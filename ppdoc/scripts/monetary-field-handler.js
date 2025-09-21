// ✅ PPDOC version: monetary-field-handler.js (Updated for dynamic fragments)

function initializeMonetaryFields() {
  const moneyInputs = document.querySelectorAll('input[data-money="true"]');
  console.log(`[MONETARY] Found ${moneyInputs.length} monetary fields to initialize`);

  moneyInputs.forEach(input => {
    // Skip if already initialized
    if (input.dataset.monetaryInitialized === 'true') {
      return;
    }
    
    console.log(`[MONETARY] Initializing field: ${input.id}`);
    
    input.addEventListener("input", () => {
      let val = input.value;

      // Strip non-numeric (allow one decimal)
      val = val.replace(/[^\d.]/g, "");

      // Limit to one decimal
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts[1];
      }

      // Limit to 2 decimal places
      if (parts[1]?.length > 2) {
        val = parts[0] + "." + parts[1].slice(0, 2);
      }

      // Limit max based on data-money-max attribute, default to 500.00
      const maxAmount = parseFloat(input.dataset.moneyMax) || 500;
      const floatVal = parseFloat(val);
      if (!isNaN(floatVal) && floatVal > maxAmount) {
        val = maxAmount.toFixed(2);
      }

      input.value = val;
    });

    input.addEventListener("blur", () => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        input.value = val.toFixed(2);
      }
    });
    
    // Mark as initialized
    input.dataset.monetaryInitialized = 'true';
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeMonetaryFields);

// Re-initialize when fragments are loaded
document.addEventListener('smartui:fragmentsReady', () => {
  console.log('[MONETARY] Fragments ready, re-initializing monetary fields...');
  initializeMonetaryFields();
});

// Re-initialize when lower fragments are dynamically loaded
document.addEventListener('lowerFragment:ready', () => {
  console.log('[MONETARY] Lower fragment ready, re-initializing monetary fields...');
  initializeMonetaryFields();
});

// Export for manual calls if needed
window.initializeMonetaryFields = initializeMonetaryFields;