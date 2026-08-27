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

APPI is a normalized composite index on a continuous scale of **1 to 100**:

$$\text{APPI} = \text{clamp}\Big( \text{round}\left( 0.70 \times F_{\text{wage}} + 0.30 \times F_{\text{hours}} \right),\, 1,\, 100 \Big)$$

where:
$$F_{\text{wage}} = \max\left( 0,\, 100 - (\beta_{\text{food}} \times 1.8) \right)$$
$$F_{\text{hours}} = \max\left( 0,\, 100 - (H_{\text{food}} \times 1.0) \right)$$

#### Weighting Rationale:
- **70% on Wage Burden ($F_{\text{wage}}$)**: Reflects *Engel's Law*—the share of income dedicated to food is the single most reliable measure of household budget strain.
- **30% on Absolute Labor Hours ($F_{\text{hours}}$)**: Captures the physical time sacrifice of labor, penalizing economies where workers must work excessive hours to eat.

#### Classification Tiers:
| Tier | Wage Share ($\beta_{\text{food}}$) | Monthly Labor ($H_{\text{food}}$) | APPI Range | Exemplar Economies |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Low Stress** | $< 10\%$ | $< 16\text{h}$ | **75 – 100** | Switzerland, USA, Denmark, Qatar |
| **Tier 2: Moderate** | $10\% – 20\%$ | $16\text{h} – 32\text{h}$ | **55 – 74** | Poland, Chile, Portugal, Malaysia |
| **Tier 3: High Stress** | $20\% – 35\%$ | $32\text{h} – 56\text{h}$ | **30 – 54** | Brazil, South Africa, Turkey, Thailand |
| **Tier 4: Severe Stress** | $> 35\%$ | $> 56\text{h}$ | **1 – 29** | Nigeria, Pakistan, Egypt, Cuba |

---

### C. Global Benchmark (`🌐 World Average`)
- Represents the unweighted arithmetic mean across all **195 sovereign nations**.
- Synthetic Entity ID: `world-average` (Flag: `🌐`, Code: `GLOBAL`).
- Global Baselines:
  - **Median Net Wage**: **$1,022.50 / month** ($6.39 / hour).
  - **Monthly Food Basket**: **$138.00 / month** (67.9h labor • 42.5% of wage).
  - **1-Bedroom Rent**: **$399.10 / month** (74.9h labor • 46.8% of wage).
  - **New Passenger Car**: **$22,682.10** (89.3 months of median wage).
  - **Medical Checkup**: **$74.40** (22.3h labor • 13.9% of wage).
  - **Essential Living (Food + Rent)**: **$537.10 / month** (142.9h labor • 89.3% of wage).

---

### D. Econometric Estimation Policy for Data-Sparse States
For 19 states where official statistical agencies do not publish standard consumer price indexes or regular labor surveys (e.g. North Korea, Eritrea, Syria, Afghanistan, Cuba, Haiti, Somalia, Yemen, South Sudan):
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
