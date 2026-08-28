# AtlasIndex

> **Real Purchasing Power & Living Cost Parity Across All 195 Sovereign Nations of the World**

AtlasIndex is an open-source, empirical economic platform developed by **BanguDevClub**. It replaces abstract macroeconomic indicators (such as GDP per capita) and informal single-item metrics (such as the Big Mac Index) with a concrete, human standard:

> **How many hours, minutes, and months of physical labor must a median-wage earner work in their domestic economy to afford essential human living pillars?**

---

## 🌟 Key Features

- **Universal 195-Nation Dataset + Global Benchmark (`🌐 World Average`)**: Complete coverage across all 195 sovereign nations of the world, with transparent econometric estimation flags for data-sparse and closed economies.
- **The 4 Essential Living Pillars**:
  1. **🍚 Nutrition**: Standardized 13-item monthly grocery basket delivering ~2,300 kcal/day adhering to WHO/FAO dietary guidelines.
  2. **🏠 Housing**: National weighted median monthly rent for a 1-bedroom self-contained residential apartment.
  3. **🚗 Transport**: Retail purchase price for a standard new compact passenger vehicle (C-segment: Toyota Corolla / VW Golf equivalent).
  4. **🩺 Healthcare**: Routine clinical outpatient preventive checkup + complete diagnostic blood panels (CBC, fasting glucose, lipid, metabolic).
- **Atlas Purchasing Power Index (APPI)**: Normalized 0–100 score classifying countries into 4 Nutritional Stress Tiers (Low, Moderate, High, Severe) based on Engel's Law and physical labor hours.
- **Custom Searchable Select & Mobile Optimization**:
  - Instant real-time search across all 196 entities with flags, ISO codes, and wage subtitles.
  - Responsive bottom-sheet modal on mobile devices with touch-friendly targets.
  - Touch-optimized pill navigation and horizontally scrollable tables.
- **Interactive Multi-Page Experience**:
  - **Overview (`/`)**: Live multi-pillar labor calculator, key global contrasts, and interactive previews.
  - **Dashboard (`/dashboard`)**: Multi-pillar bar charts, food category decompositions, wage vs basket scatter plots, and continental filters.
  - **Continents (`/continents`)**: 5 continental regional benchmarks (Africa, Americas, Asia, Europe, Oceania) side-by-side with the World Average.
  - **Global Rankings (`/ranking`)**: Filterable, sortable 195-nation table with pinned World Average row, expandable scorecards, and one-click CSV/JSON export.
  - **Side-by-Side Comparator (`/compare`)**: Compare 2 to 4 economies head-to-head with radar charts and a relocation salary simulator.
  - **Methodology & Whitepaper (`/methodology`)**: Comprehensive documentation with server-rendered KaTeX LaTeX mathematical equations, sources, and estimation models.
- **Multi-Theme Design System**:
  - **Default Light** & **Default Dark**
  - **4 Official Catppuccin Variants**: **Latte** (Light), **Frappé** (Medium Dark), **Macchiato** (Dark), and **Mocha** (Deep Dark).
  - Instant, zero-flash theme persistence using local storage and semantic HSL tokens.

---

## 📐 Economic Methodology & Mathematical Formulations

Every metric in AtlasIndex is derived from standardized mathematical equations rendered via KaTeX:

### 1. Hourly Median Take-Home Wage ($W_{\text{hourly}}$)
$$W_{\text{hourly}} = \frac{W_{\text{median}}}{H_{\text{month}}} = \frac{W_{\text{median}}}{160}$$
Standardized to a full-time benchmark of 160 labor hours per month (40h/week × 4 weeks).

### 2. Monthly Food Basket Cost ($B$) & Labor Hours ($H_{\text{food}}$)
$$B = \sum_{i=1}^{13} \left( p_i \times q_i \right)$$
$$H_{\text{food}} = \frac{B}{W_{\text{hourly}}} = \left( \frac{B}{W_{\text{median}}} \right) \times 160 \quad \text{and} \quad \beta_{\text{food}} = \left( \frac{B}{W_{\text{median}}} \right) \times 100\%$$

### 3. Housing Rent Labor Hours ($H_{\text{rent}}$) & Wage Share ($\beta_{\text{rent}}$)
$$H_{\text{rent}} = \frac{R_{\text{1BR}}}{W_{\text{hourly}}} \quad \text{and} \quad \beta_{\text{rent}} = \left( \frac{R_{\text{1BR}}}{W_{\text{median}}} \right) \times 100\%$$

### 4. Vehicle Purchase Labor Months ($M_{\text{car}}$)
$$M_{\text{car}} = \frac{P_{\text{car}}}{W_{\text{median}}} \quad \text{and} \quad H_{\text{car}} = M_{\text{car}} \times 160 = \frac{P_{\text{car}}}{W_{\text{hourly}}}$$

### 5. Healthcare Diagnostic Checkup ($H_{\text{med}}$)
$$H_{\text{med}} = \frac{C_{\text{checkup}}}{W_{\text{hourly}}} \quad \text{and} \quad \beta_{\text{med}} = \left( \frac{C_{\text{checkup}}}{W_{\text{median}}} \right) \times 100\%$$

---

## 🎯 The Atlas Purchasing Power Index (APPI)

APPI is a normalized composite index on a continuous scale of **1 to 100**:

$$\text{APPI} = \text{clamp}\Big( \text{round}\left( 0.70 \times F_{\text{wage}} + 0.30 \times F_{\text{hours}} \right),\, 1,\, 100 \Big)$$

