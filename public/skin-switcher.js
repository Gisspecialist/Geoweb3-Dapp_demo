(function () {
  const STORAGE_KEY = 'geoweb3_view_skin_v1';
  const defaultState = { skin: 'dark', textSize: 'normal', density: 'normal', reduceMotion: false };
  const skins = [
    ['dark', 'Geo Dark', 'Original Web3 view'],
    ['light', 'Clean Light', 'Bright office view'],
    ['ocean', 'Ocean Blue', 'Cool low-glare view'],
    ['forest', 'Forest Green', 'Soft conservation view'],
    ['desert', 'Desert Amber', 'Warm low-light view'],
    ['contrast', 'High Contrast', 'Maximum readability']
  ];
  const textSizes = [
    ['normal', 'Normal'], ['comfortable', 'Comfort'], ['large', 'Large'], ['xlarge', 'XL']
  ];
  const densities = [
    ['normal', 'Normal'], ['compact', 'Compact'], ['spacious', 'Spacious']
  ];

  function loadState() {
    try { return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
    catch { return Object.assign({}, defaultState); }
  }
  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyState() {
    const root = document.documentElement;
    root.setAttribute('data-skin', state.skin || 'dark');
    root.setAttribute('data-text-size', state.textSize || 'normal');
    root.setAttribute('data-density', state.density || 'normal');
    document.body && document.body.classList.toggle('geo-reduce-motion', !!state.reduceMotion);
    updateActiveStates();
  }

  function updateActiveStates() {
    document.querySelectorAll('[data-geo-skin]').forEach(btn => btn.classList.toggle('active', btn.dataset.geoSkin === state.skin));
    document.querySelectorAll('[data-geo-text-size]').forEach(btn => btn.classList.toggle('active', btn.dataset.geoTextSize === state.textSize));
    document.querySelectorAll('[data-geo-density]').forEach(btn => btn.classList.toggle('active', btn.dataset.geoDensity === state.density));
    const motion = document.getElementById('geo-reduce-motion');
    if (motion) motion.checked = !!state.reduceMotion;
  }

  function setState(patch) {
    state = Object.assign({}, state, patch);
    saveState();
    applyState();
  }

  function optionButton(type, value, name, desc) {
    const data = type === 'skin' ? 'data-geo-skin' : type === 'text' ? 'data-geo-text-size' : 'data-geo-density';
    return `<button type="button" class="geo-skin-option" ${data}="${value}"><span class="geo-skin-name">${name}</span>${desc ? `<span class="geo-skin-desc">${desc}</span>` : ''}</button>`;
  }
  function chipButton(type, value, name) {
    const data = type === 'text' ? 'data-geo-text-size' : 'data-geo-density';
    return `<button type="button" class="geo-skin-chip" ${data}="${value}">${name}</button>`;
  }

  function buildPanel() {
    if (document.getElementById('geo-skin-toggle')) return;
    const toggle = document.createElement('button');
    toggle.id = 'geo-skin-toggle';
    toggle.className = 'geo-skin-toggle';
    toggle.type = 'button';
    toggle.textContent = '🎨 Skins';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'geo-skin-panel');

    const panel = document.createElement('section');
    panel.id = 'geo-skin-panel';
    panel.className = 'geo-skin-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Application skin and viewing settings');
    panel.innerHTML = `
      <div class="geo-skin-head">
        <div><div class="geo-skin-title">Viewing Skins</div><div class="geo-skin-subtitle">Change colors, text size, spacing, and motion.</div></div>
        <button type="button" class="geo-skin-close" aria-label="Close skin panel">✕</button>
      </div>
      <div class="geo-skin-section">
        <div class="geo-skin-section-label">Color Skin</div>
        <div class="geo-skin-grid">${skins.map(s => optionButton('skin', s[0], s[1], s[2])).join('')}</div>
      </div>
      <div class="geo-skin-section">
        <div class="geo-skin-section-label">Text Size</div>
        <div class="geo-skin-row">${textSizes.map(s => chipButton('text', s[0], s[1])).join('')}</div>
      </div>
      <div class="geo-skin-section">
        <div class="geo-skin-section-label">Spacing</div>
        <div class="geo-skin-row">${densities.map(s => chipButton('density', s[0], s[1])).join('')}</div>
      </div>
      <div class="geo-skin-section">
        <label class="geo-skin-checkbox"><input type="checkbox" id="geo-reduce-motion" /> Reduce animations for easier viewing</label>
        <div class="geo-skin-note">Your choice is saved on this device. Use High Contrast or Clean Light for presentations, accessibility, or bright rooms.</div>
      </div>`;

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    function openPanel(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('button')?.focus({ preventScroll: true });
    }
    toggle.addEventListener('click', () => openPanel(panel.hidden));
    panel.querySelector('.geo-skin-close').addEventListener('click', () => openPanel(false));
    panel.addEventListener('click', (evt) => {
      const skinBtn = evt.target.closest('[data-geo-skin]');
      const textBtn = evt.target.closest('[data-geo-text-size]');
      const densityBtn = evt.target.closest('[data-geo-density]');
      if (skinBtn) setState({ skin: skinBtn.dataset.geoSkin });
      if (textBtn) setState({ textSize: textBtn.dataset.geoTextSize });
      if (densityBtn) setState({ density: densityBtn.dataset.geoDensity });
    });
    panel.querySelector('#geo-reduce-motion').addEventListener('change', (evt) => setState({ reduceMotion: evt.target.checked }));
    document.addEventListener('keydown', (evt) => { if (evt.key === 'Escape') openPanel(false); });
    updateActiveStates();
  }

  applyState();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { buildPanel(); applyState(); });
  else { buildPanel(); applyState(); }
})();
