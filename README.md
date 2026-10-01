# ERC Academy — Relative Clauses Test

A production-ready, browser-based English grammar assessment built for **ERC Academy**. The application delivers a timed 50-question Relative Clauses test, automatically grades student submissions, generates downloadable result PDFs, records attempts in GitHub, and applies basic browser-level test-integrity controls.

## Project status

The core assessment is implemented and deployed through Vercel. The project currently includes the student registration flow, the complete 50-question assessment, nine test sections, bonus production exercises, automatic scoring, result review, PDF evidence, retakes, attempt logging, timestamps, a readable GitHub results table, and responsive desktop/mobile UX.

## Assessment specification

- **Level:** Upper-Intermediate / Advanced
- **Scored questions:** 50
- **Maximum score:** 100 points
- **Scoring:** 2 points per automatically graded question
- **Time limit:** 20 minutes
- **Sections:** 9
- **Bonus:** 5 open-ended production exercises; not included in the automatic 0–100 score
- **Student identification:** full name required; class/group optional

The nine scored sections cover defining vs. non-defining relative clauses, omission of relative pronouns, error correction, prepositional relative clauses, formal prepositional clauses, nominal relative clauses, `-ever` forms, reduced relative clauses, and advanced relative phrases.

## Student flow

1. The student opens the assessment and enters a full name and optional class/group.
2. The start screen displays the level, number of questions, time limit, rules, and test-integrity warning.
3. Starting the assessment requests fullscreen and begins the 20-minute timer.
4. Questions are divided into nine sections instead of appearing on one very long page.
5. The student can move between previous and next sections while the attempt remains active.
6. A sticky progress interface displays answered questions, completion percentage, section position, and remaining time.
7. On the final section, the student can complete five optional production challenges.
8. The student submits the test or it is submitted automatically when time expires.
9. The application calculates the score and number correct.
10. The result screen allows the student to download a PDF and optionally reveal the answer review.
11. The student can retake the assessment. Every attempt is intended to remain separately recorded.

## Test integrity

While an attempt is active, the application monitors:

- browser/window blur;
- tab visibility changes;
- exit from fullscreen;
- copy;
- cut;
- paste;
- context-menu use.

If focus or fullscreen is lost, the attempt is terminated, the active answers are discarded, and the attempt receives **0/100**. The student must restart from the beginning.

### Security limitation

This is a standard browser application, **not a secure exam browser**. It cannot reliably prevent operating-system screenshots, photographs taken with another device, virtual machines, browser extensions, developer tools, or every possible method of switching applications. The controls above are deterrents and integrity signals, not foolproof proctoring.

## Automatic grading and feedback

The 50 scored questions are objective multiple-choice items defined in `src/questions.ts`. Each question contains:

- numeric question ID;
- section/part;
- instructions;
- prompt;
- answer choices;
- correct answer;
- explanatory feedback.

The final score is calculated as:

`correct answers / 50 × 100`

Students may choose **View answer review** after completion. The review is hidden by default and displays the submitted answer, correct answer, and feedback for every scored question.

## Bonus production challenge

The final section contains five open-ended writing exercises. Students combine sentence pairs using sophisticated relative-clause structures. These responses are currently practice items and **do not affect the automatic score**.

## PDF result

The project uses **jsPDF** to generate a result document directly in the browser. The PDF contains the ERC Academy assessment title, student name, class/group, score, correct-answer count, and submission status. Students are instructed to download this PDF and attach it to Google Classroom.

## Retakes

After completing an assessment, students are offered **Retake test from the beginning**. A retake resets answers, bonus responses, timer, section position, and active attempt state. The in-session attempt counter is incremented.

Students are explicitly informed that repeated attempts leave a record for the teacher. The application does **not** currently apply an automatic score penalty for retaking the test.

## GitHub results logging

The Vercel serverless endpoint at `api/log-result.js` records attempts in this repository.

### Raw log

`logs/results.jsonl`

This is the source-of-truth log. Each line is one JSON object containing:

- student name;
- group;
- score;
- number correct;
- total questions;
- attempt number;
- status;
- test start timestamp;
- submission timestamp;
- server logging timestamp.

### Readable results table

`logs/RESULTS.md`

The serverless endpoint regenerates this Markdown table whenever a new attempt is successfully recorded. It presents the records in a teacher-friendly format:

| # | Student | Group | Score | Correct | Attempt | Status | Started (UTC) | Submitted (UTC) | Logged (UTC) |
|---:|---|---|---:|---:|---:|---|---|---|---|

New submissions appear at the bottom and previous attempts are retained.

The registration screen also includes a **Teacher results ↗** shortcut to the GitHub results file. GitHub repository permissions determine who can edit those records.

## Managing or deleting logs

Detailed instructions are maintained in `logs/README.md`.

To delete a record permanently, remove the corresponding entry from **both** the source `logs/results.jsonl` and the readable `logs/RESULTS.md`. If a row is removed only from `RESULTS.md`, it can be regenerated from the JSONL source after the next submission.

To reset all records, empty `results.jsonl` and return `RESULTS.md` to its table header.

## GitHub authentication

The browser never receives a GitHub credential. Student submissions call the Vercel endpoint `/api/log-result`, and that server-side function communicates with the GitHub Contents API.

