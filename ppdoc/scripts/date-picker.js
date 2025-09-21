console.log('[DATE-PICKER] Script loaded');

// date-picker.js - Reusable Calendar Date Picker Component with Internal Icon Expansion
(function() {
    'use strict';
    
    console.log('[DATE-PICKER] Initializing date picker component');
    
    let currentPicker = null;
    let currentField = null;
    let selectedDate = new Date();
    let todayDate = new Date();
    
    // Initialize date picker for fields with data-date-picker attribute
    function initDatePickers() {
        console.log('[DATE-PICKER] initDatePickers called');
        
        const dateFields = document.querySelectorAll('[data-date-picker="true"]');
        console.log('[DATE-PICKER] Found', dateFields.length, 'date picker fields');
        
        dateFields.forEach((field, index) => {
            console.log('[DATE-PICKER] Setting up field', index, ':', field.id);
            setupDateField(field);
        });
    }
    
    function setupDateField(field) {
        console.log('[DATE-PICKER] Setting up field:', field.id);
        
        // Skip if already set up
        if (field.dataset.datePickerSetup === 'true') {
            console.log('[DATE-PICKER] Field already set up, skipping');
            return;
        }
        
        // Mark as set up to prevent duplicates
        field.dataset.datePickerSetup = 'true';
        
        // Set field styling - white background and blue hover border
        field.style.backgroundColor = 'white';
        field.style.transition = 'border-color 0.2s ease, width 0.2s ease';
        
        // Store original field dimensions
        const fieldStyle = window.getComputedStyle(field);
        const originalWidth = parseInt(fieldStyle.width) || 82;
        const expandedWidth = originalWidth + 20; // Add 20px for icon
        
        // Store original width on the field for reference
        field.dataset.originalWidth = originalWidth;
        field.dataset.expandedWidth = expandedWidth;
        
        console.log('[DATE-PICKER] Field dimensions:', {
            originalWidth: originalWidth,
            expandedWidth: expandedWidth
        });
        
        // Create calendar icon element (initially hidden)
        const icon = document.createElement('div');
        icon.className = 'date-picker-icon';
        icon.style.cssText = `
            position: absolute;
            right: 0px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background: url('../images/icons/datepopupicon-active.png') no-repeat center;
            background-size: 20px 20px;
            cursor: pointer;
            z-index: 25;
            display: none;
            pointer-events: none;
        `;
        
        // Position the field container relatively so icon can be positioned absolutely within it
        field.style.position = 'relative';
        
        // Add icon as child of the field's parent, positioned over the field
        field.parentNode.appendChild(icon);
        
        // Position icon relative to field
        function positionIcon() {
            const fieldRect = field.getBoundingClientRect();
            const parentRect = field.parentNode.getBoundingClientRect();
            
            icon.style.position = 'absolute';
            icon.style.left = (fieldRect.left - parentRect.left + field.offsetWidth - 1) + 'px';
            icon.style.top = (fieldRect.top - parentRect.top + (field.offsetHeight / 2) - 0) + 'px';
        }
        
        console.log('[DATE-PICKER] Calendar icon created and positioned');
        
        // Load saved value from localStorage
        loadFieldValue(field);
        
        // Event listeners
        
        // Field focus - expand and show icon
        field.addEventListener('focus', (e) => {
            console.log('[DATE-PICKER] Field focused - expanding and showing icon');
            
            // Expand field width
            field.style.width = expandedWidth + 'px';
            
            // Show and position icon
            icon.style.display = 'block';
            icon.style.pointerEvents = 'auto';
            
            // Position icon after width change
            setTimeout(() => {
                positionIcon();
            }, 10);
        });
        
        // Field blur - collapse and hide icon
        field.addEventListener('blur', (e) => {
            // Small delay to allow icon click to register
            setTimeout(() => {
                console.log('[DATE-PICKER] Field blurred - collapsing and hiding icon');
                
                // Restore original width
                field.style.width = originalWidth + 'px';
                
                // Hide icon
                icon.style.display = 'none';
                icon.style.pointerEvents = 'none';
                
                // Save field value
                saveFieldValue(field);
            }, 150);
        });
        
        // Icon click - open date picker
        icon.addEventListener('click', (e) => {
            console.log('[DATE-PICKER] Calendar icon clicked');
            e.preventDefault();
            e.stopPropagation();
            openDatePicker(field);
        });
        
        // Icon hover effects
        icon.addEventListener('mouseenter', () => {
            icon.style.backgroundImage = "url('../images/icons/datepopupicon-rollover.png')";
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.backgroundImage = "url('../images/icons/datepopupicon-active.png')";
        });
        
        // Blue border on field hover (not icon hover)
        field.addEventListener('mouseenter', () => {
            field.style.borderColor = '#007cbf';
        });
        
        field.addEventListener('mouseleave', () => {
            field.style.borderColor = '';
        });
        
        // Input validation
        field.addEventListener('input', () => {
            validateDateInput(field);
        });
        
        // Store icon reference on field for cleanup
        field._datePickerIcon = icon;
        
        console.log('[DATE-PICKER] Field setup completed for:', field.id);
    }
    
    function openDatePicker(field) {
        console.log('[DATE-PICKER] Opening date picker for field:', field.id);
        
        if (currentPicker) {
            closeDatePicker();
        }
        
        currentField = field;
        
        // Parse current field value or use today
        const fieldValue = field.value.trim();
        if (fieldValue && isValidDateFormat(fieldValue)) {
            selectedDate = parseDateString(fieldValue);
        } else {
            selectedDate = new Date(todayDate);
        }
        
        createCalendarPopup(field);
    }
    
    function createCalendarPopup(field) {
        console.log('[DATE-PICKER] Creating calendar popup with background image');
        
        // Create backdrop/overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'calendar-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 10002;
        `;
        
        const popup = document.createElement('div');
        popup.className = 'calendar-popup';
        popup.style.cssText = `
            position: absolute;
            width: 387px;
            height: 444px;
            background: url('../images/calendarblank.png') no-repeat;
            background-size: 387px 444px;
            z-index: 10003;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
        `;
        
        // Position relative to field
        const fieldStyle = window.getComputedStyle(field);
        const fieldLeft = parseInt(fieldStyle.left) || 0;
        const fieldTop = parseInt(fieldStyle.top) || 0;
        
        popup.style.left = (fieldLeft + 605) + 'px';
        popup.style.top = (fieldTop + 176) + 'px';
        
        // ADD ENTER KEY SUPPORT TO POPUP
        popup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmDate();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeDatePicker();
            }
        });
        
        // Make popup focusable so it can receive key events
        popup.tabIndex = -1;
        
        // Create invisible close button overlay (positioned over the X in the background)
        const closeBtn = document.createElement('div');
        closeBtn.style.cssText = `
            position: absolute;
            right: 15px;
            top: 12px;
            width: 20px;
            height: 20px;
            cursor: pointer;
            z-index: 10;
        `;
        closeBtn.addEventListener('click', closeDatePicker);
        popup.appendChild(closeBtn);
        
        // Create date input overlay (positioned over the input field in background)
        const dateInput = createDateInputOverlay();
        popup.appendChild(dateInput);
        
        // Create calendar grid overlays (positioned over the calendar areas)
        const calendarOverlays = createCalendarOverlays();
        popup.appendChild(calendarOverlays);
        
        // Create button overlays (positioned over the green/red buttons)
        const buttonOverlays = createButtonOverlays();
        popup.appendChild(buttonOverlays);
        
        document.body.appendChild(backdrop);
        document.body.appendChild(popup);
        currentPicker = { popup, backdrop };
        
        // Focus the popup so it can receive keyboard events
        setTimeout(() => {
            popup.focus();
        }, 100);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 0);
        
        console.log('[DATE-PICKER] Calendar popup created with background image and Enter key support');
    }
    
    function createDateInputOverlay() {
        const container = document.createElement('div');
        container.className = 'date-input-overlay';
        container.style.cssText = `
            position: absolute;
            top: 48px;
            left: 28px;
            width: 320px;
            height: 22px;
        `;
        
        // Invisible input field overlay
        const input = document.createElement('input');
        input.className = 'calendar-date-input';
        input.type = 'text';
        input.value = formatDate(selectedDate);
        input.style.cssText = `
            width: 290px;
            height: 22px;
            border: none;
            background: transparent;
            padding: 2px 4px;
            font-size: 13px;
            font-family: "MS Sans Serif", 'Segoe UI', Tahoma, sans-serif;
            box-sizing: border-box;
        `;
        
        // Invisible up arrow overlay
        const upArrow = document.createElement('div');
        upArrow.style.cssText = `
            position: absolute;
            right: 2px;
            top: 1px;
            width: 20px;
            height: 10px;
            cursor: pointer;
            z-index: 5;
        `;
        upArrow.addEventListener('click', () => adjustDate(1));
        
        // Invisible down arrow overlay
        const downArrow = document.createElement('div');
        downArrow.style.cssText = `
            position: absolute;
            right: 2px;
            bottom: 1px;
            width: 20px;
            height: 10px;
            cursor: pointer;
            z-index: 5;
        `;
        downArrow.addEventListener('click', () => adjustDate(-1));
        
        // Event listeners
        input.addEventListener('input', handleDateInputChange);
        
        container.appendChild(input);
        container.appendChild(upArrow);
        container.appendChild(downArrow);
        
        return container;
    }
    
    function createCalendarOverlays() {
        const container = document.createElement('div');
        container.className = 'calendar-overlays';
        container.style.cssText = `
            position: absolute;
            top: 72px;
            left: 29px;
            width: 320px;
            height: 333px;
            overflow-y: auto;
        `;
        
        // Create overlays for 5 months (previous + current + next 3)
        for (let i = -1; i <= 3; i++) {
            const monthOverlay = createMonthOverlay(i);
            container.appendChild(monthOverlay);
        }
        
        // Scroll to show previous and current month initially
        container.scrollTop = 0;
        
        return container;
    }
    
    function createMonthOverlay(monthOffset) {
        const date = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset, 1);
        const container = document.createElement('div');
        container.className = 'month-overlay';
        container.style.cssText = `
            margin-bottom: 5px;
            margin-left: 0px;
        `;
        
        // Month title overlay 
        const monthTitle = document.createElement('div');
        monthTitle.style.cssText = `
            height: 20px;
            text-align: center;
            font-weight: bold;
            color: black;
            font-size: 12px;
            margin-bottom: -5px;
            margin-top: -3px;
            margin-left: -115px;
        `;
        monthTitle.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Day headers (Mo Tu We Th Fr Sa Su)
        const dayHeaders = document.createElement('div');
        dayHeaders.style.cssText = `
            display: grid;
            grid-template-columns: 25px repeat(7, 21px);
            gap: 1px;
            margin-bottom: -1px;
            font-family: Arial, sans-serif;
            font-size: 10px;
            font-weight: bold;
            color: #007cbf;
        `;
        
        // Empty cell for week number column
        const weekHeader = document.createElement('div');
        dayHeaders.appendChild(weekHeader);
        
        // Day name headers
        ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.style.cssText = `
                text-align: center;
                padding: 2px 0;
                height: 16px;
                line-height: 16px;
            `;
            dayHeader.textContent = day;
            dayHeaders.appendChild(dayHeader);
        });
        
        // Calendar grid overlay
        const gridOverlay = createMonthGridOverlay(date);
        
        container.appendChild(monthTitle);
        container.appendChild(dayHeaders);
        container.appendChild(gridOverlay);
        
        return container;
    }
    
    function createMonthGridOverlay(monthDate) {
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: 25px repeat(7, 21px);
            gap: 1px;
            font-size: 11px;
        `;
        
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const firstDay = new Date(year, month, 1);
        
        // Get first Monday of the month view
        const startDate = new Date(firstDay);
        const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        startDate.setDate(firstDay.getDate() - dayOfWeek);
        
        // Create 5 weeks (not 6)
        for (let week = 0; week < 5; week++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + (week * 7));
            
            // Week number cell
            const weekNum = getWeekNumber(weekStart);
            const weekCell = document.createElement('div');
            weekCell.style.cssText = `
                text-align: center;
                padding: 2px;
                color: #007cbf;
                font-size: 10px;
                font-weight: bold;
                height: 16px;
                line-height: 16px;
            `;
            weekCell.textContent = weekNum;
            grid.appendChild(weekCell);
            
            // Days of week
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(weekStart);
                currentDate.setDate(weekStart.getDate() + day);
                
                const dayCell = document.createElement('div');
                dayCell.style.cssText = `
                    text-align: center;
                    padding: 2px;
                    cursor: pointer;
                    height: 20px;
                    line-height: 20px;
                    border-radius: 2px;
                    background: #f2f2f2;
                    border: 1px solid #f2f2f2;
                `;
                
                if (currentDate.getMonth() === month) {
                    dayCell.textContent = currentDate.getDate();
                    dayCell.style.color = 'black';
                    
                    // Highlight today with grey background and orange inner border
                    if (isSameDate(currentDate, todayDate)) {
                        dayCell.style.background = '#f2f2f2';
                        dayCell.style.color = 'black';
                        dayCell.style.fontWeight = 'normal';
                        dayCell.style.boxShadow = 'inset 0 0 0 2px #ffa500';
                        dayCell.style.border = '1px solid #f2f2f2';
                    }
                    
                    // Highlight selected date in grey (unless it's today)
                    if (isSameDate(currentDate, selectedDate) && !isSameDate(currentDate, todayDate)) {
                        dayCell.style.background = '#ddd';
                        dayCell.style.color = 'black';
                        dayCell.style.border = '1px solid #ddd';
                    }
                    
                    dayCell.addEventListener('click', () => selectDate(currentDate));
                } else {
                    // Days from other months - show in light grey with same background
                    dayCell.textContent = currentDate.getDate();
                    dayCell.style.color = '#ccc';
                }
                
                grid.appendChild(dayCell);
            }
        }
        
        return grid;
    }
    
    function createButtonOverlays() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            bottom: 8px;
            right: 8px;
        `;
        
        // Green checkmark button overlay
        const okBtn = document.createElement('div');
        okBtn.style.cssText = `
            position: absolute;
            right: 46px;
            bottom: 6px;
            width: 34px;
            height: 22px;
            cursor: pointer;
            z-index: 20;
        `;
        okBtn.addEventListener('click', confirmDate);
        
        // Red X button overlay
        const cancelBtn = document.createElement('div');
        cancelBtn.style.cssText = `
            position: absolute;
            right: 8px;
            bottom: 6px;
            width: 34px;
            height: 22px;
            cursor: pointer;
            z-index: 20;
        `;
        cancelBtn.addEventListener('click', closeDatePicker);
        
        container.appendChild(okBtn);
        container.appendChild(cancelBtn);
        
        return container;
    }
    
    // Event handlers
    function handleDateInputChange(e) {
        const value = e.target.value;
        if (isValidDateFormat(value)) {
            selectedDate = parseDateString(value);
            refreshCalendars();
        }
    }
    
    function adjustDate(days) {
        selectedDate.setDate(selectedDate.getDate() + days);
        updateDateInput();
        refreshCalendars();
    }
    
    function selectDate(date) {
        selectedDate = new Date(date);
        confirmDate();
    }
    
    function confirmDate() {
        if (currentField) {
            currentField.value = formatDate(selectedDate);
            saveFieldValue(currentField);
            
            // Keep field focused so icon remains visible
            currentField.focus();
        }
        closeDatePicker();
    }
    
    function updateDateInput() {
        const input = currentPicker.popup.querySelector('.calendar-date-input');
        if (input) {
            input.value = formatDate(selectedDate);
        }
    }
    
    function refreshCalendars() {
        const container = currentPicker.popup.querySelector('.calendar-overlays');
        if (container) {
            container.innerHTML = '';
            for (let i = -1; i <= 3; i++) {
                const monthOverlay = createMonthOverlay(i);
                container.appendChild(monthOverlay);
            }
        }
    }
    
    function closeDatePicker() {
        if (currentPicker) {
            document.removeEventListener('click', outsideClickHandler);
            document.body.removeChild(currentPicker.popup);
            document.body.removeChild(currentPicker.backdrop);
            currentPicker = null;
            currentField = null;
        }
    }
    
    function outsideClickHandler(e) {
        if (currentPicker && !currentPicker.popup.contains(e.target)) {
            closeDatePicker();
        }
    }
    
    // Utility functions
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
    function parseDateString(dateStr) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return new Date();
    }
    
    function isValidDateFormat(dateStr) {
        return /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr);
    }
    
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function getWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }
    
    function validateDateInput(field) {
        const value = field.value.trim();
        if (value && !isValidDateFormat(value)) {
            field.style.background = '#ffeeee';
        } else {
            field.style.background = '';
        }
    }
    
    // localStorage functions
    function getStorageKey(field) {
        return field.dataset.datePickerGroup || 'datePickerData';
    }
    
    function loadFieldValue(field) {
        const storageKey = getStorageKey(field);
        const fieldKey = field.dataset.datePickerKey || field.id;
        
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (data[fieldKey]) {
                field.value = data[fieldKey];
            }
        } catch (e) {
            console.warn('[DATE-PICKER] Error loading value:', e);
        }
    }
    
    function saveFieldValue(field) {
        const storageKey = getStorageKey(field);
        const fieldKey = field.dataset.datePickerKey || field.id;
        
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            data[fieldKey] = field.value;
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('[DATE-PICKER] Error saving value:', e);
        }
    }
    
    // Public API
    window.DatePicker = {
        init: initDatePickers,
        setupField: setupDateField
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDatePickers);
    } else {
        initDatePickers();
    }
    
    // Also initialize when fragments are loaded
    document.addEventListener('lowerFragment:ready', function() {
        setTimeout(initDatePickers, 100);
    });
    
    document.addEventListener('smartui:fragmentsReady', function() {
        setTimeout(initDatePickers, 100);
    });
    
})();