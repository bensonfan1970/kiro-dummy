# Requirements Document

## Introduction

A simple todo application delivered as three separate files — `index.html`, `style.css`, and `app.js` — using plain HTML, CSS, and vanilla JavaScript. The HTML file links to the external CSS and JS files. Todos are stored in memory only for the duration of the page session. No frameworks, build tools, or external dependencies are required. The app allows users to add, complete, and delete todo items through a minimal, usable interface.

## Glossary

- **App**: The single-page todo application running in the browser.
- **Todo**: A text-based task item that can be in one of two states: active or completed.
- **Todo List**: The in-memory collection of all Todo items for the current session.
- **Add Form**: The input field and submit control used to create new Todo items.
- **Todo Item**: A rendered row representing a single Todo, including its text, completion toggle, and delete control.
- **Completion Toggle**: A checkbox or button that switches a Todo between active and completed states.
- **Delete Control**: A button that removes a Todo from the Todo List.
- **Filter**: A control that limits the visible Todo Items to a specific subset (all, active, or completed).

---

## Requirements

### Requirement 1 — Add a Todo

**User Story:** As a user, I want to type a task and add it to the list, so that I can track things I need to do.

#### Acceptance Criteria

1. THE App SHALL render an Add Form containing a text input and a submit control on page load.
2. WHEN the user submits the Add Form with a non-empty text value, THE App SHALL append a new Todo to the Todo List with the provided text and an initial active state.
3. WHEN the user submits the Add Form with a non-empty text value, THE App SHALL clear the text input field after the Todo is added.
4. IF the user submits the Add Form with an empty or whitespace-only text value, THEN THE App SHALL not add a Todo and SHALL not clear the text input field.
5. WHEN the user presses the Enter key while the text input has focus, THE App SHALL treat the action as a form submission.

---

### Requirement 2 — Display the Todo List

**User Story:** As a user, I want to see all my todos listed on the page, so that I have a clear view of my tasks.

#### Acceptance Criteria

1. THE App SHALL render each Todo in the Todo List as a distinct Todo Item in document order, with most recently added items appearing last.
2. WHILE the Todo List contains zero items, THE App SHALL display an empty-state message indicating that no todos exist.
3. THE App SHALL visually distinguish completed Todo Items from active Todo Items (for example, using a strikethrough style on completed text).

---

### Requirement 3 — Complete a Todo

**User Story:** As a user, I want to mark a todo as complete, so that I can track what I have finished.

#### Acceptance Criteria

1. THE App SHALL render a Completion Toggle for each Todo Item.
2. WHEN the user activates the Completion Toggle on an active Todo Item, THE App SHALL update that Todo's state to completed and reflect the visual change immediately.
3. WHEN the user activates the Completion Toggle on a completed Todo Item, THE App SHALL update that Todo's state to active and reflect the visual change immediately.

---

### Requirement 4 — Delete a Todo

**User Story:** As a user, I want to remove a todo from the list, so that I can keep the list relevant.

#### Acceptance Criteria

1. THE App SHALL render a Delete Control for each Todo Item.
2. WHEN the user activates the Delete Control on a Todo Item, THE App SHALL remove that Todo from the Todo List and remove the corresponding Todo Item from the rendered list immediately.

---

### Requirement 5 — Filter Todos

**User Story:** As a user, I want to filter my todos by status, so that I can focus on active tasks or review completed ones.

#### Acceptance Criteria

1. THE App SHALL provide three Filter controls: "All", "Active", and "Completed".
2. WHEN the user selects the "All" Filter, THE App SHALL display every Todo Item in the Todo List.
3. WHEN the user selects the "Active" Filter, THE App SHALL display only Todo Items whose state is active.
4. WHEN the user selects the "Completed" Filter, THE App SHALL display only Todo Items whose state is completed.
5. THE App SHALL indicate which Filter is currently selected through a visible visual distinction.
6. WHEN a new Todo is added, THE App SHALL retain the currently active Filter selection and update the visible list accordingly.

---

### Requirement 6 — In-Memory Data Only

**User Story:** As a developer, I want the app to rely solely on in-memory state, so that no persistence layer or external dependency is introduced.

#### Acceptance Criteria

1. THE App SHALL store the Todo List exclusively in JavaScript memory within the page session.
2. WHEN the user reloads or closes the browser tab, THE App SHALL start with an empty Todo List on the next load.
3. THE App SHALL not make any network requests, read from or write to localStorage, sessionStorage, IndexedDB, cookies, or any other persistence mechanism.

---

### Requirement 7 — Multi-File Delivery

**User Story:** As a developer, I want the app split across `index.html`, `style.css`, and `app.js`, so that markup, styles, and scripts are each maintained in their own dedicated file.

#### Acceptance Criteria

1. THE App SHALL be delivered as exactly three files: `index.html`, `style.css`, and `app.js`.
2. THE `index.html` file SHALL link to `style.css` via a `<link rel="stylesheet">` element and load `app.js` via a `<script src>` element; it SHALL contain no inline `<style>` blocks or inline `<script>` blocks with application logic.
3. THE `style.css` file SHALL contain all presentation rules for the App and SHALL not contain any JavaScript.
4. THE `app.js` file SHALL contain all application logic for the App and SHALL not contain any CSS or HTML markup.
5. THE App SHALL not reference any external stylesheets, scripts, fonts, or other resources beyond the three application files.
6. THE App SHALL function correctly when served from the same directory in a modern browser without any build tool.
