# Material Notes

A personal notes workspace built with React and Google's official **Material Web** components using the **Material 3** design system. Published on GitHub Pages.

## Features

- Create, edit, and automatically save notes in this browser.
- Search note titles, body text, and tags.
- Organize notes with comma-separated tags, color roles, pinning, and favorites.
- Archive notes, restore them, and move deleted notes to Trash before permanent deletion.
- Preview Markdown headings, bold, italic, strikethrough, lists, quotations, and interactive checklist items.
- Light and dark Material 3 color schemes.
- Export and import JSON backups, with validation of imported IDs, tags, colors, and file size.
- Responsive desktop and mobile workspace with keyboard shortcuts.

## Privacy and storage

Notes are stored in this browser's \`localStorage\`. They do not sync to other devices or browsers. Clearing this site's browser storage can remove notes, so use **Export backup** periodically. Importing a backup replaces the notes currently saved in this browser.

## Run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Create a production build with \`npm run build\`.

## GitHub Pages

The workflow in \`.github/workflows/deploy.yml\` builds and deploys the \`dist\` folder on pushes to \`main\`. If needed, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

https://bradleysouciercomputer.github.io/Microsoft-Fluent-2-Testing/

## Design and implementation

- [Google Material 3 design system](https://m3.material.io/)
- [Google Material Web components](https://github.com/material-components/material-web)
- [Material Web quick start](https://github.com/material-components/material-web/blob/main/docs/quick-start.md)

The app uses Material Web's buttons, icon buttons, text fields, select/options, icons, checkboxes, and official typography styles. App-specific layouts and note cards use Material 3 system color and shape roles.

Note: The Material Web repository currently indicates that the project is in maintenance mode pending new maintainers. The app uses the published \`@material/web\` 2.x release range.
