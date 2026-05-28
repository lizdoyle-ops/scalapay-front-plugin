const FRONT_TOKEN = process.env.FRONT_API_TOKEN ?? ''
const INBOX_STANDARD = 'inb_51g3x'  // Leyton, Sarah, Elias
const INBOX_PEC      = 'inb_51gel'  // PEC

const rand6 = () => Math.floor(Math.random() * 900000) + 100000
const now   = () => Math.floor(Date.now() / 1000)

async function importMsg(inboxId: string, payload: object) {
  const r = await fetch(`https://api2.frontapp.com/inboxes/${inboxId}/imported_messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FRONT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Front API ${r.status}: ${text}`)
  }
  return r.json()
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).end()
  if (!FRONT_TOKEN) return res.status(500).json({ error: 'FRONT_API_TOKEN not configured in Vercel environment' })

  const n = rand6()
  const ts = now()

  const emails: Array<[string, object]> = [

    // ── 1. Leyton Graves — Reembolso / chargeback (Portuguese) ──────────────
    [INBOX_STANDARD, {
      sender: { handle: 'leyton@finalproduction.club', name: 'Leyton Graves' },
      to: ['workable@cloudcontentconsulting.com'],
      subject: `Reembolso pendente – pedido SP-2024-884321 – aviso de chargeback [#${n}]`,
      body: `
        <p>Olá, Suporte Scalapay,</p>
        <p>Escrevo para acompanhar o meu pedido de reembolso referente ao pedido
        <strong>SP-2024-884321</strong> (Zara, <strong>€89,70</strong>),
        submetido a <strong>12 de maio de 2026</strong>.</p>
        <p>Já passaram mais de duas semanas sem qualquer atualização da vossa parte.
        A Zara confirmou que a devolução foi aceite no sistema deles e consta como
        concluída.</p>
        <p>Fico a informar que, caso não receba confirmação do reembolso nos próximos
        <strong>5 dias úteis</strong>, serei obrigado a abrir uma disputa formal de
        <em>chargeback</em> junto do meu banco. Preferia resolver este assunto
        diretamente com a Scalapay.</p>
        <table style="border-collapse:collapse;font-size:13px;margin:12px 0">
          <tr><td style="padding:3px 12px 3px 0;color:#666">Referência do pedido</td><td><strong>SP-2024-884321</strong></td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#666">Comerciante</td><td>Zara</td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#666">Valor</td><td>€89,70</td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#666">Pedido de reembolso</td><td>12 de maio de 2026</td></tr>
        </table>
        <p>Agradeço confirmação de receção e indicação de prazo de resolução.</p>
        <p>Com os melhores cumprimentos,<br><strong>Leyton Graves</strong><br>leyton@finalproduction.club</p>
      `.trim(),
      body_format: 'html',
      external_id: `leyton-refund-${n}`,
      thread_ref: `leyton-thread-${n}`,
      created_at: ts,
      type: 'email',
      metadata: { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],

    // ── 2. Sarah Murphy — Merchant webhook / API failure ─────────────────────
    [INBOX_STANDARD, {
      sender: { handle: 'sarah@zestymedia.club', name: 'Sarah Murphy' },
      to: ['workable@cloudcontentconsulting.com'],
      subject: `URGENT: Scalapay webhook failure – Zesty Media Ltd. [#${n}]`,
      body: `
        <p>Dear Scalapay Partner Support,</p>
        <p>I am writing on behalf of <strong>Zesty Media Ltd.</strong> regarding a critical
        webhook failure affecting our Scalapay integration.</p>
        <p>Since <strong>25 May 2026</strong>, our endpoint is no longer receiving
        <code>order.completed</code> events from Scalapay. Our fulfilment platform
        has no visibility of completed payments and orders must be reconciled manually —
        an unsustainable situation at our current transaction volume.</p>
        <p>We raised ticket <strong>TECH-1823</strong> three days ago and have received
        no substantive update. Each day without resolution is costing us in delayed
        shipments and customer escalations.</p>
        <ul style="font-size:13px;line-height:1.7">
          <li>Webhook URL: <code>https://api.zestymedia.club/webhooks/scalapay</code></li>
          <li>Last successful event received: 24 May 2026, 22:41</li>
          <li>Last error in our logs: <strong>422 Unprocessable Entity</strong>, 27 May 08:14</li>
        </ul>
        <p>Please escalate to engineering and provide an ETA.</p>
        <p>Kind regards,<br><strong>Sarah Murphy</strong><br>Technology Lead, Zesty Media Ltd.<br>
        Account Manager: Sophie Morel</p>
      `.trim(),
      body_format: 'html',
      external_id: `sarah-webhook-${n}`,
      thread_ref: `sarah-thread-${n}`,
      created_at: ts,
      type: 'email',
      metadata: { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],

    // ── 3. Elias Holly — Account suspension dispute ───────────────────────────
    [INBOX_STANDARD, {
      sender: { handle: 'elias@auditlawyer.club', name: 'Elias Holly' },
      to: ['workable@cloudcontentconsulting.com'],
      subject: `Account suspension dispute – elias@auditlawyer.club [#${n}]`,
      body: `
        <p>Dear Scalapay Support Team,</p>
        <p>I am writing to formally dispute the suspension of my Scalapay account on
        <strong>18 May 2026</strong>, citing "suspicious activity."</p>
        <p>I have been a Scalapay customer for over two years with
        <strong>31 completed orders totalling approximately €4,870</strong>. All account
        activity has been conducted personally by me. I believe this suspension has been
        triggered in error.</p>
        <p>The suspension is causing significant inconvenience: I have an outstanding
        payment of <strong>€99.75</strong> due on <strong>1 June 2026</strong> for order
        SP-2024-602341 (Apple). Inability to make this payment — through no fault of my
        own — may affect my credit standing.</p>
        <p>I respectfully request:</p>
        <ol style="font-size:13px;line-height:1.8">
          <li>A written explanation of the specific activity deemed suspicious</li>
          <li>Immediate reinstatement of my account, or</li>
          <li>An expedited review with the opportunity to provide identity verification</li>
        </ol>
        <p>Please treat this as urgent.</p>
        <p>Yours sincerely,<br><strong>Elias Holly</strong><br>elias@auditlawyer.club</p>
      `.trim(),
      body_format: 'html',
      external_id: `elias-suspension-${n}`,
      thread_ref: `elias-thread-${n}`,
      created_at: ts,
      type: 'email',
      metadata: { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],

    // ── 4. PEC — Italian certified email (payment rescheduling) ──────────────
    [INBOX_PEC, {
      sender: { handle: 'mancini.associati@pec.avvocati.it', name: 'Studio Legale Mancini & Associati – PEC' },
      to: ['pec@testforfront.com'],
      subject: `[PEC] Richiesta formale rinegoziazione piano di pagamento – Rif. SP-2024-991203-${n}`,
      body: `
        <p>Spettabile <strong>Scalapay S.r.l.</strong>,</p>
        <p>con la presente comunicazione, trasmessa a mezzo
        <strong>Posta Elettronica Certificata (PEC)</strong> ai sensi del D.Lgs. 82/2005
        e del Codice del Consumo, lo Studio Legale Mancini &amp; Associati, in rappresentanza
        del proprio assistito <strong>Sig. Marco Vitali</strong>
        (C.F. VTLMRC88P10H501F, codice cliente Scalapay SCL-IT-00291847), comunica quanto segue.</p>
        <p>Il Sig. Vitali è titolare di un piano di pagamento Scalapay relativo all'ordine
        <strong>SP-2024-991203</strong> (importo totale: <strong>€ 720,00</strong> in 4 rate
        mensili da € 180,00 ciascuna). La terza rata risulta in scadenza il
        <strong>01/06/2026</strong>.</p>
        <p>A causa di una documentata temporanea difficoltà economica — attestata dalla
        documentazione allegata alla presente — il nostro assistito non è in grado di onorare
        la rata alle condizioni originarie. <strong>Ai sensi dell'art. 1467 c.c. e dell'art. 33
        del Codice del Consumo</strong>, si richiede formalmente una proroga di
        <strong>60 (sessanta) giorni</strong> sulla rata in scadenza, senza applicazione di
        interessi di mora nel periodo di proroga e con conseguente slittamento delle rate
        successive.</p>
        <p>Si diffida altresì dall'applicare qualsiasi segnalazione negativa agli organi di
        informazione creditizia (CRIF, Experian, CTC) prima dell'esito della presente
        richiesta formale.</p>
        <p>Si richiede un riscontro scritto entro e non oltre
        <strong>10 (dieci) giorni lavorativi</strong> dalla data di ricezione della presente.</p>
        <p>Con osservanza,</p>
        <p><strong>Avv. Giulia Mancini</strong><br>
        Mancini &amp; Associati Studio Legale<br>
        Via del Corso 144, 00186 Roma (RM)<br>
        Tel: +39 06 678 1234<br>
        PEC: mancini.associati@pec.avvocati.it</p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #ddd">
        <p style="font-size:11px;color:#888;font-style:italic">
          Questa comunicazione è stata trasmessa tramite Posta Elettronica Certificata (PEC).
          Il presente messaggio ha valore legale equiparabile alla raccomandata con avviso di
          ricevimento ai sensi del D.P.R. 68/2005 e del D.Lgs. 82/2005.
        </p>
      `.trim(),
      body_format: 'html',
      external_id: `pec-rinegoziazione-${n}`,
      thread_ref: `pec-thread-${n}`,
      created_at: ts,
      type: 'email',
      metadata: { is_inbound: true, is_archived: false, should_skip_rules: false },
    }],
  ]

  try {
    await Promise.all(emails.map(([inboxId, payload]) => importMsg(inboxId, payload)))
    return res.status(200).json({ success: true, ref: n, sent: emails.length })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