Vercel requires this secret environment variable:

`GITHUB_RESULTS_TOKEN`

Use a **fine-grained GitHub personal access token** restricted to this repository with:

- **Contents:** Read and write
- **Metadata:** Read-only (GitHub-required)

Do not commit the token to this repository and do not expose it through a `VITE_*` environment variable. After adding or changing the secret in Vercel, redeploy the application.

## Responsive UX/UI

The interface has been redesigned for a focused assessment experience and adapts across large desktop displays, laptops, tablets, and mobile phones.

Implemented UX features include:

- ERC Academy visual identity;
- clear registration hierarchy;
- labeled form fields;
- assessment metadata chips;
- dedicated Do/Don't instructions;
- prominent start CTA;
- sticky student/timer header;
- low-time timer treatment;
- answered-question progress bar;
- nine section indicators;
- section and question counts;
- large selectable answer cards;
- selected-answer visual states;
- Previous/Next section navigation;
- responsive spacing and typography;
- two-column question/answer layout on large screens;
- single-column touch-friendly mobile layout;
- result actions and retake panel.

The primary responsive test container scales to large browser screens instead of remaining a narrow mobile-style card.

## Technology

- React
- TypeScript
- Vite
- CSS
- jsPDF
- Vercel serverless functions
- GitHub Contents API
- GitHub repository storage for result logs

No traditional database is currently used.

## Repository structure

```text
relative-clauses-test-app/
├── api/
│   └── log-result.js          # Vercel API: securely writes attempts to GitHub
├── logs/
│   ├── RESULTS.md             # Human-readable student results table
│   ├── results.jsonl          # Raw/source-of-truth attempt log
│   └── README.md              # Log deletion and management instructions
├── src/
│   ├── main.tsx               # App flow, timer, integrity, grading, PDF, retakes
│   ├── questions.ts           # 50 scored questions and feedback
│   └── style.css              # Complete responsive UX/UI
├── index.html
├── package.json
└── README.md
```

## Local development

Requirements: a current Node.js/npm installation.

```bash
npm install
npm run dev
```

Vite will provide the local development URL.

### Production build

```bash
npm run build
```

### Preview a production build

```bash
npm run preview
```

## Vercel deployment

The application is designed to run on Vercel because the frontend and `api/log-result.js` serverless endpoint can be deployed together.

Before testing result logging in production:

1. Connect the GitHub repository to the Vercel project.
2. Add `GITHUB_RESULTS_TOKEN` as a **Secret** environment variable.
3. Enable it for Production and any other environment where logging should work.
4. Redeploy after adding or changing the variable.
5. Submit a test attempt.
6. Verify `logs/results.jsonl` and `logs/RESULTS.md` in GitHub.

## Important operational notes

- A Vercel redeployment is required after code changes before those changes appear on the live site.
- A redeployment is also recommended after adding/changing server-side environment variables.
- The GitHub token must remain server-side.
- `results.jsonl` is the authoritative log; `RESULTS.md` is the readable representation.
- Timestamps are stored in ISO format/UTC.
- Focus/fullscreen violations are logged as 0/100 when server logging succeeds.
- No student answers are intentionally persisted in the GitHub results log; the log stores assessment-result metadata.
- The bonus exercises are not automatically graded.

## Known limitations / future improvements

The current version does not provide a dedicated authenticated teacher dashboard. Results are viewed through GitHub. Possible future improvements include a protected teacher dashboard, filtering/search, CSV export, aggregate class analytics, configurable test settings, stronger server-side validation, persistent attempt identity across browser reloads/devices, and teacher review/grading of bonus responses.

Because the current attempt number is maintained in the active browser session, refreshing/reopening the application can reset that local counter. The timestamped GitHub records still retain each submitted log entry.

## Completed project milestones

The project has progressed from a basic 50-question form into a complete assessment workflow:

- integrated the full Relative Clauses question bank;
- organized the assessment into nine sections;
- implemented 0–100 automatic scoring;
- added the 20-minute non-pausable timer;
- implemented fullscreen/focus monitoring;
- added disqualification and restart behavior;
- added progress tracking and section navigation;
- added the five production challenges;
- added optional post-test answer review;
- added downloadable PDF results for Google Classroom;
- redesigned the full student UX/UI;
- optimized the layout for desktop, laptop, tablet, and mobile;
- added retake workflow and attempt messaging;
- added server-side GitHub logging through Vercel;
- added start/submission/server timestamps;
- added a raw JSONL audit log;
- added a readable Markdown results table;
- fixed Markdown table escaping/formatting;
- added log-management/deletion documentation;
- added direct teacher access to results;
- secured the GitHub credential as a Vercel environment secret.

## Maintenance

When changing questions, edit `src/questions.ts`.

When changing student flow, grading, integrity rules, PDF behavior, or result-screen behavior, edit `src/main.tsx`.

When changing responsive design, edit `src/style.css`.

When changing GitHub result persistence or table generation, edit `api/log-result.js`.

When manually managing historical results, follow `logs/README.md`.

---

**ERC Academy — English Response on Command**

This repository is the source of truth for the Relative Clauses Test application and its current implementation.
