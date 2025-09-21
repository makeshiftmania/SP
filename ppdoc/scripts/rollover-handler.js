// ✅ rollover-handler.js (Updated: supports gas buttons with global buttonMode and fixed image paths)

let activeButton = null;
let activatedButtons = new Set();

// Make buttonMode global so pencil handler can change it
window.buttonMode = window.buttonMode || 'dormant'; // 'dormant', 'activated', 'standard'

// Fragment mapping for button clicks (both electricity and gas)
const BUTTON_FRAGMENTS = {
  // Electricity buttons
  'appointment': {
    lowerImage: '../images/lower-appointment.png',
    lowerFragment: '../fragments/lower-appointment.html'
  },
  'deappointment': {
    lowerImage: '../images/lower-deappointment.png', 
    lowerFragment: '../fragments/lower-deappointment.html'
  },
  'adjustcreditdebt': {
    lowerImage: '../images/lower-adjustcreditdebt.png',
    lowerFragment: '../fragments/lower-adjustcreditdebt.html'
  },
  'replacementkey': {
    lowerImage: '../images/lower-replacementkey.png',
    lowerFragment: '../fragments/lower-replacementkey.html'
  },
  'wipedown': {
    lowerImage: '../images/lower-wipedown.png',
    lowerFragment: '../fragments/lower-wipedown.html'
  },
  'tariffchange': {
    lowerImage: '../images/lower-tariffchange.png',
    lowerFragment: '../fragments/lower-tariffchange.html'
  },
  'changeppdocstatus': {
    lowerImage: '../images/lower-changeppdocstatus.png',
    lowerFragment: '../fragments/lower-changeppdocstatus.html'
  },
  
  // Gas buttons (same images, different fragments)
  'appointmentgas': {
    lowerImage: '../images/lower-appointmentgas.png',
    lowerFragment: '../fragments/lower-appointmentgas.html'
  },
  'deappointmentgas': {
    lowerImage: '../images/lower-deappointmentgas.png', 
    lowerFragment: '../fragments/lower-deappointmentgas.html'
  },
  'adjustcreditdebtgas': {
    lowerImage: '../images/lower-adjustcreditdebtgas.png',
    lowerFragment: '../fragments/lower-adjustcreditdebtgas.html'
  },
  'replacementcard': {
    lowerImage: '../images/lower-replacementcard.png',
    lowerFragment: '../fragments/lower-replacementcard.html'
  },
  'meterdump': {
    lowerImage: '../images/lower-meterdump.png',
    lowerFragment: '../fragments/lower-meterdump.html'
  },
  'adhocquery': {
    lowerImage: '../images/lower-adhocquery.png',
    lowerFragment: '../fragments/lower-adhocquery.html'
  },
  'tariffchangegas': {
    lowerImage: '../images/lower-tariffchangegas.png',
    lowerFragment: '../fragments/lower-tariffchangegas.html'
  },
  'changeppdocstatusgas': {
    lowerImage: '../images/lower-changeppdocstatusgas.png',
    lowerFragment: '../fragments/lower-changeppdocstatusgas.html'
  }
};

// Function to get correct image prefix for rollover effects
function getImagePrefix(buttonPrefix) {
  // For gas buttons that end with 'gas', remove the 'gas' suffix for images
  if (buttonPrefix.endsWith('gas')) {
    return buttonPrefix.replace(/gas$/, '');
  }
  // For gas-specific buttons (replacementcard, meterdump, adhocquery), use as-is
  return buttonPrefix;
}

function handleButtonClick(imgEl) {
  const prefix = imgEl.dataset.imgprefix;
  const mode = imgEl.dataset.mode;

  console.log(`[ROLLOVER] Button clicked: ${prefix}, mode: ${mode}, buttonMode: ${window.buttonMode}`);

  // Handle exit button specially - reset everything
  if (prefix === 'exit') {
    resetSystem();
    return;
  }

// Handle refresh button specially - reset everything (same as exit)
if (prefix === 'refresh') {
  resetSystem();
  return;
  
}
  // Handle processlinks specially - loads new shell
  if (prefix === 'processlinks') {
    window.location.href = '../html/processlinks.html';
    return;
  }

  // Handle different button modes
  if (mode === 'dormant' && window.buttonMode === 'dormant') {
    // Dormant buttons are not clickable
    return;
  }

  if (mode === 'standard' && (window.buttonMode === 'activated' || window.buttonMode === 'standard')) {
    // Button clicked - toggle it off and load its fragment
    switchToStandardMode(prefix);
    loadFragment(prefix);
  }
}

