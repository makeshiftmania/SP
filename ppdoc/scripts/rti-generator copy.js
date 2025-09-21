// rti-generator.js - RTI Generation Popup Component with improved copy functionality
console.log('[RTI-GENERATOR] Script loaded');

(function() {
    'use strict';
    
    console.log('[RTI-GENERATOR] Initializing RTI generator component');
    
    // =========================================================================
    // POSITIONING CONFIGURATION - ADJUST THESE VALUES TO POSITION ELEMENTS
    // =========================================================================
    const RTI_POPUP_POSITIONING = {
        popup: {
            width: 685,
            height: 335
        },
        
        // Input field positions
        rtiTagNumber: {
            left: 201,      // RTI Tag Number field left position
            top: 132,       // RTI Tag Number field top position
            width: 75,      // RTI Tag Number field width
            height: 22      // RTI Tag Number field height
        },
        
        manualRtiTag: {
            left: 547,      // Manual RTI Tag field left position
            top: 132,       // Manual RTI Tag field top position
            width: 75,      // Manual RTI Tag field width
            height: 22      // Manual RTI Tag field height
        },
        
        // Button positions
        retryButton: {
            left: 250,      // Retry RTI Generation button left
            top: 185,       // Retry RTI Generation button top
            width: 170,     // Retry RTI Generation button width
            height: 25      // Retry RTI Generation button height
        },
        
        saveButton: {
            left: 556,      // Save/disk icon left position
            top: 297,       // Save/disk icon top position
            width: 33,      // Save/disk icon width
            height: 24      // Save/disk icon height
        },
        
        cancelButton: {
            left: 593,      // Cancel/X icon left position
            top: 297,       // Cancel/X icon top position
            width: 76,      // Cancel/X icon width
            height: 24      // Cancel/X icon height
        },
        
        closeButton: {
            left: 593,      // Close X top-right left position (same as cancel for now)
            top: 297,       // Close X top-right top position (same as cancel for now)
            width: 76,      // Close X top-right width (same as cancel for now)
            height: 24      // Close X top-right height (same as cancel for now)
        }
    };

    // =========================================================================
    // SUCCESS POPUP POSITIONING - ADJUST THESE VALUES TO POSITION BUTTONS
    // =========================================================================
    const SUCCESS_POPUP_POSITIONING = {
        popup: {
            width: 531,
            height: 227
        },
        
        // X button (top-right corner)
        closeButton: {
            top: 15,        // ← ADJUST THIS: distance from top
            right: 15,      // ← ADJUST THIS: distance from right edge
            width: 20,      // ← ADJUST THIS: button width
            height: 20      // ← ADJUST THIS: button height
        },
        
        // Checkmark button (green check)
        checkmarkButton: {
            left: 445,      // ← ADJUST THIS: distance from left
            top: 190,       // ← ADJUST THIS: distance from top
            width: 35,      // ← ADJUST THIS: button width
            height: 25      // ← ADJUST THIS: button height
        },
        
        // Question mark button (help)
        questionButton: {
            left: 490,      // ← ADJUST THIS: distance from left
            top: 190,       // ← ADJUST THIS: distance from top
            width: 25,      // ← ADJUST THIS: button width
            height: 25      // ← ADJUST THIS: button height
        },
        
        // PPDOC Number display field
        ppdocNumberField: {
            left: 189,      // ← ADJUST THIS: distance from left
            top: 44,        // ← ADJUST THIS: distance from top
            width: 83,      // ← ADJUST THIS: field width
            height: 20,     // ← ADJUST THIS: field height
            fontSize: '12px',        // ← ADJUST THIS: font size
            fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, sans-serif',  // ← ADJUST THIS: font family
            fontWeight: 'normal',    // ← ADJUST THIS: normal, bold, etc.
            color: 'black',          // ← ADJUST THIS: text color
            backgroundColor: 'transparent', // ← ADJUST THIS: background color
            border: '0px',           // ← ADJUST THIS: border style
            textAlign: 'left',       // ← ADJUST THIS: left, center, right
            padding: '2px 4px'       // ← ADJUST THIS: internal padding
        }
    };

    // =========================================================================
    // HELP POPUP POSITIONING - ADJUST THESE VALUES
    // =========================================================================
    const HELP_POPUP_POSITIONING = {
        popup: {
            width: 803,
            height: 760
        },
        
        // Close button for help popup (estimate - you may need to adjust)
        closeButton: {
            top: 15,        // ← ADJUST THIS: distance from top
            right: 15,      // ← ADJUST THIS: distance from right edge
            width: 25,      // ← ADJUST THIS: button width
            height: 25      // ← ADJUST THIS: button height
        }
    };

    // Set to true to see red dashed borders around all clickable areas for positioning
    const POSITIONING_MODE = false;  // ← SET TO FALSE WHEN POSITIONING IS COMPLETE
    
    // =========================================================================
    // POSITIONING TOOLS - EASY ADJUSTMENT CONTROLS
    // =========================================================================
    
    // STEP 1: Change these numbers to move the text block around
    const POSITION_ADJUSTMENTS = {
        // Move the entire text block left/right and up/down
        moveLeft: -124,     // ← CHANGE THIS: 65 - 189 = -124 (moves left)
        moveUp: 4,          // ← CHANGE THIS: 51 - 44 = +7 (moves down)
        
        // Adjust spacing between the two lines of text
        lineSpacing: 14,     // ← CHANGE THIS: 0 = no extra spacing between lines
        
        // Text styling adjustments
        makeBigger: 0,      
        makeBolder: false   
    };

    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    let currentRTIPopup = null;
    let currentSuccessPopup = null;
    let currentHelpPopup = null;
    let currentRTINumber = null;
    let formData = {};

    // =========================================================================
    // RTI GENERATION FUNCTIONS
    // =========================================================================
    
    function generateRTINumber() {
        // Generate random 7-digit number (1000000 to 9999999)
        return Math.floor(Math.random() * 9000000) + 1000000;
    }

    function collectFormData() {
        console.log('[RTI-GENERATOR] Collecting form data...');
        
        const formFields = [
            'replacementKeyReason', 'errorCode', 'emergencyIndicator', 'effFromDate',
            'emergencyCredit', 'meter_Serial', 'creditAdjustReason', 'tariffSetting',
            'initKeyCredit', 'full_Address_Trunc', 'wipeDown', 'creditSubReason'
        ];
        
        const data = {
            timestamp: new Date().toISOString(),
            rtiNumber: currentRTINumber
        };
        
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    data[fieldId] = field.checked;
                } else if (field.classList && field.classList.contains('custom-dropdown')) {
                    const selectedOption = field.querySelector('.selected-option');
                    data[fieldId] = selectedOption ? selectedOption.textContent.trim() : '';
                } else {
                    data[fieldId] = field.value || '';
                }
            }
        });
        
        console.log('[RTI-GENERATOR] Collected form data:', data);
        return data;
    }

    function saveRTIData(rtiNumber, data) {
        console.log('[RTI-GENERATOR] Saving RTI data to localStorage...');
        
        try {
            // Get existing RTI data or create empty object
            const existingData = localStorage.getItem('ppdoc_rtiData');
            const rtiDatabase = existingData ? JSON.parse(existingData) : {};
            
            // Store this RTI's data
            rtiDatabase[rtiNumber] = data;
            
            // Save back to localStorage
            localStorage.setItem('ppdoc_rtiData', JSON.stringify(rtiDatabase));
            
            console.log(`[RTI-GENERATOR] RTI ${rtiNumber} saved successfully`);
            return true;
        } catch (e) {
            console.error('[RTI-GENERATOR] Error saving RTI data:', e);
            return false;
        }
    }

    // =========================================================================
    // POPUP CREATION FUNCTIONS
    // =========================================================================
    
    function openRTIGenerator() {
        console.log('[RTI-GENERATOR] Opening RTI generator popup');
        
        if (currentRTIPopup) {
            closeRTIGenerator();
        }
        
        // Generate new RTI number
        currentRTINumber = generateRTINumber();
        console.log('[RTI-GENERATOR] Generated RTI number:', currentRTINumber);
        
        // Collect current form data
        formData = collectFormData();
        
        createRTIPopup();
    }

    function createRTIPopup() {
        console.log('[RTI-GENERATOR] Creating RTI popup with background image');
        
        // Create backdrop/overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'rti-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 10004;
        `;

        const popup = document.createElement('div');
        popup.className = 'rti-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${RTI_POPUP_POSITIONING.popup.width}px;
            height: ${RTI_POPUP_POSITIONING.popup.height}px;
            background: url('../images/generaterti.png') no-repeat;
            background-size: ${RTI_POPUP_POSITIONING.popup.width}px ${RTI_POPUP_POSITIONING.popup.height}px;
            z-index: 10005;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
        `;

        // Add keyboard support
        popup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveRTI();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeRTIGenerator();
            }
        });

        // Make popup focusable
        popup.tabIndex = -1;

        // Create input overlays
        const inputOverlays = createInputOverlays();
        popup.appendChild(inputOverlays);

        // Create button overlays
        const buttonOverlays = createButtonOverlays();
        popup.appendChild(buttonOverlays);

        document.body.appendChild(backdrop);
        document.body.appendChild(popup);
        currentRTIPopup = { popup, backdrop };

        // Focus the popup
        setTimeout(() => {
            popup.focus();
        }, 100);

        // Close on outside click - but exclude the input fields
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 0);

        console.log('[RTI-GENERATOR] RTI popup created with Enter key support');
    }

    function createInputOverlays() {
        const container = document.createElement('div');
        container.className = 'rti-input-overlays';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        // RTI Tag Number field (auto-populated, read-only but fully copyable)
        const rtiTagField = createInputField('rtiTagNumber', RTI_POPUP_POSITIONING.rtiTagNumber, true);
        rtiTagField.value = currentRTINumber.toString();
        
        // FIXED: Allow pointer events only on the field itself
        rtiTagField.style.pointerEvents = 'auto';
        
        // FIXED: Proper styling for copyable read-only field
        rtiTagField.style.backgroundColor = '#f0f0f0'; // Grey background for read-only
        rtiTagField.style.color = 'black'; // Black text for readability
        rtiTagField.style.cursor = 'text'; // Text cursor for copying
        rtiTagField.readOnly = true; // Keep as readonly but allow selection
        
        // FIXED: Enable text selection properly
        rtiTagField.style.userSelect = 'text'; // Changed back to 'text' for drag selection
        rtiTagField.style.webkitUserSelect = 'text'; // Safari support
        rtiTagField.style.mozUserSelect = 'text'; // Firefox support
        rtiTagField.style.msUserSelect = 'text'; // IE/Edge support
        
        // FIXED: Remove conflicting event handlers that prevent natural selection
        // Just add basic keyboard support without interfering with mouse selection
        rtiTagField.addEventListener('keydown', function(e) {
            // Allow standard copy/paste/select operations
            if ((e.ctrlKey || e.metaKey)) {
                if (e.key === 'c' || e.key === 'a' || e.key === 'x' || e.key === 'v') {
                    console.log('[RTI-GENERATOR] Keyboard shortcut:', e.key);
                    // Let browser handle these naturally
                    return;
                }
            }
        });
        
        // FIXED: Allow all mouse events to pass through naturally
        rtiTagField.addEventListener('mousedown', function(e) {
            e.stopPropagation(); // Only stop propagation to popup, allow field interaction
            console.log('[RTI-GENERATOR] Mouse down on RTI field');
        });
        
        rtiTagField.addEventListener('contextmenu', function(e) {
            e.stopPropagation(); // Only stop propagation to popup, allow context menu
            console.log('[RTI-GENERATOR] Context menu on RTI field');
        });
        
        container.appendChild(rtiTagField);

        // Manual RTI Tag field (set to 0, not editable)
        const manualRtiField = createInputField('manualRtiTag', RTI_POPUP_POSITIONING.manualRtiTag, true);
        manualRtiField.value = '0';
        manualRtiField.style.backgroundColor = '#f0f0f0'; // Grey background for read-only
        manualRtiField.style.color = '#666666';
        manualRtiField.readOnly = true;
        manualRtiField.style.pointerEvents = 'auto'; // Allow interaction
        container.appendChild(manualRtiField);

        return container;
    }

    function createPPDOCNumberField() {
        console.log('[RTI-GENERATOR] Creating PPDOC text block with embedded number');
        
        // Get PPDOC number from localStorage
        let ppdocNumber = '';
        try {
            const scenarioData = localStorage.getItem('smartui_data');
            if (scenarioData) {
                const data = JSON.parse(scenarioData);
                ppdocNumber = data.customerInfo?.prepaymentDocNo || '';
            }
        } catch (e) {
            console.warn('[RTI-GENERATOR] Could not retrieve PPDOC number from localStorage:', e);
        }
        
        const fieldConfig = SUCCESS_POPUP_POSITIONING.ppdocNumberField;
        
        // Apply position adjustments
        const adjustedLeft = fieldConfig.left + POSITION_ADJUSTMENTS.moveLeft;
        const adjustedTop = fieldConfig.top + POSITION_ADJUSTMENTS.moveUp;
        const adjustedFontSize = parseInt(fieldConfig.fontSize) + POSITION_ADJUSTMENTS.makeBigger;
        const fontWeight = POSITION_ADJUSTMENTS.makeBolder ? 'bold' : fieldConfig.fontWeight;
        
        // Create container for the entire text block
        const textContainer = document.createElement('div');
        textContainer.id = 'ppdoc-text-block';
        
        // Create the text with embedded PPDOC number
        const textLine1 = document.createElement('div');
        textLine1.innerHTML = `Prepayment document&nbsp;${ppdocNumber}&nbsp;changed`;
        textLine1.style.cssText = `
            font-size: ${adjustedFontSize}px;
            font-family: ${fieldConfig.fontFamily};
            font-weight: ${fontWeight};
            color: ${fieldConfig.color};
            line-height: 1.2;
            margin: 0;
            padding: 0;
        `;
        
        const textLine2 = document.createElement('div');
        textLine2.textContent = 'successfully';
        textLine2.style.cssText = `
            font-size: ${adjustedFontSize}px;
            font-family: ${fieldConfig.fontFamily};
            font-weight: ${fontWeight};
            color: ${fieldConfig.color};
            line-height: 1.2;
            margin: 0;
            padding: 0;
            margin-top: ${POSITION_ADJUSTMENTS.lineSpacing}px;
        `;
        
        // Position the container with adjustments
        textContainer.style.cssText = `
            position: absolute;
            left: ${adjustedLeft}px;
            top: ${adjustedTop}px;
            background-color: ${fieldConfig.backgroundColor};
            text-align: ${fieldConfig.textAlign};
            user-select: text;
            cursor: text;
        `;
        
        textContainer.appendChild(textLine1);
        textContainer.appendChild(textLine2);
        
        // Add positioning helper if in positioning mode
        addPositioningHelper(textContainer, 'PPDOC-TEXT');
        
        // Log current position for debugging
        console.log(`[RTI-GENERATOR] PPDOC text positioned at: left=${adjustedLeft}px, top=${adjustedTop}px, fontSize=${adjustedFontSize}px`);
        console.log('[RTI-GENERATOR] PPDOC text block created with embedded number:', ppdocNumber);
        return textContainer;
    }

    function createInputField(id, positioning, readOnly) {
        const input = document.createElement('input');
        input.type = 'text'; // Keep as text - it handles numbers fine and provides better copy/paste
        input.id = id;
        input.readOnly = readOnly;
        
        input.style.cssText = `
            position: absolute;
            left: ${positioning.left}px;
            top: ${positioning.top}px;
            width: ${positioning.width}px;
            height: ${positioning.height}px;
            border: 1px solid #bfbfbf;
            padding: 2px 4px;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 12px;
            color: black;
            box-sizing: border-box;
        `;

        // Add focus styling
        if (!readOnly) {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#007cbf';
                input.style.outline = 'none';
            });

            input.addEventListener('blur', () => {
                input.style.borderColor = '#bfbfbf';
            });
        }

        // Add positioning helper if in positioning mode
        addPositioningHelper(input, id.toUpperCase());

        return input;
    }

    function createButtonOverlays() {
        const container = document.createElement('div');
        container.className = 'rti-button-overlays';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        // Retry RTI Generation button (disabled for now)
        const retryBtn = createButton('retryButton', RTI_POPUP_POSITIONING.retryButton, () => {
            console.log('[RTI-GENERATOR] Retry button clicked - currently disabled');
            // Disabled functionality - may be adapted later
        });
        // Make button appear disabled
        retryBtn.style.opacity = '0.5';
        retryBtn.style.cursor = 'not-allowed';
        container.appendChild(retryBtn);

        // Save button (disk icon)
        const saveBtn = createButton('saveButton', RTI_POPUP_POSITIONING.saveButton, saveRTI);
        container.appendChild(saveBtn);

        // Cancel button (X icon)
        const cancelBtn = createButton('cancelButton', RTI_POPUP_POSITIONING.cancelButton, closeRTIGenerator);
        container.appendChild(cancelBtn);

        // Close button (top-right X)
        const closeBtn = createButton('closeButton', RTI_POPUP_POSITIONING.closeButton, closeRTIGenerator);
        container.appendChild(closeBtn);

        return container;
    }

    function createButton(id, positioning, clickHandler) {
        const button = document.createElement('div');
        button.id = id;
        button.style.cssText = `
            position: absolute;
            left: ${positioning.left}px;
            top: ${positioning.top}px;
            width: ${positioning.width}px;
            height: ${positioning.height}px;
            cursor: pointer;
            z-index: 10;
        `;

        button.addEventListener('click', clickHandler);

        // Add positioning helper if in positioning mode
        addPositioningHelper(button, id.toUpperCase());

        return button;
    }

    // =========================================================================
    // SUCCESS POPUP FUNCTIONS
    // =========================================================================
    
    function showSuccessPopup() {
        console.log('[RTI-GENERATOR] Showing success popup');
        
        // Remove any existing success popup
        if (currentSuccessPopup) {
            closeSuccessPopup();
        }
        
        // Create backdrop for success popup (higher z-index)
        const successBackdrop = document.createElement('div');
        successBackdrop.className = 'success-backdrop';
        successBackdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 10006;
        `;

        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup';
        successPopup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${SUCCESS_POPUP_POSITIONING.popup.width}px;
            height: ${SUCCESS_POPUP_POSITIONING.popup.height}px;
            background: url('../images/ppdocchangedsuccessfully.png') no-repeat;
            background-size: ${SUCCESS_POPUP_POSITIONING.popup.width}px ${SUCCESS_POPUP_POSITIONING.popup.height}px;
            z-index: 10007;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
        `;

        // Add keyboard support for success popup
        successPopup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                completeRTIProcess();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                completeRTIProcess();
            }
        });

        // Make popup focusable
        successPopup.tabIndex = -1;

        // Create success popup buttons
        const successButtons = createSuccessPopupButtons();
        successPopup.appendChild(successButtons);

        // Create PPDOC number field
        const ppdocField = createPPDOCNumberField();
        successPopup.appendChild(ppdocField);

        document.body.appendChild(successBackdrop);
        document.body.appendChild(successPopup);
        currentSuccessPopup = { popup: successPopup, backdrop: successBackdrop };

        // Focus the popup
        setTimeout(() => {
            successPopup.focus();
        }, 100);

        console.log('[RTI-GENERATOR] Success popup created');
    }

    function createSuccessPopupButtons() {
        const container = document.createElement('div');
        container.className = 'success-popup-buttons';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        // Close button (top-right X)
        const closeButton = document.createElement('div');
        const closeConfig = SUCCESS_POPUP_POSITIONING.closeButton;
        closeButton.style.cssText = `
            position: absolute;
            top: ${closeConfig.top}px;
            right: ${closeConfig.right}px;
            width: ${closeConfig.width}px;
            height: ${closeConfig.height}px;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', completeRTIProcess);
        addPositioningHelper(closeButton, 'SUCCESS-CLOSE');
        container.appendChild(closeButton);

        // Checkmark button (green check)
        const checkmarkButton = document.createElement('div');
        const checkConfig = SUCCESS_POPUP_POSITIONING.checkmarkButton;
        checkmarkButton.style.cssText = `
            position: absolute;
            left: ${checkConfig.left}px;
            top: ${checkConfig.top}px;
            width: ${checkConfig.width}px;
            height: ${checkConfig.height}px;
            cursor: pointer;
        `;
        checkmarkButton.addEventListener('click', completeRTIProcess);
        addPositioningHelper(checkmarkButton, 'SUCCESS-CHECK');
        container.appendChild(checkmarkButton);

        // Question mark button (help)
        const questionButton = document.createElement('div');
        const questionConfig = SUCCESS_POPUP_POSITIONING.questionButton;
        questionButton.style.cssText = `
            position: absolute;
            left: ${questionConfig.left}px;
            top: ${questionConfig.top}px;
            width: ${questionConfig.width}px;
            height: ${questionConfig.height}px;
            cursor: pointer;
        `;
        questionButton.addEventListener('click', showHelpPopup);
        addPositioningHelper(questionButton, 'SUCCESS-HELP');
        container.appendChild(questionButton);

        return container;
    }

    function closeSuccessPopup() {
        if (currentSuccessPopup) {
            document.body.removeChild(currentSuccessPopup.popup);
            document.body.removeChild(currentSuccessPopup.backdrop);
            currentSuccessPopup = null;
        }
    }

    // =========================================================================
    // HELP POPUP FUNCTIONS
    // =========================================================================
    
    function showHelpPopup() {
        console.log('[RTI-GENERATOR] Showing help popup');
        
        // Remove any existing help popup
        if (currentHelpPopup) {
            closeHelpPopup();
        }
        
        // Create backdrop for help popup (even higher z-index)
        const helpBackdrop = document.createElement('div');
        helpBackdrop.className = 'help-backdrop';
        helpBackdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.2);
            z-index: 10008;
        `;

        const helpPopup = document.createElement('div');
        helpPopup.className = 'help-popup';
        helpPopup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${HELP_POPUP_POSITIONING.popup.width}px;
            height: ${HELP_POPUP_POSITIONING.popup.height}px;
            background: url('../images/qmarkgeneraterti.png') no-repeat;
            background-size: ${HELP_POPUP_POSITIONING.popup.width}px ${HELP_POPUP_POSITIONING.popup.height}px;
            z-index: 10009;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
        `;

        // Add keyboard support for help popup
        helpPopup.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeHelpPopup();
            }
        });

        // Make popup focusable
        helpPopup.tabIndex = -1;

        // Create help popup buttons
        const helpButtons = createHelpPopupButtons();
        helpPopup.appendChild(helpButtons);

        document.body.appendChild(helpBackdrop);
        document.body.appendChild(helpPopup);
        currentHelpPopup = { popup: helpPopup, backdrop: helpBackdrop };

        // Close on outside click
        helpBackdrop.addEventListener('click', (e) => {
            if (e.target === helpBackdrop) {
                closeHelpPopup();
            }
        });

        // Focus the popup
        setTimeout(() => {
            helpPopup.focus();
        }, 100);

        console.log('[RTI-GENERATOR] Help popup created');
    }

    function createHelpPopupButtons() {
        const container = document.createElement('div');
        container.className = 'help-popup-buttons';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        // Close button (top-right X) - you may need to adjust positioning
        const closeButton = document.createElement('div');
        const closeConfig = HELP_POPUP_POSITIONING.closeButton;
        closeButton.style.cssText = `
            position: absolute;
            top: ${closeConfig.top}px;
            right: ${closeConfig.right}px;
            width: ${closeConfig.width}px;
            height: ${closeConfig.height}px;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', closeHelpPopup);
        addPositioningHelper(closeButton, 'HELP-CLOSE');
        container.appendChild(closeButton);

        return container;
    }

    function closeHelpPopup() {
        if (currentHelpPopup) {
            document.body.removeChild(currentHelpPopup.popup);
            document.body.removeChild(currentHelpPopup.backdrop);
            currentHelpPopup = null;
        }
    }

    // =========================================================================
    // PROCESS COMPLETION FUNCTIONS
    // =========================================================================
    
    function completeRTIProcess() {
        console.log('[RTI-GENERATOR] Completing RTI process and returning to replacement key page');
        
        // Close all popups
        closeHelpPopup();
        closeSuccessPopup();
        closeRTIGenerator();
        
        // Load the lower-replacementkey.html fragment
        loadReplacementKeyFragment();
    }

    function loadReplacementKeyFragment() {
        console.log('[RTI-GENERATOR] Loading lower-replacementkey.html fragment');
        
        const lowerFields = document.getElementById('lowerbox-fields');
        const lowerBox = document.getElementById('lowerbox');
        
        if (!lowerFields || !lowerBox) {
            console.error('[RTI-GENERATOR] Could not find lowerbox elements');
            return;
        }
        
        // Change the lower background image
        lowerBox.style.opacity = 0;
        
        setTimeout(() => {
            lowerBox.src = '../images/lower-replacementkey.png';
            lowerBox.onload = () => lowerBox.style.opacity = 1;
        }, 150);
        
        // Load the replacement key fragment
        fetch('../fragments/lower-replacementkey.html')
            .then(res => res.text())
            .then(html => {
                lowerFields.innerHTML = html;
                
                // Dispatch event that lower fragment is ready
                setTimeout(() => {
                    document.dispatchEvent(new Event('lowerFragment:ready'));
                    console.log('[RTI-GENERATOR] Successfully returned to replacement key page');
                }, 100);
            })
            .catch(error => {
                console.error('[RTI-GENERATOR] Error loading replacement key fragment:', error);
            });
    }

    // =========================================================================
    // POSITIONING HELPER FUNCTION
    // =========================================================================
    
    function addPositioningHelper(element, label) {
        if (!POSITIONING_MODE) return;
        
        element.style.border = '2px dashed red';
        element.style.boxSizing = 'border-box';
        
        // Add coordinate display after element is attached
        setTimeout(() => {
            if (!element.parentElement) return;
            
            const coords = document.createElement('div');
            coords.style.cssText = `
                position: absolute;
                top: -25px;
                left: 0;
                background: red;
                color: white;
                padding: 2px 5px;
                font-size: 10px;
                font-family: monospace;
                white-space: nowrap;
                z-index: 99999;
            `;
            
            coords.textContent = `${label}: ${element.style.left} x ${element.style.top} (${element.style.width} × ${element.style.height})`;
            element.appendChild(coords);
            
            console.log(`[RTI-POSITIONING] ${label}: left:${element.style.left}, top:${element.style.top}, width:${element.style.width}, height:${element.style.height}`);
        }, 50);
    }

    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================
    
    function saveRTI() {
        console.log('[RTI-GENERATOR] Save RTI clicked');
        
        // Update form data with current RTI number
        formData.rtiNumber = currentRTINumber;
        formData.timestamp = new Date().toISOString();
        
        // Get manual RTI tag if provided
        const manualRtiField = document.getElementById('manualRtiTag');
        if (manualRtiField && manualRtiField.value.trim()) {
            formData.manualRtiTag = manualRtiField.value.trim();
        }
        
        // Save to localStorage
        const saved = saveRTIData(currentRTINumber, formData);
        
        if (saved) {
            console.log(`[RTI-GENERATOR] RTI ${currentRTINumber} saved successfully`);
            // Show success popup instead of just closing
            showSuccessPopup();
        } else {
            console.error('[RTI-GENERATOR] Failed to save RTI data');
            // Could show an error message here if needed
        }
    }

    function closeRTIGenerator() {
        console.log('[RTI-GENERATOR] Closing RTI generator');
        
        if (currentRTIPopup) {
            document.removeEventListener('click', outsideClickHandler);
            document.body.removeChild(currentRTIPopup.popup);
            document.body.removeChild(currentRTIPopup.backdrop);
            currentRTIPopup = null;
            currentRTINumber = null;
            formData = {};
        }
    }

    function outsideClickHandler(e) {
        // FIXED: Don't close if clicking on input fields
        if (currentRTIPopup && !currentRTIPopup.popup.contains(e.target)) {
            // Extra check: don't close if clicking on RTI input fields specifically
            const rtiField = document.getElementById('rtiTagNumber');
            const manualField = document.getElementById('manualRtiTag');
            
            if (rtiField && rtiField.contains(e.target)) return;
            if (manualField && manualField.contains(e.target)) return;
            
            closeRTIGenerator();
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    
    // Public API
    window.RTIGenerator = {
        open: openRTIGenerator,
        close: closeRTIGenerator,
        generateNumber: generateRTINumber,
        
        // Utility functions for debugging/testing
        getAllRTIData: function() {
            try {
                const data = localStorage.getItem('ppdoc_rtiData');
                return data ? JSON.parse(data) : {};
            } catch (e) {
                console.error('[RTI-GENERATOR] Error retrieving RTI data:', e);
                return {};
            }
        },
        
        getRTIData: function(rtiNumber) {
            const allData = this.getAllRTIData();
            return allData[rtiNumber] || null;
        },
        
        clearAllRTIData: function() {
            localStorage.removeItem('ppdoc_rtiData');
            console.log('[RTI-GENERATOR] All RTI data cleared');
        }
    };

    console.log('[RTI-GENERATOR] RTI Generator initialized and API exposed');

})();