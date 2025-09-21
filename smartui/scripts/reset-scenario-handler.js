// reset-scenario-handler.js
// Clears ALL localStorage data for SmartUI and reloads with default.json

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('reset-scenario');
  if (!resetBtn) {
    console.warn('Reset button (id="reset-scenario") not found.');
    return;
  }

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Wipe absolutely everything in localStorage
    localStorage.clear();

    // Reload the app with the default scenario file
    window.location.href = 'openingpage.html?scenario=../scenarios/default.json';
  });
});
