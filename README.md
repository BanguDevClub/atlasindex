# AtlasIndex

> **Real Food Purchasing Power & Labor Effort Parity Across Global Economies**

AtlasIndex is an open, transparent economic comparison platform built with **Astro**, **React**, and **shadcn/ui**. It replaces abstract GDP metrics and single-item fast-food indexes with a concrete human standard: **how many hours and minutes of labor a median-wage earner must work to afford a nutritionally balanced monthly food basket across 26 countries**.

---

## 🌟 Key Features

- **Standardized Nutritional Food Basket**: 13 essential grocery items (Rice, Beans, Bread, Potatoes, Chicken, Beef, Eggs, Milk, Cheese, Tomatoes, Onions, Apples, Cooking Oil) delivering ~2,300 kcal/day adhering to WHO guidelines.
- **Median Wage Grounding**: Avoids mean-wage distortion by tracking official 50th-percentile disposable earnings from ILOSTAT, OECD, US BLS, Eurostat, IBGE, Statistics Japan, and other national statistical institutes.
- **Granular Labor Metrics**: Calculates exact hours of work required for the entire basket, and exact minutes of work per individual kilogram/unit of staple items.
- **Atlas Purchasing Power Index (APPI)**: Normalized 0–100 score classifying countries into 4 Dietary Stress Tiers (Low, Moderate, High, Severe).
- **Interactive Multi-Page Experience**:
  - **Landing Page (`/`)**: Live interactive food labor calculator, key real-world contrasts, global overview preview.
  - **Dashboard (`/dashboard`)**: Interactive charts, category stacked labor decomposition, wage vs basket scatter plots, regional filters.
  - **Country Rankings (`/ranking`)**: Filterable, sortable 26-nation data table with expandable item breakdowns and one-click CSV/JSON export.
  - **Side-by-Side Comparator (`/compare`)**: Compare 2 to 4 economies head-to-head with radar charts and a relocation salary simulator.
  - **Methodology & Sources (`/methodology`)**: Full mathematical whitepaper, equations, item specifications, limitations, and citations directory.
- **Multi-Theme Design System**:
  - **Default Light** & **Default Dark**
  - **4 Official Catppuccin Variants**: **Latte** (Light), **Frappé** (Medium Dark), **Macchiato** (Dark), and **Mocha** (Deep Dark).
  - Instant, zero-flash theme persistence using local storage and semantic HSL CSS tokens.

---

## 📐 Economic Methodology & Formulas

### 1. Standard Monthly Basket Cost ($B$)
$$B = \sum_{i=1}^{13} (p_i \times q_i)$$
Where $p_i$ is the retail price of item $i$ and $q_i$ is its reference monthly quantity.

### 2. Median Wage Share ($\beta$)
$$\beta = \left(\frac{B}{W_{\text{median}}}\right) \times 100\%$$

### 3. Labor Hours Required ($H$)
$$H = \frac{B}{W_{\text{hourly}}} = \frac{B}{W_{\text{median}} / 160}$$

### 4. Granular Item Work Minutes ($M_i$)
$$M_i = \left(\frac{p_i}{W_{\text{hourly}}}\right) \times 60$$

### 5. Dietary Stress Tiers
| Tier | Wage Share ($\beta$) | Labor Hours ($H$) | Description |
|---|---|---|---|
| **Tier 1 (Low Stress)** | $< 10\%$ | $< 16\text{h}$ | High food security & dietary diversity |
| **Tier 2 (Moderate Stress)** | $10\% - 20\%$ | $16\text{h} - 32\text{h}$ | Accessible nutrition with moderate budget pressure |
| **Tier 3 (High Stress)** | $20\% - 35\%$ | $32\text{h} - 56\text{h}$ | Vulnerable to staple inflation |
| **Tier 4 (Severe Stress)** | $> 35\%$ | $> 56\text{h}$ | Critical labor drain on median households |

---

## 🏛️ Primary Data Sources

