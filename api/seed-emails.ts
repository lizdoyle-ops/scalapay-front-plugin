const FRONT_TOKEN    = process.env.FRONT_API_TOKEN    ?? ''
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY  ?? ''
const INBOX_STANDARD = 'inb_51g3x'   // Leyton, Sarah, Elias
const INBOX_PEC      = 'inb_51gel'   // PEC

const rand6 = () => Math.floor(Math.random() * 900000) + 100000
const nowTs = () => Math.floor(Date.now() / 1000)

type EmailContent = { subject: string; body: string }

// ── Claude generation ─────────────────────────────────────────────────────────
async function generateEmail(prompt: string): Promise<EmailContent> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: `You write realistic inbound customer support emails for Scalapay, an Italian BNPL company.
Return ONLY a raw JSON object — no markdown, no code fences, no extra text — with exactly two fields:
  "subject": plain text subject line
  "body": HTML string using <p> tags`,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)
  const data: any = await r.json()
  const raw = data.content[0].text.trim().replace(/^```json?\s*/,'').replace(/\s*```$/,'')
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
  if (!r.ok) throw new Error(`Front API ${r.status}: ${await r.text()}`)
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

  // Generate all 4 emails in parallel via Claude
  const [leyton, sarah, elias, pec] = await Promise.all([

    generateEmail(`
Category: Chargeback Claim — customer explicitly threatening or confirming they have opened a formal chargeback through their bank.
Language: European Portuguese (PT-PT).
Sender: Leyton Graves <leyton@finalproduction.club>
Fixed details to include: order SP-2024-884321, merchant Zara, €89.70, refund requested 12 May 2026.
Vary freely: subject line, tone (frustrated/formal/angry), specific bank or card provider named,
exact chargeback timeline stated, emotional framing, any extra context invented.
Never change: sender name, email, order ID, merchant, amount, language.`),

    generateEmail(`
Category: Bug — merchant reporting a technical failure, webhook or API integration problem.
Language: English.
Sender: Sarah Murphy <sarah@zestymedia.club>, Technology Lead, Zesty Media Ltd.
Fixed details to include: webhook failure since 25 May 2026, open ticket TECH-1823, last error 422 Unprocessable Entity on 27 May 08:14, account manager Sophie Morel.
Vary freely: subject line, specific business impact described, additional technical symptoms mentioned,
tone (professional/escalating/urgent), any extra error examples invented.
Never change: sender name, company, email, ticket ID, error code, account manager name.`),

    generateEmail(`
Category: Account Issues — customer reporting their account is suspended, locked or flagged in error.
Language: Italian (IT).
Sender: Elias Holly <elias@auditlawyer.club>
Fixed details to include: account suspended 18 maggio 2026 for "attività sospetta", ~31 orders ~€4.870 lifetime, upcoming payment €99.75 for order SP-2024-602341 (Apple) due 1 June 2026.
Vary freely: subject line, tone (polite/frustrated/formal/outraged), specific arguments made,
type of identity verification offered, consequences highlighted.
Never change: sender name, email, suspension date, order IDs, amounts, language.`),

    generateEmail(`
Category: PEC email (Posta Elettronica Certificata) + Payment reschedule Request — formal Italian certified legal communication requesting postponement of a payment installment.
Language: Italian legal/formal.
Sender: Studio Legale Mancini & Associati <mancini.associati@pec.avvocati.it>
Client represented: Sig. Marco Vitali, C.F. VTLMRC88P10H501F, codice cliente SCL-IT-00291847.
Fixed details: order SP-2024-991203, €720.00 total, 4 rate da €180.00, third installment due 01/06/2026.
Must include: PEC legal references (D.Lgs. 82/2005), request proroga of 30–90 days, warning against negative credit reporting, 10-day response deadline, PEC footer disclaimer.
Vary freely: exact legal articles cited beyond the above, duration of proroga, additional clauses,
lawyer first name (keep Mancini), specific phrasing of the formal request.
Never change: client name/CF, order ID, amounts, firm email, PEC format structure, language.`),
  ])

  const emails: Array<[string, object]> = [
    [INBOX_STANDARD, {
      sender:      { handle: 'leyton@finalproduction.club', name: 'Leyton Graves' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     leyton.subject,
      body:        leyton.body,
      body_format: 'html',
      external_id: `leyton-chargeback-${n}`,
      thread_ref:  `leyton-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],
    [INBOX_STANDARD, {
      sender:      { handle: 'sarah@zestymedia.club', name: 'Sarah Murphy' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     sarah.subject,
      body:        sarah.body,
      body_format: 'html',
      external_id: `sarah-bug-${n}`,
      thread_ref:  `sarah-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],
    [INBOX_STANDARD, {
      sender:      { handle: 'elias@auditlawyer.club', name: 'Elias Holly' },
      to:          ['workable@cloudcontentconsulting.com'],
      subject:     elias.subject,
      body:        elias.body,
      body_format: 'html',
      external_id: `elias-account-${n}`,
      thread_ref:  `elias-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],
    [INBOX_PEC, {
      sender:      { handle: 'mancini.associati@pec.avvocati.it', name: 'Studio Legale Mancini & Associati – PEC' },
      to:          ['pec@testforfront.com'],
      subject:     pec.subject,
      body:        pec.body,
      body_format: 'html',
      external_id: `pec-rinegoziazione-${n}`,
      thread_ref:  `pec-thread-${n}`,
      created_at:  ts,
      type:        'email',
      metadata:    { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],
  ]

  try {
    await Promise.all(emails.map(([inboxId, payload]) => importMsg(inboxId, payload)))
    return res.status(200).json({ success: true, ref: n, sent: emails.length })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
