// /ppdoc/scripts/tree-menu.js — Updated for collapsed default state
console.log('[TREE] tree-menu.js (COLLAPSED DEFAULT) loaded');

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION - ADJUST THESE VALUES TO CHANGE APPEARANCE
  // ═══════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    // Tree positioning inside the container
    tree: {
      topMargin: 14,        // Pixels from top of container
      leftMargin: 12,       // Pixels from left of container
    },
    
    // Row appearance
    rows: {
      height: 24,           // Height of each row in pixels
      spacing: 0,           // Spacing between rows
      hoverColor: '#f6f6f6', // Grey hover color
      selectColor: '#d0e7f4', // Blue selection color
    },
    
    // Indentation for each level (how far right each level is pushed)
    indent: {
      level1: 0,            // Business Partner level
      level2: 20,           // Contract Account level  
      level3: 40,           // Contract level
      level4: 60,           // Status level (selectable)
    },
    
    // Arrow positioning
    arrows: {
      size: 16,             // Arrow image size
      leftOffset: 2,        // Further from left edge to avoid overlap
      topOffset: 3,         // How far from top of row
    },
    
    // Icon positioning  
    icons: {
      leftGap: 24,          // Space between arrow and icon
      topOffset: 1,         // How far from top of row
      textGap: 6,           // Space between icon and text
    },
    
    // Selection overlay (full-width blue background)
    selection: {
      leftExtend: -17,      // How far left beyond text
      rightExtend: -17,     // How far right beyond text
      fullWidth: 170,       // Total container width
    }
  };

  // Icon paths - change these if you move the images
  const ICONS = {
    arrowRight:   '../images/icons/rightarrow.png',
    arrowDown:    '../images/icons/downarrow.png',
    closedFolder: '../images/icons/closedfolder.png',
    openFolder:   '../images/icons/openfolder.png',
    elec:         '../images/icons/lightbulb.png',
    gas:          '../images/icons/gaspipe.png',
    live:         '../images/icons/greencircle.png',
    closed:       '../images/icons/redcircle.png',
    warning:      '../images/icons/yellowtriangle.png'
  };

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES
  // ═══════════════════════════════════════════════════════════════════
  
  let currentHover = null;      // Currently hovered element
  let currentSelection = null;  // Currently selected element
  let treeRoot = null;          // The tree container element
  let allRows = [];             // All row objects for easy management
  let autoExpandMode = false;   // Whether tree should auto-expand (set by search)
  let autoSelectSupplyType = null; // Which supply type to auto-select after expansion

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Converts offset days to DD.MM.YYYY format
  function calculateAndFormatDate(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  // Determine if account is active/closed using supplystatus and date logic
  function isAccountClosed(fuel) {
    const accountInfo = fuel.accountInfo || {};
    const deviceInfo = fuel.deviceInfo || {};
    
    // Primary check: use supplystatus if available
    const supplyStatus = deviceInfo.supplystatus || accountInfo.supplystatus;
    if (supplyStatus) {
      const status = String(supplyStatus).toLowerCase();
      if (status.includes('off supply')) {
        console.log('[TREE] Account marked as closed by supplystatus:', supplyStatus);
        return true;
      }
      if (status.includes('on supply')) {
        console.log('[TREE] Account marked as active by supplystatus:', supplyStatus);
        return false;
      }
    }
    
    // Fallback: check contract_End date
    const endDate = accountInfo.contract_End;
    if (endDate && endDate.trim() !== '' && endDate !== '31.12.9999') {
      console.log('[TREE] Account marked as closed by end date:', endDate);
      return true;
    }
    
    console.log('[TREE] Account marked as active (no end date or 31.12.9999)');
    return false;
  }

  // Clears all hover effects
  function clearHover() {
    if (currentHover) {
      currentHover.element.style.backgroundColor = '';
      currentHover = null;
    }
  }

  // Sets hover effect on a specific row
  function setHover(rowObj) {
    clearHover();
    if (rowObj !== currentSelection && rowObj.element) {
      rowObj.element.style.backgroundColor = CONFIG.rows.hoverColor;
      currentHover = rowObj;
    }
  }

  // Clears selection effect
  function clearSelection() {
    if (currentSelection) {
      currentSelection.element.style.backgroundColor = '';
      const overlay = currentSelection.element.querySelector('.selection-overlay');
      if (overlay) overlay.remove();
      currentSelection = null;
    }
    window.selectedSupplyType = null;
  }

  // Sets selection effect with full-width background
  function setSelection(rowObj) {
    clearSelection();
    clearHover();
    
    // Create full-width background overlay that goes BEHIND the content
    const overlay = document.createElement('div');
    overlay.className = 'selection-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = CONFIG.selection.leftExtend + 'px';
    overlay.style.right = CONFIG.selection.rightExtend + 'px';
    overlay.style.top = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = CONFIG.rows.selectColor;
    overlay.style.zIndex = '-1';
    overlay.style.pointerEvents = 'none';
    
    // IMPORTANT: Don't change the row's position style
    // rowObj.element.style.position = 'relative'; // This was causing the issue!
    
    // Instead, ensure the row stays absolutely positioned
    if (rowObj.element.style.position !== 'absolute') {
      rowObj.element.style.position = 'absolute';
    }
    
    rowObj.element.insertBefore(overlay, rowObj.element.firstChild);
    currentSelection = rowObj;
    
    window.selectedSupplyType = rowObj.supplyType;
    console.log('[TREE] Selected supply type:', window.selectedSupplyType);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC FUNCTIONS FOR SEARCH INTEGRATION
  // ═══════════════════════════════════════════════════════════════════

  // Function to expand tree and optionally auto-select a supply type
  function expandAndSelect(supplyType = null) {
    console.log(`[TREE] expandAndSelect called with supplyType: ${supplyType}`);
    
    autoExpandMode = true;
    autoSelectSupplyType = supplyType;
    
    // Expand all folders
    allRows.forEach(rowObj => {
      if (rowObj.isFolder) {
        rowObj.collapsed = false;
        if (rowObj.arrow) {
          rowObj.arrow.src = ICONS.arrowDown;
        }
        if (rowObj.icon) {
          rowObj.icon.src = ICONS.openFolder;
        }
      }
    });
    
    // Update visibility and positioning
    updateVisibility();
    repositionRows();
    
    // Auto-select the specified supply type if provided
    if (supplyType) {
      const targetRow = allRows.find(row => 
        row.isSelectable && row.supplyType === supplyType
      );
      
      if (targetRow) {
        setSelection(targetRow);
        console.log(`[TREE] Auto-selected ${supplyType} account`);
      } else {
        console.warn(`[TREE] Could not find ${supplyType} account to select`);
      }
    }
  }

  // Function to reset tree to collapsed state
  function resetToCollapsed() {
    console.log('[TREE] Resetting tree to collapsed state');
    
    autoExpandMode = false;
    autoSelectSupplyType = null;
    clearSelection();
    
    // Collapse all folders
    allRows.forEach(rowObj => {
      if (rowObj.isFolder) {
        rowObj.collapsed = true;
        if (rowObj.arrow) {
          rowObj.arrow.src = ICONS.arrowRight;
        }
        if (rowObj.icon) {
          rowObj.icon.src = ICONS.closedFolder;
        }
      }
    });
    
    // Update visibility and positioning
    updateVisibility();
    repositionRows();
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROW CREATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Creates a single flat row element
  function createFlatRow(label, level, iconPath, isFolder = false, isSelectable = false, supplyType = null, rowIndex) {
    const row = document.createElement('div');
    row.className = 'tree-row';
    row.style.position = 'absolute';
    row.style.left = '0';
    row.style.top = '0'; // Start at 0, will be positioned later
    row.style.height = CONFIG.rows.height + 'px';
    row.style.width = '100%';
    row.style.cursor = 'default';
    row.style.whiteSpace = 'nowrap';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.paddingLeft = CONFIG.indent['level' + level] + 'px';
    row.dataset.rowIndex = String(rowIndex);
    row.dataset.level = String(level);

    const rowObj = {
      element: row,
      level: level,
      isFolder: isFolder,
      isSelectable: isSelectable,
      supplyType: supplyType,
      collapsed: isFolder ? true : false,
      rowIndex: rowIndex,
      label: label // Store label for debugging
    };

    // Arrow (only for folders)
    if (isFolder) {
      const arrow = document.createElement('img');
      arrow.className = 'tree-arrow';
      arrow.src = ICONS.arrowRight;
      arrow.style.width = CONFIG.arrows.size + 'px';
      arrow.style.height = CONFIG.arrows.size + 'px';
      arrow.style.position = 'absolute';
      arrow.style.left = (CONFIG.indent['level' + level] + CONFIG.arrows.leftOffset) + 'px';
      arrow.style.top = CONFIG.arrows.topOffset + 'px';
      arrow.style.cursor = 'pointer';
      arrow.onclick = (e) => {
        console.log('[TREE] Arrow clicked on folder:', rowObj);
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.target === arrow) {
          toggleFolder(rowObj);
        }
      };
      row.appendChild(arrow);
      rowObj.arrow = arrow;
    } else {
      // Spacer for non-folders
      const spacer = document.createElement('div');
      spacer.style.width = CONFIG.icons.leftGap + 'px';
      spacer.style.height = '1px';
      spacer.style.display = 'inline-block';
      row.appendChild(spacer);
    }

    // Icon
    const icon = document.createElement('img');
    icon.className = 'tree-icon';
    icon.src = iconPath;
    icon.style.marginLeft = (isFolder ? CONFIG.icons.leftGap : 0) + 'px';
    icon.style.marginRight = CONFIG.icons.textGap + 'px';
    if (isSelectable) {
      icon.style.cursor = 'pointer';
      icon.onclick = (e) => {
        console.log('[TREE] Selectable icon clicked on row:', rowObj);
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.target === icon) {
          if (currentSelection === rowObj) {
            clearSelection();
          } else {
            setSelection(rowObj);
          }
        }
      };
    }
    row.appendChild(icon);
    rowObj.icon = icon;

    // Text label
    const text = document.createElement('span');
    text.textContent = label;
    text.style.userSelect = 'none';
    row.appendChild(text);

    return rowObj;
  }

  // Toggle folder open/closed state
  function toggleFolder(folderRow) {
    folderRow.collapsed = !folderRow.collapsed;
    
    // Update arrow and icon
    folderRow.arrow.src = folderRow.collapsed ? ICONS.arrowRight : ICONS.arrowDown;
    folderRow.icon.src = folderRow.collapsed ? ICONS.closedFolder : ICONS.openFolder;
    
    // Show/hide children and reposition everything
    updateVisibility();
    repositionRows();
    
    // Debug check after repositioning
    console.log('\n[TREE DEBUG] After toggle, checking actual positions:');
    allRows.forEach((row, i) => {
      if (row.element.style.display !== 'none') {
        const rect = row.element.getBoundingClientRect();
        const parentRect = row.element.parentElement.getBoundingClientRect();
        console.log(`Row ${i} "${row.label}": style.top=${row.element.style.top}, actual relative=${rect.top - parentRect.top}px`);
      }
    });
  }

  // Update visibility of all rows based on folder states
  function updateVisibility() {
    console.log('\n[TREE DEBUG] updateVisibility() starting...');
    
    // Log initial state
    console.log('Folder states:');
    allRows.forEach((row, i) => {
      if (row.isFolder) {
        console.log(`  Row ${i} (${row.label}): ${row.collapsed ? 'COLLAPSED' : 'EXPANDED'}`);
      }
    });
    
    // Start with all rows visible
    allRows.forEach((rowObj, index) => {
      rowObj.element.style.display = 'flex';
    });

    // For each collapsed folder, hide its children
    allRows.forEach((folderRow, folderIndex) => {
      if (folderRow.isFolder && folderRow.collapsed) {
        console.log(`\nProcessing collapsed folder ${folderIndex} (Level ${folderRow.level})`);
        const folderLevel = folderRow.level;
        
        // Hide all rows that come after this folder and are deeper level
        for (let i = folderIndex + 1; i < allRows.length; i++) {
          const childRow = allRows[i];
          
          // If we hit a row at same level or higher, stop
          if (childRow.level <= folderLevel) {
            console.log(`  Stopping at row ${i} (Level ${childRow.level})`);
            break;
          }
          
          // This is a child of the collapsed folder - hide it
          console.log(`  Hiding row ${i} (Level ${childRow.level})`);
          childRow.element.style.display = 'none';
        }
      }
    });
    
    // Log final visibility
    console.log('\nFinal visibility:');
    allRows.forEach((row, i) => {
      const visible = row.element.style.display !== 'none';
      console.log(`  Row ${i} "${row.label}": ${visible ? 'VISIBLE' : 'HIDDEN'}`);
    });
  }

  // Reposition all visible rows
  function repositionRows() {
    let yPos = 0;
    
    console.log('\n[TREE DEBUG] repositionRows() starting...');
    
    // Position each row based on its visibility
    allRows.forEach((rowObj, index) => {
      if (rowObj.element.style.display !== 'none') {
        console.log(`  Setting Row ${index} to position ${yPos}px`);
        rowObj.element.style.top = yPos + 'px';
        
        // Force a style recalculation to prevent layout bugs
        rowObj.element.offsetHeight; // This forces a reflow
        
        yPos += CONFIG.rows.height + CONFIG.rows.spacing;
      }
    });
    
    console.log(`Total height needed: ${yPos}px`);
    
    // Set explicit height on container to prevent overflow issues
    if (treeRoot) {
      treeRoot.style.minHeight = yPos + 'px';
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLING
  // ═══════════════════════════════════════════════════════════════════

  // Handle mouse movement for hover effects
  function handleMouseMove(e) {
    const rect = treeRoot.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Find which row the mouse is over
    let targetRow = null;
    for (const rowObj of allRows) {
      if (rowObj.element.style.display !== 'none') {
        const elementRect = rowObj.element.getBoundingClientRect();
        const treeRect = treeRoot.getBoundingClientRect();
        const rowTop = elementRect.top - treeRect.top;
        const rowBottom = rowTop + elementRect.height;
        
        if (mouseY >= rowTop && mouseY <= rowBottom) {
          targetRow = rowObj;
          break;
        }
      }
    }
    
    if (targetRow && targetRow !== currentHover) {
      setHover(targetRow);
    } else if (!targetRow) {
      clearHover();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN TREE BUILDING FUNCTION
  // ═══════════════════════════════════════════════════════════════════

  // Build default tree with just Business Partner folder (no data)
  function buildDefaultTree() {
    console.log('[TREE] Building default tree (no scenario data)');
    
    treeRoot = document.getElementById('tree-root');
    if (!treeRoot) {
      console.error('[TREE] tree-root element not found');
      return;
    }

    // Clear existing content
    treeRoot.innerHTML = '';
    allRows = [];
    
    // Set up tree container
    treeRoot.style.position = 'relative';
    treeRoot.style.margin = '0';
    treeRoot.style.padding = '0';
    treeRoot.style.paddingTop = CONFIG.tree.topMargin + 'px';
    treeRoot.style.paddingLeft = CONFIG.tree.leftMargin + 'px';

    // Create a simple non-interactive Business Partner folder
    const defaultRow = document.createElement('div');
    defaultRow.className = 'tree-row';
    defaultRow.style.position = 'absolute';
    defaultRow.style.left = '0';
    defaultRow.style.top = '0px';
    defaultRow.style.height = CONFIG.rows.height + 'px';
    defaultRow.style.width = '100%';
    defaultRow.style.cursor = 'default';
    defaultRow.style.whiteSpace = 'nowrap';
    defaultRow.style.display = 'flex';
    defaultRow.style.alignItems = 'center';
    defaultRow.style.paddingLeft = CONFIG.indent.level1 + 'px';

    // Add folder icon (no arrow)
    const icon = document.createElement('img');
    icon.className = 'tree-icon';
    icon.src = ICONS.closedFolder;
    icon.style.marginLeft = CONFIG.icons.leftGap + 'px';
    icon.style.marginRight = CONFIG.icons.textGap + 'px';
    defaultRow.appendChild(icon);

    // Add text label
    const text = document.createElement('span');
    text.textContent = 'Business Partner';
    text.style.userSelect = 'none';
    defaultRow.appendChild(text);

    // Add to tree
    treeRoot.appendChild(defaultRow);
    
    // Store in allRows for consistency
    allRows.push({
      element: defaultRow,
      level: 1,
      isFolder: false, // No arrow, not expandable
      isSelectable: false,
      supplyType: null,
      collapsed: false,
      rowIndex: 0,
      label: 'Business Partner (default)'
    });

    console.log('[TREE] Default tree built successfully');
  }

  function buildTree() {
    console.log('\n[TREE DEBUG] Building tree...');
    
    const raw = localStorage.getItem('smartui_data');
    let data = null;
    
    if (raw) {
      try { 
        data = JSON.parse(raw); 
      } catch (e) { 
        console.error('[TREE] Invalid JSON in smartui_data:', e);
        data = null;
      }
    }
    
    // If no data, show default empty tree with just Business Partner folder
    if (!data) {
      console.log('[TREE] No scenario data - building default tree');
      buildDefaultTree();
      return;
    }

    treeRoot = document.getElementById('tree-root');
    if (!treeRoot) {
      console.error('[TREE] tree-root element not found');
      return;
    }

    // Clear existing content
    treeRoot.innerHTML = '';
    allRows = [];
    
    // Set up tree container
    treeRoot.style.position = 'relative';
    treeRoot.style.margin = '0';
    treeRoot.style.padding = '0';
    treeRoot.style.paddingTop = CONFIG.tree.topMargin + 'px';
    treeRoot.style.paddingLeft = CONFIG.tree.leftMargin + 'px';

    let rowIndex = 0;

    // Level 1: Business Partner
    const bpid = data.customerInfo?.BPID || 'UNKNOWN';
    const bpRow = createFlatRow('Business Partner' + bpid, 1, ICONS.closedFolder, true, false, null, rowIndex++);
    allRows.push(bpRow);
    treeRoot.appendChild(bpRow.element);

    // Process electricity and gas supplies
    const supply = data.supplyInfo || {};
    ['electricity', 'gas'].forEach(fuelKey => {
      const fuel = supply[fuelKey];
      if (!fuel?.accountInfo?.contract_Account) return;

      // Level 2: Contract Account
      const acct = fuel.accountInfo.contract_Account;
      const caRow = createFlatRow('Contract Account0' + acct, 2, ICONS.closedFolder, true, false, null, rowIndex++);
      allRows.push(caRow);
      treeRoot.appendChild(caRow.element);

      // Level 3: Contract (with fuel type icon)
      const contractNum = fuel.accountInfo.contract;
      const contractRow = createFlatRow(
        'Contract00' + contractNum,
        3,
        fuelKey === 'electricity' ? ICONS.elec : ICONS.gas,
        false,
        false,
        null,
        rowIndex++
      );
      allRows.push(contractRow);
      treeRoot.appendChild(contractRow.element);

      // Level 4: Status (selectable) - Updated logic
      const isClosed = isAccountClosed(fuel);
      
      let dateText;
      if (isClosed) {
        // For closed accounts, show the end date
        const endDate = fuel.accountInfo.contract_End;
        dateText = endDate || 'Unknown';
      } else {
        // For active accounts, show the start date
        const startOffset = fuel.accountInfo.contract_Start_Offset;
        dateText = startOffset ? calculateAndFormatDate(startOffset) : 'Unknown';
      }
      
      const statusText = dateText + (isClosed ? 'Shut' : 'Active');
      const statusIcon = isClosed ? ICONS.closed : ICONS.live;
      
      const statusRow = createFlatRow(
        statusText,
        4,
        statusIcon,
        false,
        true,  // Selectable
        fuelKey, // Supply type for pencil button
        rowIndex++
      );
      allRows.push(statusRow);
      treeRoot.appendChild(statusRow.element);
    });

    console.log(`\n[TREE DEBUG] Created ${allRows.length} rows`);
    allRows.forEach((row, i) => {
      console.log(`  Row ${i}: "${row.label}" (Level ${row.level})`);
    });

    // Set up event listeners
    treeRoot.addEventListener('mousemove', handleMouseMove);
    treeRoot.addEventListener('mouseleave', clearHover);

    // Initial state: collapsed (show only Business Partner folder)
    if (!autoExpandMode) {
      resetToCollapsed();
    } else {
      // Auto-expand mode from search
      expandAndSelect(autoSelectSupplyType);
    }

    console.log('[TREE] Flat tree built successfully');
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  // Wait for fragments to load, then build the tree
  document.addEventListener('smartui:fragmentsReady', () => {
    console.log('[TREE] Fragments ready, building flat tree...');
    buildTree();
  }, { once: true });

// Also rebuild tree when new scenarios are loaded
document.addEventListener('scenario:loaded', () => {
  console.log('[TREE] Scenario loaded, rebuilding tree...');
  buildTree();
}, { once: false }); // Note: NOT once:true, we want this to fire every time

  // Expose debugging functions and public API
  window.TREE_DEBUG = {
    checkPositions: () => {
      console.log('\n[TREE DEBUG] Current positions:');
      allRows.forEach((row, i) => {
        const rect = row.element.getBoundingClientRect();
        const parentRect = row.element.parentElement.getBoundingClientRect();
        const visible = row.element.style.display !== 'none';
        console.log(`Row ${i}: visible=${visible}, style.top=${row.element.style.top}, relative=${rect.top - parentRect.top}px, "${row.label}"`);
      });
    },
    config: CONFIG,
    rows: allRows,
    isAccountClosed: isAccountClosed,
    expandAndSelect: expandAndSelect,
    resetToCollapsed: resetToCollapsed
  };

  // Expose public functions for search integration
  window.TREE_API = {
    expandAndSelect: expandAndSelect,
    resetToCollapsed: resetToCollapsed
  };

  console.log('[TREE] Debug functions and API exposed');

})();