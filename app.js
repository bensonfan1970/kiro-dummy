// In-memory state — persisted in localStorage with encryption
let todos = [];          // Array<{ id: number, text: string, completed: boolean }>
let nextId = 1;
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
let key = null;          // CryptoKey for encryption/decryption

// Crypto algorithms and storage keys
const ALGORITHM = { name: 'AES-GCM', length: 256 };
const STORAGE_KEY = 'todo-app-todos';
const KEY_STORAGE_KEY = 'todo-app-key';

// Generate or load encryption key
async function loadOrCreateKey() {
  try {
    const keyStr = localStorage.getItem(KEY_STORAGE_KEY);
    if (keyStr) {
      const keyData = JSON.parse(keyStr);
      key = await crypto.subtle.importKey(
        'jwk',
        keyData,
        ALGORITHM,
        true,
        ['encrypt', 'decrypt']
      );
    } else {
      // Generate new key
      key = await crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);
      const keyData = await crypto.subtle.exportKey('jwk', key);
      localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(keyData));
    }
  } catch (e) {
    console.error('Failed to load or create encryption key:', e);
    // If crypto fails, fall back to unencrypted storage
    key = null;
  }
}

// Encrypt data
async function encryptData(data) {
  if (!key) {
    return { encrypted: false, data: JSON.stringify(data) };
  }
  
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encryptedContent = await crypto.subtle.encrypt(
      ALGORITHM,
      key,
      encoder.encode(JSON.stringify(data))
    );
    
    const encryptedBytes = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);
    
    // Convert to base64 for storage
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(combined)));
    return { encrypted: true, iv: btoa(String.fromCharCode.apply(null, Array.from(iv))), data: base64 };
  } catch (e) {
    console.error('Encryption failed, using unencrypted storage:', e);
    key = null;
    return { encrypted: false, data: JSON.stringify(data) };
  }
}

// Decrypt data
async function decryptData(encryptedObj) {
  if (!key || !encryptedObj.encrypted) {
    return JSON.parse(encryptedObj.data);
  }
  
  try {
    const iv = new Uint8Array(atob(encryptedObj.iv).split('').map(c => c.charCodeAt(0)));
    const combined = new Uint8Array(atob(encryptedObj.data).split('').map(c => c.charCodeAt(0)));
    
    const encryptedBytes = combined.slice(iv.length);
    const decryptedContent = await crypto.subtle.decrypt(
      ALGORITHM,
      key,
      encryptedBytes
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedContent));
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
}

// Load state from localStorage on startup
async function loadState() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);
      if (Array.isArray(parsed)) {
        todos = parsed;
        const maxId = todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
        nextId = maxId + 1;
      }
    }
  } catch (e) {
    console.error('Failed to load state:', e);
    // Try encrypted version
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        const parsed = JSON.parse(encrypted);
        const decrypted = await decryptData(parsed);
        if (decrypted && Array.isArray(decrypted)) {
          todos = decrypted;
          const maxId = todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
          nextId = maxId + 1;
        }
      }
    } catch (e2) {
      console.error('Failed to load encrypted state:', e2);
    }
  }
}

// Save state to localStorage whenever state changes
async function saveState() {
  const encrypted = await encryptData(todos);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

/**
 * Adds a new todo if text is non-empty after trimming.
 * Clears the input on success; does nothing on empty/whitespace input.
 * @param {string} text - The raw input value from the Add Form
 */
function addTodo(text) {
  const trimmed = text.trim();

  // Requirement 1.4: reject empty or whitespace-only input
  if (!trimmed) {
    return;
  }

  // Requirement 1.2: append new todo with active state
  todos.push({ id: nextId++, text: trimmed, completed: false });

  // Save to localStorage
  saveState();

  // Requirement 1.3: clear the input field after a successful add
  const input = document.getElementById('todo-input');
  if (input) {
    input.value = '';
  }

  // Re-render the list
  render();
}

/**
 * Toggles the completed state of the todo with the given id.
 * If no todo with that id exists, does nothing.
 */
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;

  // Save to localStorage
  saveState();

  render();
}

/**
 * Removes the todo with the given id from the list.
 * @param {number} id - The id of the todo to remove
 */
function deleteTodo(id) {
  // Requirement 4.2: filter out the item with the matching id
  todos = todos.filter(todo => todo.id !== id);

  // Save to localStorage
  saveState();

  render();
}

/**
 * Sets the current filter and re-renders the todo list.
 * @param {'all' | 'active' | 'completed'} filter - The filter to apply
 */
function setFilter(filter) {
  currentFilter = filter;

  // Re-render to reflect the new filter
  render();
}

/**
 * Returns the subset of todos matching the current filter.
 * @returns {Array<{ id: number, text: string, completed: boolean }>}
 */
function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter(todo => !todo.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter(todo => todo.completed);
  }
  // 'all' — return every todo
  return todos;
}

/**
 * Wipes the todo list container and redraws every visible todo item,
 * the empty-state message, and the filter button states.
 */
function render() {
  const todoList = document.getElementById('todo-list');
  if (!todoList) return;

  // Compute visible todos based on current filter
  const visibleTodos = getFilteredTodos();

  // Clear the container
  todoList.innerHTML = '';

  // Requirement 2.2: empty-state message when no todos exist
  if (todos.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = 'No todos yet. Add one above!';
    todoList.appendChild(emptyMsg);
    updateFilterButtons();
    return;
  }

  // Requirement 2.1: render each visible todo in document order
  for (const todo of visibleTodos) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) {
      li.classList.add('completed');
    }

    // Completion Toggle (checkbox)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // Task text
    const span = document.createElement('span');
    span.textContent = todo.text;
    if (todo.completed) {
      span.classList.add('completed');
    }

    // Delete Control
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  }

  // Requirement 5.5: update filter button active state
  updateFilterButtons();
}

/**
 * Updates the .active class on filter buttons to reflect currentFilter.
 */
function updateFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  for (const btn of filterButtons) {
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

// Initialize encryption key and load state
loadOrCreateKey().then(() => {
  loadState().then(() => {
    // Initial render to paint the empty state on page load
    render();

    // Attach form submit listener
    const addForm = document.getElementById('add-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        if (input) {
          addTodo(input.value);
        }
      });
    }

    // Attach filter button click listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter) {
          setFilter(filter);
        }
      });
    });
  });
});