// Switch from activated mode to standard mode after button click
// The clicked button becomes INACTIVE, others stay ACTIVE
function switchToStandardMode(clickedPrefix) {
  console.log(`[ROLLOVER] Toggling button: ${clickedPrefix} to inactive`);
  
  window.buttonMode = 'standard';
  
  // Get all current button prefixes dynamically (handles both electricity and gas)
  const currentButtons = [];
  const activitySection = document.getElementById('activity-section');
  if (activitySection) {
    const buttons = activitySection.querySelectorAll('img[data-imgprefix]');
    buttons.forEach(btn => {
      const prefix = btn.dataset.imgprefix;
      if (prefix !== 'processlinks') { // Exclude process links
        currentButtons.push(prefix);
      }
    });
  }
  
  currentButtons.forEach(prefix => {
    const imgEl = document.getElementById(`btn-${prefix}`);
    if (imgEl) {
      const imagePrefix = getImagePrefix(prefix);
      
      if (prefix === clickedPrefix) {
        // This button becomes INACTIVE (toggled off)
        imgEl.src = `../images/buttons/${imagePrefix}-inactive.png`;
        imgEl.dataset.mode = 'dormant';
        console.log(`[ROLLOVER] Set ${prefix} to INACTIVE (toggled off)`);
      } else {
        // Other buttons stay ACTIVE and clickable
        imgEl.src = `../images/buttons/${imagePrefix}-active.png`;
        imgEl.dataset.mode = 'standard';
        console.log(`[ROLLOVER] Kept ${prefix} ACTIVE`);
      }
    }
  });
  
  // Clear activeButton since we don't have a single "active" button
  activeButton = null;
}

// Load fragment for the selected button
function loadFragment(prefix) {
  console.log(`[ROLLOVER] Loading fragment for: ${prefix}`);
  
  const fragmentConfig = BUTTON_FRAGMENTS[prefix];
  if (!fragmentConfig) {
    console.error(`[ROLLOVER] No fragment config found for: ${prefix}`);
    return;
  }

  // Store the toggled button info AND field values before reloading fragments
  const toggledButtonPrefix = prefix;
  const savedFieldValues = saveAllFieldValues();
  
  // ONLY reload the lower section - preserve core and background
  const lower = document.getElementById('lowerbox');
  const lowerFields = document.getElementById('lowerbox-fields');
  
  if (!lower || !lowerFields) {
    console.error('[ROLLOVER] Lower elements not found');
    return;
  }

  // Fade out lower image (same as loadPPDOCLayout)
  lower.style.opacity = 0;
  
  setTimeout(() => {
    // Change the lower background image
    lower.src = fragmentConfig.lowerImage;
    lower.onload = () => lower.style.opacity = 1;
  }, 150);
  
  // Load the new lower fragment
  fetch(fragmentConfig.lowerFragment)
    .then(res => res.text())
    .then(html => {
      lowerFields.innerHTML = html;
      
      // Wait for fragment to load, then restore button states AND field values
      setTimeout(() => {
        console.log(`[ROLLOVER] Restoring button states and field values after fragment reload`);
        restoreButtonStatesAfterReload(toggledButtonPrefix);
        restoreAllFieldValues(savedFieldValues);
        
        // *** NEW LINE *** - Dispatch event to notify other scripts that lower fragment is ready
        document.dispatchEvent(new Event('lowerFragment:ready'));
      }, 100); // Shorter delay since we're only loading one fragment
    })
    .catch(error => {
      console.error('[ROLLOVER] Error loading lower fragment:', error);
    });
}

// Save all input and select field values
function saveAllFieldValues() {
  const fieldValues = {};
  
  // Save all input fields
  document.querySelectorAll('input').forEach(input => {
    if (input.id) {
      fieldValues[input.id] = input.value;
    }
  });
  
  // Save all select fields
  document.querySelectorAll('select').forEach(select => {
    if (select.id) {
      fieldValues[select.id] = select.value;
    }
  });
  
  console.log(`[ROLLOVER] Saved ${Object.keys(fieldValues).length} field values`);
  return fieldValues;
}

// Restore all field values after fragment reload
function restoreAllFieldValues(savedValues) {
  let restoredCount = 0;
  
  Object.keys(savedValues).forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element && savedValues[fieldId] !== null && savedValues[fieldId] !== undefined) {
      element.value = savedValues[fieldId];
      restoredCount++;
    }
  });
  
  console.log(`[ROLLOVER] Restored ${restoredCount} field values`);
}

