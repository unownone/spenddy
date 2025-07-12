# Cloudflare Pages Deployment Guide for Spenddy

This guide walks you through migrating and deploying Spenddy to **Cloudflare Pages**.

---

## 🚀 Quick Setup

1. **Create / log in to Cloudflare**
2. Navigate to **Pages → Create a project**
3. Authorise GitHub and select this repository.
4. Build settings:
   - **Framework preset**: *Vite* (auto-detects)
   - **Build command**: `pnpm install --frozen-lockfile && pnpm run build`
   - **Output directory**: `dist`
5. Click **Save and Deploy**. Your site will be available at `https://<project>.pages.dev`.

> **Note**: The repo already contains a `public/_redirects` file so Cloudflare automatically falls back to `index.html`, enabling client-side routing.

---

## 🌐 Custom Domain

1. In the Pages dashboard open **Custom Domains → Add domain**.
2. Choose your root domain or sub-domain.
3. Follow the prompt:
   - **If your DNS is already on Cloudflare**: a CNAME record will be added automatically.
   - **If your DNS is elsewhere**: either add the shown CNAME record or move your nameservers to Cloudflare for full features.
4. Cloudflare will issue an SSL certificate automatically.

---

## 🔄 Continuous Deployment

Every push to `main` (and pull-request branches) triggers a fresh build on Cloudflare Pages. No GitHub Actions workflow is required.

---

## 🛠️ Environment Variables

Set any secrets (analytics keys, API endpoints, etc.) under **Pages → Settings → Environment Variables**.  They will be exposed at build time.

---

## 🧹 Clean-up Steps from GitHub Pages

- The **GitHub Pages** workflow has been removed.
- The `gh-pages` devDependency has been deleted.
- Vite’s `base` path is `/`, so no further change is necessary.

---

## ✅ Verification Checklist

- [ ] First build on Cloudflare succeeds
- [ ] Main routes load: `/`, `/dashboard/spending`, etc.
- [ ] Custom domain (if any) resolves with valid TLS
- [ ] README badges and links updated to new URL

Your project is now Cloudflare-ready! 🎉 