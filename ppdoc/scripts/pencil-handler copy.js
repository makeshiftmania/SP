// ppdoc-pencil-handler.js — Smart pencil functionality with dynamic button management
console.log('[PENCIL] ppdoc-pencil-handler.js loaded');

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════
  
  // List of end date fields that should be auto-filled if blank
  const END_DATE_FIELDS = ['moveOutDate', 'contract_End', 'device_End', 'valid_To'];

  // List of fields that should change from grey to white on pencil activation
  const GREY_TO_WHITE_FIELDS = ['uselessWhiteNotes-container'];

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Convert offset days to DD.MM.YYYY format (same as tree-menu.js)
  function calculateAndFormatDate(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  // Get nested object value by path string
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Auto-fill blank end date fields with 31.12.9999
  function autoFillEndDates() {
    END_DATE_FIELDS.forEach(fieldName => {
      const element = document.getElementById(fieldName);
      if (element && (!element.value || element.value.trim() === '')) {
        element.value = '31.12.9999';
        console.log(`[PENCIL] Auto-filled blank ${fieldName} with 31.12.9999`);
      }
    });
  }

  // Change specified fields from grey to white background
  function activateGreyToWhiteFields() {
    console.log('[PENCIL] Activating grey-to-white fields...');
    
    GREY_TO_WHITE_FIELDS.forEach(fieldName => {
      const element = document.getElementById(fieldName);
      if (element) {
        // Remove grey-field class and add white-field class
        element.classList.remove('grey-field');
        element.classList.add('white-field');
        
        // Override the inline background-color to white
        element.style.backgroundColor = 'white';
        
        // Find the input inside (if it exists) and ensure proper behavior
        const input = element.querySelector('input');
        if (input) {
          input.readOnly = true;
          input.style.whiteSpace = 'nowrap';
        }
        
        console.log(`[PENCIL] Activated field: ${fieldName} (grey → white)`);
      } else {
        console.warn(`[PENCIL] Field not found: ${fieldName}`);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUTTON MANAGEMENT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Check if buttons currently exist
  function buttonsExist() {
    const activitySection = document.getElementById('activity-section');
    return activitySection && activitySection.children.length > 0;
  }

  // Create buttons for the specified supply type (active by default)
  function createOrSwitchButtons(supplyType) {
    console.log(`[PENCIL] Creating/switching to ${supplyType} button set`);
    
    // Use the search handler's button creation function
    if (window.SEARCH_DEBUG && window.SEARCH_DEBUG.createButtonSet) {
      window.SEARCH_DEBUG.createButtonSet(supplyType, true); // Create as active
      
      // Set global button mode to activated so buttons are clickable
      window.buttonMode = 'activated';
      console.log(`[PENCIL] Set global buttonMode to activated`);
      
      console.log(`[PENCIL] Created active ${supplyType} buttons`);
    } else {
      console.error('[PENCIL] Search handler button creation function not available');
    }
  }

  // Activate existing buttons (change from dormant to active)
  function activateExistingButtons() {
    console.log('[PENCIL] Activating existing dormant buttons...');

    // Set global button mode to activated so buttons are clickable
    window.buttonMode = 'activated';
    console.log(`[PENCIL] Set global buttonMode to activated`);

    // Find all dormant buttons and activate them
    const activitySection = document.getElementById('activity-section');
    if (!activitySection) {
      console.error('[PENCIL] Activity section not found');
      return;
    }

    const buttons = activitySection.querySelectorAll('img[data-mode="dormant"]');
    buttons.forEach(button => {
      const prefix = button.dataset.imgprefix;
      
      // Change image to active
      button.src = button.src.replace('-inactive.png', '-active.png');
      
      // Change mode to standard (clickable)
      button.dataset.mode = 'standard';
      
      console.log(`[PENCIL] Activated button: ${prefix}`);
    });

    console.log(`[PENCIL] Activated ${buttons.length} buttons`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONSTRUCTED FIELD POPULATION
  // ═══════════════════════════════════════════════════════════════════

  // Populate fields that are constructed from multiple JSON values
  function populateConstructedFields(data) {
    if (!data.customerInfo) {
      return;
    }

    const customerInfo = data.customerInfo;

    // Get or create constructed address fields
    let constructedFields = getOrCreateConstructedFields(customerInfo);

    // Populate name_Address_Combo field (bg-shell.html format)
    const nameAddressComboElement = document.getElementById('name_Address_Combo');
    if (nameAddressComboElement) {
      nameAddressComboElement.value = constructedFields.name_Address_Combo;
      console.log(`[PENCIL] Populated name_Address_Combo: ${constructedFields.name_Address_Combo}`);
    }

    // Populate full_Address_Trunc field (fragment format)
    const fullAddressTruncElement = document.getElementById('full_Address_Trunc');
    if (fullAddressTruncElement) {
      fullAddressTruncElement.value = constructedFields.full_Address_Trunc;
      console.log(`[PENCIL] Populated full_Address_Trunc: ${constructedFields.full_Address_Trunc}`);
    }

    // Keep backward compatibility with old full_address field
    const fullAddressElement = document.getElementById('full_address');
    if (fullAddressElement) {
      fullAddressElement.value = constructedFields.full_Address_Trunc;
      console.log(`[PENCIL] Populated full_address (legacy): ${constructedFields.full_Address_Trunc}`);
    }
  }

  // Get constructed fields from localStorage or create them fresh
  function getOrCreateConstructedFields(customerInfo) {
    // Try to get from localStorage first
    const stored = localStorage.getItem('smartui_constructedFields');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[PENCIL] Using cached constructed fields from localStorage');
        return parsed;
      } catch (e) {
        console.warn('[PENCIL] Invalid constructed fields in localStorage, recreating');
      }
    }

    // Create fresh constructed fields
    console.log('[PENCIL] Creating fresh constructed fields');
    
    // Build name_Address_Combo: "Mark Woodruff / EDINBURGH, Main Street 17"
    const firstName = customerInfo.first_Name || '';
    const lastName = customerInfo.last_Name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    const city = (customerInfo.city || '').toUpperCase();
    const street = customerInfo.street || '';
    const houseNumber = customerInfo.housenumber || '';
    const flatNumber = customerInfo.flatnumber || '';
    
    // Build address part: "EDINBURGH, Main Street 17" (with flat if exists)
    let addressPart = '';
    if (city) {
      addressPart = city;
      if (street) {
        addressPart += `, ${street}`;
        if (flatNumber) {
          addressPart += ` ${flatNumber}`;
        }
        if (houseNumber) {
          addressPart += ` ${houseNumber}`;
        }
      }
    }
    
    const name_Address_Combo = fullName && addressPart ? `${fullName} / ${addressPart}` : '';

    // Build full_Address_Trunc: "17 Main Street EDINBURGH" (no postcode)
    const addressTruncParts = [
      flatNumber,
      houseNumber, 
      street,
      city
    ].filter(part => part && part.trim() !== '');
    
    const full_Address_Trunc = addressTruncParts.join(' ');

    const constructedFields = {
      name_Address_Combo,
      full_Address_Trunc
    };

    // Save to localStorage for future use
    localStorage.setItem('smartui_constructedFields', JSON.stringify(constructedFields));
    console.log('[PENCIL] Cached constructed fields to localStorage');

    return constructedFields;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FIELD POPULATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Populate supply-specific fields based on selected supply type
  function populateSupplyFields(data, supplyType) {
    console.log(`[PENCIL] Populating ${supplyType} supply fields...`);

    if (!data.supplyInfo || !data.supplyInfo[supplyType]) {
      console.warn(`[PENCIL] No ${supplyType} supply info found in data`);
      return;
    }

    const supply = data.supplyInfo[supplyType];
    const accountInfo = supply.accountInfo || {};
    const deviceInfo = supply.deviceInfo || {};

    // Flatten all the supply data into a single object for easy field mapping
    const supplyData = {
      ...accountInfo,
      ...deviceInfo
    };

    // Direct field mapping - populate fields that have matching IDs
    Object.keys(supplyData).forEach(key => {
      const element = document.getElementById(key);
      if (element && supplyData[key] !== null && supplyData[key] !== undefined && supplyData[key] !== '') {
        let value = supplyData[key];
        
        // Handle offset date fields - convert to actual dates
        if (key.includes('_Offset') || key.includes('Offset')) {
          value = calculateAndFormatDate(value);
          console.log(`[PENCIL] Converted offset ${key}: ${supplyData[key]} → ${value}`);
        }
        
        element.value = value;
        console.log(`[PENCIL] Populated ${key}: ${value}`);
      }
    });

    // Handle special field mappings for different supply types
    if (supplyType === 'electricity') {
      // Map MPAN to MPANMPRN field if it exists
      const mpanElement = document.getElementById('MPANMPRN');
      if (mpanElement && accountInfo.MPAN) {
        mpanElement.value = accountInfo.MPAN;
        console.log(`[PENCIL] Populated MPANMPRN with MPAN: ${accountInfo.MPAN}`);
      }
    } else if (supplyType === 'gas') {
      // Map MPRN to MPANMPRN field if it exists
      const mprnElement = document.getElementById('MPANMPRN');
      if (mprnElement && accountInfo.MPRN) {
        mprnElement.value = accountInfo.MPRN;
        console.log(`[PENCIL] Populated MPANMPRN with MPRN: ${accountInfo.MPRN}`);
      }
    }

    // Handle status dropdown based on supplystatus
    const statusElement = document.getElementById('status');
    if (statusElement) {
      const supplyStatus = deviceInfo.supplystatus || accountInfo.supplystatus;
      if (supplyStatus) {
        let statusValue = '';
        if (supplyStatus.toLowerCase().includes('on supply')) {
          statusValue = 'Active';
        } else if (supplyStatus.toLowerCase().includes('off supply')) {
          statusValue = 'Inactive';
        }
        
        if (statusValue) {
          statusElement.value = statusValue;
          // Make it read-only by adding grey styling class
          statusElement.classList.add('grey-field');
          statusElement.disabled = true; // Also disable it
          console.log(`[PENCIL] Set status to: ${statusValue} (from ${supplyStatus})`);
        }
      }
    }

    // Handle other special field combinations if needed
    // Add more custom mappings here as requirements emerge

    // Auto-fill blank end date fields
    autoFillEndDates();

    console.log(`[PENCIL] ${supplyType} supply fields populated successfully`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // FRAGMENT REPOPULATION FUNCTION
  // ═══════════════════════════════════════════════════════════════════

  // Re-populate fields when new fragments are loaded
  function repopulateFieldsAfterFragmentLoad() {
    console.log('[PENCIL] Re-populating fields after fragment load...');

    // Only repopulate if we have a selected supply type and data
    if (!window.selectedSupplyType) {
      console.log('[PENCIL] No supply type selected, skipping repopulation');
      return;
    }

    const raw = localStorage.getItem('smartui_data');
    if (!raw) {
      console.log('[PENCIL] No scenario data found, skipping repopulation');
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('[PENCIL] Invalid JSON in smartui_data:', e);
      return;
    }

    // Re-populate fields for the current supply type
    populateSupplyFields(data, window.selectedSupplyType);
    
    // Re-populate constructed fields (like full_address)
    populateConstructedFields(data);
    
    console.log(`[PENCIL] Re-populated ${window.selectedSupplyType} fields after fragment load`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PENCIL BUTTON HANDLER
  // ═══════════════════════════════════════════════════════════════════

  // Handle pencil button click
  function handlePencilClick(event) {
    console.log('[PENCIL] Pencil button clicked');

    // Check if a supply type is selected in the tree
    if (!window.selectedSupplyType) {
      console.warn('[PENCIL] No supply type selected in tree');
      alert('Please select an electricity or gas account from the tree first');
      return;
    }

    // Get the current scenario data from localStorage
    const raw = localStorage.getItem('smartui_data');
    if (!raw) {
      console.error('[PENCIL] No smartui_data found in localStorage');
      alert('No scenario data loaded');
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('[PENCIL] Invalid JSON in smartui_data:', e);
      alert('Invalid scenario data');
      return;
    }

    console.log(`[PENCIL] Processing ${window.selectedSupplyType} account`);

    // Smart button management
    const currentSupplyType = window.selectedSupplyType;
    const previousSupplyType = window.currentButtonSupplyType;

    if (!buttonsExist()) {
      // No buttons exist - create them as active
      console.log('[PENCIL] No buttons exist, creating active button set');
      createOrSwitchButtons(currentSupplyType);
    } else if (previousSupplyType !== currentSupplyType) {
      // Buttons exist but for different supply type - switch them
      console.log(`[PENCIL] Switching buttons from ${previousSupplyType} to ${currentSupplyType}`);
      createOrSwitchButtons(currentSupplyType);
    } else {
      // Buttons exist for same supply type - just activate them
      console.log('[PENCIL] Buttons exist for same supply type, activating them');
      activateExistingButtons();
    }

    // Populate supply-specific fields
    populateSupplyFields(data, currentSupplyType);

    // Populate constructed fields (like full_address)
    populateConstructedFields(data);

    // Activate grey-to-white fields
    activateGreyToWhiteFields();

    console.log('[PENCIL] Pencil button processing completed successfully');
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  // Initialize pencil button functionality after fragments are ready
  function initializePencilHandler() {
    console.log('[PENCIL] Initializing pencil button functionality...');

    const pencilButton = document.getElementById('btn-pencil');
    
    if (!pencilButton) {
      console.error('[PENCIL] Pencil button not found');
      return;
    }

    // Add click event listener to pencil button
    pencilButton.addEventListener('click', handlePencilClick);
    
    console.log('[PENCIL] Pencil button functionality initialized');
  }

  // Wait for fragments to be ready
  document.addEventListener('smartui:fragmentsReady', initializePencilHandler, { once: true });

  // *** NEW *** - Listen for lower fragment reloads and repopulate fields
  document.addEventListener('lowerFragment:ready', repopulateFieldsAfterFragmentLoad);

  // Expose functions for debugging
  window.PENCIL_DEBUG = {
    handlePencilClick: handlePencilClick,
    populateSupplyFields: populateSupplyFields,
    createOrSwitchButtons: createOrSwitchButtons,
    activateExistingButtons: activateExistingButtons,
    buttonsExist: buttonsExist,
    greyToWhiteFields: GREY_TO_WHITE_FIELDS,
    repopulateFieldsAfterFragmentLoad: repopulateFieldsAfterFragmentLoad,
    populateConstructedFields: populateConstructedFields,
    getOrCreateConstructedFields: getOrCreateConstructedFields
  };

})();