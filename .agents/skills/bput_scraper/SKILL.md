---
name: Automate BPUT Scraper
description: Use browser automation to scrape bput.ac.in and push new event notices to the UniVerse backend as posts.
---

# BPUT Event Scraper Automation

This skill instructs Antigravity to act as an automated curator for the UniVerse platform by sourcing real-time updates directly from the official BPUT website.

## Execution Steps

1. **Launch Browser Agent**:
   Start the `browser_subagent` and instruct it to visit the BPUT notices page: `http://www.bput.ac.in/notices-circulars.php` (or use Google Search if the exact URL has changed).

2. **Scraper Objective**:
   Tell the browser agent to capture the Title and Date of the 3 most recent notices on the page. The subagent must return this data array formatted cleanly as JSON in its final response.

3. **Backend Injection Protocol**:
   Once you receive the array of notices from the browser agent, invoke the Node.js helper script to push these notices securely to the UniVerse ecosystem.
   - Run: `node c:\Users\Panig\UniVerse\.agents\skills\bput_scraper\scripts\bput_scraper.js '[JSON_STRING_OUTPUT]'`
   - Make sure you properly enclose the JSON in quotes for the bash/powershell argument.

4. **Verify**:
   Use the `command_status` tool to ensure the upload finished with no errors. Report the freshly pulled updates to the User.
