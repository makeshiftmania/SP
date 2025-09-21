// dropdown-core.js  (17 May 2025)
// Generic dropdown utilities shared by every custom dropdown.
//
// Exposes `window.dropdownCore` with:
//   • populate(wrapper, items, onSelect)
//   • closeAll()
//   • open(wrapper)
//
(function () {
  const core = {};
  const OPEN_CLASS = "open";

  core.closeAll = () => {
    document.querySelectorAll('.custom-dropdown.' + OPEN_CLASS)
            .forEach(el => {
              el.classList.remove(OPEN_CLASS);
              const list = el.querySelector('.dropdown-options');
              if (list) list.style.display = 'none';
            });
  };

  core.open = (wrapper) => {
    const list = wrapper.querySelector('.dropdown-options');
    if (!list) return;
    core.closeAll();
    wrapper.classList.add(OPEN_CLASS);
    list.style.display = 'block';
  };

  // helper to inject <div> items
  core.populate = (wrapper, items, onSelect) => {
    const list = wrapper.querySelector('.dropdown-options');
    if (!list) return;
    list.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div');
      div.textContent = it.label;
      div.dataset.value = it.value;
      list.appendChild(div);
    });
    list.onclick = (e) => {
      if (e.target.tagName !== 'DIV') return;
      onSelect(e.target.dataset.value, e.target.textContent);
      core.closeAll();
    };
    // toggle on click of selected-option
    const so = wrapper.querySelector('.selected-option');
    so.onclick = (e) => {
      e.stopPropagation();
      if (wrapper.classList.contains(OPEN_CLASS)) {
        core.closeAll();
      } else {
        core.open(wrapper);
      }
    };
  };

  // close if click anywhere else
  document.addEventListener('click', core.closeAll);

  window.dropdownCore = core;
})();