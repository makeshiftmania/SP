// dropdown-system.js - Unified Dropdown System
// Combines functionality from dropdown-handler.js, dropdown-core.js, and dropdown-lower.js
// Created: June 2025

(function() {
    'use strict';
    
    // Debug mode - enable with localStorage.setItem('dropdown_debug', 'true')
    const DEBUG = localStorage.getItem('dropdown_debug') === 'true';
    const log = DEBUG ? console.log.bind(console, '[DROPDOWN-SYSTEM]') : () => {};
    const warn = console.warn.bind(console, '[DROPDOWN-SYSTEM]');
    const error = console.error.bind(console, '[DROPDOWN-SYSTEM]');
    
    // Feature detection
    const requiredFeatures = ['addEventListener', 'CustomEvent'];
    const missing = requiredFeatures.filter(feature => !window[feature]);
    
    // Check for querySelector on document
    if (!document.querySelector) {
        missing.push('querySelector');
    }
    
    if (missing.length) {
        error('Missing browser features:', missing);
        return;
    }
    
    // Namespace protection - backup existing system
    if (window.dropdownCore && !window.dropdownCore._unified) {
        warn('Existing dropdown system detected, creating backup');
        window.dropdownCore_backup = window.dropdownCore;
    }
    
    // Main dropdown system object
    const dropdownSystem = {
        version: '1.0.0',
        _unified: true,
        initialized: false,
        dropdowns: new Map(), // Track all dropdown instances
        
        // Constants
        OPEN_CLASS: 'open',
        
        // Fragment switching configuration
        fragmentMap: {
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
        },
        
        // Initialize system
        init() {
            if (this.initialized) {
                log('Already initialized, skipping');
                return;
            }
            
            log('Initializing unified dropdown system v' + this.version);
            
            // Set up event listeners first (don't wait for dropdowns to exist)
            this.setupEventListeners();
            this.initialized = true;
            log('Initialization complete');
        },
        
        // Setup all event listeners
        setupEventListeners() {
            // Initialize on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeAllDropdowns());
            } else {
                this.initializeAllDropdowns();
            }
            
            // Initialize on fragment events
            document.addEventListener('smartui:fragmentsReady', () => this.initializeFragmentDropdowns());
            document.addEventListener('lowerFragment:ready', () => this.initializeFragmentDropdowns());
            
            // Global click to close dropdowns
            document.addEventListener('click', (e) => this.handleGlobalClick(e));
        },
        
        // Initialize all dropdowns on page
        initializeAllDropdowns() {
            log('Initializing all dropdowns');
            const dropdowns = document.querySelectorAll('.custom-dropdown');
            
            if (!dropdowns.length) {
                log('No dropdowns found yet, will initialize on fragment events');
                return;
            }
            
            dropdowns.forEach(dropdown => this.initializeDropdown(dropdown));
        },
        
        // Initialize fragment-specific dropdowns
        initializeFragmentDropdowns() {
            log('Initializing fragment dropdowns');
            const fragmentDropdowns = document.querySelectorAll('.custom-dropdown');
            
            fragmentDropdowns.forEach(dropdown => {
                if (!this.dropdowns.has(dropdown)) {
                    this.initializeDropdown(dropdown);
                }
            });
            
            // Special handling for replacement key dropdown
            const replacementKeyDropdown = document.getElementById('replacementKeyReason');
            if (replacementKeyDropdown) {
                this.setupFragmentSwitching(replacementKeyDropdown);
            }
        },
        
        // Initialize individual dropdown
        initializeDropdown(dropdown) {
            const id = dropdown.id || 'unnamed_' + Date.now();
            log('Initializing dropdown:', id);
            
            const selected = dropdown.querySelector('.selected-option');
            const optionsList = dropdown.querySelector('.dropdown-options');
            
            if (!selected || !optionsList) {
                error('Dropdown structure is invalid. Missing required elements:', {
                    dropdown: id,
                    hasSelected: !!selected,
                    hasOptionsList: !!optionsList
                });
                return;
            }
            
            // Store dropdown info
            const dropdownInfo = {
                element: dropdown,
                selected: selected,
                optionsList: optionsList,
                preserveSelection: dropdown.hasAttribute('data-preserve-selection'),
                fragmentSwitching: dropdown.hasAttribute('data-fragment-switching'),
                lastValue: null
            };
            
            this.dropdowns.set(dropdown, dropdownInfo);
            
            // Setup click handler for selected option
            selected.addEventListener('click', (e) => this.handleSelectedClick(e, dropdown));
            
            // Initialize with existing HTML options (static dropdown)
            this.initializeStaticOptions(dropdown);
            
            log('Dropdown initialized:', id);
        },
        
        // Initialize static HTML options
        initializeStaticOptions(dropdown) {
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            const options = info.optionsList.querySelectorAll('div[data-value]');
            
            options.forEach(option => {
                option.addEventListener('click', (e) => this.handleOptionClick(e, dropdown, option));
            });
            
            // Ensure dropdown starts blank unless it has a preserved value
            if (!info.preserveSelection || !info.lastValue) {
                info.selected.textContent = '';
            }
        },
        
        // Handle click on selected option (toggle dropdown)
        handleSelectedClick(e, dropdown) {
            e.stopPropagation();
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            const isOpen = dropdown.classList.contains(this.OPEN_CLASS);
            
            if (isOpen) {
                this.close(dropdown);
            } else {
                this.open(dropdown);
            }
        },
        
        // Handle option selection
        handleOptionClick(e, dropdown, option) {
            e.stopPropagation();
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            const value = option.dataset.value;
            const label = option.textContent;
            
            if (value === undefined) {
                warn('Option clicked has no data-value attribute:', option);
                return;
            }
            
            this.selectOption(dropdown, value, label);
        },
        
        // Select an option programmatically
        selectOption(dropdown, value, label) {
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            log('Selecting option:', dropdown.id, value, label);
            
            // Update display (show empty for blank values)
            info.selected.textContent = value === '' ? '' : label;
            
            // Store value for preservation
            if (info.preserveSelection) {
                info.lastValue = value;
            }
            
            // Close dropdown
            this.close(dropdown);
            
            // Trigger change event
            const event = new CustomEvent('change', {
                detail: { value: value, label: label },
                bubbles: true
            });
            dropdown.dispatchEvent(event);
            
            log('Option selected and event triggered');
        },
        
        // Open dropdown
        open(dropdown) {
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            log('Opening dropdown:', dropdown.id);
            
            // Close all other dropdowns first
            this.closeAll();
            
            // Open this dropdown
            dropdown.classList.add(this.OPEN_CLASS);
            info.optionsList.style.display = 'block';
        },
        
        // Close specific dropdown
        close(dropdown) {
            const info = this.dropdowns.get(dropdown);
            if (!info) return;
            
            dropdown.classList.remove(this.OPEN_CLASS);
            info.optionsList.style.display = 'none';
        },
        
        // Close all dropdowns
        closeAll() {
            this.dropdowns.forEach((info, dropdown) => {
                if (dropdown.classList.contains(this.OPEN_CLASS)) {
                    this.close(dropdown);
                }
            });
        },
        
        // Handle global clicks (close dropdowns when clicking outside)
        handleGlobalClick(e) {
            // If click was not inside any custom dropdown, close all
            if (!e.target.closest('.custom-dropdown')) {
                this.closeAll();
            }
        },
        
        // Dynamic population (for scenario selector, etc.)
        populate(dropdown, items, onSelect) {
            let info = this.dropdowns.get(dropdown);
            
            // If dropdown not initialized, initialize it now
            if (!info) {
                log('Auto-initializing dropdown for populate():', dropdown.id);
                this.initializeDropdown(dropdown);
                info = this.dropdowns.get(dropdown);
                
                // If still no info, there's a structural problem
                if (!info) {
                    error('Cannot initialize dropdown for populate()');
                    return;
                }
            }
            
            log('Populating dropdown with', items.length, 'items');
            
            // Clear existing options
            info.optionsList.innerHTML = '';
            
            // Create new options
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item.label;
                div.dataset.value = item.value;
                div.addEventListener('click', (e) => {
                    this.handleOptionClick(e, dropdown, div);
                    if (onSelect) {
                        onSelect(item.value, item.label);
                    }
                });
                info.optionsList.appendChild(div);
            });
            
            log('Dropdown populated successfully');
        },
        
        // Setup fragment switching for replacement key dropdown
        setupFragmentSwitching(dropdown) {
            log('Setting up fragment switching for:', dropdown.id);
            
            dropdown.addEventListener('change', (e) => {
                const value = e.detail ? e.detail.value : '';
                
                if (!value || !this.fragmentMap[value]) {
                    return;
                }
                
                log('Fragment switching triggered for value:', value);
                this.loadFragment(this.fragmentMap[value], value);
            });
        },
        
        // Load fragment (for replacement key switching)
        loadFragment(config, selectedValue) {
            const lower = document.getElementById('lowerbox');
            const lowerFields = document.getElementById('lowerbox-fields');
            
            if (!lower || !lowerFields) {
                error('Lower elements not found for fragment switching');
                return;
            }
            
            log('Loading fragment:', config.lowerFragment);
            
            // Fade out lower image
            lower.style.opacity = 0;
            
            setTimeout(() => {
                // Change background image
                lower.src = config.lowerImage;
                lower.onload = () => lower.style.opacity = 1;
            }, 150);
            
            // Load new fragment
            fetch(config.lowerFragment)
                .then(res => res.text())
                .then(html => {
                    lowerFields.innerHTML = html;
                    
                    // Restore dropdown selection after reload
                    setTimeout(() => {
                        const newDropdown = document.getElementById('replacementKeyReason');
                        if (newDropdown && selectedValue) {
                            const selectedOption = newDropdown.querySelector('.selected-option');
                            const matchingOption = newDropdown.querySelector(`[data-value="${selectedValue}"]`);
                            
                            if (selectedOption && matchingOption) {
                                selectedOption.textContent = matchingOption.textContent;
                            }
                        }
                        
                        // Trigger fragment ready event
                        document.dispatchEvent(new Event('lowerFragment:ready'));
                    }, 50);
                })
                .catch(err => {
                    error('Error loading fragment:', err);
                });
        },
        
        // Rollback to previous system
        rollback() {
            if (window.dropdownCore_backup) {
                window.dropdownCore = window.dropdownCore_backup;
                warn('Rolled back to previous dropdown system');
                return true;
            }
            warn('No backup system available for rollback');
            return false;
        },
        
        // Get dropdown info (for debugging)
        getDropdownInfo(dropdown) {
            return this.dropdowns.get(dropdown);
        },
        
        // Get all dropdowns (for debugging)
        getAllDropdowns() {
            return Array.from(this.dropdowns.keys());
        }
    };
    
    // Expose system globally
    window.dropdownSystem = dropdownSystem;
    
    // Backward compatibility - keep existing dropdownCore interface
    window.dropdownCore = {
        _unified: true,
        populate: (wrapper, items, onSelect) => dropdownSystem.populate(wrapper, items, onSelect),
        closeAll: () => dropdownSystem.closeAll(),
        open: (wrapper) => dropdownSystem.open(wrapper)
    };
    
    // Initialize the system
    dropdownSystem.init();
    
    log('Dropdown system loaded and initialized');
    
})();