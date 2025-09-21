// replacement-key-faulty-handler.js - Updated with Enter key support for Generate RTI button
window.faultyKeyHandler = (function() {
    'use strict';

    // =========================================================================
    // POSITIONING CONFIGURATION - ADJUST THESE VALUES TO POSITION BUTTONS
    // =========================================================================
    const POPUP_POSITIONING = {
        // First popup (confirmmsn.png) button positions
        confirmMsnPopup: {
            width: 531,
            height: 199,
            // Close button (bottom right)
            closeButton: {
                bottom: 17,    // ← ADJUST THIS: distance from bottom
                right: 66,     // ← ADJUST THIS: distance from right
                width: 34,     // ← ADJUST THIS: button width
                height: 22     // ← ADJUST THIS: button height
            },
            // New trigger button for second popup
            triggerButton: {
                top: 160,       // ← ADJUST THIS: distance from top
                left: 468,     // ← ADJUST THIS: distance from left
                width: 32,     // ← ADJUST THIS: button width
                height: 22     // ← ADJUST THIS: button height
            }
        },
        
        // Second popup (confirmmsnpa.png) button positions
        confirmMsnPaPopup: {
            width: 580,    // ← ADJUST THIS: popup width (if different)
            height: 549,   // ← ADJUST THIS: popup height (if different)
            // Close button (top right)
            closeButton: {
                top: 15,       // ← ADJUST THIS: distance from top
                right: 19,     // ← ADJUST THIS: distance from right
                width: 16,     // ← ADJUST THIS: button width
                height: 16     // ← ADJUST THIS: button height
            }
        }
    };

    // Set to true to see red dashed borders around all clickable areas
    const POSITIONING_MODE = false;  // ← SET TO FALSE WHEN POSITIONING IS COMPLETE

    // =========================================================================
    // FIELD EXCLUSIONS - Fields that should NOT have their colors changed
    // =========================================================================
    const PROTECTED_FIELDS = [
        'name_Address_Combo'  // This field should stay blue (#007cbf)
    ];

    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    let errorCodeSelected = false;
    let emergencyIndicatorSelected = false;
    let currentWorkflow = null;
    let dynamicDropdownCreated = false;
    let originalPositions = {};
    let formState = {
        errorCodeLocked: false,
        fieldsActivated: false
    };

    // Credit adjust reason options that trigger dynamic dropdown creation
    const DYNAMIC_DROPDOWN_TRIGGERS = [
        'creditAddedToOldKey',
        'creditLostOnKey',
        'goodwillExgratiaPPNorth',
        'goodwillExgratiaPPSouth',
        'creditAdvance',
        'refund',
        'creditForCovid19'
    ];

    // Elements that need to move down when dynamic dropdown is created (only moveable ones)
    const MOVEABLE_ELEMENTS = [
        'full_Address_Trunc',
        'wipeDown',
        'btn-generaterti',
        'btn-editaddress',
        'btn-viewoutlets',
        'address-label',      // HTML text label that moves
        'wipedown-label'      // HTML text label that moves
    ];

    function initialize() {
        console.log('[FAULTY-KEY] Initialize called');
        
        resetState();
        createTextLabels();
        storeOriginalPositions();
        setInitialFieldStates();
        attachEventListeners();
        setupEnterKeyBehavior();
        setupTabOrder(); // Set up custom tab order with Enter key support
        
        console.log('[FAULTY-KEY] Initialization complete');
    }

    // UPDATED FUNCTION: Set up custom tab order with Enter key support
    function setupTabOrder() {
        console.log('[FAULTY-KEY] Setting up custom tab order with Enter key support...');
        
        const initKeyCredit = document.getElementById('initKeyCredit');
        const generateRTIButton = document.getElementById('btn-generaterti');
        
        if (initKeyCredit && generateRTIButton) {
            // Tab key handling
            initKeyCredit.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' && !e.shiftKey) {
                    console.log('[FAULTY-KEY] Tab pressed in initKeyCredit, focusing Generate RTI button');
                    e.preventDefault();
                    
                    // Make the button focusable temporarily if it's not already
                    if (!generateRTIButton.hasAttribute('tabindex')) {
                        generateRTIButton.setAttribute('tabindex', '0');
                    }
                    
                    generateRTIButton.focus();
                }
            });
            
            // NEW: Add Enter key support to Generate RTI button
            generateRTIButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { // Space bar also works for buttons
                    console.log('[FAULTY-KEY] Enter/Space pressed on Generate RTI button, triggering click');
                    e.preventDefault();
                    
                    // Simulate the button click
                    generateRTIButton.click();
                }
            });
            
            // Make sure the button can receive focus
            if (!generateRTIButton.hasAttribute('tabindex')) {
                generateRTIButton.setAttribute('tabindex', '0');
            }
            
            console.log('[FAULTY-KEY] Tab order and Enter key support set up: initKeyCredit -> btn-generaterti');
        } else {
            console.warn('[FAULTY-KEY] Could not find initKeyCredit or btn-generaterti for tab order setup');
        }
    }

    function resetState() {
        errorCodeSelected = false;
        emergencyIndicatorSelected = false;
        currentWorkflow = null;
        dynamicDropdownCreated = false;
        formState = {
            errorCodeLocked: false,
            fieldsActivated: false
        };
        clearInfoMessage();
        removeDynamicDropdown();
    }

    // Create ALL HTML text labels to replace background image text
    function createTextLabels() {
        console.log('[FAULTY-KEY] Creating HTML text labels...');
        
        // Remove existing labels if they exist
        const existingLabels = [
            'error-code-label', 'emergency-indicator-label', 'eff-from-date-label',
            'emergency-credit-label', 'meter-serial-label', 'credit-adjust-reason-label',
            'tariff-setting-label', 'init-key-credit-label', 'address-label', 'wipedown-label'
        ];
        
        existingLabels.forEach(labelId => {
            const existing = document.getElementById(labelId);
            if (existing) existing.remove();
        });
        
        // Base styling for most labels (same as Address)
        const baseLabelStyle = {
            fontFamily: 'Tahoma, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 'normal',
            color: '#666666',
            letterSpacing: '-0.5px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: '6',
            position: 'absolute'
        };

        // Define all labels with their positions
        const labels = [
            { id: 'error-code-label', text: 'Error Code', top: 63, left: 18 },
            { id: 'emergency-indicator-label', text: 'Emergency Indicator', top: 90, left: 18 },
            { id: 'eff-from-date-label', text: 'Eff. From Date', top: 117, left: 18 },
            { id: 'emergency-credit-label', text: 'Emergency Credit', top: 144, left: 18 },
            { id: 'tariff-setting-label', text: 'Tariff Setting', top: 63, left: 346 },
            { id: 'meter-serial-label', text: 'Meter SerNo.', top: 90, left: 346 },
            { id: 'credit-adjust-reason-label', text: 'Credit Adjust Reason', top: 117, left: 346 },
            { id: 'init-key-credit-label', text: 'Init Key Credit', top: 144, left: 346 },
            { id: 'address-label', text: 'Address', top: 171, left: 18, moveable: true },  // This one moves
            { id: 'wipedown-label', text: 'Wipedown', top: 197, left: 396, moveable: true }  // This one moves
        ];

        // Create each label
        labels.forEach(labelConfig => {
            const label = document.createElement('div');
            label.id = labelConfig.id;
            label.textContent = labelConfig.text;
            
            // Apply base styling
            Object.assign(label.style, baseLabelStyle);
            label.style.top = labelConfig.top + 'px';
            label.style.left = labelConfig.left + 'px';
            
            // Special styling for wipedown (lighter color)
            if (labelConfig.id === 'wipedown-label') {
                label.style.color = '#999999';  // Lighter shade than the default #666666
            }
            
            // Add to page - use any available field's parent
            const addressField = document.getElementById('full_Address_Trunc');
            if (addressField && addressField.parentNode) {
                addressField.parentNode.appendChild(label);
                console.log(`[FAULTY-KEY] Created ${labelConfig.text} label`);
            } else {
                console.error(`[FAULTY-KEY] Could not find parent for ${labelConfig.text} label`);
            }
        });
    }

    function storeOriginalPositions() {
        console.log('[FAULTY-KEY] Storing original positions...');
        MOVEABLE_ELEMENTS.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                const style = window.getComputedStyle(element);
                originalPositions[elementId] = {
                    top: parseInt(style.top) || 0,
                    element: element
                };
                console.log(`[FAULTY-KEY] Stored ${elementId}: ${originalPositions[elementId].top}px`);
            }
        });
    }

    function setInitialFieldStates() {
        const tariffSetting = document.getElementById('tariffSetting');
        const fullAddress = document.getElementById('full_Address_Trunc');
        
        if (tariffSetting) {
            tariffSetting.classList.add('grey-field');
            tariffSetting.classList.remove('white-field');
            tariffSetting.readOnly = true;
        }
        
        if (fullAddress) {
            fullAddress.classList.add('grey-field');
            fullAddress.classList.remove('white-field');
            fullAddress.readOnly = true;
        }
    }

    function attachEventListeners() {
        // Error code dropdown
        const errorCodeDropdown = document.getElementById('errorCode');
        if (errorCodeDropdown) {
            // Add click handler to the dropdown container to prevent opening when locked
            errorCodeDropdown.addEventListener('click', function(e) {
                if (formState.errorCodeLocked) {
                    console.log('[FAULTY-KEY] Error code is locked, preventing dropdown from opening');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
            
            // Add option selection handler using event delegation
            errorCodeDropdown.addEventListener('click', handleErrorCodeSelection);
            
            // Add scroll-to-bottom behavior when dropdown opens - but only if not locked
            const selectedOption = errorCodeDropdown.querySelector('.selected-option');
            if (selectedOption) {
                selectedOption.addEventListener('click', function(e) {
                    if (formState.errorCodeLocked) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    
                    setTimeout(() => {
                        const dropdownOptions = errorCodeDropdown.querySelector('.dropdown-options');
                        if (dropdownOptions && dropdownOptions.style.display === 'block') {
                            dropdownOptions.scrollTop = dropdownOptions.scrollHeight;
                            console.log('[FAULTY-KEY] Scrolled errorCode dropdown to bottom');
                        }
                    }, 10);
                });
            }
        }

        // Fields to monitor for error code requirement - also lock error code when they have values
        const fieldsToMonitor = [
            'emergencyIndicator', 'effFromDate', 'emergencyCredit', 
            'meter_Serial', 'creditAdjustReason', 'initKeyCredit', 'wipeDown'
        ];

        fieldsToMonitor.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('focus', checkErrorCodeFirst);
                
                // Only lock when field actually gets a value, not on focus
                field.addEventListener('input', () => {
                    lockErrorCodeOnOtherFieldInteraction();
                });
                
                field.addEventListener('change', () => {
                    lockErrorCodeOnOtherFieldInteraction();
                });
                
                if (field.classList.contains('custom-dropdown')) {
                    field.addEventListener('click', checkErrorCodeFirst);
                }
            }
        });

        // Emergency indicator
        const emergencyIndicator = document.getElementById('emergencyIndicator');
        if (emergencyIndicator) {
            emergencyIndicator.addEventListener('click', handleEmergencyIndicatorSelection);
        }

        // Credit adjust reason
        const creditAdjustReason = document.getElementById('creditAdjustReason');
        if (creditAdjustReason) {
            creditAdjustReason.addEventListener('click', handleCreditAdjustReasonSelection);
        }

        // Generate RTI button
        const generateRTIButton = document.getElementById('btn-generaterti');
        if (generateRTIButton) {
            generateRTIButton.addEventListener('click', handleGenerateRTIClick);
        }
    }

    function checkErrorCodeFirst(e) {
        if (!errorCodeSelected && !formState.errorCodeLocked) {
            e.preventDefault();
            e.stopPropagation();
            
            showInfoMessage('noErrorCode', 'Select an Error Code to proceed.', '../images/icons/explanationred.png');
            setAllFieldsReadonly(true);
            
            const errorCode = document.getElementById('errorCode');
            if (errorCode) {
                errorCode.classList.remove('grey-field');
                errorCode.classList.add('white-field');
            }
        }
    }

    function handleErrorCodeSelection(e) {
        // If locked, prevent any changes and close dropdown
        if (formState.errorCodeLocked) {
            console.log('[FAULTY-KEY] Error code is locked, preventing selection change');
            const dropdownOptions = this.querySelector('.dropdown-options');
            if (dropdownOptions) {
                dropdownOptions.style.display = 'none';
            }
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        if (e.target.dataset && e.target.dataset.value) {
            const selectedValue = e.target.dataset.value;
            if (selectedValue) {
                errorCodeSelected = true;
                
                const selectedOption = this.querySelector('.selected-option');
                if (selectedOption) {
                    selectedOption.textContent = e.target.textContent;
                }
                
                const dropdownOptions = this.querySelector('.dropdown-options');
                if (dropdownOptions) {
                    dropdownOptions.style.display = 'none';
                }
                
                setTimeout(() => showConfirmationPopup(), 100);
            }
        }
    }

    // =========================================================================
    // POPUP POSITIONING HELPER FUNCTIONS - FIXED VERSION
    // =========================================================================
    
    function addPositioningHelper(element, label) {
        if (!POSITIONING_MODE) return;
        
        element.style.border = '2px dashed red';
        element.style.boxSizing = 'border-box';
        
        // Add coordinate display - BUT ONLY AFTER ELEMENT IS ATTACHED
        setTimeout(() => {
            // Double-check element still exists and has parent
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
            
            const rect = element.getBoundingClientRect();
            const parentRect = element.parentElement.getBoundingClientRect();
            const relativeTop = rect.top - parentRect.top;
            const relativeLeft = rect.left - parentRect.left;
            
            coords.textContent = `${label}: ${relativeLeft}x${relativeTop} (${element.style.width}×${element.style.height})`;
            element.appendChild(coords);
            
            console.log(`[POSITIONING] ${label}: top:${element.style.top}, left:${element.style.left}, width:${element.style.width}, height:${element.style.height}`);
        }, 50);
    }

    function showConfirmationPopup() {
        const existingBackdrop = document.getElementById('faulty-key-backdrop');
        const existingPopup = document.getElementById('faulty-key-popup');
        if (existingBackdrop) existingBackdrop.remove();
        if (existingPopup) existingPopup.remove();
        
        const backdrop = document.createElement('div');
        backdrop.id = 'faulty-key-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10000;
        `;

        const popup = document.createElement('div');
        popup.id = 'faulty-key-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${POPUP_POSITIONING.confirmMsnPopup.width}px;
            height: ${POPUP_POSITIONING.confirmMsnPopup.height}px;
            background: url('../images/confirmmsn.png') no-repeat;
            background-size: contain;
            z-index: 10001;
        `;

        // Add keyboard support for popup
        popup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Close popup when Enter is pressed
                document.getElementById('faulty-key-backdrop').remove();
                document.getElementById('faulty-key-popup').remove();
                clearInfoMessage();
                setAllFieldsReadonly(false);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                // Close popup when Escape is pressed
                document.getElementById('faulty-key-backdrop').remove();
                document.getElementById('faulty-key-popup').remove();
                clearInfoMessage();
                setAllFieldsReadonly(false);
            }
        });

        // Make popup focusable
        popup.tabIndex = -1;

        // Close button (bottom right)
        const closeButton = document.createElement('div');
        const closeConfig = POPUP_POSITIONING.confirmMsnPopup.closeButton;
        closeButton.style.cssText = `
            position: absolute;
            bottom: ${closeConfig.bottom}px;
            right: ${closeConfig.right}px;
            width: ${closeConfig.width}px;
            height: ${closeConfig.height}px;
            cursor: pointer;
        `;
        
        closeButton.addEventListener('click', function() {
            document.getElementById('faulty-key-backdrop').remove();
            document.getElementById('faulty-key-popup').remove();
            // DON'T lock error code here - only lock when other fields are used
            clearInfoMessage();
            setAllFieldsReadonly(false);
        });

        // New trigger button for second popup
        const triggerButton = document.createElement('div');
        const triggerConfig = POPUP_POSITIONING.confirmMsnPopup.triggerButton;
        triggerButton.style.cssText = `
            position: absolute;
            top: ${triggerConfig.top}px;
            left: ${triggerConfig.left}px;
            width: ${triggerConfig.width}px;
            height: ${triggerConfig.height}px;
            cursor: pointer;
        `;
        
        triggerButton.addEventListener('click', function() {
            showSecondPopup();
        });

        popup.appendChild(closeButton);
        popup.appendChild(triggerButton);
        document.body.appendChild(backdrop);
        document.body.appendChild(popup);

        // Focus the popup immediately so Enter key works
        setTimeout(() => {
            popup.focus();
            console.log('[FAULTY-KEY] Popup focused, Enter key will close it');
        }, 100);

        // Add positioning helpers AFTER elements are attached to DOM
        addPositioningHelper(closeButton, 'CLOSE');
        addPositioningHelper(triggerButton, 'TRIGGER');

        backdrop.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Log popup positioning info if in positioning mode
        if (POSITIONING_MODE) {
            console.log('[POSITIONING] === FIRST POPUP POSITIONING ===');
            console.log('[POSITIONING] To adjust button positions, modify POPUP_POSITIONING.confirmMsnPopup in the code');
            console.log('[POSITIONING] Current settings:', POPUP_POSITIONING.confirmMsnPopup);
        }
    }

    function showSecondPopup() {
        console.log('[FAULTY-KEY] Opening second popup (confirmmsnpa.png)');
        
        // Remove any existing second popup
        const existingSecondBackdrop = document.getElementById('second-popup-backdrop');
        const existingSecondPopup = document.getElementById('second-popup');
        if (existingSecondBackdrop) existingSecondBackdrop.remove();
        if (existingSecondPopup) existingSecondPopup.remove();
        
        const secondBackdrop = document.createElement('div');
        secondBackdrop.id = 'second-popup-backdrop';
        secondBackdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 10002;
        `;

        const secondPopup = document.createElement('div');
        secondPopup.id = 'second-popup';
        secondPopup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${POPUP_POSITIONING.confirmMsnPaPopup.width}px;
            height: ${POPUP_POSITIONING.confirmMsnPaPopup.height}px;
            background: url('../images/confirmmsnpa.png') no-repeat;
            background-size: contain;
            z-index: 10003;
        `;

        // Close button (top right)
        const secondCloseButton = document.createElement('div');
        const secondCloseConfig = POPUP_POSITIONING.confirmMsnPaPopup.closeButton;
        secondCloseButton.style.cssText = `
            position: absolute;
            top: ${secondCloseConfig.top}px;
            right: ${secondCloseConfig.right}px;
            width: ${secondCloseConfig.width}px;
            height: ${secondCloseConfig.height}px;
            cursor: pointer;
        `;
        
        secondCloseButton.addEventListener('click', function() {
            document.getElementById('second-popup-backdrop').remove();
            document.getElementById('second-popup').remove();
        });

        secondPopup.appendChild(secondCloseButton);
        document.body.appendChild(secondBackdrop);
        document.body.appendChild(secondPopup);

        // Add positioning helper for second popup close button AFTER attachment
        addPositioningHelper(secondCloseButton, 'CLOSE-2');

        // Close second popup when clicking outside
        secondBackdrop.addEventListener('click', function(e) {
            if (e.target === secondBackdrop) {
                document.getElementById('second-popup-backdrop').remove();
                document.getElementById('second-popup').remove();
            }
        });

        // Log second popup positioning info if in positioning mode
        if (POSITIONING_MODE) {
            console.log('[POSITIONING] === SECOND POPUP POSITIONING ===');
            console.log('[POSITIONING] To adjust button positions, modify POPUP_POSITIONING.confirmMsnPaPopup in the code');
            console.log('[POSITIONING] Current settings:', POPUP_POSITIONING.confirmMsnPaPopup);
        }
    }

    // =========================================================================
    // SMART ERROR CODE LOCKING FUNCTIONS
    // =========================================================================

    // Lock error code when user actually fills other fields (not just clicks them)
    function lockErrorCodeOnOtherFieldInteraction() {
        if (!errorCodeSelected || formState.errorCodeLocked) {
            return;
        }
        
        // Check if any other fields have actual values
        const fieldsToCheck = [
            'emergencyIndicator', 'effFromDate', 'emergencyCredit', 
            'meter_Serial', 'creditAdjustReason', 'initKeyCredit', 'wipeDown'
        ];
        
        let hasOtherFieldValues = false;
        
        fieldsToCheck.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox' && field.checked) {
                    hasOtherFieldValues = true;
                } else if (field.classList.contains('custom-dropdown')) {
                    const selectedOption = field.querySelector('.selected-option');
                    if (selectedOption && selectedOption.textContent.trim() !== '') {
                        hasOtherFieldValues = true;
                    }
                } else if (field.value && field.value.trim() !== '') {
                    hasOtherFieldValues = true;
                }
            }
        });
        
        if (hasOtherFieldValues) {
            console.log('[FAULTY-KEY] Locking error code due to other fields having values');
            lockErrorCode();
        }
    }

    function lockErrorCode() {
        formState.errorCodeLocked = true;
        const errorCodeDropdown = document.getElementById('errorCode');
        if (errorCodeDropdown) {
            errorCodeDropdown.classList.remove('white-field');
            errorCodeDropdown.classList.add('grey-field');
            
            // Immediately close any open dropdown
            const dropdownOptions = errorCodeDropdown.querySelector('.dropdown-options');
            if (dropdownOptions) {
                dropdownOptions.style.display = 'none';
                
                const options = dropdownOptions.querySelectorAll('div');
                options.forEach(option => {
                    option.style.pointerEvents = 'none';
                    option.style.cursor = 'default';
                    option.style.color = '#999999'; // Grey out the options
                });
            }
            
            // Also grey out the selected option display
            const selectedOption = errorCodeDropdown.querySelector('.selected-option');
            if (selectedOption) {
                selectedOption.style.color = '#999999';
                selectedOption.style.cursor = 'default';
                selectedOption.style.pointerEvents = 'none'; // Prevent clicking
            }
        }
    }

    function handleEmergencyIndicatorSelection(e) {
        if (e.target.dataset && e.target.dataset.value) {
            const selectedValue = e.target.dataset.value;
            const selectedOption = this.querySelector('.selected-option');
            
            if (selectedOption) {
                selectedOption.textContent = e.target.textContent;
            }
            
            const dropdownOptions = this.querySelector('.dropdown-options');
            if (dropdownOptions) {
                dropdownOptions.style.display = 'none';
            }

            // Lock error code when user actually selects a value (not empty)
            if (selectedValue && selectedValue.trim() !== '') {
                lockErrorCodeOnOtherFieldInteraction();
            }

            if (selectedValue === 'pickUpKeyAtTheOutlet' || selectedValue === 'reconfigureExistingKey') {
                currentWorkflow = 'shopPickup';
                initiateShopPickupWorkflow();
            }
        }
    }

    function handleCreditAdjustReasonSelection(e) {
        if (e.target.dataset && e.target.dataset.value !== undefined) {
            const selectedValue = e.target.dataset.value;
            const selectedOption = this.querySelector('.selected-option');
            
            if (selectedOption) {
                selectedOption.textContent = e.target.textContent;
            }
            
            const dropdownOptions = this.querySelector('.dropdown-options');
            if (dropdownOptions) {
                dropdownOptions.style.display = 'none';
            }

            console.log('[FAULTY-KEY] Credit Adjust Reason selected:', selectedValue);

            // Lock error code when user actually selects a value (not empty)
            if (selectedValue && selectedValue.trim() !== '') {
                lockErrorCodeOnOtherFieldInteraction();
            }

            if (selectedValue && DYNAMIC_DROPDOWN_TRIGGERS.includes(selectedValue)) {
                createDynamicDropdown();
            } else {
                removeDynamicDropdown();
            }
        }
    }

    // =========================================================================
    // RTI GENERATION FUNCTIONS (UPDATED)
    // =========================================================================

    function handleGenerateRTIClick(e) {
        console.log('[FAULTY-KEY] Generate RTI button clicked');
        
        if (e.target.dataset.mode === 'dormant') {
            console.log('[FAULTY-KEY] Generate RTI button is dormant, ignoring click');
            return;
        }

        if (!validateCreditFields()) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        console.log('[FAULTY-KEY] Generate RTI validation passed, opening RTI generator...');
        
        // Check if RTI Generator is available
        if (window.RTIGenerator && typeof window.RTIGenerator.open === 'function') {
            window.RTIGenerator.open();
        } else {
            console.error('[FAULTY-KEY] RTI Generator not available. Make sure rti-generator.js is loaded.');
            // Could show an error message to user here
            alert('RTI Generator not available. Please ensure all scripts are loaded.');
        }
    }

    // =========================================================================
    // REMAINING ORIGINAL FUNCTIONS (FIXED COLOR HANDLING)
    // =========================================================================

    function createDynamicDropdown() {
        if (dynamicDropdownCreated) {
            console.log('[FAULTY-KEY] Dynamic dropdown already exists');
            return;
        }

        console.log('[FAULTY-KEY] Creating dynamic dropdown...');

        const dynamicDropdown = document.createElement('div');
        dynamicDropdown.id = 'creditSubReason';
        dynamicDropdown.className = 'custom-dropdown white-field';
        dynamicDropdown.style.cssText = `
            position: absolute;
            top: 166px;
            left: 538px;
            width: 152px;
            height: 25px;
            z-index: 19;
        `;

        const selectedOption = document.createElement('div');
        selectedOption.className = 'selected-option';
        selectedOption.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
        
        const dropdownOptions = document.createElement('div');
        dropdownOptions.className = 'dropdown-options';
        dropdownOptions.style.cssText = 'max-height: 160px; overflow-y: auto; width: 338px; font-size: 12px;';
        
        const options = [
            { value: '', text: '' },
            { value: 'customerCannotAffordTopup', text: 'Customer cannot afford to top up' },
            { value: 'customerToppedUpNoPayment', text: 'Customer topped up but no payment went to the meter' },
            { value: 'paymentAppliedBalanceDown', text: 'Payment applied to the meter, but balance went down too fast' },
            { value: 'selfRationing', text: 'Self-rationing' },
            { value: 'selfDisconnecting', text: 'Self-Disconnecting' },
            { value: 'other', text: 'Other' }
        ];

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.setAttribute('data-value', option.value);
            optionDiv.textContent = option.text;
            dropdownOptions.appendChild(optionDiv);
        });

        dynamicDropdown.appendChild(selectedOption);
        dynamicDropdown.appendChild(dropdownOptions);

        const initKeyCredit = document.getElementById('initKeyCredit');
        if (initKeyCredit && initKeyCredit.parentNode) {
            initKeyCredit.parentNode.appendChild(dynamicDropdown);
            
            if (window.dropdownCore) {
                const items = options.map(option => ({
                    value: option.value,
                    label: option.text
                }));
                
                window.dropdownCore.populate(dynamicDropdown, items, (value, label) => {
                    selectedOption.textContent = value === '' ? '' : label;
                });
            }
            
            // Initialize arrow rollover for the dynamic dropdown
setTimeout(() => {
    const selectedOption = dynamicDropdown.querySelector('.selected-option');
    if (selectedOption) {
        // Add mouse events for arrow rollover
        selectedOption.addEventListener('mousemove', function(e) {
            const rect = selectedOption.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const arrowAreaLeft = rect.width - 22;
            
            if (mouseX >= arrowAreaLeft) {
                selectedOption.classList.remove('arrow-normal');
                selectedOption.classList.add('arrow-hover');
            } else {
                selectedOption.classList.remove('arrow-hover');
                selectedOption.classList.add('arrow-normal');
            }
        });
        
        selectedOption.addEventListener('mouseleave', function() {
            selectedOption.classList.remove('arrow-hover');
            selectedOption.classList.add('arrow-normal');
        });
        
        // Set initial state
        selectedOption.classList.add('arrow-normal');
    }
}, 100);

            dynamicDropdownCreated = true;
            moveElementsDown();
            console.log('[FAULTY-KEY] Dynamic dropdown created successfully');
        } else {
            console.error('[FAULTY-KEY] Could not find parent for dynamic dropdown');
        }
    }

    function removeDynamicDropdown() {
        const existingDropdown = document.getElementById('creditSubReason');
        if (existingDropdown) {
            console.log('[FAULTY-KEY] Removing dynamic dropdown...');
            existingDropdown.remove();
            dynamicDropdownCreated = false;
            moveElementsToOriginalPositions();
            console.log('[FAULTY-KEY] Dynamic dropdown removed');
        }
    }

    function moveElementsDown() {
        console.log('[FAULTY-KEY] Moving elements down 28px...');
        MOVEABLE_ELEMENTS.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element && originalPositions[elementId]) {
                const newTop = originalPositions[elementId].top + 28;
                element.style.top = newTop + 'px';
                console.log(`[FAULTY-KEY] Moved ${elementId} to ${newTop}px`);
            }
        });
    }

    function moveElementsToOriginalPositions() {
        console.log('[FAULTY-KEY] Moving elements back to original positions...');
        MOVEABLE_ELEMENTS.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element && originalPositions[elementId]) {
                element.style.top = originalPositions[elementId].top + 'px';
                console.log(`[FAULTY-KEY] Restored ${elementId} to ${originalPositions[elementId].top}px`);
            }
        });
    }

    function validateCreditFields() {
        const creditAdjustReason = document.getElementById('creditAdjustReason');
        const initKeyCredit = document.getElementById('initKeyCredit');
        const creditSubReason = document.getElementById('creditSubReason');

        const creditReasonValue = getDropdownValue(creditAdjustReason);
        const initCreditValue = initKeyCredit ? initKeyCredit.value.trim() : '';
        const subReasonValue = creditSubReason ? getDropdownValue(creditSubReason) : '';

        console.log('[FAULTY-KEY] Validating credit fields:', {
            creditReason: creditReasonValue,
            initCredit: initCreditValue,
            subReason: subReasonValue,
            dynamicDropdownExists: dynamicDropdownCreated
        });

        // Case 1: Both empty (no credit) - valid
        if (!creditReasonValue && !initCreditValue) {
            console.log('[FAULTY-KEY] Validation passed: no credit being added');
            return true;
        }

        // Case 2: Credit reason selected but no init credit - invalid
        if (creditReasonValue && !initCreditValue) {
            console.log('[FAULTY-KEY] Validation failed: credit reason selected but no init credit');
            showCreditValidationError();
            return false;
        }

        // Case 3: Both credit reason and init credit provided
        if (creditReasonValue && initCreditValue) {
            if (dynamicDropdownCreated && !subReasonValue) {
                console.log('[FAULTY-KEY] Validation failed: sub-reason required but not selected');
                showSubReasonValidationError();
                return false;
            }
            
            console.log('[FAULTY-KEY] Validation passed: all required credit fields completed');
            return true;
        }

        // Case 4: Init credit provided but no credit reason - allow
        console.log('[FAULTY-KEY] Validation passed: init credit provided');
        return true;
    }

    function showCreditValidationError() {
        console.log('[FAULTY-KEY] Showing credit validation error');
        showInfoMessage('creditValidation', 
            'If credit reason is populated, populate the initial Key Credit field', 
            '../images/icons/explanationred.png');
        greyOutFieldsExceptCredit();
    }

    function showSubReasonValidationError() {
        console.log('[FAULTY-KEY] Showing sub-reason validation error');
        showInfoMessage('subReasonValidation', 
            'Please select a sub-reason for the credit adjustment', 
            '../images/icons/explanationred.png');
        greyOutFieldsExceptCredit(false);
    }

    function greyOutFieldsExceptCredit(greyOutSubReason = true) {
        const fieldsToGrey = [
            'emergencyIndicator', 'effFromDate', 'emergencyCredit', 
            'meter_Serial', 'full_Address_Trunc', 'wipeDown'
        ];
        
        if (greyOutSubReason && dynamicDropdownCreated) {
            fieldsToGrey.push('creditSubReason');
        }
        
        fieldsToGrey.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.disabled = true;
                } else {
                    field.classList.remove('white-field');
                    field.classList.add('grey-field');
                    field.readOnly = true;
                }
            }
        });
        
        const creditFields = ['creditAdjustReason', 'initKeyCredit'];
        if (!greyOutSubReason && dynamicDropdownCreated) {
            creditFields.push('creditSubReason');
        }
        
        creditFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('grey-field');
                field.classList.add('white-field');
                field.readOnly = false;
            }
        });
        
        const tariffSetting = document.getElementById('tariffSetting');
        if (tariffSetting) {
            tariffSetting.classList.add('grey-field');
            tariffSetting.classList.remove('white-field');
            tariffSetting.readOnly = true;
        }
    }

    function getDropdownValue(dropdown) {
        if (!dropdown) return '';
        const selectedOption = dropdown.querySelector('.selected-option');
        if (!selectedOption) return '';
        
        const options = dropdown.querySelectorAll('.dropdown-options div');
        for (let option of options) {
            if (option.textContent.trim() === selectedOption.textContent.trim()) {
                return option.dataset.value || '';
            }
        }
        return '';
    }

    function initiateShopPickupWorkflow() {
        const redFields = ['emergencyIndicator', 'emergencyCredit', 'meter_Serial'];
        redFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.classList.contains('custom-dropdown')) {
                    const selectedOption = field.querySelector('.selected-option');
                    if (selectedOption) {
                        selectedOption.style.color = '#b50004';
                    }
                } else {
                    field.style.color = '#b50004';
                }
            }
        });

        showInfoMessage('effDateMandatory', 'Effective From Date is a mandatory field; enter the required value.', '../images/icons/explanationred.png');

        const greyFields = ['errorCode', 'full_Address_Trunc', 'tariffSetting', 
                           'creditAdjustReason', 'initKeyCredit', 'wipeDown'];
        greyFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.disabled = true;
                } else {
                    field.classList.remove('white-field');
                    field.classList.add('grey-field');
                    field.readOnly = true;
                }
            }
        });

        const effFromDate = document.getElementById('effFromDate');
        if (effFromDate) {
            effFromDate.focus();
            effFromDate.style.color = '#b50004';
        }
    }

    function setupEnterKeyBehavior() {
        const enterFields = ['effFromDate', 'emergencyCredit', 'meter_Serial'];
        
        enterFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && currentWorkflow === 'shopPickup') {
                        const effFromDate = document.getElementById('effFromDate');
                        if (effFromDate && isValidDate(effFromDate.value)) {
                            activateAllFields();
                        }
                    }
                });
            }
        });
    }

    function isValidDate(dateStr) {
        const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
        if (!dateRegex.test(dateStr)) return false;
        
        const parts = dateStr.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > 2100) return false;
        
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            daysInMonth[1] = 29;
        }
        
        return day <= daysInMonth[month - 1];
    }

    // FIXED: activateAllFields function that protects specific fields from color changes
    function activateAllFields() {
        clearInfoMessage();
        
        // FIXED: Only change colors for fields that aren't protected
        const allFields = document.querySelectorAll('input, .custom-dropdown');
        allFields.forEach(field => {
            // Skip protected fields (like name_Address_Combo)
            if (PROTECTED_FIELDS.includes(field.id)) {
                console.log(`[FAULTY-KEY] Skipping color change for protected field: ${field.id}`);
                return;
            }
            
            if (field.classList.contains('custom-dropdown')) {
                const selectedOption = field.querySelector('.selected-option');
                if (selectedOption) {
                    selectedOption.style.color = 'black';
                }
            } else {
                field.style.color = 'black';
            }
        });

        const activateFields = ['emergencyIndicator', 'effFromDate', 
                               'emergencyCredit', 'meter_Serial', 'creditAdjustReason', 
                               'initKeyCredit', 'wipeDown'];
        
        if (dynamicDropdownCreated) {
            activateFields.push('creditSubReason');
        }
        
        activateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.disabled = false;
                } else {
                    field.classList.remove('grey-field');
                    field.classList.add('white-field');
                    field.readOnly = false;
                }
            }
        });

        const errorCode = document.getElementById('errorCode');
        if (errorCode && formState.errorCodeLocked) {
            errorCode.classList.remove('white-field');
            errorCode.classList.add('grey-field');
        }

        const tariffSetting = document.getElementById('tariffSetting');
        if (tariffSetting) {
            tariffSetting.classList.add('grey-field');
            tariffSetting.classList.remove('white-field');
            tariffSetting.readOnly = true;
        }

        const generateRTI = document.getElementById('btn-generaterti');
        if (generateRTI) {
            generateRTI.src = generateRTI.src.replace('-inactive.png', '-active.png');
            generateRTI.dataset.mode = 'standard';
        }

        formState.fieldsActivated = true;
        
        console.log('[FAULTY-KEY] All fields activated, protected fields preserved');
    }

    function setAllFieldsReadonly(readonly) {
        const fields = ['emergencyIndicator', 'effFromDate', 'emergencyCredit', 
                       'meter_Serial', 'creditAdjustReason', 'initKeyCredit', 'wipeDown'];
        
        if (dynamicDropdownCreated) {
            fields.push('creditSubReason');
        }
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (readonly) {
                    if (field.type === 'checkbox') {
                        field.disabled = true;
                    } else {
                        field.classList.remove('white-field');
                        field.classList.add('grey-field');
                        field.readOnly = true;
                    }
                } else {
                    if (field.type === 'checkbox') {
                        field.disabled = false;
                    } else {
                        field.classList.remove('grey-field');
                        field.classList.add('white-field');
                        field.readOnly = false;
                    }
                }
            }
        });
    }

    function showInfoMessage(type, text, iconPath) {
        const infoArea = document.getElementById('info-message-area');
        const infoIcon = document.getElementById('info-message-icon');
        const infoText = document.getElementById('info-message-text');
        
        if (infoArea && infoIcon && infoText) {
            if (iconPath) {
                infoIcon.src = iconPath;
                infoIcon.style.display = 'block';
            } else {
                infoIcon.style.display = 'none';
            }
            
            infoText.textContent = text;
            infoArea.style.display = 'flex';
            
            console.log('[FAULTY-KEY] Info message shown:', text);
        } else {
            console.warn('[FAULTY-KEY] Info panel elements not found');
        }
    }

    function clearInfoMessage() {
        const infoArea = document.getElementById('info-message-area');
        const infoIcon = document.getElementById('info-message-icon');
        const infoText = document.getElementById('info-message-text');
        
        if (infoArea && infoIcon && infoText) {
            infoArea.style.display = 'none';
            infoIcon.src = '';
            infoIcon.style.display = 'none';
            infoText.textContent = '';
            
            console.log('[FAULTY-KEY] Info message cleared');
        }
    }

    // Public API
    return {
        initialize: initialize,
        getFormState: () => formState,
        activateAllFields: activateAllFields,
        showInfoMessage: showInfoMessage,
        clearInfoMessage: clearInfoMessage
    };

})();