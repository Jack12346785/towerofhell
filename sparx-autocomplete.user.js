// ==UserScript==
// @name         Sparx Math Auto Complete Helper
// @namespace    towerofhell/sparx
// @version      0.1.0
// @description  Save and auto-fill repeated Sparx Math answers based on question text + URL.
// @author       You
// @match        https://*.sparxmaths.uk/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORE_KEY = 'sparx_autocomplete_answers_v1';
  const PANEL_ID = 'sparx-autocomplete-panel';
  const STATUS_ID = 'sparx-autocomplete-status';

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function getQuestionText() {
    const candidateSelectors = [
      '[data-testid*="question"]',
      '.question',
      'main h1',
      'main h2',
      'main p'
    ];

    for (const selector of candidateSelectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const best = nodes
        .map((n) => n.innerText?.trim())
        .filter((t) => t && t.length > 15)
        .sort((a, b) => b.length - a.length)[0];
      if (best) return best;
    }

    return document.title || 'unknown-question';
  }

  function getQuestionKey() {
    const urlKey = location.pathname;
    const textKey = getQuestionText().replace(/\s+/g, ' ').slice(0, 300);
    return `${urlKey}::${textKey}`;
  }

  function getAnswerInputs() {
    return Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea'))
      .filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function getCurrentInputValue() {
    const inputs = getAnswerInputs();
    if (!inputs.length) return '';
    return inputs.map((el) => el.value || '').join('||');
  }

  function applyInputValue(serializedValue) {
    const inputs = getAnswerInputs();
    if (!inputs.length) return false;

    const parts = String(serializedValue).split('||');
    inputs.forEach((input, idx) => {
      const value = parts[idx] ?? parts[0] ?? '';
      input.focus();
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    return true;
  }

  function setStatus(message, color = '#a6e3a1') {
    const node = document.getElementById(STATUS_ID);
    if (!node) return;
    node.textContent = message;
    node.style.color = color;
  }

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.position = 'fixed';
    panel.style.right = '16px';
    panel.style.bottom = '16px';
    panel.style.zIndex = '999999';
    panel.style.background = '#1e1e2e';
    panel.style.color = '#fff';
    panel.style.padding = '10px';
    panel.style.border = '1px solid #45475a';
    panel.style.borderRadius = '8px';
    panel.style.fontFamily = 'system-ui, sans-serif';
    panel.style.width = '230px';
    panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';

    panel.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px;">Sparx Auto Complete</div>
      <button id="sparx-save-answer" style="width:100%;margin-bottom:6px;">Save Current Answer</button>
      <button id="sparx-fill-answer" style="width:100%;margin-bottom:6px;">Fill Saved Answer</button>
      <button id="sparx-clear-answer" style="width:100%;margin-bottom:6px;">Clear Saved Answer</button>
      <div id="${STATUS_ID}" style="font-size:12px;opacity:0.9;">Ready.</div>
    `;

    document.body.appendChild(panel);

    document.getElementById('sparx-save-answer')?.addEventListener('click', () => {
      const value = getCurrentInputValue();
      if (!value) {
        setStatus('No visible input value found.', '#f38ba8');
        return;
      }
      const key = getQuestionKey();
      const store = loadStore();
      store[key] = { value, updatedAt: new Date().toISOString() };
      saveStore(store);
      setStatus('Saved answer for this question.');
    });

    document.getElementById('sparx-fill-answer')?.addEventListener('click', () => {
      const key = getQuestionKey();
      const store = loadStore();
      const entry = store[key];
      if (!entry) {
        setStatus('No saved answer for this question.', '#f9e2af');
        return;
      }
      const ok = applyInputValue(entry.value);
      setStatus(ok ? 'Filled saved answer.' : 'Could not find input fields.', ok ? '#a6e3a1' : '#f38ba8');
    });

    document.getElementById('sparx-clear-answer')?.addEventListener('click', () => {
      const key = getQuestionKey();
      const store = loadStore();
      if (store[key]) {
        delete store[key];
        saveStore(store);
        setStatus('Cleared saved answer.');
      } else {
        setStatus('No saved answer to clear.', '#f9e2af');
      }
    });
  }

  function autoFillIfAvailable() {
    const key = getQuestionKey();
    const store = loadStore();
    const entry = store[key];
    if (!entry) return;

    const filled = applyInputValue(entry.value);
    if (filled) setStatus('Auto-filled saved answer.');
  }

  function init() {
    createPanel();
    setTimeout(autoFillIfAvailable, 600);
  }

  window.addEventListener('load', init);
})();
