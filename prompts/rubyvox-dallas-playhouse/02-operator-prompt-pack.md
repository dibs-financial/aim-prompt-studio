# 2. Operator prompt pack: The Dallas Play House

Connect the RubyVox MCP server first (`https://rubyvox.com/mcp`). Then paste the identity block at the top of every new chat. RubyVox does not publish a tool catalog, so the prompts only ask for verbs RubyVox documents: list / update / manage agents, pull leads, text a caller, book a slot. Anything else, the model must say it does not have.

## Identity block (paste first, every chat)

```
You are operating my RubyVox voice agent via MCP.

Agent name: The Dallas Play House
Agent UUID: 542e1ccb-c597-4dd1-bdeb-7f0236ca59cd
Caller page: https://rubyvox.com/a/542e1ccb-c597-4dd1-bdeb-7f0236ca59cd
Phone: (509) 808-8801
MCP: https://rubyvox.com/mcp

Before doing anything else:
1. Discover available RubyVox tools.
2. Confirm you can see this agent by name or UUID.
3. Reply with the agent's current status and the tool names you actually have.
4. Do not invent tools. If a tool is missing, say so.
5. Do not change voice, knowledge, or public copy unless I explicitly ask.
```

## Daily prompts

Read-only unless a line says otherwise.

```
List my RubyVox agents. Highlight The Dallas Play House (542e1ccb-c597-4dd1-bdeb-7f0236ca59cd).
```

```
Pull leads and recaps for The Dallas Play House from the last 7 days. Table: date, caller, what they wanted, next step.
```

```
Who called The Dallas Play House today? Two sentences each. No raw transcripts.
```

```
Draft (do not send) a follow-up text to anyone who asked to book with The Dallas Play House and did not. One draft per caller. Show me before anything goes out.
```

```
Show open booking slots for The Dallas Play House for the next 7 days. Stop and tell me if booking is not a discovered tool.
```

```
The Dallas Play House standup for the last 24 hours: calls, bookings, messages sent, and anything I should handle personally. Under 150 words.
```

## Write prompts (explicit, one change each)

```
Send the follow-up text you drafted for [caller name] to The Dallas Play House lead. Confirm the number before sending. One message only.
```

```
Book [caller name] into the [day, time] slot for The Dallas Play House. Confirm the slot is still open first. Do not text them unless I say so.
```

```
Show me the current voice, greeting and knowledge for The Dallas Play House. Read-only. Do not change anything.
```

```
Update only the greeting for The Dallas Play House to the text below. Leave voice and knowledge as they are. Show me a before / after diff.

[new greeting]
```

## Safety rails

- **Discover before acting.** The identity block makes the model list its real tools first. If a prompt names a verb that did not come back, the model stops and says so.
- **One agent.** Every prompt carries the name or the UUID. If the model sees several agents, it acts on this one only.
- **Draft, then send.** Texts are drafted and shown first. A send is a separate, explicit prompt naming one caller.
- **No public copy changes by default.** Voice, knowledge and public copy change only on a prompt that names the field and shows a diff.
- **No raw transcripts in summaries.** Summaries are two sentences per caller. Ask for a transcript by caller when you need one.
- **No caller link in MCP.** `/a/542e1ccb-…` is for callers. `https://rubyvox.com/mcp` is for clients.

## When it fails

| Symptom | Read it as |
|---|---|
| Model lists IDE tools, no RubyVox tools | MCP server not connected, auth failed, or custom-MCP pass-through is off (file 03) |
| Model cannot find the agent | Wrong account signed in to RubyVox, or the agent is not shared with that login |
| Model invents a tool such as "call caller" | Restate rule 4 from the identity block and ask again |
| 401 in the client | OAuth did not complete. Use the stdio proxy in file 03 |
