# Fluent Notes

A personal note-taking workspace built with **React** and Microsoft's **Fluent UI React v9** (Fluent 2 design language), published on GitHub Pages.

## Features

- Create, edit, and automatically save notes in your browser.
- Search titles, note contents, and tags.
- Organize notes with comma-separated tags and pastel note colors.
- Pin important notes and mark favorites.
- Archive notes, restore them, and move notes to trash before permanent deletion.
- Export all notes as a JSON backup and import a backup later.
- Light and dark themes, responsive mobile layout, and keyboard shortcuts.
- Lightweight static hosting: no server, account, or API keys required.

## Privacy and storage

Notes are stored in this browser's `localStorage`. They do not sync to other devices or browsers. Clearing this site's browser storage can remove the notes, so use **Export backup** periodically if the notes matter to you. Importing a backup replaces the notes currently in this browser.

## Run locally

Requires Node.js 22 or another Node.js version supported by the installed Vite release.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds the app and deploys the `dist` folder whenever a commit is pushed to `main`, and can also be run manually from the Actions tab.

One-time setup: open [**Settings → Pages**](https://github.com/bradleysouciercomputer/Microsoft-Fluent-2-Testing/settings/pages) and choose **GitHub Actions** under Build and deployment. GitHub does not allow this workflow token to enable Pages itself. Then open **Actions**, select **Deploy to GitHub Pages**, and run the workflow (or push another commit). After deployment succeeds, the site will be available at:

https://bradleysouciercomputer.github.io/Microsoft-Fluent-2-Testing/

## Design reference

The UI uses Fluent UI React v9 components and follows Microsoft's Fluent 2 guidance for typography, visual hierarchy, spacing, accessible controls, and neutral surfaces.

- [Fluent 2 React components](https://fluent2.microsoft.design/components/web/react)
- [Fluent 2 design tokens](https://fluent2.microsoft.design/design-tokens)
