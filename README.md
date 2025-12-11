# Daily Task Progress Tracker

A lightweight, single-page task tracker with a calendar view and recurring tasks support. Built with plain HTML/CSS/JavaScript for easy local use and quick prototyping.

**Key Features**
- Add daily tasks and mark them complete
- Calendar view showing tasks on specific dates
- Recurring tasks with per-day completion tracking
- Progress stats (completed / total / remaining)
- Simple local persistence using `localStorage`

**Quick Start**
- Option A — Open locally:
  - Open `index.html` in your browser (double-click or right-click -> Open with).

- Option B — Run a simple local server (recommended for consistent behavior):
  - If you have Python installed, from the project folder run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

- Option C — VS Code Live Server:
  - Install the Live Server extension and click "Go Live" while the `My Tracker` folder is open.

**Usage**
- Add tasks using the "Today's Tasks" form.
- Use the calendar tab to navigate months and click a date to view tasks for that day.
- Add recurring tasks in the Multi-Day / Recurring tab; those tasks appear on each date in the selected range and can be checked per-date.
- Use the filter buttons to view All / Active / Completed tasks for today.

**Files**
- `index.html` — Main UI
- `style.css` — Styling
- `script.js` — Application logic and state management
- `manifest.json` — Web manifest (optional)

**Troubleshooting & Notes**
- The app stores data in the browser `localStorage`. Clearing site data or using a private window will remove saved tasks.
- If dates are off by one day, this is often caused by timezone differences. The code uses local-date formatting to reduce timezone-related shifts.
- If a UI section (e.g., multi-day bulk add) is missing, it may have been intentionally removed from the HTML; the underlying JS may still contain related logic.

**Development**
- The project uses plain JavaScript (no build step). Edit files directly and refresh the browser to see changes.
- Suggested development flow:
  - Open the folder in VS Code
  - Use Live Server or a local server to serve files
  - Inspect and modify `script.js` for behavior changes

**Contributing**
- Feel free to submit improvements (UI/UX fixes, bug fixes, feature additions).

**License**
- MIT-style — free to use and modify. No license file is included by default.

---

If you want, I can also:
- Add a `LICENSE` file
- Add usage screenshots to the README
- Add a short demo GIF showing adding and completing a task

