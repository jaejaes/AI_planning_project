# PriorityAI Landing Page

Static B2B SaaS landing page built with plain HTML, CSS, and vanilla JavaScript.

## Files

- `index.html`
- `style.css`
- `script.js`
- `vercel.json`

## Local Preview

Open `index.html` directly in a browser.

## GitHub Ready

This project has no build step and can be pushed to GitHub as-is.

Recommended files to keep in the repository:

- `index.html`
- `style.css`
- `script.js`
- `vercel.json`
- `.gitignore`

## Vercel Setup

1. Create a new GitHub repository.
2. Push this project folder to that repository.
3. In Vercel, click `Add New Project`.
4. Import the GitHub repository.
5. Set Framework Preset to `Other` or `No Framework`.
6. Leave Build Command empty.
7. Leave Output Directory empty.
8. Deploy. After that, every push to GitHub will trigger an automatic Vercel deployment.

## Example Git Commands

If Git is installed on your machine, you can use:

```bash
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Notes

- `vercel.json` contains a simple static-site deployment configuration.
- No package installation is required.

## Analytics Setup

Tracking placeholders are defined in `index.html`:

```html
window.ANALYTICS_CONFIG = {
  ga4MeasurementId: "G-08TNKEJNM4",
  contentsquareTagId: "eaeb680a6a6c2"
};
```

Both analytics IDs are now set in the current project version.

The site already sends basic events for:

- CTA clicks
- Mobile navigation toggle
- Lead form validation errors
- Lead form submission
