

/* =========================================================
 * Helper: Flatten selected fuel block onto root so that legacy
 * page loaders still find the flat keys they expect.
 * Supports either root-level gasOverrides/electricityOverrides
 * OR nested supplyInfo blocks (supplyInfo.gas / .electricity).
 * ========================================================= */
function flattenScenarioForFuel(scenario, fuel /* "Electricity"|"Gas" */) {
  const fuelLower   = fuel.toLowerCase();
  const overrideKey = fuelLower + "Overrides";   // gasOverrides / electricityOverrides

  // Prefer overrides, fall back to nested supplyInfo
  const src =
    scenario[overrideKey] ||
    (scenario.supplyInfo && scenario.supplyInfo[fuelLower]) ||
    null;

  if (!src) {
    console.warn("⚠️  No per‑fuel block found for", fuel);
    return { ...scenario, ...(scenario.customerInfo || {}), elecOrGas: fuel };
  }

  // Handle both “three‑object” and flat variants
  const { accountInfo = {}, deviceInfo = {}, data = {}, ...other } = src;
  const flatSrc =
    src.accountInfo || src.deviceInfo || src.data
      ? { ...accountInfo, ...deviceInfo, ...data, ...other }
      : src;

  return {
    ...scenario,
    ...(scenario.customerInfo || {}),   // bring shared data up
    ...flatSrc,
    elecOrGas: fuel
  };
}


// smartui-loader.js
console.log("✅ Active version: smartui-loader.js (Updated 28 April 2025, 17:38)");

const level = document.body.dataset.level || "standard";
// Corrected fragment path logic assuming server root is parent of 'smartui'
// If server root IS 'smartui', this should be '/fragments/...'
const fragmentPath = `../fragments/core-input-fields-${level}.html`;


// ==============================
// Setup ElecOrGas Dropdown Logic
// ==============================



function setupElecOrGasDropdown(scenario) {
  const el = document.getElementById('elecOrGas');
  if (!el) {
    console.warn("⚠️ elecOrGas element not found on page.");
    return;
  }

  // Determine available fuels
  const fuels = [];
  if (scenario.electricityOverrides || scenario?.supplyInfo?.electricity) fuels.push("Electricity");
  if (scenario.gasOverrides || scenario?.supplyInfo?.gas) fuels.push("Gas");
  if (fuels.length === 0 && scenario.elecOrGas) fuels.push(scenario.elecOrGas);
  const uniqFuels = [...new Set(fuels)];
  if (uniqFuels.length === 0) {
    console.warn("⚠️ No fuel options detected.");
    return;
  }

  // If native <select>
  if (el.tagName === 'SELECT') {
    el.innerHTML = '';
    uniqFuels.forEach(fuel => {
      const opt = document.createElement('option');
      opt.value = fuel;
      opt.textContent = fuel;
      el.appendChild(opt);
    });
    el.disabled = uniqFuels.length === 1;
    el.value = (scenario.elecOrGas && uniqFuels.includes(scenario.elecOrGas)) ? scenario.elecOrGas : uniqFuels[0];
    el.addEventListener('change', e => handleFuelSwitch(e.target.value));
    // Trigger initial switch
    el.dispatchEvent(new Event('change'));
  } else if (el.classList.contains('custom-dropdown')) {
    // custom dropdown structure
    const selectedBox = el.querySelector('.selected-option');
    const optionsBox  = el.querySelector('.dropdown-options');
    if (!selectedBox || !optionsBox) {
      console.error("Custom dropdown structure missing children");
      return;
    }
    optionsBox.innerHTML = '';
    uniqFuels.forEach(fuel => {
      const item = document.createElement('div');
      item.setAttribute('data-value', fuel);
      item.textContent = fuel;
      optionsBox.appendChild(item);
    });
    // Set initial label
    const initialFuel = (scenario.elecOrGas && uniqFuels.includes(scenario.elecOrGas))
                          ? scenario.elecOrGas
                          : uniqFuels[0];
    selectedBox.textContent = initialFuel;
// Listen for synthetic 'change' events dispatched by dropdown-fuel-handler.js
el.addEventListener('change', (e) => {
  const newFuel = e.value || selectedBox.textContent;
  handleFuelSwitch(newFuel);
});


    // Dispatch synthetic change so loader populates
    const initEvt = new Event('change');
    initEvt.value = initialFuel;
    el.dispatchEvent(initEvt);

    // If only one fuel, visually disable dropdown
    if (uniqFuels.length === 1) {
      el.classList.add('disabled');
    } else {
      el.classList.remove('disabled');
    }
  } else {
    console.warn("elecOrGas element is neither <select> nor custom-dropdown div.");
  }

  console.log("✅ setupElecOrGasDropdown completed.");
}


