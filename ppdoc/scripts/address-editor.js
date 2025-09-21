console.log('[ADDRESS-EDITOR] Script loaded');

// address-editor.js - Address Editor Popup Component with Background Image
(function() {
    'use strict';
    
    console.log('[ADDRESS-EDITOR] Initializing address editor component');
    
    let currentPopup = null;
    let currentTargetField = null;
    let addressData = {
        line1: '',
        line2: '',
        line3: '',
        line4: '',
        line5: '',
        line6: '',
        line7: '',
        line8: '',
        line9: '',
        postalCode: ''
    };
    
    // Initialize address editor for edit address buttons
    function initAddressEditor() {
        console.log('[ADDRESS-EDITOR] initAddressEditor called');
        
        // Use event delegation instead of direct button listeners
        setupEventDelegation();
    }
    
    function setupEventDelegation() {
        console.log('[ADDRESS-EDITOR] Setting up event delegation for address editor');
        
        // Remove any existing listener to prevent duplicates
        document.removeEventListener('click', handleDocumentClick);
        
        // Add single document-level click listener
        document.addEventListener('click', handleDocumentClick);
        
        console.log('[ADDRESS-EDITOR] Event delegation setup completed');
    }
    
    function handleDocumentClick(e) {
        // Check if clicked element is an edit address button
        if (e.target.id === 'btn-editaddress' || e.target.closest('#btn-editaddress')) {
            console.log('[ADDRESS-EDITOR] Edit address button clicked via delegation');
            e.preventDefault();
            e.stopPropagation();
            
            // Find the target field with retry mechanism
            const targetField = findTargetFieldWithRetry();
            if (targetField) {
                openAddressEditor(targetField);
            } else {
                console.warn('[ADDRESS-EDITOR] Target field full_Address_Trunc not found after retries');
            }
        }
    }
    
    function findTargetFieldWithRetry(maxAttempts = 3, delay = 100) {
        console.log('[ADDRESS-EDITOR] Looking for target field with retry mechanism');
        
        let attempts = 0;
        
        function attemptFind() {
            const targetField = document.getElementById('full_Address_Trunc');
            if (targetField) {
                console.log('[ADDRESS-EDITOR] Target field found on attempt', attempts + 1);
                return targetField;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                console.log('[ADDRESS-EDITOR] Target field not found, retrying in', delay, 'ms (attempt', attempts, 'of', maxAttempts, ')');
                setTimeout(attemptFind, delay);
                return null;
            } else {
                console.warn('[ADDRESS-EDITOR] Target field not found after', maxAttempts, 'attempts');
                return null;
            }
        }
        
        return attemptFind();
    }
    
    function openAddressEditor(targetField) {
        console.log('[ADDRESS-EDITOR] Opening address editor');
        
        // Defensive check - ensure target field still exists
        if (!targetField || !document.contains(targetField)) {
            console.warn('[ADDRESS-EDITOR] Target field is null or no longer in document');
            return;
        }
        
        if (currentPopup) {
            closeAddressEditor();
        }
        
        currentTargetField = targetField;
        
        // Load existing address data
        loadAddressData();
        
        createAddressPopup();
    }
    
    function createAddressPopup() {
        console.log('[ADDRESS-EDITOR] Creating address popup with background image');
        
        // Create backdrop/overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'address-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 999;
        `;
        
        const popup = document.createElement('div');
        popup.className = 'address-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 1027px;
            height: 307px;
            background: url('../images/editaddress.png') no-repeat;
            background-size: 1027px 307px;
            z-index: 1000;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
        `;
        
        // ADD ENTER KEY SUPPORT TO POPUP
        popup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmAddress();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeAddressEditor();
            }
        });
        
        // Make popup focusable so it can receive key events
        popup.tabIndex = -1;
        
        // Create input field overlays (positioned over the input fields in background)
        const inputOverlays = createInputOverlays();
        popup.appendChild(inputOverlays);
        
        // Create button overlays (positioned over the green/red buttons)
        const buttonOverlays = createButtonOverlays();
        popup.appendChild(buttonOverlays);
        
        document.body.appendChild(backdrop);
        document.body.appendChild(popup);
        currentPopup = { popup, backdrop };
        
        // Focus the popup so it can receive keyboard events
        setTimeout(() => {
            popup.focus();
            // Also focus the first input field
            const firstInput = popup.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 0);
        
        console.log('[ADDRESS-EDITOR] Address popup created with background image and Enter key support');
    }
    
    function createInputOverlays() {
        const container = document.createElement('div');
        container.className = 'address-input-overlays';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        // Field positioning - ADJUST THESE COORDINATES to match your background image
        // Format: [fieldName, left, top, width, height]
        const fieldPositions = [
            ['line1', 162, 79, 304, 22],      // Address Line 1
            ['line2', 162, 106, 304, 22],     // Address Line 2  
            ['line3', 162, 133, 304, 22],     // Address Line 3
            ['line4', 162, 160, 304, 22],     // Address Line 4
            ['postalCode', 162, 187, 88, 22], // Postal Code
            ['line5', 674, 79, 304, 22],      // Address Line 5
            ['line6', 674, 106, 304, 22],     // Address Line 6
            ['line7', 674, 133, 304, 22],     // Address Line 7
            ['line8', 674, 160, 304, 22],     // Address Line 8
            ['line9', 674, 187, 304, 22],     // Address Line 9
        ];
        
        fieldPositions.forEach(([fieldName, left, top, width, height]) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = fieldName;
            input.value = addressData[fieldName] || '';
            input.style.cssText = `
                position: absolute;
                left: ${left}px;
                top: ${top}px;
                width: ${width}px;
                height: ${height}px;
                border: 1px solid #bfbfbf;
                background: white;
                padding: 2px 4px;
                font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
                font-size: 12px;
                font-weight: normal !important;
                color: black;
                box-sizing: border-box;
            `;
            
            // Add input event listener to update data
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                addressData[fieldName] = value;
                e.target.value = value;
            });
            
            // Add focus styling (blue border on select)
            input.addEventListener('focus', () => {
                input.style.borderColor = '#007cbf';
                input.style.outline = 'none';
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = '#bfbfbf';
            });
            
            container.appendChild(input);
        });
        
        return container;
    }
    
    function createButtonOverlays() {
        const container = document.createElement('div');
        container.className = 'address-button-overlays';
        container.style.cssText = `
            position: absolute;
            bottom: 15px;
            right: 15px;
        `;
        
        // Green tick button overlay - ADJUST COORDINATES to match your background
        const okBtn = document.createElement('div');
        okBtn.style.cssText = `
            position: absolute;
            right: 40px;
            bottom: 0px;
            width: 30px;
            height: 20px;
            cursor: pointer;
            z-index: 20;
        `;
        okBtn.addEventListener('click', confirmAddress);
        
        // Red X button overlay - ADJUST COORDINATES to match your background
        const cancelBtn = document.createElement('div');
        cancelBtn.style.cssText = `
            position: absolute;
            right: 3px;
            bottom: 0px;
            width: 30px;
            height: 20px;
            cursor: pointer;
            z-index: 20;
        `;
        cancelBtn.addEventListener('click', closeAddressEditor);
        
        container.appendChild(okBtn);
        container.appendChild(cancelBtn);
        
        return container;
    }
    
    function confirmAddress() {
        console.log('[ADDRESS-EDITOR] Confirming address changes');
        
        // Defensive check - ensure target field still exists
        if (currentTargetField && !document.contains(currentTargetField)) {
            console.warn('[ADDRESS-EDITOR] Target field no longer exists, attempting to find it again');
            currentTargetField = document.getElementById('full_Address_Trunc');
        }
        
        // Save to sessionStorage (session only)
        saveAddressData();
        
        // Update the target field with combined address (excluding postal code)
        if (currentTargetField) {
            const combinedAddress = combineAddressLines().toUpperCase();
            currentTargetField.value = combinedAddress;
            console.log('[ADDRESS-EDITOR] Updated target field:', combinedAddress);
        } else {
            console.warn('[ADDRESS-EDITOR] No target field available to update');
        }
        
        closeAddressEditor();
    }
    
    function combineAddressLines() {
        // Use same formula as pencil-handler.js getOrCreateConstructedFields()
        // Format: "flatnumber housenumber street city" (excluding postal code)
        const addressParts = [
            addressData.line1,  // flatnumber
            addressData.line2,  // housenumber
            addressData.line3,  // street
            addressData.line4   // city
        ].filter(part => part && part.trim() !== '');
        
        const combined = addressParts.join(' ');
        console.log('[ADDRESS-EDITOR] Combined address (no postcode):', combined);
        return combined;
    }
    
    function loadAddressData() {
        console.log('[ADDRESS-EDITOR] Loading address data');
        
        // Priority order:
        // 1. SessionStorage (if user has made edits this session)
        // 2. Scenario data from localStorage (fresh from JSON)
        // 3. Empty defaults
        
        try {
            // First try sessionStorage (user edits)
            const sessionData = sessionStorage.getItem('smartui_addressData');
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                addressData = { ...addressData, ...parsed };
                console.log('[ADDRESS-EDITOR] Loaded address data from sessionStorage (user edits)');
                return;
            }
            
            // Then try scenario data from localStorage
            const scenarioData = localStorage.getItem('smartui_data');
            if (scenarioData) {
                const scenario = JSON.parse(scenarioData);
                const customerInfo = scenario.customerInfo || {};
                
                // Map scenario fields to address editor fields
                addressData = {
                    line1: (customerInfo.flatnumber || '').toUpperCase(),
                    line2: (customerInfo.housenumber || '').toUpperCase(),
                    line3: (customerInfo.street || '').toUpperCase(),
                    line4: (customerInfo.city || '').toUpperCase(),
                    line5: '',  // Not used in current scenario structure
                    line6: '',
                    line7: '',
                    line8: '',
                    line9: '',
                    postalCode: (customerInfo.postcode || '').toUpperCase()
                };
                
                console.log('[ADDRESS-EDITOR] Loaded address data from scenario:', addressData);
                return;
            }
            
            // Fallback to empty defaults
            console.log('[ADDRESS-EDITOR] No address data found, using empty defaults');
            addressData = {
                line1: '', line2: '', line3: '', line4: '', line5: '',
                line6: '', line7: '', line8: '', line9: '', postalCode: ''
            };
            
        } catch (e) {
            console.warn('[ADDRESS-EDITOR] Error loading address data:', e);
            // Use empty defaults on error
            addressData = {
                line1: '', line2: '', line3: '', line4: '', line5: '',
                line6: '', line7: '', line8: '', line9: '', postalCode: ''
            };
        }
    }
    
    function saveAddressData() {
        console.log('[ADDRESS-EDITOR] Saving address data to sessionStorage');
        
        try {
            sessionStorage.setItem('smartui_addressData', JSON.stringify(addressData));
            console.log('[ADDRESS-EDITOR] Address data saved');
        } catch (e) {
            console.warn('[ADDRESS-EDITOR] Error saving address data:', e);
        }
    }
    
    function closeAddressEditor() {
        console.log('[ADDRESS-EDITOR] Closing address editor');
        
        if (currentPopup) {
            document.removeEventListener('click', outsideClickHandler);
            document.body.removeChild(currentPopup.popup);
            document.body.removeChild(currentPopup.backdrop);
            currentPopup = null;
            currentTargetField = null;
        }
    }
    
    function outsideClickHandler(e) {
        if (currentPopup && !currentPopup.popup.contains(e.target)) {
            closeAddressEditor();
        }
    }
    
    // Public API
    window.AddressEditor = {
        init: initAddressEditor,
        open: openAddressEditor
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAddressEditor);
    } else {
        // DOM already ready, initialize immediately
        initAddressEditor();
    }
    
    // Reinitialize when fragments are loaded (defensive approach)
    document.addEventListener('lowerFragment:ready', function() {
        console.log('[ADDRESS-EDITOR] Lower fragment ready, ensuring event delegation is active');
        setTimeout(() => {
            setupEventDelegation(); // Re-setup delegation to ensure it's active
        }, 100);
    });
    
    document.addEventListener('smartui:fragmentsReady', function() {
        console.log('[ADDRESS-EDITOR] SmartUI fragments ready, ensuring event delegation is active');
        setTimeout(() => {
            setupEventDelegation(); // Re-setup delegation to ensure it's active
        }, 100);
    });
    
})();