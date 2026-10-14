# Job Application Tracker

A frontend-only kanban board for tracking job applications. Built with plain HTML, CSS and JavaScript. Data is saved in the browser's localStorage, so no backend or database is needed.

## Features
- Add, edit and delete applications (company, role, job link, date, notes)
- Four columns: Applied, Interview, Offer, Rejected
- Drag and drop cards between columns to update the status
- Search by company, role or notes, and filter by status
- Live summary counts for each status
- Sample data preloaded, with a "Reset demo data" button

## Run locally
Open `index.html` in any modern browser. No install or build step.

## Deploy (free)
**GitHub Pages:** push this folder to a repo, then Settings > Pages > deploy from the `main` branch (root).
**Netlify:** drag and drop the folder at app.netlify.com/drop.

## Tech
HTML5 (dialog element, native drag and drop), CSS Grid, vanilla JavaScript, localStorage.

## Possible extensions
- Chart.js dashboard of applications per week
- Export to CSV
- Follow-up reminders