import { describe, expect, it } from 'vitest'
import { bm25Rank, chunkDocument, fuzzyRank, hybridSearch, type KnowledgeDoc } from './rag'

const docs: KnowledgeDoc[] = [
  {
    id: 'bond',
    title: 'Bond rule',
    content:
      'The provider supplies the $75k bond. Margin recovers that cost first; remaining profit splits 80/20.\n\nResidual basis, per-load versus monthly pool, is still open.',
    createdAt: 1,
  },
  {
    id: 'style',
    title: 'Writing style',
    content: 'Keep answers short enough to read aloud. Calm, specific, vendor-blind. No hype.',
    createdAt: 2,
  },
]

const chunks = docs.flatMap((doc) => chunkDocument(doc))

describe('chunkDocument', () => {
  it('splits on blank lines and keeps chunk ids stable', () => {
    const bondChunks = chunkDocument(docs[0])
    expect(bondChunks).toHaveLength(1)
    expect(bondChunks[0].id).toBe('bond:0')
  })

  it('splits oversized paragraphs by character budget', () => {
    const long = { id: 'x', title: 'x', content: 'a'.repeat(1300), createdAt: 0 }
    expect(chunkDocument(long, 500)).toHaveLength(3)
  })
})

describe('rankers', () => {
  it('bm25 finds exact terms', () => {
    expect(bm25Rank('bond margin', chunks)[0].docId).toBe('bond')
  })

  it('fuzzy ranker tolerates typos', () => {
    expect(fuzzyRank('vendr-blind hyp', chunks)[0].docId).toBe('style')
  })

  it('hybrid fuses both rankers and reports ranks', () => {
    const hits = hybridSearch('profit split', chunks, { topK: 1 })
    expect(hits).toHaveLength(1)
    expect(hits[0].chunk.docId).toBe('bond')
    expect(hits[0].lexicalRank).toBe(1)
  })

  it('returns nothing for an empty query', () => {
    expect(hybridSearch('', chunks)).toEqual([])
  })
})
