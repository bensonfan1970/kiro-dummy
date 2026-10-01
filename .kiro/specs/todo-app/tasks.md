# Implementation Plan: Todo App

## Overview

Implement the app across three files: `index.html` (markup, links to CSS and JS), `style.css` (all styles), and `app.js` (all logic). State lives in a JS array in `app.js`; every user action mutates state and triggers a full re-render. No frameworks, no build tools, no external resources.

## Tasks

- [x] 1. Create the HTML skeleton and external CSS/JS files
  - [x] 1.1 Create `index.html` with the base HTML structure
    - Add `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` scaffolding
    - Include `<link rel="stylesheet" href="style.css">` in `<head>`
    - Include `<script src="app.js" defer></script>` before `</body>`
    - Include a centered container `<div id="app">` with a heading
    - Add the Add Form: `<form id="add-form">` with a text `<input id="todo-input">` and a submit `<button>`
    - Add a filter bar: three `<button class="filter-btn">` elements labelled "All", "Active", "Completed"
    - Add an empty `<ul id="todo-list">` for the rendered todo items
    - No inline `<style>` blocks or inline `<script>` blocks with application logic
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1, 7.2, 7.5, 7.6_

  - [x] 1.2 Create `style.css` with all presentation rules
    - Center the layout, max-width ~480 px, clean minimal appearance
    - Style `.todo-item.completed span` with `text-decoration: line-through; opacity: 0.5`
    - Style `.filter-btn.active` with a highlighted border/background
    - Style the Add Form input and button for usability
    - _Requirements: 2.3, 5.5, 7.1, 7.3_

- [x] 2. Implement the in-memory state and core logic
  - [x] 2.1 Declare state variables at the top of `app.js`
    - `let todos = [];`, `let nextId = 1;`, `let currentFilter = 'all';`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.2 Implement `addTodo(text)`
    - Trim the input; return early if empty or whitespace-only
    - Push `{ id: nextId++, text, completed: false }` onto `todos`
    - Clear the input field after a successful add
    - Call `render()`
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 2.3 Write property test for `addTodo`
    - **Property 1: Adding a valid task grows the list**
    - **Validates: Requirements 1.2**
    - **Property 2: Whitespace input is rejected**
    - **Validates: Requirements 1.4**
    - **Property 3: Input field cleared after valid add**
    - **Validates: Requirements 1.3**

  - [x] 2.4 Implement `toggleTodo(id)`
    - Find the todo by `id`; if found, flip its `completed` field
    - Call `render()`
    - _Requirements: 3.2, 3.3_

  - [x] 2.5 Implement `deleteTodo(id)`
    - Filter `todos` to exclude the item with the matching `id`
    - Call `render()`
    - _Requirements: 4.2_

  - [x] 2.6 Implement `setFilter(filter)` and `getFilteredTodos()`
    - `setFilter` updates `currentFilter` and calls `render()`
    - `getFilteredTodos` returns `todos` filtered by `currentFilter`
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

  - [ ]* 2.7 Write property tests for `toggleTodo`, `deleteTodo`, and filter functions
    - **Property 6: Toggle is a round-trip**
    - **Validates: Requirements 2.3, 3.2, 3.3**
    - **Property 7: Delete removes exactly one item**
    - **Validates: Requirements 4.2**
    - **Property 8: "All" filter shows every item**
    - **Validates: Requirements 5.2**
    - **Property 9: "Active" filter shows only active items**
    - **Validates: Requirements 5.3**
    - **Property 10: "Completed" filter shows only completed items**
    - **Validates: Requirements 5.4**
    - **Property 12: Filter selection is retained after adding a todo**
    - **Validates: Requirements 5.6**

- [x] 3. Implement the `render()` function
  - [x] 3.1 Write `render()` — wipe and redraw the todo list
    - Compute `visibleTodos = getFilteredTodos()`
    - Clear `#todo-list` innerHTML
    - If `todos.length === 0`, show empty-state `<p>` message and return early
    - For each item in `visibleTodos`, create an `<li class="todo-item">` containing:
      - `<input type="checkbox">` (checked when `completed`) as the Completion Toggle
      - `<span>` with task text (add `.completed` class when done)
      - `<button>` as the Delete Control
    - Wire checkbox `change` → `toggleTodo(id)` and delete button `click` → `deleteTodo(id)`
    - Update filter button `.active` class to reflect `currentFilter`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.5_

  - [ ]* 3.2 Write property tests for `render()`
    - **Property 4: Insertion order preserved in rendered list**
    - **Validates: Requirements 2.1**
    - **Property 5: Every todo item has a toggle and a delete control**
    - **Validates: Requirements 3.1, 4.1**
    - **Property 11: Active filter button is visually distinguished**
    - **Validates: Requirements 5.5**

- [ ] 4. Wire up event listeners and bootstrap
  - [ ] 4.1 Attach event listeners and call initial `render()`
    - Add `submit` listener on `#add-form` → prevent default, call `addTodo(input.value)` (covers both button click and Enter key)
    - Add `click` listeners on each `.filter-btn` → `setFilter('all' | 'active' | 'completed')`
    - Call `render()` once on script load to paint the initial empty state
    - _Requirements: 1.1, 1.5, 5.1_

- [ ] 5. Checkpoint — Ensure all tests pass
  - Serve the three files from the same directory (e.g., `python3 -m http.server`) and manually verify all acceptance criteria are met; resolve any issues.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Code is split across three files: `index.html` (markup), `style.css` (styles), `app.js` (logic)
- The `render()` full-wipe strategy is intentional; performance is fine at todo-list scale
- No async operations, no network calls, no storage APIs — error handling is minimal by design
- Property tests validate universal correctness properties; unit tests validate specific examples

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.5", "2.6"] },
    { "id": 3, "tasks": ["2.3", "2.7", "3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1"] }
  ]
}
```
