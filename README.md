# Revision Helper

A simple browser-based revision helper for school subjects.

## Features

- Computer Science, Science, English, and Maths topics
- Flashcard mode for quick review
- Question task mode for active practice

## Usage

1. Open `index.html` in your browser.
2. Select a subject.
3. Choose between `Flashcards` or `Question Task`.
4. Use the buttons to navigate and review content.

## Publish as a website

This project is a static website and can be hosted on GitHub Pages, Netlify, Vercel, or another static host.

### GitHub Pages

1. Create a GitHub repository and push this project.
2. Enable Pages in the repository settings using the `main` branch and root folder.
3. Your site will be available at `https://<username>.github.io/<repo>`.

### Custom domain

This project can use the custom domain `Testrevisionuk.com` on GitHub Pages.

1. Add a `CNAME` file containing:
   ```
   Testrevisionuk.com
   ```
2. In GitHub Pages settings, set the custom domain to `Testrevisionuk.com`.
3. Configure your DNS:
   - Create an `A` record for `Testrevisionuk.com` pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - (Optional) Add a `CNAME` record for `www` pointing to `Testrevisionuk.com`.

### Local preview

Install a simple static server and run it from the project root:

```bash
npm install
npm run start
```

### Deploying the site

- Push this project to GitHub and enable Pages on the repository root.
- Use Netlify or Vercel to deploy directly from your GitHub repository.
- A `CNAME` file is already included for `Testrevisionuk.com`.

## Files

- `index.html` — main app layout
- `style.css` — styling
- `script.js` — app behavior
