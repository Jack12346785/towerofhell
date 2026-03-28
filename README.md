# Sparx Math Auto Complete Helper

This repository contains a lightweight browser userscript that helps speed up repetitive Sparx Math interactions by auto-filling answers you've already saved for matching questions.

## What this does
- Detects question text and page URL as a key.
- Lets you save your current input as an answer for that question.
- Automatically fills saved answers when the same question appears again.
- Stores answers in browser `localStorage`.

## What this does **not** do
- It does not solve unseen questions for you.
- It does not bypass platform security.

## Setup (Tampermonkey)
1. Install Tampermonkey in your browser.
2. Create a new userscript.
3. Paste the contents of `sparx-autocomplete.user.js`.
4. Save and enable the script.
5. Open Sparx Math and use the helper panel in the bottom-right.

## Notes
- Only use automation in ways allowed by your school and Sparx terms.
- If Sparx changes their HTML structure, selectors may need updates.
