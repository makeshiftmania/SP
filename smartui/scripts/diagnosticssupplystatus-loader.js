document.addEventListener('DOMContentLoaded', function() {
    const supplyStateField = document.getElementById('SupplyState');
  
    function updateFieldValue() {
      const storedValue = localStorage.getItem('smartui_field_diagnosticssupplystatus_SupplyState');
      if (storedValue) {
        supplyStateField.value = storedValue;
      }
    }
  
    // Initial field population
    updateFieldValue();
  
    // Listen for changes in localStorage
    window.addEventListener('storage', function(event) {
      if (event.key === 'smartui_field_diagnosticssupplystatus_SupplyState') {
        updateFieldValue();
      }
    });
  });