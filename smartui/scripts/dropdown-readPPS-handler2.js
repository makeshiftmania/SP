Specific Handler for the "#readPPS_Display_Latest_Stored_Values" dropdown ---
// (This block now includes the check to prevent errors if the element doesn't exist)
document.addEventListener("DOMContentLoaded", () => {
    // Specific handler for readPPS_Display_Latest_Stored_Values dropdown
    const readPPSDropdown = document.getElementById('readPPS_Display_Latest_Stored_Values');
    if (!readPPSDropdown) {
        console.warn('readPPS_Display_Latest_Stored_Values dropdown not found on the page');
        return;
    }

    const selectedElement = readPPSDropdown.querySelector('.selected-option');
    const optionsListElement = readPPSDropdown.querySelector('.dropdown-options');
    
    if (!selectedElement || !optionsListElement) {
        console.error('readPPS dropdown structure is invalid. Missing required elements:', {
            hasSelected: !!selectedElement,
            hasOptionsList: !!optionsListElement
        });
        return;
    }

    // Load saved value from localStorage
    const savedValue = localStorage.getItem('readPPS_Display_Latest_Stored_Values');
    if (savedValue) {
        const option = optionsListElement.querySelector(`[data-value="${savedValue}"]`);
        if (option) {
            selectedElement.textContent = option.textContent;
        } else {
            console.warn(`Saved value "${savedValue}" not found in dropdown options`);
        }
    }

    // Save selected value to localStorage
    readPPSDropdown.addEventListener('change', () => {
        const selectedOption = selectedElement.textContent;
        const optionElement = optionsListElement.querySelector(`[data-value="${selectedOption}"]`);
        
        if (optionElement) {
            const value = optionElement.dataset.value;
            if (value) {
                localStorage.setItem('readPPS_Display_Latest_Stored_Values', value);
                console.log(`Saved value "${value}" to localStorage`);
            } else {
                console.warn('Selected option has no data-value attribute:', optionElement);
            }
        } else {
            console.warn('Could not find option element for selected text:', selectedOption);
        }
    });
});