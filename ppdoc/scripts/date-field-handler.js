// ✅ Date Field Handler - DD.MM.YYYY format validation and formatting

function initializeDateFields() {
  const dateInputs = document.querySelectorAll('input[data-date-format="true"]');
  console.log(`[DATE-FORMAT] Found ${dateInputs.length} date format fields to initialize`);

  dateInputs.forEach(input => {
    // Skip if already initialized
    if (input.dataset.dateFormatInitialized === 'true') {
      return;
    }
    
    console.log(`[DATE-FORMAT] Initializing field: ${input.id}`);
    
    input.addEventListener("input", (e) => {
      let val = input.value;
      
      // Remove any non-digit characters except dots
      val = val.replace(/[^\d.]/g, "");
      
      // Auto-format: add dots after day and month
      if (val.length >= 2 && val.indexOf('.') === -1) {
        val = val.substring(0, 2) + '.' + val.substring(2);
      }
      if (val.length >= 5 && val.split('.').length === 2) {
        const parts = val.split('.');
        val = parts[0] + '.' + parts[1].substring(0, 2) + '.' + parts[1].substring(2);
      }
      
      // Limit to DD.MM.YYYY format (10 characters)
      if (val.length > 10) {
        val = val.substring(0, 10);
      }
      
      input.value = val;
    });

    input.addEventListener("blur", () => {
      const val = input.value.trim();
      
      // Skip validation if field is empty
      if (!val) {
        input.style.borderColor = ''; // Clear any error styling
        return;
      }
      
      // Validate DD.MM.YYYY format
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(val)) {
        console.warn(`[DATE-FORMAT] Invalid date format in ${input.id}: ${val}`);
        input.style.borderColor = '#ff6b6b';
        input.title = 'Please use DD.MM.YYYY format';
        return;
      }
      
      // Validate actual date values
      const parts = val.split('.');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      // Basic validation
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        console.warn(`[DATE-FORMAT] Invalid date values in ${input.id}: ${val}`);
        input.style.borderColor = '#ff6b6b';
        input.title = 'Invalid date';
        return;
      }
      
      // More precise date validation using JavaScript Date
      const testDate = new Date(year, month - 1, day);
      if (testDate.getDate() !== day || testDate.getMonth() !== month - 1 || testDate.getFullYear() !== year) {
        console.warn(`[DATE-FORMAT] Invalid date in ${input.id}: ${val}`);
        input.style.borderColor = '#ff6b6b';
        input.title = 'Invalid date (e.g., Feb 30th)';
        return;
      }
      
      // Valid date - clear any error styling
      input.style.borderColor = '';
      input.title = '';
      console.log(`[DATE-FORMAT] Valid date in ${input.id}: ${val}`);
    });

    input.addEventListener("focus", () => {
      // Clear error styling when user starts typing
      input.style.borderColor = '';
      input.title = '';
    });
    
    // Mark as initialized
    input.dataset.dateFormatInitialized = 'true';
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeDateFields);

// Re-initialize when fragments are loaded
document.addEventListener('smartui:fragmentsReady', () => {
  console.log('[DATE-FORMAT] Fragments ready, re-initializing date format fields...');
  initializeDateFields();
});

// Re-initialize when lower fragments are dynamically loaded
document.addEventListener('lowerFragment:ready', () => {
  console.log('[DATE-FORMAT] Lower fragment ready, re-initializing date format fields...');
  initializeDateFields();
});

// Export for manual calls if needed
window.initializeDateFields = initializeDateFields;