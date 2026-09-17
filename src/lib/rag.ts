/**
 * Hybrid retrieval over a local knowledge base.
 *
 * Two rankers run over every chunk, then their rankings are fused:
 *  - BM25 (lexical): exact-term matching with length normalisation.
 *  - TF-IDF cosine over character trigrams (fuzzy): tolerant of typos,
 *    morphology and partial matches, standing in for a dense embedding
 *    without needing an embeddings API.
 * Reciprocal rank fusion merges the two lists.
 */

export interface KnowledgeDoc {
  id: string
  title: string
  content: string
  createdAt: number
}

export interface Chunk {
  id: string
  docId: string
  title: string
  text: string
  index: number
}

export interface RetrievalHit {
  chunk: Chunk
  score: number
  lexicalRank: number | null
  fuzzyRank: number | null
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

export function chunkDocument(doc: KnowledgeDoc, maxChars = 600): Chunk[] {
  const paragraphs = doc.content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const chunks: Chunk[] = []
  let buffer = ''
  const flush = () => {
    if (buffer.trim()) {
      chunks.push({
        id: `${doc.id}:${chunks.length}`,
        docId: doc.id,
        title: doc.title,
        text: buffer.trim(),
        index: chunks.length,
      })
    }
    buffer = ''
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      flush()
      for (let start = 0; start < paragraph.length; start += maxChars) {
        buffer = paragraph.slice(start, start + maxChars)
        flush()
      }
      continue
    }
    if ((buffer + '\n\n' + paragraph).length > maxChars) flush()
    buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
  }
  flush()
  return chunks
}

function trigrams(text: string): string[] {
  const normalised = ` ${text.toLowerCase().replace(/\s+/g, ' ').trim()} `
  const grams: string[] = []
  for (let i = 0; i + 3 <= normalised.length; i++) grams.push(normalised.slice(i, i + 3))
  return grams
}

function termFrequencies(terms: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const term of terms) freq.set(term, (freq.get(term) ?? 0) + 1)
  return freq
}

export function bm25Rank(query: string, chunks: Chunk[], k1 = 1.5, b = 0.75): Chunk[] {
  const queryTerms = tokenize(query)
  if (queryTerms.length === 0 || chunks.length === 0) return []

  const docTerms = chunks.map((chunk) => tokenize(chunk.text))
  const avgLength = docTerms.reduce((sum, terms) => sum + terms.length, 0) / chunks.length
  const docFreq = new Map<string, number>()
  for (const terms of docTerms) {
    for (const term of new Set(terms)) docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
  }

  const scored = chunks.map((chunk, i) => {
    const tf = termFrequencies(docTerms[i])
    const length = docTerms[i].length
    let score = 0
    for (const term of queryTerms) {
      const df = docFreq.get(term)
      if (!df) continue
      const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5))
      const f = tf.get(term) ?? 0
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * length) / avgLength)))
    }
    return { chunk, score }
  })

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.chunk)
}

export function fuzzyRank(query: string, chunks: Chunk[]): Chunk[] {
  const queryGrams = trigrams(query)
  if (queryGrams.length === 0 || chunks.length === 0) return []

  const docGrams = chunks.map((chunk) => termFrequencies(trigrams(chunk.text)))
  const docFreq = new Map<string, number>()
  for (const grams of docGrams) {
    for (const gram of grams.keys()) docFreq.set(gram, (docFreq.get(gram) ?? 0) + 1)
  }
  const idf = (gram: string) => Math.log(1 + chunks.length / (1 + (docFreq.get(gram) ?? 0)))

  const queryVector = new Map<string, number>()
  for (const [gram, count] of termFrequencies(queryGrams)) queryVector.set(gram, count * idf(gram))
  const queryNorm = Math.sqrt([...queryVector.values()].reduce((sum, v) => sum + v * v, 0))

  const scored = chunks.map((chunk, i) => {
    let dot = 0
    let norm = 0
    for (const [gram, count] of docGrams[i]) {
      const weight = count * idf(gram)
      norm += weight * weight
      const q = queryVector.get(gram)
      if (q) dot += q * weight
    }
    const score = norm === 0 || queryNorm === 0 ? 0 : dot / (Math.sqrt(norm) * queryNorm)
    return { chunk, score }
  })

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.chunk)
}

export interface HybridOptions {
  topK?: number
  /** Reciprocal rank fusion constant. Higher values flatten the rank curve. */
  rrfK?: number
  /** 0 = lexical only, 1 = fuzzy only, 0.5 = equal weight. */
  fuzzyWeight?: number
}

export function hybridSearch(query: string, chunks: Chunk[], options: HybridOptions = {}): RetrievalHit[] {
  const { topK = 5, rrfK = 60, fuzzyWeight = 0.5 } = options
  const lexical = bm25Rank(query, chunks)
  const fuzzy = fuzzyRank(query, chunks)

  const hits = new Map<string, RetrievalHit>()
  const ensure = (chunk: Chunk) => {
    let hit = hits.get(chunk.id)
    if (!hit) {
      hit = { chunk, score: 0, lexicalRank: null, fuzzyRank: null }
      hits.set(chunk.id, hit)
    }
    return hit
  }

  lexical.forEach((chunk, rank) => {
    const hit = ensure(chunk)
    hit.lexicalRank = rank + 1
    hit.score += (1 - fuzzyWeight) / (rrfK + rank + 1)
  })
  fuzzy.forEach((chunk, rank) => {
    const hit = ensure(chunk)
    hit.fuzzyRank = rank + 1
    hit.score += fuzzyWeight / (rrfK + rank + 1)
  })

  return [...hits.values()].sort((a, b) => b.score - a.score).slice(0, topK)
}

/** Render retrieved chunks as a context block ready to paste into the Input field. */
export function formatContext(hits: RetrievalHit[]): string {
  if (hits.length === 0) return ''
  const blocks = hits.map((hit, i) => `[${i + 1}] ${hit.chunk.title}\n${hit.chunk.text}`)
  return `Reference material (retrieved from the knowledge base):\n\n${blocks.join('\n\n')}`
}
