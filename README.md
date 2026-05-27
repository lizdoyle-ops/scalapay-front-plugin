# Scalapay Front Plugin

A Front sidebar plugin for Scalapay support agents — built as a polished demo with hardcoded mock data for the evaluation team.

## Setup

```bash
npm install
npm run dev      # local preview at http://localhost:5173
npm run build    # outputs to /dist
```

## Deploy

1. `npm run build`
2. Deploy the `/dist` folder to **Vercel** or **Netlify** (static site, no server needed)
3. In Front: **Settings → Integrations → Plugins → Add plugin** → paste your deployed URL

## Demo Instructions

Open a Front conversation where the contact email matches one of the three demo accounts:

| Email | Scenario |
|---|---|
| `leyton@finalproduction.club` | Consumer with an active refund request + overdue payment |
| `elias@auditlawyer.club` | Suspended account (fraud flag) — Account Actions tab unlocked |
| `sarah@zestymedia.club` | Merchant with API errors and open Jira tickets |

The plugin auto-loads the matching scenario. All action buttons work with live mock state.

## Running outside Front (Demo Mode)

When opened in a regular browser tab (not embedded in Front), the plugin enters **Demo Mode** automatically. A banner at the top lets you click between the three mock customers to explore the full UI.

## Features by Tab

| Tab | Highlights |
|---|---|
| **Overview** | Customer identity, status badge, suspension banner for Elias |
| **Orders** | Installment progress bars, refund status badges, Approve Refund action with modal |
| **Payments** | Per-plan callout (overdue/on-time), reschedule modal with date picker |
| **Account** | Only visible for suspended accounts — Reactivate, Escalate to Fraud, Password Reset |
| **Merchant** | Only visible for merchant type — GMV bar chart, API health, Jira ticket list + create |

## Tech Stack

- React 18 + TypeScript
- @frontapp/plugin-sdk
- Tailwind CSS v3
- Vite 5
