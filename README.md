# MathBank – English Web Version

This repository is the GitHub Pages / web-ready adaptation of the supplied MathBank package.

## What is included
- English MathBank web interface
- Question bank browsing and filtering UI
- Question editor / add / edit / delete demo
- Statistics and settings UI
- Theme and dark-mode controls
- Paper workspace UI retained for future use
- Responsive layout for desktop and mobile
- Original-style JavaScript modules consolidated into `static/js/mathbank.js` where applicable

## What was removed from the web deployment
- Bundled Windows Python runtime and DLLs
- Windows batch launcher
- Local-only upload/runtime folders
- Local copies of large third-party libraries when a CDN version is suitable

## Important
GitHub Pages can serve the frontend, but it cannot execute the original Python/FastAPI backend. Features that depend on `/api/*` (database, OCR, AI, PDF/Word export, etc.) require a separate backend deployment. The current web version therefore provides the English frontend and a browser-based demo for the core question-bank interaction.
