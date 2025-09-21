/* dropdown-fuel-handler.js
   Event-delegation version – robust ancestor matching.
*/
document.addEventListener('click', (e) => {
  const fuelShell = document.getElementById('elecOrGas');
  if (!fuelShell || !fuelShell.classList.contains('custom-dropdown')) return;

  const selectedBox = fuelShell.querySelector('.selected-option');
  const optionsBox  = fuelShell.querySelector('.dropdown-options');
  const option      = e.target.closest('#elecOrGas .dropdown-options [data-value]');

  /* 1️⃣ Click on (or inside) the selected box → toggle list */
  if (e.target.closest('#elecOrGas .selected-option')) {
    e.stopPropagation();                       // keep click from bubbling out
    optionsBox.classList.toggle('show');
    return;
  }

  /* 2️⃣ Click on one of the options */
  if (option) {
    const value = option.dataset.value;
    selectedBox.textContent = value;
    optionsBox.classList.remove('show');

    const changeEvt = new Event('change');
    changeEvt.value = value;
    fuelShell.dispatchEvent(changeEvt);
    return;
  }

  /* 3️⃣ Click anywhere else → close the list if open */
  if (optionsBox.classList.contains('show')) {
    optionsBox.classList.remove('show');
  }
});