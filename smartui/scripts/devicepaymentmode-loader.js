document.addEventListener('DOMContentLoaded', function() {
    const devicePaymentModeField = document.getElementById('DevicePaymentMode');
  
    function updateFieldValue() {
      const storedValue = localStorage.getItem('smartui_field_diagnosticsdevicepaymentmode_DevicePaymentMode');
      if (storedValue) {
        devicePaymentModeField.value = storedValue;
      }
    }
  
    // Initial field population
    updateFieldValue();
  
    // Listen for changes in localStorage
    window.addEventListener('storage', function(event) {
      if (event.key === 'smartui_field_diagnosticsdevicepaymentmode_DevicePaymentMode') {
        updateFieldValue();
      }
    });
  });