# CPACC Study Tool

An independent static study resource for the IAAP Certified Professional in Accessibility Core Competencies (CPACC) exam. It contains **50 original multiple-choice practice questions** and **75 original flashcards** across the broad CPACC knowledge domains. No IAAP sample or exam questions are reproduced.

> This is an unofficial CPACC study tool and is not affiliated with or endorsed by IAAP.

## Use the tool

Open the [CPACC Study Tool website](https://miamtmurphy-oss.github.io/cpacc-study-tool/) after GitHub Pages has completed its first deployment. To run locally, open `index.html` in a modern browser; there is no build step or package installation.

## Features and privacy

- Untimed 50-question exam with shuffled choices, navigation, editable answers, review flags, score by domain, explanations, and an incorrect-only review filter.
- 75 flashcards with domain filters, shuffle, flip, and keyboard-accessible controls.
- Completed attempts are stored only in this browser when local storage is available. No results are uploaded; the app has no analytics or score-collection network requests. Browser storage restrictions, clearing data, or switching browsers may make previous results unavailable.
- If storage is unavailable or full, the app discloses that results cannot be saved.

## Update content

Edit `questions.js` to change exam data or `flashcards.js` to change flashcards. Questions use the `domain`, `prompt`, `options`, zero-based `answer`, and `explanation` properties. Cards use `domain`, `term`, and `definition`. Keep the content original and use the three existing domain names to keep the score breakdown and filters consistent. If changing the question count from 50, update the progress bar maximum in `index.html`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys this repository root to GitHub Pages on pushes to `main` and on manual workflow runs. Enable **Settings → Pages → Build and deployment → GitHub Actions** if needed. The app uses relative asset URLs and needs no build step.

## Reference materials

These IAAP resources informed the subject scope, not the wording of the original questions or cards:

- [CPACC sample exam questions](https://www.accessibilityassociation.org/cpacc-sample-exam-questions) (format and scope only)
- [CPACC certification content outline](https://www.accessibilityassociation.org/cpacc-certification-content-outline)
- [CPACC Body of Knowledge](https://www.accessibilityassociation.org/sfsites/c/resource/CPACCBoK)

Consult current official IAAP materials for definitive exam information.