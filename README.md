# Math Question Bank

This repository is the **GitHub Pages / static-web version** of the MathBank Question Bank workflow.

## Included in this web build

- Responsive desktop / tablet / mobile layout
- Login and student self-registration
- Admin and Student roles
- Question ID, marks, chapter, source, source year, tags
- Easy / Medium / Hard difficulty
- Active / Archived status
- Public / Private visibility
- Add, edit, delete, preview
- Delete confirmation and duplicate Question ID validation
- LaTeX math input and KaTeX rendering
- Search and filter: Chapter → Difficulty → Source
- Favorites for Admin and Student
- Random question selection
- Dashboard and statistics without charts
- Student dashboard
- English UI
- Browser persistence with `localStorage`

## Intentionally excluded from the GitHub Pages build

The original desktop package contains Python/FastAPI server code, a bundled Windows Python runtime, OCR services, AI providers, PDF/Word export, and paper-generation workflows. Those are not part of this static website because GitHub Pages cannot execute the desktop/backend runtime. Practice/Paper/AI/OCR features are also postponed according to the current project scope.

## Run

Open `index.html` through GitHub Pages. The root page redirects to `static/index.html`.

Demo admin account:

- Email: `admin@mathbank.local`
- Password: `admin123`

> This is a frontend-only V1. Authentication and question data are stored locally in the browser. Supabase/backend integration should be added later for real multi-user production use.
