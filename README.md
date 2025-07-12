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

### 1. Install the Chrome Extension (Required)

Spenddy offers a companion <strong>Chrome extension</strong> that grabs your Swiggy order history in a single click and stores it securely in your browser.

- Source code & manual install: <a href="https://github.com/unownone/spenddy-link" target="_blank">unownone/spenddy-link</a>
- Install from Chrome Web&nbsp;Store: <a href="https://chromewebstore.google.com/detail/mibpmhoncjmniigifepbckapmoflkglo?utm_source=item-share-cb" target="_blank">Spenddy&nbsp;Link</a>

> **Heads-up!** Manual upload has been **removed** in favour of the one-click browser extension.  
> The UI no longer shows an upload panel – simply install the *Spenddy Link* extension and your data will appear automatically.

---

### 2. Manual Upload (Alternative)

If you prefer not to use the extension you can still upload the data yourself:

1. Request your data export from Swiggy.
2. Extract the ZIP and locate <code>allOrders.json</code>.
3. Drag &amp; drop the file into Spenddy.

## 📱 How to Use

### Option A – Zero-Click via Chrome Extension

1. Install the extension from <a href="https://chromewebstore.google.com/detail/mibpmhoncjmniigifepbckapmoflkglo?utm_source=item-share-cb" target="_blank">Chrome&nbsp;Web&nbsp;Store</a> (or <a href="https://github.com/unownone/spenddy-link" target="_blank">manual GitHub version</a>).
2. Follow the extension's prompts – it will visit your Swiggy order history and save everything locally.
3. Open Spenddy (this web app). Your data will be detected automatically and the dashboards will load.

### Option B – Manual Upload

1. Login to Swiggy → Account → Privacy → Download Your Data.
2. Request the data export and download the ZIP when ready.
3. Extract the ZIP and find <code>allOrders.json</code>.
4. Upload the file in Spenddy.

Then…

### Explore Your Analytics

- **📊 Overview**: Total orders, spending, and key statistics
- **💳 Spending**: Detailed spending patterns and trends
- **🏪 Restaurants**: Your favorite places and cuisine preferences  
- **🗺️ Locations**: Interactive map with order locations and heatmaps

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

## 🎥 Demo Video

<div align="center">
  <iframe width="720" height="405" src="https://www.youtube.com/embed/9MSGW4WkbBc" title="Spenddy for Swiggy | Spenddy | Know your spends" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  <p><em>If the video doesn't load, <a href="https://www.youtube.com/watch?v=9MSGW4WkbBc" target="_blank">watch it on YouTube</a>.</em></p>
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

## 🔏 Privacy & License

- Spenddy is <strong>100% client-side</strong>; no data ever leaves your browser.
- We do <strong>not</strong> collect or store any personal information.
- Read our full <a href="/source/privacy-policy">Privacy&nbsp;Policy</a>.
- The project is open-source under the <a href="/LICENSE">MIT License</a> – contributions welcome!
