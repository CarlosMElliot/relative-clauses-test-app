# Relative Clauses Test App

Timed browser-based grammar assessment for students.

## Current assessment
- 50 automatically graded questions on relative clauses
- Score calculated from 0–100 (2 points per question)
- 20-minute timer
- No pause control; automatic submission when time expires
- Fullscreen test mode
- Detects tab hiding, window blur and fullscreen exit and ends the attempt
- Copy/cut/paste/context-menu deterrence
- End-of-test review with the correct answer and grammar feedback
- Results page designed as evidence for Google Classroom

## Important security limitation
This is a normal web application, **not a secure exam browser**. A webpage cannot reliably prevent OS-level screenshots, another physical device, virtual machines, browser extensions, or every possible task-switching technique. The app therefore detects common focus/fullscreen changes and terminates the attempt, but it must not claim foolproof anti-cheating or screenshot prevention.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
The project is Vite/React and can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.

## Data
This first version intentionally stores no student data on a server. The student's name and answers exist only in the active browser session. A teacher dashboard/persistent results database requires a backend (for example Supabase) and should include appropriate access controls and privacy handling.

## Test integrity
The test intentionally converts open-ended rewrite items into objective multiple-choice equivalents so all 50 questions can be graded consistently and automatically.