All wage and price data points are sourced from official national statistics agencies and international organizations:

- **International Labour Organization (ILOSTAT)**: Median earnings series
- **OECD Labour Force Statistics**: Employment and disposable wage distributions
- **Eurostat**: Structure of Earnings Survey & Harmonized CPI
- **U.S. Bureau of Labor Statistics (BLS)**: Usual weekly earnings & Food CPI
- **Statistics Canada (StatCan)**: Labour Force Survey & monthly food prices
- **IBGE Brazil**: Pesquisa Nacional por Amostra de Domicílios (PNAD Contínua) & DIEESE
- **Statistics Japan (MHLW & SBJ)**: Basic Survey on Wage Structure & Retail Price Survey
- **Statistics Korea (KOSTAT)**: Economically Active Population Survey
- **CAPMAS Egypt & NBS Nigeria**: National labor and consumer price bulletins
- **World Bank International Comparison Program (ICP)** & **FAO Food Price Index**

---

## 🎨 Design System & Theming

AtlasIndex utilizes Tailwind CSS with shadcn/ui components mapped to semantic CSS variable tokens:

| Theme Name | Flavour | Base Surface | Accent | Primary Color |
|---|---|---|---|---|
| **Default Light** | Slate / Clean | `#ffffff` / `#f1f5f9` | Slate Accent | `#2563eb` Blue |
| **Default Dark** | Zinc / Deep | `#090d16` / `#1e293b` | Dark Slate | `#3b82f6` Blue |
| **Catppuccin Latte** | Warm Light | `#eff1f5` / `#e6e9ef` | `#ccd0da` Surface | `#1e66f5` Blue |
| **Catppuccin Frappé** | Cozy Dark | `#303446` / `#292c3c` | `#414559` Surface | `#8caaee` Sapphire |
| **Catppuccin Macchiato**| Dark | `#24273a` / `#1e2030` | `#363a4f` Surface | `#8aadf4` Blue |
| **Catppuccin Mocha** | Deep Dark | `#1e1e2e` / `#181825` | `#313244` Surface | `#89b4fa` Blue |

---

## 🛠️ Development & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:4321`.

### 3. Build for Production
```bash
npm run build
```
The output will be built into the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
atlasindex/
├── src/
│   ├── components/
│   │   ├── compare/          # Multi-country comparator & simulator
│   │   ├── dashboard/        # Dashboard KPIs & Recharts visualizations
│   │   ├── landing/          # Hero, QuickCalculator, Highlights, Preview
│   │   ├── methodology/      # Whitepaper & data sources documentation
│   │   ├── ranking/          # Searchable, sortable data table & export
│   │   ├── ui/               # shadcn component primitives (Card, Table, Badge, etc.)
│   │   ├── Footer.astro      # Global site footer
│   │   ├── Navbar.astro      # Responsive navigation header
│   │   └── ThemeToggle.tsx   # Light/Dark/Catppuccin theme selector
│   ├── data/
│   │   ├── basketDefinition.ts # 13-item nutritional basket definition
│   │   └── countries.ts      # 26-country economic raw data & sources
│   ├── layouts/
│   │   └── Layout.astro      # Master layout with SEO & theme hydration
│   ├── lib/
│   │   ├── methodology.ts    # Mathematical calculation engine
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── utils.ts          # Formatting & class merging helpers
│   ├── pages/
│   │   ├── compare.astro     # /compare route
│   │   ├── dashboard.astro   # /dashboard route
│   │   ├── index.astro       # / landing page
│   │   ├── methodology.astro # /methodology route
│   │   └── ranking.astro     # /ranking route
│   └── styles/
│       └── globals.css       # Semantic HSL theme variables
├── astro.config.mjs
├── components.json
├── package.json
├── tailwind.config.mjs
└── tsconfig.json
```

---

## 📜 License & Citation

All software code is open source under the [MIT License](LICENSE).
Economic data and methodology documentation are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
