---
description: Build a new feature for UniVerse as a multi-agent team (Antigravity). Includes Build, Review, and Test stages.
---
# UniVerse Feature Development Workflow

This workflow enforces the multi-agent approach for high-quality features: **Builder**, **Reviewer**, and **Tester**. This ensures that Antigravity produces robust, visually appealing, and bug-free code.

1. **Build Phase (Builder Agent)**
   - Analyze the feature request and document the required models, routes, and UI components.
   - First, implement the backend logic in `c:\Users\Panig\UniVerse_backend`. Ensure Mongoose schema validations exist.
   - Second, build the React frontend in `c:\Users\Panig\UniVerse\universe-frontend`. Ensure that frontend code strictly follows the "Petrovascope" deep space dark theme aesthetic (heavy blacks, `#DC143C` crimson highlights, `#00FF41` phosphor accents, and glassmorphism).

2. **Review Phase (Reviewer Agent)**
   - Audit the code structure just written in Phase 1.
   - Verify that there are no unused variables, routes are properly protected with `authMiddleware` or `roleMiddleware` if necessary.
   - Check the frontend to ensure Tailwind classes are clean and the UI is responsive. Improve logic if needed.

3. **Test Phase (Tester Agent)**
   - Verify that the frontend connects to the backend successfully.
   - Test success states and error states (e.g. failing to fetch data or submitting invalid data).
   - If something fails, loop back to the Builder and Fix it.
