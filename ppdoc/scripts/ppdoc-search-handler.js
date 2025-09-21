// ppdoc-search-handler.js — Search functionality for PPDOC with dynamic button creation
console.log('[SEARCH] ppdoc-search-handler.js loaded');

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════
  
  const SEARCH_MAPPINGS = {
    'findByContract_Account': {
      paths: [
        'supplyInfo.electricity.accountInfo.contract_Account',
        'supplyInfo.gas.accountInfo.contract_Account'
      ],
      caseSensitive: true
    },
    'findByMPANMPRN': {
      paths: [
        'supplyInfo.electricity.accountInfo.MPAN',
        'supplyInfo.gas.accountInfo.MPRN'
      ],
      caseSensitive: true
    },
    'findByReferenceNumber': {
      paths: [
        'supplyInfo.electricity.accountInfo.refNumber',
        'supplyInfo.gas.accountInfo.refNumber'
      ],
      caseSensitive: true
    },
    'findByContract': {
      paths: [
        'supplyInfo.electricity.accountInfo.contract',
        'supplyInfo.gas.accountInfo.contract'
      ],
      caseSensitive: true
    },
    'findByPartner': {
      paths: [
        'customerInfo.BPID'
      ],
      caseSensitive: true
    },
    'findByMeterSerial': {
      paths: [
        'supplyInfo.electricity.deviceInfo.meter_Serial',
        'supplyInfo.gas.deviceInfo.meter_Serial'
      ],
      caseSensitive: false
    },
    'findByGasCardNo': {
      paths: [
        'supplyInfo.gas.accountInfo.gasCardNumber'
      ],
      caseSensitive: false
    },
    'findByPrepaymentDocNo': {
      paths: [
        'supplyInfo.electricity.accountInfo.prepaymentDocNo',
        'supplyInfo.gas.accountInfo.prepaymentDocNo'
      ],
      caseSensitive: false
    }
  };

  // Button configurations for different supply types
  const BUTTON_CONFIGS = {
    electricity: [
      'appointment',
      'deappointment', 
      'adjustcreditdebt',
      'replacementkey',
      'wipedown',
      'tariffchange',
      'changeppdocstatus'
    ],
    gas: [
      'appointmentgas',
      'deappointmentgas',
      'adjustcreditdebtgas', 
      'replacementcard',
      'meterdump',
      'adhocquery',
      'tariffchangegas',
      'changeppdocstatusgas'
    ]
  };

  // List of end date fields that should be auto-filled if blank
  const END_DATE_FIELDS = ['moveOutDate', 'contract_End', 'device_End', 'valid_To'];

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Converts offset days to DD.MM.YYYY format
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
        console.log(`[SEARCH] Auto-filled blank ${fieldName} with 31.12.9999`);
      }
    });
  }

  // Compare values with case sensitivity option
  function compareValues(searchValue, jsonValue, caseSensitive) {
    if (jsonValue === null || jsonValue === undefined || jsonValue === '') {
      return false;
    }
    
    const search = caseSensitive ? String(searchValue) : String(searchValue).toLowerCase();
    const json = caseSensitive ? String(jsonValue) : String(jsonValue).toLowerCase();
    
    return search === json;
  }

  // Show popup message
  function showPopup(message) {
    alert(message); // Simple popup - can be replaced with custom modal later
  }

  // ═══════════════════════════════════════════════════════════════════
  // DYNAMIC BUTTON CREATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Clear existing buttons from activity section
  function clearExistingButtons() {
    const activitySection = document.getElementById('activity-section');
    if (activitySection) {
      activitySection.innerHTML = '';
      console.log('[SEARCH] Cleared existing buttons');
    }
  }

  // Create button set for specified supply type
  function createButtonSet(supplyType, active = false) {
    console.log(`[SEARCH] Creating ${active ? 'active' : 'dormant'} ${supplyType} button set`);
    
    // Check if activity section exists, if not wait for fragments to load
    let activitySection = document.getElementById('activity-section');
    if (!activitySection) {
      console.log('[SEARCH] Activity section not found, waiting for fragments...');
      // Wait a bit for fragments to load, then try again
      setTimeout(() => {
        activitySection = document.getElementById('activity-section');
        if (!activitySection) {
          console.error('[SEARCH] Activity section still not found after waiting');
          return;
        }
        createButtonSetInternal(activitySection, supplyType, active);
      }, 200);
      return;
    }
    
    createButtonSetInternal(activitySection, supplyType, active);
  }

  // Internal function to actually create the buttons
  function createButtonSetInternal(activitySection, supplyType, active = false) {
    console.log(`[SEARCH] Creating ${supplyType} buttons in activity section`);
    
    clearExistingButtons();

    // Create activity header image
    const activityImg = document.createElement('img');
    activityImg.id = 'activity-header';
    activityImg.src = '../images/activity.png';
    activityImg.style.position = 'absolute';
    activityImg.style.top = '0px';
    activityImg.style.left = '0px';
    activityImg.style.width = '220px';
    activityImg.style.height = '39px';
    activitySection.appendChild(activityImg);

    // Button positioning
    const buttonStartY = 39; // After activity image
    const buttonHeight = 27;
    const buttonSpacing = 27; // Same as button height
    const buttonLeft = 30;
    const buttonWidth = 168;

    // Create buttons for this supply type
    const buttons = BUTTON_CONFIGS[supplyType];
    buttons.forEach((buttonPrefix, index) => {
      const buttonY = buttonStartY + (index * buttonSpacing);
      
      // Determine the correct image filename
      let imagePrefix = buttonPrefix;
      
      // For gas buttons that end with 'gas', remove the 'gas' suffix for the image
      if (buttonPrefix.endsWith('gas')) {
        imagePrefix = buttonPrefix.replace(/gas$/, '');
      }
      
      const button = document.createElement('img');
      button.id = `btn-${buttonPrefix}`;
      button.className = 'nav-button';
      button.src = `../images/buttons/${imagePrefix}-${active ? 'active' : 'inactive'}.png`;
      button.dataset.imgprefix = buttonPrefix;
      button.dataset.mode = active ? 'standard' : 'dormant';
      button.onclick = function() { handleButtonClick(this); };
      button.onmouseover = function() { handleRollover(this); };
      button.onmouseout = function() { handleRollout(this); };
      button.style.position = 'absolute';
      button.style.top = buttonY + 'px';
      button.style.left = buttonLeft + 'px';
      button.style.width = buttonWidth + 'px';
      button.style.height = buttonHeight + 'px';
      
      activitySection.appendChild(button);
      console.log(`[SEARCH] Created button: ${buttonPrefix} (image: ${imagePrefix}) at Y:${buttonY}`);
    });

    // Create Process Links button (always at bottom)
    const processLinksY = buttonStartY + (buttons.length * buttonSpacing) + 24; // 24px gap
    const processLinksButton = document.createElement('img');
    processLinksButton.id = 'btn-processlinks';
    processLinksButton.className = 'nav-button';
    processLinksButton.src = '../images/buttons/processlinks-active.png';
    processLinksButton.dataset.imgprefix = 'processlinks';
    processLinksButton.dataset.mode = 'always';
    processLinksButton.onclick = function() { handleButtonClick(this); };
    processLinksButton.onmouseover = function() { handleRollover(this); };
    processLinksButton.onmouseout = function() { handleRollout(this); };
    processLinksButton.style.position = 'absolute';
    processLinksButton.style.top = processLinksY + 'px';
    processLinksButton.style.left = '46px';
    processLinksButton.style.width = '136px';
    processLinksButton.style.height = buttonHeight + 'px';
    
    activitySection.appendChild(processLinksButton);
    console.log(`[SEARCH] Created Process Links button at Y:${processLinksY}`);

    // Store the current supply type for pencil handler
    window.currentButtonSupplyType = supplyType;
    
    console.log(`[SEARCH] ${supplyType} button set created successfully`);
  }

  // Determine supply type from search results and path
  function determineSupplyType(scenarioData, searchType, searchValue, matchedPath) {
    console.log(`[SEARCH] Determining supply type from matched path: ${matchedPath}`);
    
    // If BPID search, return null (no specific supply type)
    if (searchType === 'findByPartner') {
      console.log('[SEARCH] BPID search - no specific supply type');
      return null;
    }
    
    // Determine from the matched path
    if (matchedPath.includes('electricity')) {
      console.log('[SEARCH] Matched electricity supply');
      return 'electricity';
    } else if (matchedPath.includes('gas')) {
      console.log('[SEARCH] Matched gas supply');
      return 'gas';
    }
    
    console.log('[SEARCH] Could not determine supply type from path');
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FIELD POPULATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Populate customerInfo fields immediately after scenario load
  function populateCustomerInfoFields(data) {
    console.log('[SEARCH] Populating customerInfo fields...');
    
    if (!data.customerInfo) {
      console.warn('[SEARCH] No customerInfo found in data');
      return;
    }

    const customerInfo = data.customerInfo;
    
    // Direct field mapping - populate fields that have matching IDs
    Object.keys(customerInfo).forEach(key => {
      const element = document.getElementById(key);
      if (element && customerInfo[key] !== null && customerInfo[key] !== undefined) {
        let value = customerInfo[key];
        
        // Handle offset date fields - convert to actual dates
        if (key.includes('_Offset') || key.includes('Offset') || key.toLowerCase().includes('offset')) {
          value = calculateAndFormatDate(value);
          console.log(`[SEARCH] Converted offset ${key}: ${customerInfo[key]} → ${value}`);
        }
        
        element.value = value;
        console.log(`[SEARCH] Populated ${key}: ${value}`);
      }
    });

    // Handle special field combinations
    // Create full_address from individual address components
    const addressParts = [
      customerInfo.flatnumber,
      customerInfo.housenumber,
      customerInfo.street,
      customerInfo.city,
      customerInfo.postcode
    ].filter(part => part && part.trim() !== ''); // Remove empty/null parts
    
    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(' ');
      const fullAddressElement = document.getElementById('full_address');
      if (fullAddressElement) {
        fullAddressElement.value = fullAddress;
        console.log(`[SEARCH] Populated full_address: ${fullAddress}`);
      }
    }

    // Auto-fill blank end date fields
    autoFillEndDates();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Search through a single scenario for the given criteria
  function searchInScenario(scenarioData, searchType, searchValue) {
    const mapping = SEARCH_MAPPINGS[searchType];
    if (!mapping) {
      console.warn(`[SEARCH] Unknown search type: ${searchType}`);
      return { found: false, matchedPath: null };
    }

    // Check each path in the mapping
    for (const path of mapping.paths) {
      const jsonValue = getNestedValue(scenarioData, path);
      if (compareValues(searchValue, jsonValue, mapping.caseSensitive)) {
        console.log(`[SEARCH] Match found in path: ${path}, value: ${jsonValue}`);
        return { found: true, matchedPath: path };
      }
    }

    return { found: false, matchedPath: null };
  }

  // Load and search through all available scenarios
  async function performSearch(searchType, searchValue) {
    console.log(`[SEARCH] Searching for ${searchType}: "${searchValue}"`);

    try {
      // Get list of available scenarios
      const scenarioListResponse = await fetch(`../scenarios/scenario-list.json?_=${Date.now()}`, { 
        cache: 'no-store' 
      });
      
      if (!scenarioListResponse.ok) {
        throw new Error('Failed to load scenario list');
      }
      
      const scenarioList = await scenarioListResponse.json();
      console.log(`[SEARCH] Checking ${scenarioList.length} scenarios...`);

      // Search through each scenario
      for (const scenario of scenarioList) {
        try {
          const scenarioResponse = await fetch(`../scenarios/${scenario.file}`);
          
          if (!scenarioResponse.ok) {
            console.warn(`[SEARCH] Failed to load ${scenario.file}`);
            continue;
          }
          
          const scenarioData = await scenarioResponse.json();
          
          // Check if this scenario contains our search value
          const searchResult = searchInScenario(scenarioData, searchType, searchValue);
          if (searchResult.found) {
            console.log(`[SEARCH] Found match in scenario: ${scenario.label} (${scenario.file})`);
            
            // Load this scenario into localStorage
            localStorage.setItem('smartui_rawScenario', JSON.stringify(scenarioData));
            localStorage.setItem('smartui_data', JSON.stringify(scenarioData));
            
            // Populate customerInfo fields immediately
            populateCustomerInfoFields(scenarioData);
            
            // Determine supply type from search results
            const supplyType = determineSupplyType(scenarioData, searchType, searchValue, searchResult.matchedPath);
            
            // Create buttons if we have a specific supply type
            if (supplyType) {
              createButtonSet(supplyType, false); // Create dormant buttons
              
              // Expand tree and auto-select the matching supply type
              if (window.TREE_API && window.TREE_API.expandAndSelect) {
                window.TREE_API.expandAndSelect(supplyType);
              }
            } else {
              // BPID or non-supply-specific search - just expand tree
              if (window.TREE_API && window.TREE_API.expandAndSelect) {
                window.TREE_API.expandAndSelect(null);
              }
            }
            
            // Trigger events to update other components
            document.dispatchEvent(new Event('scenario:loaded'));
            
            return true;
          }
        } catch (err) {
          console.error(`[SEARCH] Error loading scenario ${scenario.file}:`, err);
        }
      }

      // No match found
      console.log('[SEARCH] No matching scenario found');
      return false;

    } catch (err) {
      console.error('[SEARCH] Search failed:', err);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // Handle search when Enter is pressed
  async function handleSearchEnter(event) {
    if (event.key !== 'Enter') return;

    const searchTypeElement = document.getElementById('searchType');
    const findByElement = document.getElementById('findBy');

    if (!searchTypeElement || !findByElement) {
      console.error('[SEARCH] Required elements not found');
      return;
    }

    const searchValue = searchTypeElement.value.trim();
    const searchType = findByElement.value;

    // Validate inputs
    if (!searchValue) {
      showPopup('Please enter a search value');
      return;
    }

    if (!searchType) {
      showPopup('Please select what you want to search for');
      return;
    }

    console.log(`[SEARCH] Starting search: ${searchType} = "${searchValue}"`);

    // Perform the search
    const found = await performSearch(searchType, searchValue);

    if (!found) {
      showPopup('No account found');
    } else {
      // Keep the search value and add underlining after successful search
      searchTypeElement.style.textDecoration = 'underline';
      console.log('[SEARCH] Search completed successfully');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  // Initialize search functionality after fragments are ready
  function initializeSearch() {
    console.log('[SEARCH] Initializing search functionality...');

    const searchTypeElement = document.getElementById('searchType');
    
    if (!searchTypeElement) {
      console.error('[SEARCH] searchType element not found');
      return;
    }

    // Add Enter key listener to search field
    searchTypeElement.addEventListener('keydown', handleSearchEnter);
    
    console.log('[SEARCH] Search functionality initialized');
  }

  // Wait for fragments to be ready
  document.addEventListener('smartui:fragmentsReady', initializeSearch, { once: true });

  // Expose functions for debugging and pencil handler integration
  window.SEARCH_DEBUG = {
    performSearch: performSearch,
    searchInScenario: searchInScenario,
    populateCustomerInfoFields: populateCustomerInfoFields,
    createButtonSet: createButtonSet,
    clearExistingButtons: clearExistingButtons,
    mappings: SEARCH_MAPPINGS,
    buttonConfigs: BUTTON_CONFIGS
  };

})();