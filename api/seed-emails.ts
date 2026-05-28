const FRONT_TOKEN    = process.env.FRONT_API_TOKEN   ?? ''
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY ?? ''
const INBOX_STANDARD = 'inb_51g3x'
const INBOX_PEC      = 'inb_51gel'

const rand6 = () => Math.floor(Math.random() * 900000) + 100000
const nowTs = () => Math.floor(Date.now() / 1000)

// ── One Claude call → 4 emails ────────────────────────────────────────────────
async function generateAllEmails(n: number): Promise<{
  leyton: { subject: string; body: string }
  sarah:  { subject: string; body: string }
  elias:  { subject: string; body: string }
  pec:    { subject: string; body: string }
}> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      system: `You write realistic inbound customer support emails for Scalapay, an Italian BNPL company.
Return ONLY a raw JSON object with four keys: "leyton", "sarah", "elias", "pec".
Each key maps to an object with "subject" (plain text) and "body" (HTML using <p> tags).
No markdown, no code fences, no commentary — just the raw JSON.`,
      messages: [{
        role: 'user',
        content: `Generate 4 unique support emails. Ref: ${n}.

EMAIL 1 — key "leyton"
Category: Chargeback Claim. Customer explicitly threatening or confirming a chargeback with their bank.
Language: European Portuguese (PT-PT).
Sender: Leyton Graves <leyton@finalproduction.club>
Must include: order SP-2024-884321, Zara, €89.70, refund requested 12 May 2026.
Vary freely: subject, tone, bank named, chargeback timeline, emotional framing.

EMAIL 2 — key "sarah"
Category: Bug. Merchant reporting a technical webhook/API integration failure.
Language: English.
Sender: Sarah Murphy <sarah@zestymedia.club>, Technology Lead, Zesty Media Ltd.
Must include: webhook failure since 25 May 2026, ticket TECH-1823, error 422 Unprocessable Entity 27 May 08:14, account manager Sophie Morel.
Vary freely: subject, business impact described, tone, additional technical symptoms.

EMAIL 3 — key "elias"
Category: Account Issues. Customer disputing account suspension, locked out.
Language: Italian.
Sender: Elias Holly <elias@auditlawyer.club>
Must include: account suspended 18 maggio 2026 for "attività sospetta", ~31 orders ~€4.870 lifetime value, upcoming payment €99.75 order SP-2024-602341 (Apple) due 1 June 2026.
Vary freely: subject, tone, arguments made, verification offered.

EMAIL 4 — key "pec"
Category: PEC email + Payment reschedule Request. Formal Italian certified legal email requesting payment postponement.
Language: Formal Italian legal.
Sender: Studio Legale Mancini & Associati <mancini.associati@pec.avvocati.it>
Client: Sig. Marco Vitali, C.F. VTLMRC88P10H501F, codice cliente SCL-IT-00291847.
Must include: order SP-2024-991203, €720.00 total, 4 rate da €180.00, third installment due 01/06/2026, D.Lgs. 82/2005 PEC reference, proroga request 30-90 days, 10-day response deadline, PEC legal footer.
Vary freely: exact legal articles beyond above, proroga duration, lawyer first name (keep Mancini surname), additional clauses.`,
      }],
    }),
  })

  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)

  const data: any = await r.json()
  const raw = data.content[0].text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/,      '')
    .replace(/\s*```$/,      '')

  return JSON.parse(raw)
}

// ── Front import ──────────────────────────────────────────────────────────────
async function importMsg(inboxId: string, payload: object) {
  const r = await fetch(`https://api2.frontapp.com/inboxes/${inboxId}/imported_messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FRONT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`Front ${r.status}: ${await r.text()}`)
  return r.json()
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST')   return res.status(405).end()
  if (!FRONT_TOKEN)   return res.status(500).json({ error: 'FRONT_API_TOKEN not configured' })
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const n  = rand6()
  const ts = nowTs()

  // One Claude call, then 4 Front imports in parallel
  const generated = await generateAllEmails(n)

  await Promise.all([
    importMsg(INBOX_STANDARD, {
      sender:      { handle: 'leyton@finalproduction.club', name: 'Leyton Graves' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     generated.leyton.subject,
      body:        generated.leyton.body,
      body_format: 'html',
      external_id: `leyton-chargeback-${n}`,
      thread_ref:  `leyton-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }),
    importMsg(INBOX_STANDARD, {
      sender:      { handle: 'sarah@zestymedia.club', name: 'Sarah Murphy' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     generated.sarah.subject,
      body:        generated.sarah.body,
      body_format: 'html',
      external_id: `sarah-bug-${n}`,
      thread_ref:  `sarah-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }),
    importMsg(INBOX_STANDARD, {
      sender:      { handle: 'elias@auditlawyer.club', name: 'Elias Holly' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     generated.elias.subject,
      body:        generated.elias.body,
      body_format: 'html',
      external_id: `elias-account-${n}`,
      thread_ref:  `elias-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }),
    importMsg(INBOX_PEC, {
      sender:      { handle: 'mancini.associati@pec.avvocati.it', name: 'Studio Legale Mancini & Associati – PEC' },
      to:          ['pec@testforfront.com'],
      subject:     generated.pec.subject,
      body:        generated.pec.body,
      body_format: 'html',
      external_id: `pec-rinegoziazione-${n}`,
      thread_ref:  `pec-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }),
  ])

  return res.status(200).json({ success: true, ref: n, sent: 4 })
}
