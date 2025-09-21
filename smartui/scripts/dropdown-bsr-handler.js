// --- General Handler for ALL elements with class="custom-dropdown" ---
document.addEventListener("DOMContentLoaded", () => {
    // General handler for all elements with class 'custom-dropdown'
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    if (!dropdowns.length) {
        console.warn('No custom-dropdown elements found on the page');
        return;
    }

    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.selected-option');
        const optionsList = dropdown.querySelector('.dropdown-options');
        
        if (!selected || !optionsList) {
            console.error('Dropdown structure is invalid. Missing required elements:', {
                dropdown: dropdown.id || 'unnamed',
                hasSelected: !!selected,
                hasOptionsList: !!optionsList
            });
            return;
        }

        // Toggle dropdown visibility
        selected.addEventListener('click', () => {
            const isOpen = optionsList.style.display === "block";
            
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown-options').forEach(list => {
                if (list !== optionsList) {
                    list.style.display = "none";
                }
            });
            
            optionsList.style.display = isOpen ? "none" : "block";
        });

        // Handle option selection
        const options = optionsList.querySelectorAll('div');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                // Allow even blank values, just warn if undefined (not missing or empty)
                if (value === undefined) {
                  console.warn('Option clicked has no data-value attribute:', option);
                  return;
                }
                
                selected.textContent = option.textContent;
                optionsList.style.display = "none";
                
                // Trigger change event
                const event = new Event('change');
                dropdown.dispatchEvent(event);
            });
        });
    });

    // Add a listener to the whole document to close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        // If the click was not inside *any* element with class "custom-dropdown"
        if (!e.target.closest(".custom-dropdown")) {
            // Hide all dropdown option lists
            document.querySelectorAll(".custom-dropdown .dropdown-options").forEach(opt => {
                opt.style.display = "none";
            });
        }
    });
});