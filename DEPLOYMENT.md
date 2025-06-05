# GitHub Pages Deployment Guide for Spenddy

This guide will help you deploy your Spenddy application to GitHub Pages for easy public access.

## 🚀 Quick Setup

### 1. Repository Setup

1. **Push your code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy on the next push to `main`

### 3. Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

- ✅ Install dependencies using pnpm
- ✅ Build the project with production optimizations
- ✅ Deploy to GitHub Pages automatically
- ✅ Set up proper base path for subdirectory deployment

## 🌐 Access Your Deployed App

Once deployed, your app will be available at:

```
https://yourusername.github.io/swig/
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Install gh-pages package** (already added to package.json):

   ```bash
   pnpm install
   ```

2. **Deploy manually**:

   ```bash
   pnpm run deploy
   ```

## 📁 Configuration Details

### Vite Configuration

- **Base Path**: Configured for `/swig/` subdirectory
- **Output Directory**: `dist/` folder
- **Environment Detection**: Automatically uses correct base path

### GitHub Actions Workflow

- **Trigger**: Pushes to `main` branch
- **Node Version**: 18.x
- **Package Manager**: pnpm with caching
- **Build Command**: `pnpm run build`
- **Deploy Source**: `dist/` folder

## 🔍 Troubleshooting

### Common Issues

1. **404 Error on Refresh**
   - ✅ **Not an issue**: This is a SPA without React Router, so no 404s on refresh

2. **Assets Not Loading**
   - Check if the base path is correct in `vite.config.ts`
   - Ensure all asset imports are relative

3. **Build Fails**
   - Check the Actions tab for detailed error logs
   - Ensure all dependencies are in `package.json`

4. **Page Not Updating**
   - Wait a few minutes for GitHub Pages to propagate
   - Clear browser cache
   - Check if the workflow completed successfully

### Debugging Steps

1. **Check Workflow Status**:
   - Go to Actions tab in your repository
   - Look for failed builds and error messages

2. **Test Local Build**:

   ```bash
   pnpm run build
   pnpm run preview
   ```

3. **Verify Configuration**:
   - Ensure `base: '/swig/'` in `vite.config.ts`
   - Check that `.nojekyll` file exists in `public/`

## 🎯 Optimization Tips

1. **Performance**:
   - Source maps are enabled for debugging
   - Assets are automatically optimized
   - Build includes tree-shaking

2. **SEO**:
   - Meta tags are included in `index.html`
   - Open Graph tags for social sharing
   - Proper title and descriptions

3. **Security**:
   - All data processing is client-side
   - No server-side data transmission
   - Privacy-first approach maintained

## 🔄 Update Deployment

To update your deployed app:

1. Make changes to your code
2. Commit and push to `main` branch:

   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

3. GitHub Actions will automatically rebuild and deploy

## 📞 Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Check the repository Issues section

---

**Your Spenddy app is now ready for the world! 🌍**

Share your deployed link and let users analyze their Swiggy data privately and securely.
