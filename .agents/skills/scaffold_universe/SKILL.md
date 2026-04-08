---
name: Scaffold UniVerse Feature
description: Autogenerates the full stack boilerplate for a new feature in the UniVerse project.
---

# Scaffold UniVerse Feature

When the user asks you to run this skill or scaffold a new feature, you must autonomously create the backend logic and the frontend visual layer, wired together correctly.

## Instructions
1. **Understand Project Context**:
  - The Backend is an Express + MongoDB REST API at `c:\Users\Panig\UniVerse_backend`.
  - The Frontend is a React + Tailwind application at `c:\Users\Panig\UniVerse\universe-frontend`.

2. **Backend Execution**:
  - Create the required Mongoose `.js` models in `backend/models`.
  - Create the Express `.js` routes in `backend/routes`.
  - Wire up the new route to `backend/server.js`.

3. **Frontend Execution**:
  - Create the new React page or component in `src/pages` or `src/components`.
  - Style it exclusively using Tailwind CSS, taking heavy cues from the "Petrovascope" aesthetic (deep space dark, neon green `text-[#00FF41]`, crimson accents `bg-[#DC143C]`, glassmorphic backgrounds via `bg-black/50 backdrop-blur-md`, mono-spaced fonts).
  - Add it into the application's React Router setup in `src/App.js` or corresponding index.

4. **Self-Correction & Polish**:
  - Automatically review your changes using the `universe_feature_dev` workflow. Do not ask for user permission before creating the basic boilerplate. Make it highly functional on the first go!
