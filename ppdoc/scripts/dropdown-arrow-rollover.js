// dropdown-arrow-rollover.js - Handle dropdown arrow rollover effects
(function() {
    'use strict';
    
    function initializeDropdownArrowRollovers() {
        // Find all custom dropdowns
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        
        dropdowns.forEach(dropdown => {
            const selectedOption = dropdown.querySelector('.selected-option');
            if (!selectedOption) return;
            
            // Add mouse events to the selected option area
            selectedOption.addEventListener('mousemove', function(e) {
                handleMouseMove(e, selectedOption);
            });
            
            selectedOption.addEventListener('mouseleave', function() {
                setArrowState(selectedOption, 'normal');
            });
        });
    }
    
    function handleMouseMove(e, selectedOption) {
        const rect = selectedOption.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Arrow area is roughly the right 22px of the dropdown
        const arrowAreaLeft = rect.width - 22;
        const arrowAreaRight = rect.width;
        const arrowAreaTop = 0;
        const arrowAreaBottom = rect.height;
        
        // Check if mouse is over arrow area
        if (mouseX >= arrowAreaLeft && mouseX <= arrowAreaRight && 
            mouseY >= arrowAreaTop && mouseY <= arrowAreaBottom) {
            setArrowState(selectedOption, 'hover');
        } else {
            setArrowState(selectedOption, 'normal');
        }
    }
    
    function setArrowState(selectedOption, state) {
        // Remove existing arrow state classes
        selectedOption.classList.remove('arrow-hover', 'arrow-normal');
        
        // Add new state class
        if (state === 'hover') {
            selectedOption.classList.add('arrow-hover');
        } else {
            selectedOption.classList.add('arrow-normal');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDropdownArrowRollovers);
    } else {
        initializeDropdownArrowRollovers();
    }
    
    // Also initialize when fragments are loaded
    document.addEventListener('smartui:fragmentsReady', initializeDropdownArrowRollovers);
    document.addEventListener('lowerFragment:ready', initializeDropdownArrowRollovers);
    
})();