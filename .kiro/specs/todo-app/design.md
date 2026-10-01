# Design Document

## Overview

A todo application delivered as three separate files: `index.html`, `style.css`, and `app.js`. The HTML file links to the external CSS and JS files. State is held exclusively in a JavaScript array for the duration of the page session. No frameworks, build tools, or external resources are used.

---

## Architecture

The app follows a minimal **unidirectional data-flow** pattern without any library:

```
User Action
    │
    ▼
State Mutation  (pure JS functions acting on `todos[]`)
    │
    ▼
Re-render       (DOM diffing-free: wipe & redraw the list)
    │
    ▼
Updated UI
```

Everything lives across two files: `index.html` (markup only), `style.css` (all styles), and `app.js` (all logic). There are no modules, no imports, and no build step. The files must be served from the same directory.

---

## Components

### 1. State

```javascript
// In-memory state — never written to any storage API
let todos = [];          // Array<{ id: number, text: string, completed: boolean }>
let nextId = 1;
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
```

A todo object has three fields:

| Field       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| `id`        | number  | Monotonically increasing unique key  |
| `text`      | string  | The task description (trimmed)       |
| `completed` | boolean | `false` = active, `true` = completed |

### 2. Add Form

- A `<form>` element containing a text `<input>` and a submit `<button>`.
- Submitting the form calls `addTodo()`.
- The `submit` event is used (covers both button click and Enter key press).

### 3. Todo List

- A `<ul>` element re-rendered from scratch on every state change via `render()`.
- Each `<li>` contains:
  - A `<input type="checkbox">` as the Completion Toggle
  - A `<span>` for the task text (gets `.completed` class when done)
  - A `<button>` as the Delete Control

### 4. Empty State

- When `todos.length === 0`, the `<ul>` is replaced by a `<p>` with an empty-state message.

### 5. Filter Bar

- Three `<button>` elements: "All", "Active", "Completed".
- The active filter button receives a `.active` CSS class.
- Clicking a filter button updates `currentFilter` and calls `render()`.

---

## Interfaces (Functions)

```javascript
/**
 * Adds a new todo if text is non-empty after trimming.
 * Clears the input on success; does nothing on empty/whitespace input.
 */
function addTodo(text) { ... }

/**
 * Toggles the completed state of the todo with the given id.
 */
function toggleTodo(id) { ... }

/**
 * Removes the todo with the given id from the list.
 */
function deleteTodo(id) { ... }

/**
 * Sets the current filter and re-renders.
 */
function setFilter(filter) { ... }

/**
 * Returns the subset of todos matching the current filter.
 */
function getFilteredTodos() { ... }

/**
 * Wipes the todo list container and redraws every visible todo item,
 * the empty-state message, and the filter button states.
 */
function render() { ... }
```

---

## Data Model

```javascript
// Example state after two additions and one completion:
todos = [
  { id: 1, text: 'Buy groceries', completed: true },
  { id: 2, text: 'Write tests',   completed: false },
];
currentFilter = 'active';
// getFilteredTodos() → [{ id: 2, text: 'Write tests', completed: false }]
```

---

## Rendering Strategy

`render()` is a full re-render:

1. Compute `visibleTodos = getFilteredTodos()`.
2. Clear `#todo-list` innerHTML.
3. If `todos.length === 0`, show empty-state message and return.
4. For each item in `visibleTodos`, create an `<li>` and append it.
5. Update filter button classes to reflect `currentFilter`.

This is intentionally simple — no virtual DOM, no diffing. For the target scale (a handful of todos), it is more than fast enough.

---

## CSS Design

All styles live in `style.css`, linked from `index.html` via `<link rel="stylesheet" href="style.css">`. Key rules:

- `.todo-item.completed span` — `text-decoration: line-through; opacity: 0.5`
- `.filter-btn.active` — highlighted border/background to indicate selection
- Layout: centered column, max-width ~480 px, clean minimal aesthetic

---

## Error Handling

| Scenario                          | Behavior                                                         |
|-----------------------------------|------------------------------------------------------------------|
| Empty / whitespace-only input     | `addTodo` returns early; no state change; input not cleared      |
| Toggle on non-existent id         | `Array.find` returns `undefined`; guard prevents crash           |
| Delete on non-existent id         | `Array.filter` produces no change; no crash                      |

No network requests, no async operations — there are no I/O errors to handle.

---

## File Structure

```
todo-app/
├── index.html   ← markup only; links to style.css and app.js
├── style.css    ← all presentation rules
└── app.js       ← all application logic (state + render functions)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Adding a valid task grows the list

*For any* non-empty (non-whitespace) task string, calling `addTodo` with that string increases `todos.length` by exactly 1, and the last element has the supplied text and `completed: false`.

**Validates: Requirements 1.2**

---

### Property 2: Whitespace input is rejected

*For any* string composed entirely of whitespace characters, calling `addTodo` leaves `todos` unchanged (same length, same contents).

**Validates: Requirements 1.4**

---

### Property 3: Input field cleared after valid add

*For any* non-empty task string submitted via the Add Form, the text input's value is the empty string immediately after the todo is added.

**Validates: Requirements 1.3**

---

### Property 4: Insertion order preserved in rendered list

*For any* sequence of valid task additions, the rendered `<li>` elements appear in the same order as the insertions — earliest first, most recent last.

**Validates: Requirements 2.1**

---

### Property 5: Every todo item has a toggle and a delete control

*For any* non-empty todo list, every rendered `<li>` contains exactly one checkbox (Completion Toggle) and exactly one delete button (Delete Control).

**Validates: Requirements 3.1, 4.1**

---

### Property 6: Toggle is a round-trip

*For any* todo item in any state, activating its Completion Toggle twice returns it to its original `completed` value, and the visual style (`.completed` class) matches the `completed` field at each step.

**Validates: Requirements 2.3, 3.2, 3.3**

---

### Property 7: Delete removes exactly one item

*For any* todo list and any item in it, activating the Delete Control removes that item from `todos` (length decreases by 1) and no other items are affected.

**Validates: Requirements 4.2**

---

### Property 8: "All" filter shows every item

*For any* todo list containing any mix of active and completed items, setting the filter to "All" causes every item in `todos` to appear in the rendered list.

**Validates: Requirements 5.2**

---

### Property 9: "Active" filter shows only active items

*For any* todo list, setting the filter to "Active" causes the rendered list to contain exactly the todos where `completed === false` and no todos where `completed === true`.

**Validates: Requirements 5.3**

---

### Property 10: "Completed" filter shows only completed items

*For any* todo list, setting the filter to "Completed" causes the rendered list to contain exactly the todos where `completed === true` and no todos where `completed === false`.

**Validates: Requirements 5.4**

---

### Property 11: Active filter button is visually distinguished

*For any* filter value in `{'all', 'active', 'completed'}`, after `setFilter` is called with that value, exactly the corresponding button element has the `.active` CSS class and the other two do not.

**Validates: Requirements 5.5**

---

### Property 12: Filter selection is retained after adding a todo

*For any* active filter and any valid task string added while that filter is set, `currentFilter` is unchanged after the add and `getFilteredTodos()` returns results consistent with that unchanged filter.

**Validates: Requirements 5.6**
