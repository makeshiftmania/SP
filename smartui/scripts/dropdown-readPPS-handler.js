// --- Dropdown Handler for #readPPS_Display_Latest_Stored_Values ---
// Handles dropdown/radio sync and localStorage persistence

document.addEventListener("DOMContentLoaded", function() {
    // Get the dropdown elements
    const dropdown = document.getElementById("readPPS_Display_Latest_Stored_Values");
    if (!dropdown) {
        console.error("Dropdown element #readPPS_Display_Latest_Stored_Values not found!");
        return;
    }
    const selectedOptionDiv = dropdown.querySelector(".selected-option");
    const optionsContainer = dropdown.querySelector(".dropdown-options");
    if (!selectedOptionDiv || !optionsContainer) {
         console.error("Dropdown structure error: .selected-option or .dropdown-options not found within #readPPS_Display_Latest_Stored_Values.");
         return;
    }
  
    // --- Load saved value from localStorage on page load ---
    const savedValue = localStorage.getItem('readPPS_Display_Latest_Stored_Values');
    if (savedValue) {
        const option = optionsContainer.querySelector(`[data-value="${savedValue}"]`);
        if (option) {
            selectedOptionDiv.textContent = option.textContent;
        } else {
            console.warn(`Saved value "${savedValue}" not found in dropdown options`);
        }
    }
  
    // --- Function to synchronize radio buttons based on dropdown value/text ---
    function syncRadioButtonsToDropdown(selectedValueOrText) {
        let radioToCheck = null;
        if (selectedValueOrText === "DisplayLatestStoredValues") {
             radioToCheck = document.querySelector("input[name='readMode'][value='latest']");
        } else if (selectedValueOrText === "NONE") {
            document.querySelectorAll("input[name='readMode']").forEach(radio => radio.checked = false);
            return;
        }
        if (radioToCheck) {
            radioToCheck.checked = true;
        }
    }
  
    // Toggle dropdown options visibility when the selected option is clicked
    selectedOptionDiv.addEventListener("click", function() {
        optionsContainer.style.display = optionsContainer.style.display === "block" ? "none" : "block";
    });
  
    // When an option is clicked, update the selected option, sync radio, and hide dropdown
    optionsContainer.addEventListener("click", function(e) {
        if (e.target && e.target.matches("div[data-value]")) { 
            const clickedText = e.target.textContent;
            const clickedValue = e.target.dataset.value;
  
            selectedOptionDiv.textContent = clickedText;
            optionsContainer.style.display = "none";
  
            // --- Save selected value to localStorage ---
            if (clickedValue) {
                localStorage.setItem('readPPS_Display_Latest_Stored_Values', clickedValue);
            }
  
            // --- Sync radio buttons based on the clicked option's data-value ---
            syncRadioButtonsToDropdown(clickedValue); 
        }
    });
  
    // Optional: Close the dropdown if clicked outside
    document.addEventListener("click", function(e) {
        if (!dropdown.contains(e.target)) {
            optionsContainer.style.display = "none";
        }
    });
  
    // --- Initial synchronization on page load ---
    // Sync based on the default text in the dropdown (after possible localStorage restore)
    const initialSelectedText = selectedOptionDiv.textContent.trim();
    syncRadioButtonsToDropdown(initialSelectedText);
  });