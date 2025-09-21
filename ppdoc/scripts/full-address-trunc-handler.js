// full-address-trunc-handler.js - Global handler to ensure full_Address_Trunc is always uppercase
console.log('[FULL-ADDRESS-TRUNC] Script loaded');

(function() {
    'use strict';
    
    console.log('[FULL-ADDRESS-TRUNC] Initializing full_Address_Trunc uppercase handler');
    
    // Setup uppercase input handler for full_Address_Trunc field
    function setupFullAddressTruncUppercase() {
        const fullAddressTruncElement = document.getElementById('full_Address_Trunc');
        
        if (!fullAddressTruncElement) {
            console.log('[FULL-ADDRESS-TRUNC] full_Address_Trunc field not found');
            return;
        }
        
        // Check if already has the handler to prevent duplicates
        if (fullAddressTruncElement.dataset.uppercaseHandler === 'true') {
            console.log('[FULL-ADDRESS-TRUNC] Uppercase handler already attached');
            return;
        }
        
        // Mark as having the handler
        fullAddressTruncElement.dataset.uppercaseHandler = 'true';
        
        // Add input event listener to convert to uppercase in real-time
        fullAddressTruncElement.addEventListener('input', handleUppercaseInput);
        
        // Also convert existing value to uppercase
        if (fullAddressTruncElement.value) {
            fullAddressTruncElement.value = fullAddressTruncElement.value.toUpperCase();
        }
        
        console.log('[FULL-ADDRESS-TRUNC] Set up uppercase input handler for full_Address_Trunc');
    }
    
    // Handle input events to convert to uppercase while preserving cursor position
    function handleUppercaseInput(event) {
        const element = event.target;
        const cursorPosition = element.selectionStart;
        const originalLength = element.value.length;
        const uppercaseValue = element.value.toUpperCase();
        
        element.value = uppercaseValue;
        
        // Restore cursor position after uppercase conversion
        // Account for any length changes (though uppercase shouldn't change length)
        const newCursorPosition = cursorPosition + (uppercaseValue.length - originalLength);
        element.setSelectionRange(newCursorPosition, newCursorPosition);
    }
    
    // Initialize on DOM ready
    function initializeHandler() {
        console.log('[FULL-ADDRESS-TRUNC] Initializing handler...');
        setupFullAddressTruncUppercase();
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHandler);
    } else {
        initializeHandler();
    }
    
    // Re-initialize when fragments are loaded
    document.addEventListener('smartui:fragmentsReady', function() {
        console.log('[FULL-ADDRESS-TRUNC] SmartUI fragments ready, setting up handler...');
        setTimeout(setupFullAddressTruncUppercase, 100);
    });
    
    document.addEventListener('lowerFragment:ready', function() {
        console.log('[FULL-ADDRESS-TRUNC] Lower fragment ready, setting up handler...');
        setTimeout(setupFullAddressTruncUppercase, 100);
    });
    
    // Expose public API
    window.FullAddressTruncHandler = {
        setup: setupFullAddressTruncUppercase
    };
    
})();