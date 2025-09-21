// diagselect-loader.js
console.log("✅ Active version: diagselect-loader.js (Updated 17 April 00:18)");

document.addEventListener('DOMContentLoaded', function() {

  const deviceTypeDropdown = document.getElementById('Diagselect_Select_Device_Type');
  const deviceReadDropdown = document.getElementById('Diagselect_Select_Device_Read');
  const executeButton = document.getElementById('diagSelectionExecute');
  // 🔢 PDOC generation support
  const pdocInput = document.getElementById('diag_Select_PDOC');
  const PDOC_KEY = 'smartui_diagselect_pdoc';

  // Pre‑populate the PDOC field from localStorage, if present
  if (pdocInput) {
    const storedPDOC = localStorage.getItem(PDOC_KEY);
    if (storedPDOC) {
      pdocInput.value = storedPDOC;
    }
  }

  // Same 20‑digit pattern used in reset‑pin.js: 11 zeros, a 9, then 8 random digits
  function generatePDOC() {
    const randPart = Math.floor(Math.random() * 1e8).toString().padStart(8, '0');
    return '00000000000' + '9' + randPart;
  }


  // 🔁 Function to toggle dropdown open/close on click
  function setupDropdownToggle(dropdown) {
    const selected = dropdown.querySelector('.selected-option');
    const options = dropdown.querySelector('.dropdown-options');
  
    // Global click handler: close dropdowns ONLY when clicking outside any custom dropdown
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-options').forEach(opt => opt.style.display='none');
      }
    });
  
    // Toggle this specific dropdown
    selected.addEventListener('click', function(event) {
      event.stopPropagation();
      const isVisible = options.style.display === 'block';
  
      // Close all dropdowns before opening the current one
      document.querySelectorAll('.dropdown-options').forEach(function(opt) {
        opt.style.display = 'none';
      });
  
      // Now open the one we clicked (unless it was already open)
      options.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close this dropdown if user clicks outside it
    document.addEventListener('click', function(event) {
      if (!dropdown.contains(event.target)) {
        options.style.display = 'none';
      }
    });
  }

  // Mapping object for dropdown selections and corresponding field data
  const selectionMapping = {
    ESME: {
      "Tariff Info": {
        page: 'diagnosticstariffinfo', // Corrected
        fieldId: 'TariffInfo',
        jsonKey: 'tariffinfo',
      },
      "Payment Mode": {
        page: 'diagnosticsdevicepaymentmode', // ✅ matches diagnosticsdevicepaymentmode.html
        fieldId: 'DevicePaymentMode',
        jsonKey: 'devicepaymentmode',
      },
      "Supply Status": {
        page: 'diagnosticssupplystatus', // ✅ matches diagnosticssupplystatus.html
        fieldId: 'SupplyState',
        jsonKey: 'supplystatus',
      },
      "Auxillary Load Switch": {
        page: 'diagnosticsloadcontrolswitchdata', // Corrected from deviceauxload
        fieldId: 'AuxLoadSwitch',
        jsonKey: 'auxloadswitch',
      },
      "Device Log": {
        page: 'diagnosticsdevicelog', // Corrected from devicedevicelog
        fieldId: 'DeviceLog',
        jsonKey: 'devicelog',
      },
    },
    PPMID: {
      A1: {},
      A2: {},
      A3: {},
      A4: {},
    },
    GPF: {
      B1: {},
      B2: {},
      B3: {},
      B4: {},
    },
    'COMMS HUB': {
      C1: {},
      C2: {},
      C3: {},
      C4: {},
    },
  };

  // Function to update the device read dropdown options based on the selected device type
  function updateDeviceReadOptions() {
    if (!deviceTypeDropdown || !deviceReadDropdown) return;
    
    const selectedElement = deviceTypeDropdown.querySelector('.selected-option');
    if (!selectedElement) return;
    
    const selectedType = selectedElement.getAttribute('data-value');
    if (!selectedType) return;
    
    const options = deviceReadDropdown.querySelector('.dropdown-options');
    if (!options) return;
    
    options.innerHTML = ''; // Clear existing options

    // Add a blank option
    const blankOption = document.createElement('div');
    blankOption.setAttribute('data-value', '');
    blankOption.classList.add('dropdown-option');
    blankOption.textContent = '\u00A0'; // non-breaking space: visually blank but renders
    options.appendChild(blankOption);

    if (selectionMapping[selectedType]) {
      Object.keys(selectionMapping[selectedType]).forEach(function(key) {
        const option = document.createElement('div');
        option.setAttribute('data-value', key);
        option.textContent = key;
        options.appendChild(option);
      });
    }

    // Force blank selection when device type changes
    const selectedDisplay = deviceReadDropdown.querySelector('.selected-option');
    if (selectedDisplay) {
      selectedDisplay.setAttribute('data-value', '');
      selectedDisplay.textContent = '\u00A0'; // visually blank
    }
    localStorage.setItem('smartui_diagselect_device_read', '');

    // If we have a stored read value, try to select it after populating options
    const storedRead = localStorage.getItem('smartui_diagselect_device_read');
    if (storedRead && storedRead !== '') {
      const readOption = options.querySelector(`[data-value="${storedRead}"]`);
      if (readOption) {
        readOption.click();
      }
    }
  }

  // Function to handle the execute button click
  function handleExecuteButtonClick() {
    // ─── PDOC AUTO‑FILL ─────────────────────────────────────────────────────
    if (pdocInput) {
      if (!localStorage.getItem(PDOC_KEY)) {
        if (!pdocInput.value.trim()) {
          const newPDOC = generatePDOC();
          pdocInput.value = newPDOC;
          localStorage.setItem(PDOC_KEY, newPDOC);
        } else {
          // If the user typed a value before first Execute, preserve it
          localStorage.setItem(PDOC_KEY, pdocInput.value.trim());
        }
      }
    }

    if (!deviceTypeDropdown || !deviceReadDropdown) {
      console.error("Required dropdown elements not found");
      return;
    }
    
    const typeElement = deviceTypeDropdown.querySelector('.selected-option');
    const readElement = deviceReadDropdown.querySelector('.selected-option');
    
    if (!typeElement || !readElement) {
      console.error("Selected options not found");
      return;
    }
    
    const selectedType = typeElement.getAttribute('data-value');
    const selectedRead = readElement.getAttribute('data-value');

    if (selectedType && selectedRead && selectionMapping[selectedType] && selectionMapping[selectedType][selectedRead]) {
      const mapping = selectionMapping[selectedType][selectedRead];
      const scenarioDataString = localStorage.getItem('smartui_data');

      if (scenarioDataString) {
        try {
          const scenarioData = JSON.parse(scenarioDataString);
          const fieldValue = scenarioData[mapping.jsonKey] || ''; // Use empty string if data is not available

          localStorage.setItem(`smartui_field_${mapping.page}_${mapping.fieldId}`, fieldValue);
          console.log(`Field value set for ${mapping.page} - ${mapping.fieldId}: ${fieldValue}`);
        } catch (error) {
          console.error("Error parsing smartui_data:", error);
        }
      } else {
        console.warn("No scenario data found in localStorage");
      }
    } else {
      console.warn("Invalid or missing selection");
    }
  }

  // 🔧 Activate toggle logic for both dropdowns
  if (deviceTypeDropdown && deviceReadDropdown) {
    setupDropdownToggle(deviceTypeDropdown);
    setupDropdownToggle(deviceReadDropdown);
  
    // Device type dropdown selection
    deviceTypeDropdown.addEventListener('click', function(event) {
      if (event.target.closest('.dropdown-options') && event.target.hasAttribute('data-value')) {
        const selectedOption = event.target;
        const selectedValue = selectedOption.getAttribute('data-value');
    
        console.log("✅ Device Type option clicked:", selectedValue);
  
        // Update .selected-option
        const selectedDisplay = deviceTypeDropdown.querySelector('.selected-option');
        if (selectedDisplay) {
          selectedDisplay.setAttribute('data-value', selectedValue);
          selectedDisplay.textContent = selectedOption.textContent;
      
          localStorage.setItem('smartui_diagselect_device_type', selectedValue);
          updateDeviceReadOptions();
        
          // Auto‑close the dropdown after selection
          const typeOptionsContainer = deviceTypeDropdown.querySelector('.dropdown-options');
          if (typeOptionsContainer) {
            typeOptionsContainer.style.display = 'none';
          }
}
      }
    });
    
    // Device read dropdown selection
    deviceReadDropdown.addEventListener('click', function(event) {
      if (event.target.closest('.dropdown-options') && event.target.hasAttribute('data-value')) {
        const selectedOption = event.target;
        const selectedValue = selectedOption.getAttribute('data-value');
    
        console.log("✅ Device Read option clicked:", selectedValue);
  
        // Update .selected-option
        const selectedDisplay = deviceReadDropdown.querySelector('.selected-option');
        if (selectedDisplay) {
          selectedDisplay.setAttribute('data-value', selectedValue);
          selectedDisplay.textContent = selectedOption.textContent;
      
          localStorage.setItem('smartui_diagselect_device_read', selectedValue);
        
          // Auto‑close the dropdown after selection
          const readOptionsContainer = deviceReadDropdown.querySelector('.dropdown-options');
          if (readOptionsContainer) {
            readOptionsContainer.style.display = 'none';
          }
}
      }
    });
  
    // Event listener for execute button click
    if (executeButton) {
      executeButton.addEventListener('click', handleExecuteButtonClick);
    }
    // Ensure a blank option appears at the top of Device Type
const typeOptionsContainer = deviceTypeDropdown.querySelector('.dropdown-options');
if (typeOptionsContainer && !typeOptionsContainer.querySelector('[data-value=""]')) {
  const blankType = document.createElement('div');
  blankType.classList.add('dropdown-option');
  blankType.setAttribute('data-value', '');
  blankType.textContent = '\u00A0';
  typeOptionsContainer.insertBefore(blankType, typeOptionsContainer.firstChild);
}

// Force display blank initially
const selectedTypeDisplay = deviceTypeDropdown.querySelector('.selected-option');
if (selectedTypeDisplay) {
  selectedTypeDisplay.setAttribute('data-value', '');
  selectedTypeDisplay.textContent = '\u00A0';
}
localStorage.setItem('smartui_diagselect_device_type', '');

    // Load previous device type selection from localStorage
    const storedType = localStorage.getItem('smartui_diagselect_device_type');
    if (storedType) {
      const typeOptions = deviceTypeDropdown.querySelectorAll('.dropdown-options [data-value]');
      let typeOption = null;
      typeOptions.forEach(opt => {
        if (opt.getAttribute('data-value') === storedType) {
          typeOption = opt;
        }
      });

      if (typeOption) {
        typeOption.click();
        // The device read selection will be handled in updateDeviceReadOptions
      }
    }
  } else {
    console.error("Required dropdown elements not found");
  }
});