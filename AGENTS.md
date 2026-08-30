# AGENTS.md — AtlasIndex Project Guide & Methodology Standards

> **AtlasIndex** is an open-source, empirical economic platform developed by **BanguDevClub** that measures genuine purchasing power and living costs across **all 195 sovereign nations of the world** plus a unified **Global Benchmark (`🌐 World Average`)**.

---

## 1. Project Summary & Purpose

AtlasIndex replaces abstract macroeconomic indicators (such as GDP per capita or GNI) and informal single-item metrics (such as the Big Mac Index) with a concrete, time-based standard:

> **How many hours, minutes, and months of physical labor must a median-wage earner work in their domestic economy to afford essential human living pillars?**

### The 4 Essential Living Pillars
1. **🍚 Nutrition**: Standardized 13-item monthly grocery basket (~2,300 kcal/day adult baseline adhering to WHO/FAO guidelines).
2. **🏠 Housing**: National weighted median monthly rent for a 1-bedroom self-contained residential apartment.
3. **🚗 Transport**: Retail purchase price for a standard new compact passenger vehicle (C-segment: Toyota Corolla / VW Golf equivalent).
4. **🩺 Healthcare**: Routine clinical outpatient preventive checkup + complete diagnostic blood panels (CBC, fasting glucose, lipid, metabolic).

---

## 2. Technology Stack & Architecture

| Layer | Technology | Key Libraries & Purpose |
| :--- | :--- | :--- |
| **Framework** | **Astro 7.x** | Static site generation (SSG) with Vite 8 (`output: "static"`). |
| **UI Components** | **React 19** | Interactive client islands via `@astrojs/react@6.0.4`. |
| **Styling** | **Tailwind CSS 3.x (PostCSS)** | Semantic HSL design tokens, responsive layouts, glassmorphism. |
| **Component Primitives**| **shadcn/ui + Radix UI** | Accessible dialogs, tabs, sliders, tooltips, select dropdowns, tables. |
| **Mathematical Rendering**| **KaTeX** | Fast, server-rendered LaTeX equations via `<Latex formula={String.raw`...`} />`. |
| **Data Visualization** | **Recharts 3.x** | Multi-pillar bar charts, stacked nutritional decomposition, scatter plots. |
| **Icons** | **Lucide React** | Consistent iconography across Astro templates and React components. |
| **Type Safety & Linting** | **TypeScript 5.x + Astro Check** | Strict typing with `npm run check` (`astro check && tsc --noEmit`). |

