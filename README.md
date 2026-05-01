# MCIF Frontend — Web Application v3.0

Next.js 14 + TypeScript + Tailwind CSS interface for the **Mine Competitive Index Framework
 (MCIF)** — interactive mine scoring, comparison, sensitivity analysis, and printable reports.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Runtime | Node.js ≥ 18 |

## Project Structure

```
MTP-2-frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout — sidebar nav, global styles
│   │   ├── page.tsx                  # Dashboard — stats, quick links
│   │   ├── parameters/page.tsx       # Main input form (150+ params, Core + Sub-topic modes)
│   │   ├── predict/page.tsx          # Run prediction & view ResultPanel
│   │   ├── report/[id]/page.tsx      # Printable full report for a prediction
│   │   ├── history/page.tsx          # Saved prediction history
│   │   ├── compare/page.tsx          # Multi-mine radar chart comparison
│   │   ├── sensitivity/page.tsx      # OAT sensitivity waterfall chart
│   │   ├── data/page.tsx             # Reference mine data browser
│   │   └── workflow/page.tsx         # How MCIF works — full methodology
│   ├── components/
│   │   ├── ResultPanel.tsx           # MCI result display, grade card, ComparisonCard
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   └── ...
│   └── lib/
│       └── api.ts                    # Typed API client (fetch wrappers)
├── next.config.js                    # API URL config via env var
├── tailwind.config.js
└── tsconfig.json
```

## Environment Variables

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_API=http://localhost:8000
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API` | `http://localhost:8000` | Backend API base URL |

For production deployment, set this to your hosted backend URL (e.g., Render, Railway, EC2).

## Setup & Run

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev        # → http://localhost:3000

# Production build
npm run build
npm start
```

> The backend (`MTP-2-backend`) must be running on port 8000 before using the app.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — total predictions, grade breakdown, avg MCI, quick links |
| `/parameters` | Enter 150+ mine parameters (Core mode + 7 Sub-topic sections) |
| `/predict` | Submit parameters, view MCI score, grade, dimension breakdown |
| `/report/[id]` | Printable A4 report — full scores, subtopic profile, validation comparison |
| `/history` | Browse and reload past prediction sessions |
| `/compare` | Side-by-side radar chart of up to 4 mines |
| `/sensitivity` | One-at-a-time sensitivity: varies each param ±10/20/30%, shows MCI delta |
| `/data` | Browse 12 reference mines with all stored parameters |
| `/workflow` | Full methodology — 6-step workflow, dimension formulas, ensemble weights |

## Key Components

### `ResultPanel.tsx`
Displays prediction output with:
- **MCI grade card** (A/B/C/D with color coding)
- **Dimension score bars** (7 dimensions with weights)
- **Valuation method** recommendation (CIMVAL Code)
- **ComparisonCard** (for validation mines with known actual scores):
  - Predicted vs Actual MCI summary (4 metric cards)
  - Confidence interval banner (±2.53 pts = ±1 MAE)
  - Visual bar comparison (Predicted / Actual / Δ Error)
  - Per-dimension error table (Δ pts + % error for all 7 dimensions)
  - Subtopic score profile (7 engineering sections)

### `report/[id]/page.tsx`
Print-optimized report including:
- Mine metadata header
- Dimension score bars (print-safe inline styles)
- Engineering Section Score Profile (7 subtopics with status badges)
- Validation comparison (when actual scores available)
- Methodology footnotes

## Input Modes

### Core Mode (always available)
8 sections covering 150+ parameters:

| Section | Parameter Count |
|---------|----------------|
| Economic | 18 |
| Technical | 10 |
| Geological | 4 |
| Environmental | 16 |
| Social | 9 |
| Geographical | 6 |
| Risk | 13 |
| Governance | 6 |

### Sub-topic Mode (deep-dive)
7 engineering sections feeding into dimension scores:

| Section | Feeds Into |
|---------|-----------|
| Mine Life | Technical |
| HEMM & Cost | Technical + Economic |
| Stripping Ratio | Technical |
| Coal Quality | Technical + Environmental + Risk |
| Bench & Blast | Technical + Risk |
| Dewatering | Environmental + Risk |
| Infrastructure | Geographical |

## Default Values

The parameter form pre-loads defaults from **Rajmahal OCP** (MINE_010) — a validation mine with known actual scores (Grade C, MCI 58.4). This lets you immediately run a prediction and see a real validation comparison.

## Scoring Summary

| Dimension | Weight | Note |
|-----------|--------|------|
| Technical | 12.7% | |
| Economic | 17.0% | Highest discriminator |
| Environmental | 10.1% | EC status is binary gate |
| Social | 13.9% | LTIFR drives spread |
| Geographical | 13.0% | Rail distance & logistics |
| Governance | 6.6% | ISO 14001/45001, ESG |
| Risk | 26.7% | Safety Quality = 100 − hazard |

**MCI = (0.127T + 0.170E + 0.101Env + 0.139S + 0.130G + 0.066Gov + 0.267R) × 0.87**

## Printing Reports

Navigate to `/report/<prediction_id>` and use **Ctrl+P** (or browser Print). The layout uses inline styles for print compatibility — sidebar and nav are hidden automatically via `@media print`.

## Deployment Notes

- Set `NEXT_PUBLIC_API` to your backend URL before `npm run build`
- `next.config.js` has `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` for CI convenience — fix any warnings before production
- No server-side secrets in this app — all API calls go from browser to backend