// Restore button states after fragment reload
// The toggled button stays INACTIVE, others stay ACTIVE
function restoreButtonStatesAfterReload(toggledButtonPrefix) {
  console.log(`[ROLLOVER] Restoring states: ${toggledButtonPrefix} INACTIVE, others ACTIVE`);
  
  window.buttonMode = 'standard';
  
  // Get all current button prefixes dynamically
  const currentButtons = [];
  const activitySection = document.getElementById('activity-section');
  if (activitySection) {
    const buttons = activitySection.querySelectorAll('img[data-imgprefix]');
    buttons.forEach(btn => {
      const prefix = btn.dataset.imgprefix;
      if (prefix !== 'processlinks') { // Exclude process links
        currentButtons.push(prefix);
      }
    });
  }
  
  currentButtons.forEach(prefix => {
    const imgEl = document.getElementById(`btn-${prefix}`);
    if (imgEl) {
      const imagePrefix = getImagePrefix(prefix);
      
      if (prefix === toggledButtonPrefix) {
        // This button stays INACTIVE (toggled off)
        imgEl.src = `../images/buttons/${imagePrefix}-inactive.png`;
        imgEl.dataset.mode = 'dormant';
        console.log(`[ROLLOVER] Restored ${prefix} as INACTIVE`);
      } else {
        // Other buttons stay ACTIVE and clickable
        imgEl.src = `../images/buttons/${imagePrefix}-active.png`;
        imgEl.dataset.mode = 'standard';
        console.log(`[ROLLOVER] Restored ${prefix} as ACTIVE`);
      }
    }
  });
  
  // No single activeButton since multiple buttons are active
  activeButton = null;
}

// Activate all buttons to activated mode (called by pencil handler)
function activateAllButtons() {
  console.log('[ROLLOVER] Activating all buttons to activated mode');
  
  window.buttonMode = 'activated';
  
  // Get all current button prefixes dynamically
  const currentButtons = [];
  const activitySection = document.getElementById('activity-section');
  if (activitySection) {
    const buttons = activitySection.querySelectorAll('img[data-imgprefix]');
    buttons.forEach(btn => {
      const prefix = btn.dataset.imgprefix;
      if (prefix !== 'processlinks') { // Exclude process links
        currentButtons.push(prefix);
      }
    });
  }
  
  currentButtons.forEach(prefix => {
    const imgEl = document.getElementById(`btn-${prefix}`);
    if (imgEl) {
      const imagePrefix = getImagePrefix(prefix);
      imgEl.dataset.mode = 'standard'; // Make them clickable
      imgEl.src = `../images/buttons/${imagePrefix}-active.png`;
      activatedButtons.add(prefix);
      console.log(`[ROLLOVER] Activated button: ${prefix}`);
    }
  });
}

function handleRollover(imgEl) {
  const prefix = imgEl.dataset.imgprefix;
  const mode = imgEl.dataset.mode;
  const imagePrefix = getImagePrefix(prefix);
  
  // Allow rollover for:
  // - Always active buttons (like pencil, processlinks, exit)
  // - Standard mode buttons (active buttons that can be clicked)
  if (mode === 'always') {
    imgEl.src = `../images/buttons/${imagePrefix}-rollover.png`;
  } else if (mode === 'standard') {
    // Active buttons get rollover regardless of buttonMode
    imgEl.src = `../images/buttons/${imagePrefix}-rollover.png`;
  }
  // Dormant buttons get no rollover effect
}

function handleRollout(imgEl) {
  const prefix = imgEl.dataset.imgprefix;
  const mode = imgEl.dataset.mode;
  const imagePrefix = getImagePrefix(prefix);
  
  console.log(`[ROLLOVER] Rollout: ${prefix}, mode: ${mode}, buttonMode: ${window.buttonMode}`);
  
  // Handle different rollout behaviors based on button mode
  if (mode === 'always') {
    // Always-active buttons return to active
    imgEl.src = `../images/buttons/${imagePrefix}-active.png`;
    console.log(`[ROLLOVER] ${prefix} set to active (always mode)`);
  } else if (mode === 'dormant') {
    // Dormant buttons stay inactive
    imgEl.src = `../images/buttons/${imagePrefix}-inactive.png`;
    console.log(`[ROLLOVER] ${prefix} set to inactive (dormant mode)`);
  } else if (mode === 'standard') {
    // Standard mode buttons return to active
    imgEl.src = `../images/buttons/${imagePrefix}-active.png`;
    console.log(`[ROLLOVER] ${prefix} set to active (standard mode)`);
  }
}

// Reset the entire system to initial state
function resetSystem() {
  console.log('[ROLLOVER] Forcing complete page reload to reset system...');
  
  // Clear localStorage before reload
  localStorage.clear();
  
  // Force a complete page reload (equivalent to hard refresh)
  window.location.reload(true);
}