### Multi-Theme System
- **Default Light** & **Default Dark**
- **4 Catppuccin Variants**: Latte (Light), Frappé (Medium Dark), Macchiato (Dark), Mocha (Deep Dark).
- Zero-flash theme execution via inline `<script>` in [`src/layouts/Layout.astro`](file:///home/cassio/Documents/Code/Orgs/BanguDevClub/atlasindex/src/layouts/Layout.astro) using `localStorage.getItem("atlasindex-theme")`.

---

## 3. Project Structure & Directory Map

```text
atlasindex/
├── .agents/                    # Custom agent skills and workflows
├── public/                     # Static assets (favicons, manifest, og-image)
├── src/
│   ├── components/
│   │   ├── compare/            # CountryComparator.tsx (side-by-side & simulator)
│   │   ├── continents/         # ContinentComparator.tsx (regional summaries & drilldown)
│   │   ├── dashboard/          # DashboardContainer.tsx (multi-pillar chart visualizations)
│   │   ├── landing/            # HeroSection, QuickCalculator, HighlightsGrid, GlobalOverviewPreview
│   │   ├── methodology/        # MethodologyContent.astro (whitepaper & LaTeX models)
│   │   ├── ranking/            # RankingContainer.tsx (sortable 195-nation multi-pillar table)
│   │   ├── sandbox/            # AppiSandbox.tsx (interactive macroeconomic simulator)
│   │   └── ui/                 # shadcn UI components + Latex.astro
│   ├── data/
│   │   ├── continents/         # 195 nations: africa.ts, americas.ts, asia.ts, europe.ts, oceania.ts
│   │   ├── basketDefinition.ts # 13 food items, calories, and non-food pillar specs
│   │   └── countries.ts        # Aggregated RAW_COUNTRIES dataset
│   ├── layouts/
│   │   └── Layout.astro        # Master HTML layout, SEO meta tags, fonts, theme loader
│   ├── lib/
│   │   ├── methodology.ts      # Core calculation engine, APPI score, global average synthesis
│   │   ├── types.ts            # Strict TypeScript domain interfaces
│   │   └── utils.ts            # Currency/time formatters and getBasePath helper
│   ├── pages/
│   │   ├── index.astro         # Homepage with live calculator and highlights
│   │   ├── dashboard.astro     # Interactive multi-pillar visual analytics
│   │   ├── ranking.astro       # Global rankings with CSV/JSON export
│   │   ├── compare.astro       # Head-to-head 2-4 country + World Average comparator
│   │   ├── continents.astro    # 5 continental regions vs World Average
│   │   ├── sandbox.astro       # Custom country APPI sandbox & parameter simulator
│   │   └── methodology.astro   # Complete scientific documentation & whitepaper
│   └── styles/
│       └── globals.css         # Tailwind directives, KaTeX styles, HSL theme tokens
├── astro.config.mjs            # Astro configuration with site and base path (/atlasindex)
├── package.json                # Dependencies and npm scripts
├── tailwind.config.mjs         # Tailwind configuration with shadcn tokens
└── tsconfig.json               # TypeScript path aliases (@/* -> src/*)
```

---

## 4. Economic Methodology & Mathematical Guidelines

### A. Core Mathematical Formulas

#### 1. Hourly Median Take-Home Wage ($W_{\text{hourly}}$)
$$W_{\text{hourly}} = \frac{W_{\text{median}}}{H_{\text{month}}} = \frac{W_{\text{median}}}{160}$$
- $W_{\text{median}}$: Monthly median net disposable earnings from official labor surveys.
- $H_{\text{month}}$: Standardized full-time benchmark of 160 working hours per month (40h/week × 4 weeks).

#### 2. Monthly Food Basket Cost ($B$) & Labor Hours ($H_{\text{food}}$)
$$B = \sum_{i=1}^{13} \left( p_i \times q_i \right)$$
$$H_{\text{food}} = \frac{B}{W_{\text{hourly}}} = \left( \frac{B}{W_{\text{median}}} \right) \times 160$$
$$\beta_{\text{food}} = \left( \frac{B}{W_{\text{median}}} \right) \times 100\%$$

#### 3. Housing Rent Labor Hours ($H_{\text{rent}}$) & Wage Share ($\beta_{\text{rent}}$)
$$H_{\text{rent}} = \frac{R_{\text{1BR}}}{W_{\text{hourly}}} = \left( \frac{R_{\text{1BR}}}{W_{\text{median}}} \right) \times 160$$
$$\beta_{\text{rent}} = \left( \frac{R_{\text{1BR}}}{W_{\text{median}}} \right) \times 100\%$$

#### 4. Vehicle Purchase Labor Months ($M_{\text{car}}$) & Work Hours ($H_{\text{car}}$)
$$M_{\text{car}} = \frac{P_{\text{car}}}{W_{\text{median}}}$$
$$H_{\text{car}} = M_{\text{car}} \times 160 = \frac{P_{\text{car}}}{W_{\text{hourly}}}$$

#### 5. Healthcare Checkup Labor Hours ($H_{\text{med}}$) & Wage Share ($\beta_{\text{med}}$)
$$H_{\text{med}} = \frac{C_{\text{checkup}}}{W_{\text{hourly}}} = \left( \frac{C_{\text{checkup}}}{W_{\text{median}}} \right) \times 160$$
$$\beta_{\text{med}} = \left( \frac{C_{\text{checkup}}}{W_{\text{median}}} \right) \times 100\%$$

---

### B. The Atlas Purchasing Power Index (APPI)

APPI is a normalized composite index on a continuous scale of **1 to 100** structured into two complementary dimensions:
1. **🍚🏠 APPI Essentials (Food + Rent)**: Standardized monthly food basket ($B$) plus 1-bedroom apartment rent ($R_{\text{1BR}}$).
2. **🚗🩺 APPI Luxury (Transport + Healthcare)**: Compact new passenger vehicle MSRP ($P_{\text{car}}$) plus outpatient clinical diagnostic blood panel ($C_{\text{checkup}}$).

$$\text{APPI} = \text{clamp}\Big( \text{round}\left( 0.70 \times \text{APPI}_{\text{essentials}} + 0.30 \times \text{APPI}_{\text{luxury}} \right),\, 1,\, 100 \Big)$$

where:
$$\text{APPI}_{\text{essentials}} = \text{clamp}\Big( \text{round}\left( 0.70 \times F_{\text{ess\_wage}} + 0.30 \times F_{\text{ess\_hours}} \right),\, 1,\, 100 \Big)$$
- $F_{\text{ess\_wage}} = \max\left( 0,\, 100 - (\beta_{\text{essentials}} \times 0.90) \right)$ with $\beta_{\text{essentials}} = \beta_{\text{food}} + \beta_{\text{rent}}$
- $F_{\text{ess\_hours}} = \max\left( 0,\, 100 - (H_{\text{essentials}} \times 0.55) \right)$ with $H_{\text{essentials}} = H_{\text{food}} + H_{\text{rent}}$

$$\text{APPI}_{\text{luxury}} = \text{clamp}\Big( \text{round}\left( 0.60 \times F_{\text{car}} + 0.40 \times F_{\text{med}} \right),\, 1,\, 100 \Big)$$
- $F_{\text{car}} = \max\left( 0,\, 100 - (M_{\text{car}} \times 1.25) \right)$ with $M_{\text{car}} = P_{\text{car}} / W_{\text{median}}$
- $F_{\text{med}} = \max\left( 0,\, 100 - (\beta_{\text{med}} \times 2.50) \right)$ with $\beta_{\text{med}} = (C_{\text{checkup}} / W_{\text{median}}) \times 100\%$

#### Weighting Rationale:
- **70% on APPI Essentials**: Anchors the index in basic physiological survival (food security & residential shelter) adhering to *Engel's Law*.
- **30% on APPI Luxury**: Captures private vehicular mobility and routine diagnostic healthcare security.

#### Classification Tiers:
| Tier | Essential Burden ($\beta_{\text{essentials}}$) | APPI Range | Exemplar Economies |
| :--- | :--- | :--- | :--- |
| **Tier 1: Low Stress** | $< 40\%$ | **70 – 100** | USA (74 • Rank #1), UAE (71), Germany (71), Switzerland (71) |
| **Tier 2: Moderate** | $40\% – 65\%$ | **50 – 69** | Poland (64 • Rank #44), Chile (56), Portugal (56), Malaysia (55) |
| **Tier 3: High Stress** | $65\% – 90\%$ | **25 – 49** | Brazil (49 • Rank #80), South Africa (40), Thailand (38), Turkey (31) |
| **Tier 4: Severe Stress** | $> 90\%$ | **1 – 24** | Nigeria (1 • Rank #189), Pakistan (1), Egypt (1), Cuba (1), Syria (1) |

> **Real-World Frontier vs 100/100 Optimum**: Because food and residential housing in market economies require physical land, agriculture, and labor, even the wealthiest countries spend 35%–45% of median earnings on essentials (55–70h labor), yielding top empirical APPI Essentials scores of ~65–68 (e.g. USA at 68). A score of 100/100 represents a post-scarcity theoretical optimum (essentials requiring <1.5% of wage / <2.4h labor).

---

### C. Global Benchmark (`🌐 World Average`)
- Represents the unweighted arithmetic mean across all **195 sovereign nations** (mean pillar costs; APPI is the APPI *of* the mean values: **19 /100** (Essentials: 16, Luxury: 25), distinct from the mean of APPI scores ~32/51/38).
- Synthetic Entity ID: `world-average` (Flag: `🌐`, Code: `GLOBAL`).
- Global Baselines (2025 median-net dataset, corrected for median vs average):
  - **Median Net Wage**: **$982.50 / month** ($6.14 / hour).
  - **Composite APPI**: **19 / 100** (Essentials: 16, Luxury: 25) — APPI of global mean basket/rent/car/medical.
  - **Monthly Food Basket**: **$138.00 / month** (70.6h labor • 44.1% of wage).
  - **1-Bedroom Rent**: **$399.10 / month** (78.9h labor • 49.3% of wage).
  - **New Passenger Car**: **$22,682.10** (93.3 months of median wage).
  - **Medical Checkup**: **$74.40** (23.3h labor • 14.6% of wage).
  - **Essential Living (Food + Rent)**: **$537.10 / month** (149.5h labor • 93.4% of wage).
---

### D. Econometric Estimation Policy for Data-Sparse States
For 19 states where official statistical agencies do not publish standard consumer price indexes or regular labor surveys — the full cohort is **Afghanistan, Central African Republic, Cuba, DR Congo, Eritrea, Haiti, Holy See (Vatican City), Iran, Lebanon, Myanmar, North Korea, Palestine, Somalia, South Sudan, Sudan, Syria, Turkmenistan, Venezuela, Yemen** (illustrative e.g. North Korea, Eritrea, Syria, Afghanistan, Cuba, Haiti, Somalia, Yemen, South Sudan):
1. Country records must be flagged with `isEstimated: true`.
2. Must supply an explicit `estimationDisclaimer` detailing the triangulation source (e.g. UN WFP VAM price monitoring, World Bank ICP regional PPP models, or cross-border market surveys).
3. UI components must display an **"Est."** badge and tooltip disclaimer whenever displaying estimated country data.
---

## 5. Development & Code Conventions for Agents

### 1. Verification Commands
Always verify changes before concluding tasks:
```bash
# 1. Type check and lint (must pass with 0 errors)
npm run check

# 2. Production static bundle build
npm run build
```

### 2. Dependency Stability Notice
- The project runs on **Astro 7.x** with **Vite 8** and **`@astrojs/react@6.0.4`**.
- Tailwind CSS is powered natively via Vite/PostCSS (`postcss.config.mjs`) for optimal performance with shadcn/ui and HSL color tokens.

### 3. LaTeX Formatting in Astro Templates
- Always use the `<Latex />` component with `String.raw` template strings to prevent JavaScript from misinterpreting LaTeX backslashes (`\t`, `\f`, `\r`) as control characters:
```astro
---
import Latex from "@/components/ui/Latex.astro";
---

<!-- Inline Formula -->
<Latex formula={String.raw`W_{\text{hourly}} = \frac{W_{\text{median}}}{160}`} />

<!-- Display Block Formula -->
<Latex formula={String.raw`B = \sum_{i=1}^{13} (p_i \times q_i)`} display={true} />
```

### 4. Base Path & Subpath Deployment
- The repository is configured for GitHub Pages with `base: '/atlasindex'`.
- Always wrap internal links, images, and route navigations with `getBasePath(...)` from [`src/lib/utils.ts`](file:///home/cassio/Documents/Code/Orgs/BanguDevClub/atlasindex/src/lib/utils.ts):
```tsx
import { getBasePath } from "@/lib/utils";

<a href={getBasePath("/compare?c1=usa&c2=world-average")}>Compare</a>
```

### 5. Lucide Icons in Astro vs React
- Lucide React components used inside `.astro` files must use `className="..."` (not `class="..."`) to satisfy TypeScript JSX element attribute typing.
