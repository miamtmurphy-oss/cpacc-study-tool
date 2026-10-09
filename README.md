# CPACC Study Tool

An independent, static study resource for the IAAP Certified Professional in Accessibility Core Competencies (CPACC) exam. It contains **150 original multiple-choice practice questions** and **75 original flashcards**. The original 50-question set is preserved in `questions.js`; 100 additional questions are stored separately in `expanded-questions.js`. No IAAP sample or exam questions are reproduced.

> This is an unofficial CPACC study tool and is not affiliated with or endorsed by IAAP. The current IAAP Body of Knowledge and certification content outline are authoritative.

## Use the tool

Open the [CPACC Study Tool on GitHub Pages](https://miamtmurphy-oss.github.io/cpacc-study-tool/) after GitHub Pages has been deployed. For local study, open `index.html` in a current browser. There is no build step, package manager, analytics, or required network connection; external requests occur only if a learner opens a linked reference.

The site offers:

- **Weighted practice exams:** 50-question or 100-question forms with domain counts of 20/20/10 or 40/40/20 (40%/40%/20%). Questions and answer positions are randomized. Navigation, review flags, score-by-domain, explanations, and incorrect-only review are available.
- **Optional study timer:** No timer is the default. The optional 60- and 120-minute study timers never submit or close an exam; the learner chooses when to submit. These options are study aids, not claims about official IAAP exam duration.
- **Quick quiz:** Filter questions by domain, topic, difficulty, or question type (including scenarios); select a short set and see feedback, an explanation, and a source after each answer.
- **Study modules, searchable glossary, and references:** Review domain introductions, 75 cards, and linked primary sources. Flashcards support domain and text search, shuffle, flip, Term First / Definition First, and locally saved known/review status.
- **Progress and missed-question review:** Completed exam scores and attempts can be reviewed locally in this browser. Missed-question practice is based on each question’s latest saved response.
- **Local data controls:** Export results to JSON, import and validate a JSON backup, or clear saved exam results and flashcard study status. Import merges valid attempts. Corrupt saved data is not overwritten automatically.
- **Responsive, accessible controls:** Semantic page sections, keyboard-accessible buttons and fields, visible focus, skip link, status announcements, reduced-motion support, and small-screen layouts.

## Privacy

Completed exams, card direction, and known-card status are stored in browser `localStorage`. Results are not uploaded, and the site does not use analytics or a score-collection service. Storage may be unavailable in private browsing or under browser policy; clearing site data or changing browser/device may remove or hide attempts. Export a backup before clearing data or moving to another device.

The standalone static site loads its own relative JavaScript and CSS assets and requires no third-party runtime libraries. Its only external navigation links are references the learner chooses to open.

## Content and sources

Original questions have an ID, domain, topic, difficulty, question type, explanation, and source reference. The expanded bank includes questions across disability models and functional access needs; assistive technology and communication; universal and inclusive design; WCAG principles and conformance; sensory alternatives and interaction; international frameworks and U.S. laws; and accessibility management. Distractor positions are shuffled per quiz or exam. The authoring key positions in the expanded bank are distributed across A–D.

The question set is for study, not an official representation of the current test form. Consult current IAAP materials for definitive competency scope, exam format, weighting, and policies. Source references and their scope are included in question review. Key sources include:

- [IAAP CPACC Body of Knowledge (October 2023)](https://www.accessibilityassociation.org/sfsites/c/resource/CPACCBoK) and the [CPACC content outline](https://www.accessibilityassociation.org/cpacc-certification-content-outline).
- [IAAP CPACC sample questions](https://www.accessibilityassociation.org/cpacc-sample-exam-questions) (format and scope only; no wording reproduced).
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- [UN Convention on the Rights of Persons with Disabilities](https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities).
- [U.S. Department of Justice ADA law and regulations](https://www.ada.gov/law-and-regs/ada/) and [U.S. Access Board ICT / Section 508 resources](https://www.access-board.gov/ict/).
- [WHO, Disability and health](https://www.who.int/news-room/fact-sheets/detail/disability-and-health). The statistics page states the WHO global estimate of 1.3 billion / 16% (2023 fact sheet) and the separately scoped illustrative estimate for disability-inclusive NCD prevention and care. They are not predictions for an individual program.

## Update content

- `questions.js` is the preserved original 50-question set and domain labels.
- `expanded-questions.js` contains the added question records and source metadata.
- `flashcards.js` holds the existing 75-card collection.
- `index.html`, `app.js`, and `styles.css` define the static application.

Keep question IDs unique, use an existing domain name, provide four distinct options and a zero-based answer key in the range 0–3, and cite an identifiable source and section for new material. The app samples exam sizes against the 40/40/20 domain distribution, so maintain at least 40 questions in each of the first two domains and 20 in the third to support a 100-question exam.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root to GitHub Pages on pushes to `main` and on manual workflow runs. Enable **Settings → Pages → Build and deployment → GitHub Actions** if needed. All asset links are relative, so the site supports the project-page base path without a generated build directory.