where:
$$F_{\text{wage}} = \max\left( 0,\, 100 - (\beta_{\text{food}} \times 1.8) \right)$$
$$F_{\text{hours}} = \max\left( 0,\, 100 - (H_{\text{food}} \times 1.0) \right)$$

### Classification Tiers:
| Tier | Wage Share ($\beta_{\text{food}}$) | Monthly Labor ($H_{\text{food}}$) | APPI Range | Exemplar Economies |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Low Stress** | $< 10\%$ | $< 16\text{h}$ | **75 – 100** | Switzerland, USA, Denmark, Qatar |
| **Tier 2: Moderate** | $10\% – 20\%$ | $16\text{h} – 32\text{h}$ | **55 – 74** | Poland, Chile, Portugal, Malaysia |
| **Tier 3: High Stress** | $20\% – 35\%$ | $32\text{h} – 56\text{h}$ | **30 – 54** | Brazil, South Africa, Turkey, Thailand |
| **Tier 4: Severe Stress** | $> 35\%$ | $> 56\text{h}$ | **1 – 29** | Nigeria, Pakistan, Egypt, Cuba |

---

## 🌐 Global Benchmark Baseline (`World Average`)

- **Median Net Wage**: **$1,022.50 / month** ($6.39 / hour).
- **Monthly Food Basket**: **$138.00 / month** (67.9h labor • 42.5% of wage).
- **1-Bedroom Rent**: **$399.10 / month** (74.9h labor • 46.8% of wage).
- **New Passenger Car**: **$22,682.10** (89.3 months of median wage).
- **Medical Checkup**: **$74.40** (22.3h labor • 13.9% of wage).
- **Combined Essential Living (Food + Rent)**: **$537.10 / month** (142.9h labor • 89.3% of wage).

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Astro 7.x** | High-performance Static Site Generation (SSG) with Vite 8. |
| **UI Components** | **React 19** | Interactive client islands (`client:load`, `client:visible`). |
| **Styling & CSS** | **Tailwind CSS 3.x + PostCSS** | Semantic HSL design tokens, glassmorphism, responsive utilities. |
| **Component Primitives**| **shadcn/ui + Radix UI** | Accessible dialogs, tabs, sliders, tooltips, select dropdowns. |
| **Select & Search** | **Custom SearchableSelect** | Real-time keyboard-navigable search & mobile bottom sheets. |
| **Mathematical Rendering**| **KaTeX** | Fast, server-rendered LaTeX equations via `<Latex formula={...} />`. |
| **Data Visualization** | **Recharts 3.x** | Multi-pillar bar charts, stacked compositions, scatter plots. |
| **Icons** | **Lucide React** | Consistent iconography across Astro templates and React components. |
| **Type Safety** | **TypeScript 5.x + Astro Check** | Strict domain typing with `npm run check`. |

---

## 🚀 Development & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ or v24+ recommended)
- **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Run Type Checking & Linter
```bash
npm run check
```

### 4. Build for Production
```bash
npm run build
```
The static distribution files will be generated into the `dist/` directory.

---

## 📁 Project Structure

```text
atlasindex/
├── src/
│   ├── components/
│   │   ├── compare/          # CountryComparator.tsx (multi-country comparator & simulator)
│   │   ├── continents/       # ContinentComparator.tsx (regional summaries & drilldown)
│   │   ├── dashboard/        # DashboardContainer.tsx (multi-pillar visualizations & scatter)
│   │   ├── landing/          # HeroSection, QuickCalculator, HighlightsGrid, GlobalOverviewPreview
│   │   ├── methodology/      # MethodologyContent.astro (scientific whitepaper & LaTeX models)
│   │   ├── ranking/          # RankingContainer.tsx (sortable 195-nation table & CSV/JSON export)
│   │   ├── ui/               # shadcn UI components + SearchableSelect + Latex.astro
│   │   ├── Footer.astro      # Global site footer
│   │   ├── Navbar.astro      # Touch-friendly responsive navigation header
│   │   └── ThemeToggle.tsx   # Light/Dark/Catppuccin theme selector
│   ├── data/
│   │   ├── continents/       # 195 nations: africa.ts, americas.ts, asia.ts, europe.ts, oceania.ts
│   │   ├── basketDefinition.ts # 13 food items, calories, and non-food pillar specs
│   │   └── countries.ts      # Aggregated RAW_COUNTRIES dataset
│   ├── layouts/
│   │   └── Layout.astro      # Master layout with SEO meta tags & zero-flash theme hydration
│   ├── lib/
│   │   ├── methodology.ts    # Calculation engine, APPI score, global average synthesis
│   │   ├── types.ts          # Strict TypeScript interfaces
│   │   └── utils.ts          # Formatting & getBasePath helper
│   ├── pages/
│   │   ├── index.astro       # / landing page
│   │   ├── dashboard.astro   # /dashboard route
│   │   ├── continents.astro  # /continents route
│   │   ├── ranking.astro     # /ranking route
│   │   ├── compare.astro     # /compare route
│   │   └── methodology.astro # /methodology route
│   └── styles/
│       └── globals.css       # Tailwind directives, KaTeX styles, HSL theme tokens
├── astro.config.mjs          # Astro configuration with GitHub Pages base path (/atlasindex)
├── package.json              # Dependencies and npm scripts
├── postcss.config.mjs        # Native Vite PostCSS Tailwind configuration
├── tailwind.config.mjs       # Tailwind configuration with shadcn tokens
└── tsconfig.json             # TypeScript path aliases (@/* -> src/*)
```

---

## 📜 License & Citation

All software code is open source under the **MIT License**.
Economic data and methodology documentation are licensed under **[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)**.

Developed with ❤️ by **[BanguDevClub](https://github.com/BanguDevClub)**.
