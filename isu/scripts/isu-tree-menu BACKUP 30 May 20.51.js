// ISU-tree-menu.js - Tree menu system for ISU interface
console.log('[ISU-TREE] ISU-tree-menu.js loaded');

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION - ADJUST THESE VALUES TO CHANGE APPEARANCE
  // ═══════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    // Tree positioning inside the container
    tree: {
      topMargin: 0,         // Pixels from top of container
      leftMargin: 0,        // Pixels from left of container
    },
    
    // Row appearance
    rows: {
      height: 20,           // Height of each row in pixels
      spacing: 2,           // Spacing between rows
      hoverColor: '#f0f0f0', // Grey hover color
      selectColor: '#d0e7f4', // Blue selection color
    },
    
    // Indentation for each level
    indent: {
      level1: 0,            // Top level folders
      level2: 20,           // Second level items
      level3: 40,           // Third level folders
      level4: 60,           // Fourth level items
    },
    
    // Arrow positioning
    arrows: {
      size: 16,             // Arrow image size
      leftOffset: 2,        // Distance from left edge
      topOffset: 2,         // How far from top of row
    },
    
    // Icon positioning  
    icons: {
      leftGap: 20,          // Space between arrow and icon
      topOffset: 2,         // How far from top of row
      textGap: 6,           // Space between icon and text
    },
    
    // Selection overlay (full-width blue background)
    selection: {
      fullWidth: 671,       // Total container width
    }
  };

  // Icon paths
  const ICONS = {
    arrowRight:   '../images/icons/rightarrow.png',
    arrowDown:    '../images/icons/downarrow.png',
    closedFolder: '../images/icons/closedfolder.png',
    openFolder:   '../images/icons/openfolder.png',
    star:         '../images/icons/star.png',
    whitebox:     '../images/icons/whitebox.png'
  };

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES
  // ═══════════════════════════════════════════════════════════════════
  
  let currentHover = null;      // Currently hovered element
  let currentSelection = null;  // Currently selected element
  let treeContainer = null;     // The tree container element
  let allRows = [];             // All row objects for easy management
  let clickTimeout = null;      // For double-click detection

  // ═══════════════════════════════════════════════════════════════════
  // TREE DATA STRUCTURE
  // ═══════════════════════════════════════════════════════════════════

  const TREE_DATA = {
    favorites: {
      name: 'Favorites',
      type: 'folder',
      expanded: true,
      children: [
        { name: 'PPDOC', type: 'star', link: '../../ppdoc/html/ppdoc-shell.html' },
        { name: 'FPL9', type: 'star', link: 'FPL9.html' },
        { name: 'easibi', type: 'star', link: 'easibi.html' },
        { name: 'Home', type: 'star', link: 'home.html' },
        { name: 'SmartUI', type: 'star', link: '../../smartui/html/openingpage.html' }
      ]
    },
    userMenu: {
      name: 'User Menu for BRUCE BORBOLETA',
      type: 'folder',
      expanded: true,
      children: [
        // Direct whitebox items
        { name: 'Complain DQ Report Mass Overall Check', type: 'whitebox', link: '#' },
        { name: 'ISU Transaction for plan history', type: 'whitebox', link: '#' },
        { name: 'Tcode for invoice simulation', type: 'whitebox', link: '#' },
        { name: 'Create Individual Bill', type: 'whitebox', link: '#' },
        { name: 'Create Payment Scheme', type: 'whitebox', link: '#' },
        { name: 'Create Payment Scheme Requests', type: 'whitebox', link: '#' },
        { name: 'Change Payment Scheme', type: 'whitebox', link: '#' },
        { name: 'Display Print Document', type: 'whitebox', link: '#' },
        { name: 'Reverse Billing Document', type: 'whitebox', link: '#' },
        { name: 'Reversal of Invoicing Documents', type: 'whitebox', link: '#' },
        { name: 'Print/Billing Document Reversal', type: 'whitebox', link: '#' },
        { name: 'Case List with Shortcut Keys', type: 'whitebox', link: '#' },
        { name: 'Change Case', type: 'whitebox', link: '#' },
        { name: 'Display Case', type: 'whitebox', link: '#' },
        
        // Subfolders
        {
          name: 'Z-FL_006',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Create Individual Bill', type: 'whitebox', link: '#' },
            { name: 'Create Individual Simulation', type: 'whitebox', link: '#' },
            { name: 'Create Payment Scheme', type: 'whitebox', link: '#' },
            { name: 'Create Payment Scheme Requests', type: 'whitebox', link: '#' },
            { name: 'Change Payment Scheme', type: 'whitebox', link: '#' },
            { name: 'Stop Payment Scheme', type: 'whitebox', link: '#' },
            { name: 'Display Billing Document', type: 'whitebox', link: '#' },
            { name: 'Bill Correction', type: 'whitebox', link: '#' },
            { name: 'Maintain Rate Data', type: 'whitebox', link: '#' },
            { name: 'Reverse Billing Document', type: 'whitebox', link: '#' },
            { name: 'Reversal of Invoicing Documents', type: 'whitebox', link: '#' },
            { name: 'Print/Billing Document Reversal', type: 'whitebox', link: '#' },
            { name: 'Print/Billing Document Reversal', type: 'whitebox', link: '#' },
            { name: 'Create Bill (individual Creation)', type: 'whitebox', link: '#' },
            { name: 'Single Entry', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z-FL_008',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Display Returns History', type: 'whitebox', link: '#' },
            { name: 'Change Document', type: 'whitebox', link: '#' },
            { name: 'Display Document', type: 'whitebox', link: '#' },
            { name: 'Check Management', type: 'whitebox', link: '#' },
            { name: 'FL-CA Interest on Cash Sec. Deposit', type: 'whitebox', link: '#' },
            { name: 'FL-CA Display Interest Calculation', type: 'whitebox', link: '#' },
            { name: 'Create Security Deposit', type: 'whitebox', link: '#' },
            { name: 'Change Security Deposit', type: 'whitebox', link: '#' },
            { name: 'Display Security Deposit', type: 'whitebox', link: '#' },
            { name: 'Post Document', type: 'whitebox', link: '#' },
            { name: 'Mass Document Change', type: 'whitebox', link: '#' },
            { name: 'Display Document Changes', type: 'whitebox', link: '#' },
            { name: 'Reset Clearing', type: 'whitebox', link: '#' },
            { name: 'Transfer', type: 'whitebox', link: '#' },
            { name: 'Displaying Dunning History', type: 'whitebox', link: '#' },
            { name: 'History of Collection Items', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z-MM_001',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Create Order', type: 'whitebox', link: '#' },
            { name: 'Display PM Order', type: 'whitebox', link: '#' },
            { name: 'CHANGE ORDER', type: 'whitebox', link: '#' },
            { name: 'Charge PM Orders', type: 'whitebox', link: '#' },
            { name: 'Display Connect Object', type: 'whitebox', link: '#' },
            { name: 'Display Premise', type: 'whitebox', link: '#' },
            { name: 'Display Installation', type: 'whitebox', link: '#' },
            { name: 'Display Point of Delivery', type: 'whitebox', link: '#' },
            { name: 'Display Service Provider', type: 'whitebox', link: '#' },
            { name: 'Display Device Loc', type: 'whitebox', link: '#' },
            { name: 'Display Material Serial Number', type: 'whitebox', link: '#' },
            { name: 'Display Register Group', type: 'whitebox', link: '#' },
            { name: 'Display Device Category', type: 'whitebox', link: '#' },
            { name: 'Create Order', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z-MR_004',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Display Portion', type: 'whitebox', link: '#' },
            { name: 'Activate Meter Reading Units', type: 'whitebox', link: '#' },
            { name: 'Display Installation', type: 'whitebox', link: '#' },
            { name: 'List of Sched. Recs', type: 'whitebox', link: '#' },
            { name: 'Manual Monitoring', type: 'whitebox', link: '#' },
            { name: 'Display Device Loc', type: 'whitebox', link: '#' },
            { name: 'Display Point of Delivery', type: 'whitebox', link: '#' },
            { name: 'Display Register Relationships', type: 'whitebox', link: '#' },
            { name: 'Display period consumption', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:PP_001',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Contract Cleaning Program', type: 'whitebox', link: '#' },
            { name: 'Create/Display MDP Claim & Work item', type: 'whitebox', link: '#' },
            { name: 'Maintain Prepayment Document', type: 'whitebox', link: '#' },
            { name: 'Retrieve the MDP-Out Claim Work item', type: 'whitebox', link: '#' },
            { name: 'Display MDP Out claim record', type: 'whitebox', link: '#' },
            { name: 'Maintain Prepayment Document', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:PP_002',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Remote Part of Launch Transaction', type: 'whitebox', link: '#' },
            { name: 'Contract Cleaning Program', type: 'whitebox', link: '#' },
            { name: 'Create/Display MDP Claim & Work item', type: 'whitebox', link: '#' },
            { name: 'Maintain Prepayment Document', type: 'whitebox', link: '#' },
            { name: 'Retrieve the MDP-Out Claim Work item', type: 'whitebox', link: '#' },
            { name: 'Display MDP Out claim record', type: 'whitebox', link: '#' },
            { name: 'Maintain Prepayment Document', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_BI',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Create Individual Bill', type: 'whitebox', link: '#' },
            { name: 'Create Individual Simulation', type: 'whitebox', link: '#' },
            { name: 'Transaction code for Manual Billing', type: 'whitebox', link: '#' },
            { name: 'Display and Release Outsortings', type: 'whitebox', link: '#' },
            { name: 'Reverse Billing Document', type: 'whitebox', link: '#' },
            { name: 'Print/Billing Document Reversal', type: 'whitebox', link: '#' },
            { name: 'Vacant/LTV/Narrative Upload', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_FICA',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Clarification Processing Pmnt Lot', type: 'whitebox', link: '#' },
            { name: 'Display Contract', type: 'whitebox', link: '#' },
            { name: 'Display Contract Account', type: 'whitebox', link: '#' },
            { name: 'Data environ. for business partner', type: 'whitebox', link: '#' },
            { name: 'Stop Payment Scheme', type: 'whitebox', link: '#' },
            { name: 'Post Document', type: 'whitebox', link: '#' },
            { name: 'Transfer', type: 'whitebox', link: '#' },
            { name: 'Display Payment Scheme', type: 'whitebox', link: '#' },
            { name: 'Reverse Document', type: 'whitebox', link: '#' },
            { name: 'FICA - Internal Order Table Maint', type: 'whitebox', link: '#' },
            { name: 'Check Management', type: 'whitebox', link: '#' },
            { name: 'Change Contract Account', type: 'whitebox', link: '#' },
            { name: 'Chg. Contract', type: 'whitebox', link: '#' },
            { name: 'Data environ. for business partner', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_IP',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Sending D131 : Meter Address Update', type: 'whitebox', link: '#' },
            { name: 'Appointment / De-appointment', type: 'whitebox', link: '#' },
            { name: 'Change Service Provider', type: 'whitebox', link: '#' },
            { name: 'Display Service Provider', type: 'whitebox', link: '#' },
            { name: 'T-code for sending req query to MAM', type: 'whitebox', link: '#' },
            { name: 'Create Service Provider', type: 'whitebox', link: '#' },
            { name: 'Process on Missing Read for BEPM', type: 'whitebox', link: '#' },
            { name: 'Transaction for Voluntary Withdrawal', type: 'whitebox', link: '#' },
            { name: 'ET Process Screen', type: 'whitebox', link: '#' },
            { name: 'Disconnection Process', type: 'whitebox', link: '#' },
            { name: 'Sending D0205 to MPAS', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_MM',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Maintain Rate Data', type: 'whitebox', link: '#' },
            { name: 'CHANGE ORDER', type: 'whitebox', link: '#' },
            { name: 'Create Material Serial Number', type: 'whitebox', link: '#' },
            { name: 'Create Register Group', type: 'whitebox', link: '#' },
            { name: 'Full Installation', type: 'whitebox', link: '#' },
            { name: 'Full Removal', type: 'whitebox', link: '#' },
            { name: 'Display Material Serial Number', type: 'whitebox', link: '#' },
            { name: 'Display PM Order', type: 'whitebox', link: '#' },
            { name: 'Display PM orders', type: 'whitebox', link: '#' },
            { name: 'Change Equipment', type: 'whitebox', link: '#' },
            { name: 'Change Functional Location', type: 'whitebox', link: '#' },
            { name: 'Device modification', type: 'whitebox', link: '#' },
            { name: 'Display Material Serial Number', type: 'whitebox', link: '#' },
            { name: 'Appointment / De-appointment', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_MR',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Amend Scheduled Records', type: 'whitebox', link: '#' },
            { name: 'Post Code Matrix Upload/Download', type: 'whitebox', link: '#' },
            { name: 'Single Entry', type: 'whitebox', link: '#' },
            { name: 'Correction of Plausible Results', type: 'whitebox', link: '#' },
            { name: 'Manual Monitoring', type: 'whitebox', link: '#' },
            { name: 'Program to view MR history', type: 'whitebox', link: '#' },
            { name: 'Reverse Meter Reading Order Creation', type: 'whitebox', link: '#' },
            { name: 'Generate SRs of a Record Type', type: 'whitebox', link: '#' },
            { name: 'Agent Calendar Upload/Download', type: 'whitebox', link: '#' },
            { name: 'Customer Post Code table maintenance', type: 'whitebox', link: '#' },
            { name: 'Agent calendar table maintenance', type: 'whitebox', link: '#' },
            { name: 'Execute Order Creation', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:EX_001_PP',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Maintain Prepayment Document', type: 'whitebox', link: '#' },
            { name: 'Create/Display MDP Claim & Work Item', type: 'whitebox', link: '#' },
            { name: 'Retrieve the MDP- Out Claim Work Item', type: 'whitebox', link: '#' },
            { name: 'Settle the MDP IN Requests', type: 'whitebox', link: '#' },
            { name: 'Select MDP Payments to Settle', type: 'whitebox', link: '#' }
          ]
        },
        
        {
          name: 'Z:IP_001',
          type: 'folder',
          expanded: false,
          children: [
            { name: 'Display Point of Delivery', type: 'whitebox', link: '#' },
            { name: 'Monitoring of Process Documents', type: 'whitebox', link: '#' }
          ]
        },
        
        // Additional whitebox items at the end
        { name: 'Create Installment Plan', type: 'whitebox', link: '#' },
        { name: 'Change Installment Plan', type: 'whitebox', link: '#' },
        { name: 'Installment Plan Printing', type: 'whitebox', link: '#' },
        { name: 'ArchiveLink Administration Documents', type: 'whitebox', link: '#' },
        { name: 'End to End MAP Validation Process', type: 'whitebox', link: '#' },
        { name: 'Program Executor', type: 'whitebox', link: '#' },
        { name: 'Authorisation req', type: 'whitebox', link: '#' },
        { name: 'High-risk code authorisation tool', type: 'whitebox', link: '#' },
        { name: 'Edit Table', type: 'whitebox', link: '#' },
        { name: 'Display Last Short Dump', type: 'whitebox', link: '#' },
        { name: 'Short Message', type: 'whitebox', link: '#' },
        { name: 'SAP Business Workplace', type: 'whitebox', link: '#' },
        { name: 'Find in SAP Menu', type: 'whitebox', link: '#' },
        { name: 'Display Own Jobs', type: 'whitebox', link: '#' },
        { name: 'Output Controller', type: 'whitebox', link: '#' },
        { name: 'Display Spool Requests', type: 'whitebox', link: '#' },
        { name: 'SAP Appointment Calendar (Employee)', type: 'whitebox', link: '#' },
        { name: 'SAP (own) Appointment Calendar', type: 'whitebox', link: '#' },
        { name: 'Maintain Users Own Data', type: 'whitebox', link: '#' },
        { name: 'Evaluate Authorisation Check', type: 'whitebox', link: '#' },
        { name: 'Analyse User Buffer', type: 'whitebox', link: '#' },
        { name: 'WF Notification: Edit Work Item', type: 'whitebox', link: '#' },
        { name: 'Asynchronous Method Call in BOR', type: 'whitebox', link: '#' },
        { name: 'Logon to SAPNet', type: 'whitebox', link: '#' },
        { name: 'Short Message', type: 'whitebox', link: '#' },
        { name: 'SAP Business Workspace', type: 'whitebox', link: '#' },
        { name: 'Find in SAP Menu', type: 'whitebox', link: '#' },
        { name: 'Session Manager Menu Tree Display', type: 'whitebox', link: '#' },
        { name: 'Batch Input Monitoring', type: 'whitebox', link: '#' },
        { name: 'Batch Input Log Monitoring', type: 'whitebox', link: '#' },
        { name: 'Session Manager Menu Tree Display', type: 'whitebox', link: '#' },
        { name: 'Display Own Jobs', type: 'whitebox', link: '#' },
        { name: 'SAPoffice: Inbox', type: 'whitebox', link: '#' },
        { name: 'SAPoffice: Outbox', type: 'whitebox', link: '#' },
        { name: 'Output Controller', type: 'whitebox', link: '#' },
        { name: 'Display Spool Requests', type: 'whitebox', link: '#' },
        { name: 'Maintain Users Own Data', type: 'whitebox', link: '#' },
        { name: 'Evaluate Authorisation Check', type: 'whitebox', link: '#' },
        { name: 'Analyse User Buffer', type: 'whitebox', link: '#' },
        { name: 'Case List with Shortcut Keys', type: 'whitebox', link: '#' },
        { name: 'Change Case', type: 'whitebox', link: '#' },
        { name: 'Display Case', type: 'whitebox', link: '#' },
        { name: 'Edit Table', type: 'whitebox', link: '#' },
        { name: 'Display Last Short Dump', type: 'whitebox', link: '#' },
        { name: 'Short Message', type: 'whitebox', link: '#' },
        { name: 'SAP Business Workplace', type: 'whitebox', link: '#' },
        { name: 'Find in SAP Menu', type: 'whitebox', link: '#' },
        { name: 'Display Own Jobs', type: 'whitebox', link: '#' },
        { name: 'Output Controller', type: 'whitebox', link: '#' },
        { name: 'Display Spool Requests', type: 'whitebox', link: '#' },
        { name: 'SAP Appointment Calendar (Employee)', type: 'whitebox', link: '#' },
        { name: 'SAP (own) Appointment Calendar', type: 'whitebox', link: '#' },
        { name: 'Evaluate Authorisation Check', type: 'whitebox', link: '#' },
        { name: 'Analyse User Buffer', type: 'whitebox', link: '#' },
        { name: 'WF Notification: Edit Work Item', type: 'whitebox', link: '#' },
        { name: 'Asynchronous Method Call in BOR', type: 'whitebox', link: '#' },
        { name: 'Logon to SAPNet', type: 'whitebox', link: '#' },
        { name: 'Short Message', type: 'whitebox', link: '#' },
        { name: 'SAP Business Workplace', type: 'whitebox', link: '#' },
        { name: 'Find in SAP Menu', type: 'whitebox', link: '#' },
        { name: 'Session Manager Menu Tree Display', type: 'whitebox', link: '#' },
        { name: 'Batch Input Monitoring', type: 'whitebox', link: '#' },
        { name: 'Batch Input Log Monitoring', type: 'whitebox', link: '#' },
        { name: 'Session Manager Menu Tree Display', type: 'whitebox', link: '#' },
        { name: 'Display Own Jobs', type: 'whitebox', link: '#' },
        { name: 'SAPoffice: Inbox', type: 'whitebox', link: '#' },
        { name: 'SAPoffice: Outbox', type: 'whitebox', link: '#' },
        { name: 'Output Controller', type: 'whitebox', link: '#' },
        { name: 'Display Spool Requests', type: 'whitebox', link: '#' },
        { name: 'Evaluate Authorisation Check', type: 'whitebox', link: '#' },
        { name: 'Analyse User Buffer', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'Transaction for SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' },
        { name: 'SMART UI', type: 'whitebox', link: '#' }
      ]
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

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
  }

  // Sets selection effect with full-width background
  function setSelection(rowObj) {
    clearSelection();
    clearHover();
    
    // Create full-width background overlay
    const overlay = document.createElement('div');
    overlay.className = 'selection-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.top = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = CONFIG.rows.selectColor;
    overlay.style.zIndex = '-1';
    overlay.style.pointerEvents = 'none';
    overlay.style.width = CONFIG.selection.fullWidth + 'px';
    
    // Ensure the row is positioned absolutely
    if (rowObj.element.style.position !== 'absolute') {
      rowObj.element.style.position = 'absolute';
    }
    
    rowObj.element.insertBefore(overlay, rowObj.element.firstChild);
    currentSelection = rowObj;
    
    console.log('[ISU-TREE] Selected:', rowObj.name);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROW CREATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Creates a single row element
  function createRow(item, level, parent = null) {
    const row = document.createElement('div');
    row.className = 'tree-row';
    row.style.position = 'absolute';
    row.style.left = '0';
    row.style.height = CONFIG.rows.height + 'px';
    row.style.width = '100%';
    row.style.cursor = 'pointer';
    row.style.whiteSpace = 'nowrap';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.paddingLeft = CONFIG.indent['level' + level] + 'px';

    const rowObj = {
      element: row,
      level: level,
      name: item.name,
      type: item.type,
      link: item.link,
      expanded: item.expanded || false,
      parent: parent,
      children: [],
      visible: true
    };

    // Arrow (only for folders)
    if (item.type === 'folder') {
      const arrow = document.createElement('img');
      arrow.className = 'tree-arrow';
      arrow.src = rowObj.expanded ? ICONS.arrowDown : ICONS.arrowRight;
      arrow.style.width = CONFIG.arrows.size + 'px';
      arrow.style.height = CONFIG.arrows.size + 'px';
      arrow.style.position = 'absolute';
      arrow.style.left = (CONFIG.indent['level' + level] + CONFIG.arrows.leftOffset) + 'px';
      arrow.style.top = CONFIG.arrows.topOffset + 'px';
      arrow.style.cursor = 'pointer';
      
      arrow.onclick = (e) => {
        e.stopPropagation();
        toggleFolder(rowObj);
      };
      
      row.appendChild(arrow);
      rowObj.arrow = arrow;
    }

    // Icon
    const icon = document.createElement('img');
    icon.className = 'tree-icon';
    
    // Determine icon based on type
    if (item.type === 'folder') {
      icon.src = rowObj.expanded ? ICONS.openFolder : ICONS.closedFolder;
    } else if (item.type === 'star') {
      icon.src = ICONS.star;
    } else if (item.type === 'whitebox') {
      icon.src = ICONS.whitebox;
    }
    
    icon.style.marginLeft = (item.type === 'folder' ? CONFIG.icons.leftGap : 0) + 'px';
    icon.style.marginRight = CONFIG.icons.textGap + 'px';
    icon.style.cursor = 'pointer';
    
    row.appendChild(icon);
    rowObj.icon = icon;

    // Text label
    const text = document.createElement('span');
    text.textContent = item.name;
    text.style.userSelect = 'none';
    text.style.cursor = 'pointer';
    
    // Store link data if item has a link
    if (item.link && (item.type === 'star' || item.type === 'whitebox')) {
      text.setAttribute('data-link', item.link);
    }
    
    row.appendChild(text);
    rowObj.textElement = text;

    // Event handlers
    row.addEventListener('click', (e) => handleRowClick(e, rowObj));
    row.addEventListener('dblclick', (e) => handleRowDoubleClick(e, rowObj));

    return rowObj;
  }

  // Toggle folder open/closed state
  function toggleFolder(folderRow) {
    console.log('[ISU-TREE] Toggling folder:', folderRow.name, 'current expanded:', folderRow.expanded, 'children count:', folderRow.children.length);
    
    folderRow.expanded = !folderRow.expanded;
    
    // Update arrow and icon
    if (folderRow.arrow) {
      folderRow.arrow.src = folderRow.expanded ? ICONS.arrowDown : ICONS.arrowRight;
    }
    if (folderRow.icon) {
      folderRow.icon.src = folderRow.expanded ? ICONS.openFolder : ICONS.closedFolder;
    }
    
    // Update visibility and reposition
    updateVisibility();
    repositionRows();
    
    console.log('[ISU-TREE] Toggled folder:', folderRow.name, 'new expanded:', folderRow.expanded);
  }

  // Update visibility of all rows based on folder states
  function updateVisibility() {
    console.log('[ISU-TREE] Updating visibility...');
    
    function setVisibility(rowObj, visible) {
      rowObj.visible = visible;
      rowObj.element.style.display = visible ? 'flex' : 'none';
      
      console.log('[ISU-TREE] Setting', rowObj.name, 'visible:', visible, 'level:', rowObj.level);
      
      // If this row is not visible, hide all its children
      if (!visible || (rowObj.type === 'folder' && !rowObj.expanded)) {
        rowObj.children.forEach(child => setVisibility(child, false));
      } else {
        // If this row is visible and expanded, show direct children
        rowObj.children.forEach(child => setVisibility(child, true));
      }
    }

    // Start with root items
    allRows.forEach(rowObj => {
      if (rowObj.level === 1) {
        setVisibility(rowObj, true);
      }
    });
    
    console.log('[ISU-TREE] Visibility update complete');
  }

  // Reposition all visible rows
  function repositionRows() {
    let yPos = CONFIG.tree.topMargin;
    
    allRows.forEach(rowObj => {
      if (rowObj.visible) {
        rowObj.element.style.top = yPos + 'px';
        yPos += CONFIG.rows.height + CONFIG.rows.spacing;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLING
  // ═══════════════════════════════════════════════════════════════════

  // Handle single click on row
  function handleRowClick(e, rowObj) {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any pending double-click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    
    // Set selection
    setSelection(rowObj);
    
    console.log('[ISU-TREE] Single click on:', rowObj.name);
  }

  // Handle double click on row
  function handleRowDoubleClick(e, rowObj) {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any pending single-click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    
    if (rowObj.type === 'folder') {
      // Double click on folder toggles it
      toggleFolder(rowObj);
    } else if ((rowObj.type === 'star' || rowObj.type === 'whitebox') && rowObj.link) {
      // Double click on linkable item navigates
      console.log('[ISU-TREE] Double click - navigating to:', rowObj.link);
      if (rowObj.link !== '#') {
        window.location.href = rowObj.link;
      }
    }
  }

  // Handle mouse movement for hover effects
  function handleMouseMove(e) {
    const rect = treeContainer.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Find which row the mouse is over
    let targetRow = null;
    for (const rowObj of allRows) {
      if (rowObj.visible) {
        const elementRect = rowObj.element.getBoundingClientRect();
        const containerRect = treeContainer.getBoundingClientRect();
        const rowTop = elementRect.top - containerRect.top;
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
  // TREE BUILDING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  // Build tree structure recursively
  function buildTreeStructure(items, level, parent = null) {
    const rows = [];
    
    items.forEach(item => {
      const rowObj = createRow(item, level, parent);
      rows.push(rowObj);
      
      if (parent) {
        parent.children.push(rowObj);
      }
      
      // Process children if this is a folder
      if (item.type === 'folder' && item.children) {
        const childRows = buildTreeStructure(item.children, level + 1, rowObj);
        rows.push(...childRows);
      }
    });
    
    return rows;
  }

  // Main tree building function
  function buildTree() {
    console.log('[ISU-TREE] Building tree...');
    
    treeContainer = document.getElementById('tree-container');
    if (!treeContainer) {
      console.error('[ISU-TREE] tree-container element not found');
      return;
    }

    // Clear existing content
    treeContainer.innerHTML = '';
    allRows = [];
    
    // Set up tree container
    treeContainer.style.position = 'relative';
    treeContainer.style.width = '748px';
    treeContainer.style.height = '809px';
    treeContainer.style.left = '15px';
    treeContainer.style.top = '78px';
    treeContainer.style.overflow = 'auto';
    treeContainer.style.margin = '0';
    treeContainer.style.padding = '0';
    treeContainer.style.fontFamily = '"MS Sans Serif", "Segoe UI", Tahoma, sans-serif';

    // Build tree structure
    const treeItems = [TREE_DATA.favorites, TREE_DATA.userMenu];
    allRows = buildTreeStructure(treeItems, 1);

    // Add all rows to container
    allRows.forEach(rowObj => {
      treeContainer.appendChild(rowObj.element);
    });

    // Set up event listeners
    treeContainer.addEventListener('mousemove', handleMouseMove);
    treeContainer.addEventListener('mouseleave', clearHover);

    // Initial state: update visibility and position rows
    updateVisibility();
    repositionRows();

    console.log('[ISU-TREE] Tree built successfully with', allRows.length, 'rows');
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[ISU-TREE] DOM ready, building tree...');
    buildTree();
  });

  // Expose debugging functions
  window.ISU_TREE_DEBUG = {
    config: CONFIG,
    rows: () => allRows,
    clearSelection: clearSelection,
    setSelection: setSelection,
    toggleFolder: toggleFolder,
    updateVisibility: updateVisibility,
    repositionRows: repositionRows
  };

  console.log('[ISU-TREE] Debug functions exposed');

})();