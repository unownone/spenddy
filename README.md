# Spenddy 🍕

![Spenddy Demo](./assets/demo.gif)

**Advanced Swiggy Order Analytics Platform**

A modern, React + TypeScript web application that transforms your Swiggy order data into beautiful, interactive analytics dashboards. Built with cutting-edge technologies for the best user experience.

![Spenddy Preview](https://img.shields.io/badge/Status-Ready%20for%20Development-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue)

## ✨ Features

### 📊 **Comprehensive Analytics**

- **Overview Dashboard** - Key metrics and summary statistics
- **Spending Analysis** - Monthly and yearly spending patterns
- **Restaurant Analytics** - Favorite restaurants and cuisine preferences
- **Order Patterns** - Time-based ordering behavior analysis
- **Location Insights** - Delivery location and area analysis
- **Smart Insights** - AI-powered insights and recommendations

### 🎨 **Modern UI/UX**

- **Dark Theme** - Beautiful, modern dark interface
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Interactive Charts** - Chart.js and Recharts visualizations
- **Drag & Drop Upload** - Intuitive file upload experience

### 🔒 **Privacy-First**

- **Client-Side Processing** - All data processed in your browser
- **No Server Required** - Complete frontend-only solution
- **Your Data Stays Private** - Nothing sent to external servers

### 🚀 **Performance**

- **Fast Processing** - Optimized data processing algorithms
- **Real-time Filtering** - Dynamic time-based filtering
- **Lazy Loading** - Components load as needed
- **Optimized Rendering** - React.memo and useMemo optimizations

## 🛠 Tech Stack

- **Frontend Framework**: React 18.2 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Charts**: Chart.js & Recharts
- **Icons**: Lucide React
- **File Upload**: React Dropzone
- **Date Handling**: date-fns
- **Build Tool**: Create React App
- **State Management**: React Hooks (useState, useMemo, useCallback)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd swig
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
pnpm run build
```

This creates an optimized production build in the `dist/` folder.

### 🌐 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Instructions

1. **Enable GitHub Pages**
   - Go to your repository → Settings → Pages
   - Source: "GitHub Actions"
   - The site will be available at: `https://yourusername.github.io/swig/`

2. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - GitHub Actions will build and deploy your app
   - Check the Actions tab for deployment status

3. **Custom Domain (Optional)**
   - Add a `CNAME` file to the `public/` folder with your domain
   - Configure your domain's DNS to point to GitHub Pages

#### Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
pnpm run build

# Deploy to gh-pages branch (requires gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

## 📱 Usage

### Getting Your Data

1. **Login to Swiggy**
   - Go to [Swiggy.com](https://swiggy.com)
   - Login to your account

2. **Download Your Data**
   - Navigate to Account → Privacy → Download your data
   - Request your data export
   - Download the ZIP file when ready

3. **Upload to Spenddy**
   - Extract the ZIP file
   - Find the `allOrders.json` file
   - Drag and drop it into Spenddy

### Exploring Analytics

Once your data is uploaded, you can:

- **📈 Overview**: See total orders, spending, and key metrics
- **💰 Spending**: Analyze monthly/yearly spending patterns
- **🍽 Restaurants**: Discover your favorite restaurants and cuisines
- **⏰ Patterns**: Understand your ordering behavior by time
- **📍 Locations**: Explore delivery locations and areas
- **💡 Insights**: Get smart insights about your ordering habits

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── dashboards/      # Dashboard components
│   ├── Header.tsx       # App header
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── FileUpload.tsx   # File upload component
├── types/               # TypeScript type definitions
│   └── SwiggyData.ts    # Data interfaces
├── utils/               # Utility functions
│   └── dataProcessor.ts # Data processing logic
├── App.tsx              # Main app component
├── index.tsx            # App entry point
└── index.css            # Global styles
```

## 🎨 Customization

### Theme Colors

The app uses a custom color palette defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#ff6b35',  // Swiggy orange
    // ... other shades
  },
  dark: {
    900: '#0a0a0a',  // Background
    800: '#212529',  // Cards
    // ... other shades
  }
}
```

### Adding New Analytics

1. **Create processing function** in `utils/dataProcessor.ts`
2. **Add new dashboard component** in `components/dashboards/`
3. **Update routing** in `App.tsx`
4. **Add navigation item** in `Sidebar.tsx`

## 📊 Analytics Features

### Spending Analysis

- Monthly spending trends
- Yearly comparison
- Fees breakdown (delivery, packing, convenience)
- Discount and coupon analysis
- Average order value trends

### Restaurant Analytics

- Top restaurants by order count
- Top restaurants by spending
- Cuisine preferences
- Restaurant performance over time
- Location-based restaurant analysis

### Order Patterns

- Hourly ordering patterns
- Day-of-week analysis
- Peak vs off-peak ordering
- Seasonal trends
- Order frequency analysis

### Location Insights

- Delivery area analysis
- Distance patterns
- Area-wise spending
- Location-based preferences

### Smart Insights

- Highest order detection
- Farthest delivery analysis
- Longest delivery times
- Monthly favorites comparison
- Cancelled order analysis

## 🔧 Configuration

### Environment Variables

Create a `.env` file for any environment-specific settings:

```bash
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2024-01-01
```

### Build Optimization

The app is configured for optimal performance:

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Optimized assets
- **Bundle Analysis**: `npm run build` shows bundle stats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Swiggy** for providing the data export feature
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Chart.js & Recharts** for beautiful visualizations
- **Framer Motion** for smooth animations

## 📧 Support

If you have any questions or need help:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

**Made with ❤️ for food lovers who want to understand their ordering patterns**

*Spenddy - Bringing clarity to your food ordering journey* 🍽️📊
