// dropdown-lower.js - Handles replacement key dropdown fragment switching
(function() {
    // Wait for fragments to be ready before initializing
    document.addEventListener('smartui:fragmentsReady', initializeReplacementKeyDropdown);
    
    // Also listen for when lower fragments are reloaded
    document.addEventListener('lowerFragment:ready', initializeReplacementKeyDropdown);
    
    function initializeReplacementKeyDropdown() {
        const dropdown = document.getElementById('replacementKeyReason');
        
        if (!dropdown) {
            // No replacement key dropdown on this fragment
            return;
        }
        
        // Initialize all custom dropdowns on this fragment using dropdown-core
        initializeAllCustomDropdowns();
        
        // Add specific change handling for replacementKeyReason
        dropdown.addEventListener('change', handleReplacementKeyChange);
        
        // *** NEW *** - Check if this is the faulty key fragment and initialize its handler
        initializeFaultyKeyHandler();
        
        // *** NEW *** - Initialize senddataflow button state based on current dropdown value
        initializeSendDataflowButton();
    }
    
    function initializeAllCustomDropdowns() {
        // Find all custom dropdowns in the current fragment
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        
        dropdowns.forEach(dropdown => {
            const options = dropdown.querySelectorAll('.dropdown-options div');
            const items = Array.from(options).map(option => {
                const value = option.dataset.value || '';
                const text = option.textContent.trim();
                return {
                    value: value,
                    label: text || '' // Keep empty options truly empty
                };
            });
            
            // Use dropdown-core to populate and handle the dropdown
            if (window.dropdownCore) {
                window.dropdownCore.populate(dropdown, items, (value, label) => {
                    // Update the selected option display
                    const selectedOption = dropdown.querySelector('.selected-option');
                    if (selectedOption) {
                        // Show empty for blank values, otherwise show the label
                        selectedOption.textContent = value === '' ? '' : label;
                    }
                    
                    // Trigger change event for any special handling
                    const event = new CustomEvent('change', { 
                        detail: { value: value, label: label }
                    });
                    dropdown.dispatchEvent(event);
                });
                
                // Only ensure dropdown starts blank on initial load, not after every populate
                const selectedOption = dropdown.querySelector('.selected-option');
                if (selectedOption && !selectedOption.textContent) {
                    selectedOption.textContent = '';
                }
            } else {
                console.error('[DROPDOWN-LOWER] dropdownCore not available');
            }
        });
    }
    
    // *** NEW *** - Initialize faulty key handler if this is the faulty key fragment
    function initializeFaultyKeyHandler() {
        // Check if this is the faulty key fragment by looking for unique elements
        const errorCodeDropdown = document.getElementById('errorCode');
        const emergencyIndicator = document.getElementById('emergencyIndicator');
        
        if (errorCodeDropdown && emergencyIndicator) {
            console.log('[DROPDOWN-LOWER] Faulty key fragment detected, initializing handler...');
            
            // Call the faulty key handler if it exists
            if (window.faultyKeyHandler && typeof window.faultyKeyHandler.initialize === 'function') {
                window.faultyKeyHandler.initialize();
                console.log('[DROPDOWN-LOWER] Faulty key handler initialized successfully');
            } else {
                console.warn('[DROPDOWN-LOWER] faultyKeyHandler not available');
            }
        }
    }
    
    // *** NEW *** - Initialize senddataflow button state on fragment load
    function initializeSendDataflowButton() {
        const sendDataflowBtn = document.getElementById('btn-senddataflow');
        const dropdown = document.getElementById('replacementKeyReason');
        
        if (!sendDataflowBtn || !dropdown) {
            return;
        }
        
        // Check if dropdown has a selection
        const selectedOption = dropdown.querySelector('.selected-option');
        const hasSelection = selectedOption && selectedOption.textContent.trim() !== '';
        
        console.log(`[DROPDOWN-LOWER] Initializing senddataflow button, hasSelection: ${hasSelection}`);
        
        if (hasSelection) {
            activateSendDataflowButton(sendDataflowBtn);
        } else {
            deactivateSendDataflowButton(sendDataflowBtn);
        }
    }
    
    // *** NEW *** - Activate senddataflow button
    function activateSendDataflowButton(button) {
        console.log('[DROPDOWN-LOWER] Activating senddataflow button');
        button.src = '../images/buttons/senddataflow-active.png';
        button.dataset.mode = 'standard';
    }
    
    // *** NEW *** - Deactivate senddataflow button
    function deactivateSendDataflowButton(button) {
        console.log('[DROPDOWN-LOWER] Deactivating senddataflow button');
        button.src = '../images/buttons/senddataflow-inactive.png';
        button.dataset.mode = 'dormant';
    }
    
    function handleReplacementKeyChange(event) {
        const selectedValue = event.detail ? event.detail.value : event.target.value;
        
        // *** NEW *** - Handle senddataflow button activation based on selection
        const sendDataflowBtn = document.getElementById('btn-senddataflow');
        if (sendDataflowBtn) {
            if (selectedValue && selectedValue.trim() !== '') {
                // Any non-empty selection activates the button
                activateSendDataflowButton(sendDataflowBtn);
            } else {
                // Empty selection deactivates the button
                deactivateSendDataflowButton(sendDataflowBtn);
            }
        }
        
        // Don't load anything for empty selection
        if (!selectedValue) {
            return;
        }
        
        // Fragment mapping
        const fragmentMap = {
            'brokenstolenlost': {
                lowerImage: '../images/lower-replacementkeybsl.png',
                lowerFragment: '../fragments/lower-replacementkeybsl.html'
            },
            'faultyKey': {
                lowerImage: '../images/lower-replacementkeyfaulty.png',
                lowerFragment: '../fragments/lower-replacementkeyfaulty.html'
            },
            'keyNotReceived': {
                lowerImage: '../images/lower-replacementkeynotreceived.png',
                lowerFragment: '../fragments/lower-replacementkeynotreceived.html'
            }
        };
        
        const config = fragmentMap[selectedValue];
        
        if (!config) {
            console.warn('[DROPDOWN-LOWER] No fragment configuration found for:', selectedValue);
            return;
        }
        
        // Save the selected value so we can restore it after reload
        const savedSelection = selectedValue;
        
        // Load the new fragment
        loadLowerSection(config.lowerImage, config.lowerFragment, savedSelection);
    }
    
    // Function to load just the lower section with selected dropdown value
    function loadLowerSection(lowerImage, lowerFragment, selectedValue) {
        const lower = document.getElementById('lowerbox');
        const lowerFields = document.getElementById('lowerbox-fields');
        
        if (!lower || !lowerFields) {
            console.error('[DROPDOWN-LOWER] Lower elements not found');
            return;
        }
        
        // Fade out lower image (consistent with existing system)
        lower.style.opacity = 0;
        
        setTimeout(() => {
            // Change the lower background image
            lower.src = lowerImage;
            lower.onload = () => lower.style.opacity = 1;
        }, 150); // Same timing as existing system
        
        // Load the new lower fragment
        fetch(lowerFragment)
            .then(res => res.text())
            .then(html => {
                lowerFields.innerHTML = html;
                
                // Wait a moment for the DOM to update, then restore dropdown selection
                setTimeout(() => {
                    const newDropdown = document.getElementById('replacementKeyReason');
                    if (newDropdown && selectedValue) {
                        // For custom dropdown, we need to set the selected option text
                        const selectedOption = newDropdown.querySelector('.selected-option');
                        const matchingOption = newDropdown.querySelector(`[data-value="${selectedValue}"]`);
                        
                        if (selectedOption && matchingOption) {
                            selectedOption.textContent = matchingOption.textContent;
                        }
                    }
                    
                    // Dispatch event that lower fragment is ready
                    document.dispatchEvent(new Event('lowerFragment:ready'));
                }, 50);
            })
            .catch(error => {
                console.error('[DROPDOWN-LOWER] Error loading lower fragment:', error);
            });
    }
    
})();