// ========================================
// Handle switching between Electricity/Gas
// ========================================

function handleFuelSwitch(selectedFuel) {
  try {
    const rawStr = localStorage.getItem("smartui_rawScenario");
    if (!rawStr) { console.warn("rawScenario missing"); return; }
    const raw = JSON.parse(rawStr);
    const flattened = flattenScenarioForFuel(raw, selectedFuel);
    localStorage.setItem("smartui_data", JSON.stringify(flattened));
    populatePageFields(flattened);
    document.dispatchEvent(new Event("smartui:dataUpdated"));
    console.log("🔄 Fuel switched to", selectedFuel);
  } catch (err) {
    console.error("❌ handleFuelSwitch error", err);
  }
}

// Load SmartUI input fields fragment (core fields on left side)
fetch(fragmentPath)
  .then(res => {
    if (!res.ok) throw new Error(`Failed to fetch fragment ${fragmentPath}. Status: ${res.status}`);
    return res.text();
  })
  .then(html => {
    const wrapper = document.getElementById("wrapper");
    if (!wrapper) throw new Error("No #wrapper element found in the page");
    wrapper.insertAdjacentHTML("afterbegin", html);

    // Remove PPS-only extra fields on pages other than readprepaymentsettings
    const pageName = window.location.pathname.split('/').pop().split('?')[0];
    if (pageName !== 'readprepaymentsettings.html') {
      wrapper.querySelector('#pps-only-fields')?.remove();
    }

    // Initialize Tippy tooltips after fragment is loaded
    function initTippyWhenReady() {
      if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]', {
          placement: 'right',
          theme: 'light-border',
          delay: [100, 0],
          allowHTML: true
        });
        console.log("Tippy initialized.");
      } else {
        // Wait and retry if tippy library hasn't loaded yet
        setTimeout(initTippyWhenReady, 50);
      }
    }
    initTippyWhenReady(); // Call the function to initialize Tippy
  })
  .then(() => {
    // Determine scenario path and data source after fragment is loaded and Tippy setup is initiated
    const urlParams = new URLSearchParams(window.location.search);
    let scenario = urlParams.get("scenario");
    let scenarioPath;
    let existingData = null;
    let shouldLoadFreshScenario = false;

    // Try to get existing data from localStorage
    try {
      const existingDataStr = localStorage.getItem("smartui_data");
      if (existingDataStr) {
        existingData = JSON.parse(existingDataStr);
        console.log("Found existing data in localStorage");
      }
    } catch (err) {
      console.warn("Error reading existing data from localStorage:", err);
      existingData = null;
    }

    // Determine if we need to load a fresh scenario
    if (scenario) {
      // URL parameter explicitly requests a scenario - always load it fresh
      scenarioPath = scenario.includes('/') ? scenario : `/smartui/scenarios/${scenario}`;
      const prevPath = localStorage.getItem("smartui_scenarioPath");
      
      // Note: We load fresh even if it's the same path to allow for explicit refreshing
      localStorage.setItem("smartui_scenarioPath", scenarioPath);
      shouldLoadFreshScenario = true;
      console.log(`Loading scenario requested in URL: ${scenarioPath}`);
    } else if (!existingData) {
      // No data in localStorage - need to load default scenario
      scenarioPath = localStorage.getItem("smartui_scenarioPath") || "/smartui/scenarios/default.json";
      shouldLoadFreshScenario = true;
      console.log(`No existing data, loading default scenario: ${scenarioPath}`);
    } else {
      // We have existing data and no explicit scenario request - use localStorage data
      scenarioPath = localStorage.getItem("smartui_scenarioPath") || "/smartui/scenarios/default.json";
      shouldLoadFreshScenario = false;
      console.log(`Using existing data from localStorage (scenario: ${scenarioPath})`);
    }

    if (shouldLoadFreshScenario) {
      // Load fresh data from JSON file
      loadScenarioFromFile(scenarioPath).then(data => {

// Preserve raw scenario for runtime fuel switching
localStorage.setItem("smartui_rawScenario", JSON.stringify(data));

// Decide default fuel
const defaultFuel =
  data.elecOrGas ||
  (data.electricityOverrides ? "Electricity"
     : data.gasOverrides ? "Gas"
     : (data.supplyInfo && data.supplyInfo.electricity) ? "Electricity"
     : "Gas");

data = flattenScenarioForFuel(data, defaultFuel);


        // Save the loaded data to localStorage
        localStorage.setItem("smartui_data", JSON.stringify(data));
        console.log("Fresh scenario data loaded and saved to localStorage");
        clearResetPinFields(); // Clear reset pin when scenario reloads

        
        // Populate fields with the fresh data
        populatePageFields(data);
        setupElecOrGasDropdown(data);
        
        // Add the UTRN reverse helper
        setupUTRNReverseHelper();
      }).catch(err => {
        console.error("Error loading scenario from file:", err);
        // If loading fails but we have existing data, fall back to it
        if (existingData) {
          console.log("Falling back to existing data after load error");
          populatePageFields(existingData);
          setupElecOrGasDropdown(existingData);setupUTRNReverseHelper();
        }
      });
    } else {
      // Use existing data from localStorage
      populatePageFields(existingData);
          setupElecOrGasDropdown(existingData);// Add the UTRN reverse helper
      setupUTRNReverseHelper();
    }
  })
  .catch(error => {
    console.error("Error loading page components:", error);
    // Display user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border:1px solid #ff0000;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
      <h3 style="color:#ff0000;margin:0 0 10px 0;">Error Loading SmartUI</h3>
      <p style="margin:0;">There was a problem loading the application. Please try refreshing the page.</p>
      <p style="margin:10px 0 0 0;font-size:0.9em;color:#666;">Error details: ${error.message}</p>
    `;
    document.body.appendChild(errorDiv);
  });

// Helper function to set up the UTRN reverse functionality
function setupUTRNReverseHelper() {
  window.smartUIHelpers = window.smartUIHelpers || {};
  window.smartUIHelpers.reverseUTRN = function(utrn) {
    try {
      const data = JSON.parse(localStorage.getItem("smartui_data"));
      if (!data || !Array.isArray(data.utrnRows)) {
        console.error("Cannot reverse UTRN: data or utrnRows not found");
        return false;
      }
      
      // Find by UTRN value instead of index
      const index = data.utrnRows.findIndex(row => row.utrn === utrn);
      if (index === -1) {
        console.error("Cannot reverse UTRN: UTRN not found in data");
        return false;
      }
      
      // Check if the UTRN can be reversed
      const row = data.utrnRows[index];
      if (row.status === "UTRN generated" || 
          row.status === "UTRN Generated" || 
          (!row.appliedTime && !row.appliedOffset)) {
        // Update the row
        data.utrnRows[index].status = "Reversed";
        data.utrnRows[index].appliedOffset = null;
        data.utrnRows[index].appliedTime = null;
        
        // Save back to localStorage
        localStorage.setItem("smartui_data", JSON.stringify(data));
        console.log(`UTRN ${utrn} reversed successfully.`);
        return true;
      } else {
        console.log(`Cannot reverse UTRN ${utrn}. Status: ${row.status}`);
        return false;
      }
    } catch (e) {
      console.error("Error in reverseUTRN helper:", e);
      return false;
    }
  };
}

// Clear reset pin fields and localStorage
function clearResetPinFields() {
  console.log("🧹 Clearing reset pin values");
  localStorage.removeItem("reset_Pin_PDOC");
  localStorage.removeItem("reset_Pin_Response");
  localStorage.removeItem("reset_Pin_Message");

  ["reset_Pin_PDOC", "reset_Pin_Response", "reset_Pin_Message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// Function to fetch JSON from file and process it (without saving to localStorage)
async function loadScenarioFromFile(path) {
  try {
    // Fetch the scenario JSON data
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load scenario JSON from ${path}. Status: ${response.status}`);

    const data = await response.json();
    console.log("Scenario data loaded:", data);

    // Process the data (calculate dates, etc.) but DON'T save to localStorage here
    return processScenarioData(data);
  } catch (error) {
    console.error("Error in loadScenarioFromFile function:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

// Function to process raw scenario data (separated from loading and field population)
function processScenarioData(data) {
// Helper to add .date fields to storedMeterReads arrays
const addDatesToStoredReads = (arr) => {
  if (!Array.isArray(arr)) return;
  const today = new Date();
  arr.forEach(entry => {
    if (typeof entry.offset === 'number') {
      const d = new Date(today);
      d.setDate(today.getDate() + entry.offset);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      entry.date = `${dd}.${mm}.${yyyy}`;
    }
  });
};

// Handle nested storedMeterReads inside each fuel block
['electricity','gas'].forEach(fuel => {
  addDatesToStoredReads(
    data?.supplyInfo?.[fuel]?.data?.storedMeterReads
  );
});

  // --- Helper function for offset date calculation and formatting ---
  function calculateAndFormatDate(offset) {
    if (typeof offset !== 'number') {
      console.warn("Invalid offset value received:", offset);
      return ""; // Return empty string or some default for invalid offsets
    }
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset); // Add offset (can be negative)
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const yyyy = targetDate.getFullYear();
      return `${dd}.${mm}.${yyyy}`; // Format as DD.MM.YYYY
    } catch (dateError) {
      console.error("Error calculating date from offset:", offset, dateError);
      return ""; // Return empty on error
    }
  }

  // --- Default values ---
  // Provide a default for contract_End if missing or empty
  if (!data.contract_End || String(data.contract_End).trim() === "") {
    data.contract_End = "31.12.9999";
  }

  // --- Process storedMeterReads array ---
  // Ensure data.storedMeterReads exists and is an array before processing
  if (Array.isArray(data.storedMeterReads)) {
    const todayForReads = new Date(); // Use a consistent 'today' for all reads in this batch
    // Use .map to create a new array with the added .date field
    data.storedMeterReads = data.storedMeterReads.map(entry => {
      // Check if entry has a valid offset
      if (typeof entry.offset === 'number') {
        const d = new Date(todayForReads);
        d.setDate(todayForReads.getDate() + entry.offset);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const yyyy = d.getFullYear();
        // Return a new object spreading existing entry and adding formatted date
        return { ...entry, date: `${dd}.${mm}.${yyyy}` };
      } else {
        // If offset is missing or invalid, return entry as is (or add an error/default date)
        console.warn("Missing or invalid offset in storedMeterReads entry:", entry);
        return { ...entry, date: "Invalid Date" }; // Add default invalid date
      }
    });
    console.log("Updated storedMeterReads:", data.storedMeterReads); // Log the processed array
  } else {
    // If storedMeterReads is missing or not an array, ensure it's an empty array in the data object
    data.storedMeterReads = [];
    console.log("No valid storedMeterReads array found in scenario data.");
  }

  // --- Process utrnRows array ---
  if (Array.isArray(data.utrnRows)) {
    const todayForUTRN = new Date();
    data.utrnRows = data.utrnRows.map((entry, index) => {
      // Preserve the original index for reference
      const entryWithIndex = { ...entry, originalIndex: index };
      
      if (typeof entry.createdOffset === 'number') {
        const d = new Date(todayForUTRN);
        d.setDate(todayForUTRN.getDate() + entry.createdOffset);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return { ...entryWithIndex, date: `${dd}.${mm}.${yyyy}` };
      } else {
        console.warn("Invalid or missing createdOffset:", entry);
        return { ...entryWithIndex, date: "Invalid Date" };
      }
    });
    console.log("Updated utrnRows with .date:", data.utrnRows);
  } else {
    // If utrnRows is missing, initialize it as an empty array
    data.utrnRows = [];
  }

  return data;
}

