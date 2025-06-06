# Spenddy

<div align="center">
  <img src="./public/logo.png" alt="Spenddy Logo" width="200" height="200" />
  
  **Transform Your Swiggy Order Data into Beautiful Analytics**
  
  A modern, privacy-first web application that analyzes your Swiggy order history with interactive dashboards and insightful visualizations.

  [![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-4.4.0-purple)](https://vitejs.dev/)
</div>

## ✨ Features

### 📊 **Comprehensive Analytics**

- **📈 Overview Dashboard** - Key metrics, order frequency, and spending summaries
- **💰 Spending Analysis** - Monthly/yearly trends with detailed breakdowns
- **🍽️ Restaurant Analytics** - Top restaurants, cuisine preferences, and ordering patterns
- **📍 Location Insights** - Interactive map with real restaurant and delivery coordinates
- **⏰ Order Activity** - GitHub-style heatmap showing your ordering patterns throughout the year

### 🎨 **Modern Experience**

- **🌙 Beautiful Dark Theme** - Eye-friendly interface with smooth animations
- **📱 Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- **🎯 Interactive Visualizations** - Dynamic charts and maps powered by Chart.js and Leaflet
- **⚡ Fast & Smooth** - Optimized performance with React 18 and modern build tools

### 🔒 **Privacy-First Design**

- **🏠 100% Client-Side** - All data processing happens in your browser
- **🔐 Zero Data Collection** - Your personal data never leaves your device
- **📤 No External Servers** - Complete privacy and security guaranteed

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd swig
   pnpm install
   ```

2. **Start development server**

   ```bash
   pnpm dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### 📦 Production Build

```bash
pnpm build
```

## 📱 How to Use

### Step 1: Get Your Swiggy Data

1. Login to [Swiggy.com](https://swiggy.com)
2. Go to **Account** → **Privacy** → **Download your data**
3. Request data export and download the ZIP file when ready

### Step 2: Upload to Spenddy

1. Extract the downloaded ZIP file
2. Find the `allOrders.json` file
3. Drag and drop it into Spenddy or use the upload button

### Step 3: Explore Your Analytics

- **📊 Overview**: Total orders, spending, and key statistics
- **💳 Spending**: Detailed spending patterns and trends
- **🏪 Restaurants**: Your favorite places and cuisine preferences  
- **🗺️ Locations**: Interactive map with order locations and heatmaps
- **📅 Activity**: Year-long order activity heatmap

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 + TypeScript |
| **Styling** | Tailwind CSS + Custom Dark Theme |
| **Build Tool** | Vite |
| **Charts** | Chart.js + Recharts |
| **Maps** | Leaflet + React-Leaflet |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |

## 🌐 Deployment

### GitHub Pages (Recommended)

1. Fork/clone this repository
2. Enable GitHub Pages in repository settings
3. Choose "GitHub Actions" as source
4. Push to `main` branch for automatic deployment

### Manual Deployment

```bash
pnpm build
# Deploy the dist/ folder to your hosting platform
```

## 🎨 Screenshots

<div align="center">
  <img src="./assets/demo.gif" alt="Spenddy Demo" width="100%" />
</div>

## 📊 Analytics Features

### Spending Analysis

- 📈 Monthly and yearly spending trends
- 💰 Breakdown by fees (delivery, packing, convenience)
- 🎫 Discount and coupon analysis
- 📊 Average order value patterns

### Restaurant Analytics  

- 🏆 Top restaurants by order count and spending
- 🍜 Cuisine preference analysis
- 📍 Location-based restaurant insights
- ⭐ Restaurant performance tracking

### Location Insights

- 🗺️ Interactive map with real coordinates
- 🏠 Delivery location analysis  
- 🏪 Restaurant location patterns
- 📊 Geographic spending distribution

### Order Activity

- 📅 Year-long GitHub-style heatmap
- ⏰ Peak ordering times and days
- 📈 Order frequency patterns
- 🎯 Activity trends and insights

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── dashboards/         # Analytics dashboards
│   ├── ui/                # Reusable UI components  
│   ├── Header.tsx         # App header with logo
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── FileUpload.tsx     # File upload component
├── types/
│   └── SwiggyData.ts      # TypeScript interfaces
├── utils/
│   └── dataProcessor.ts   # Data processing logic
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── App.tsx               # Main application
```

### Adding New Features

1. Create processing functions in `utils/dataProcessor.ts`
2. Add dashboard component in `components/dashboards/`
3. Update navigation in `src/App.tsx`
4. Add menu item in `Sidebar.tsx`

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for food lovers who want data-driven insights
- Inspired by the need for privacy-first analytics tools
- Thanks to the amazing open-source community

---

<div align="center">
  <p><strong>Made with ❤️ for food lovers everywhere</strong></p>
  <p><em>Spenddy - Your personal food ordering analytics companion</em></p>
</div>