// Function to populate page fields with data (separated from loading)
function populatePageFields(data) {
  if (!data) {
    console.error("No data provided to populatePageFields");
    return;
  }

  // --- Helper function for offset date calculation and formatting ---
  function calculateAndFormatDate(offset) {
    if (typeof offset !== 'number') {
      console.warn("Invalid offset value received:", offset);
      return ""; // Return empty string or some default for invalid offsets
    }
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset); // Add offset (can be negative)
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const yyyy = targetDate.getFullYear();
      return `${dd}.${mm}.${yyyy}`; // Format as DD.MM.YYYY
    } catch (dateError) {
      console.error("Error calculating date from offset:", offset, dateError);
      return ""; // Return empty on error
    }
  }

  // List of field IDs to populate
  const fields = [
    "contract_Account", "contract", "contract_Start", "operating_Mode", "payment_Plan",
    "read_Retrieval", "last_Comm", "pod", "device_Guid", "meter_Serial",
    "device_Start", "device_End", "device_Status", "elecOrGas", "BPID",
    "firmware_Version", "SMSO_ID", "device_Location", "smets1_DCC", "contract_End"
  ];

  // Iterate through fields and populate corresponding elements
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) { // Check if element exists
      let valueToSet = undefined;

      // *** Special handling for offset-based date fields ***
      if (id === 'contract_Start' && data.contract_Start_Offset !== undefined) {
        valueToSet = calculateAndFormatDate(data.contract_Start_Offset);
        console.log(`Calculated contract_Start (${data.contract_Start_Offset}) as: ${valueToSet}`);
      } else if (id === 'last_Comm' && data.last_Comm_Offset !== undefined) {
        valueToSet = calculateAndFormatDate(data.last_Comm_Offset);
        console.log(`Calculated last_Comm (${data.last_Comm_Offset}) as: ${valueToSet}`);
      }
      // *** Handle fields where data key matches ID directly (including fixed dates) ***
      else if (data[id] !== undefined) {
        valueToSet = data[id];
      }

      // If a value was determined, set the element's value
      if (valueToSet !== undefined) {
        el.value = valueToSet;

        // Also update any duplicate fields marked with data-field attribute
        const duplicates = document.querySelectorAll(`[data-field="${id}"]`);
        duplicates.forEach(dup => {
          dup.value = valueToSet;
        });
      }
    }
  });

  // --- Populate Composite Fields ---
  // Populate full name
  const fullNameEl = document.getElementById("full_Name");
  if (fullNameEl && data.first_Name && data.last_Name) {
    fullNameEl.value = `${data.first_Name} ${data.last_Name}`;
  }

  // Populate full address
  const addressEl = document.getElementById("full_address");
  if (addressEl) {
    const parts = [];
    // Build address string carefully, handling potential missing parts
    if (data.flatnumber) parts.push(`FLAT ${String(data.flatnumber).toUpperCase()}`);
    if (data.housenumber || data.street) {
      const house = data.housenumber ? String(data.housenumber).toUpperCase() : '';
      const street = data.street ? String(data.street).toUpperCase() : '';
      parts.push(`${house} ${street}`.trim());
    }
    if (data.city) parts.push(String(data.city).toUpperCase());
    if (data.postcode) parts.push(String(data.postcode).toUpperCase());
    addressEl.value = parts.join(", ");
  }

  console.log("Page fields successfully populated with data.");
}

// --- Optional: UTRN row click highlighting (if needed globally) ---
// Consider moving this to a specific script if only needed on certain pages
document.addEventListener("DOMContentLoaded", () => {

  // Use event delegation for potentially dynamic rows
  const tableContainer = document.querySelector(".utrn-frame"); // Adjust selector if needed
  if (tableContainer) {
    tableContainer.addEventListener("click", (event) => {
      const row = event.target.closest(".utrn-row"); // Find the clicked row
      if (row) {

        document.addEventListener("DOMContentLoaded", () => {
          const resetBtn = document.getElementById("reset-scenario");
          if (resetBtn) {
            resetBtn.addEventListener("click", () => {
              console.log("🔁 reset-scenario button clicked — clearing reset pin fields");
              clearResetPinFields();
            });
          }
        });
        // Remove selected class from all sibling rows within the same container
        row.parentNode.querySelectorAll(".utrn-row").forEach(r => r.classList.remove("selected"));
        // Add selected class to the clicked row
        row.classList.add("selected");
      }
    });
  }
});

// Add transition handling
document.body.classList.add('loading');

window.addEventListener('load', () => {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
});

// Handle navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
    document.body.classList.add('loading');
  }
});
