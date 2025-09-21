/**
 * Bronze Tutorial Manager
 * 
 * This script manages the tutorial state for bronze level pages.
 * It handles transitions between different tutorial steps by updating
 * the background image.
 */

// Tutorial state management
const tutorialState = {
  // Current step in the tutorial
  currentStep: 1,
  
  // Total number of steps in the tutorial
  totalSteps: 5,
  
  // Configuration for each step
  steps: {
    1: {
      backgroundImage: '../images/readprepaymentsettingsbronze.png'
    },
    2: {
      backgroundImage: '../images/readprepaymentsettingsbronze2.png'
    },
    3: {
      backgroundImage: '../images/readprepaymentsettingsbronze3.png'
    },
    4: {
      backgroundImage: '../images/readprepaymentsettingsbronze4.png'
    },
    5: {
      backgroundImage: '../images/readprepaymentsettingsbronze5.png'
    }
  },
  
  /**
   * Advance to the next step in the tutorial
   */
  nextStep: function() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateUI();
      console.log(`Advanced to tutorial step ${this.currentStep}`);
    } else {
      console.log('Tutorial completed');
    }
  },
  
  /**
   * Go to a specific step in the tutorial
   */
  goToStep: function(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
      this.updateUI();
      console.log(`Jumped to tutorial step ${this.currentStep}`);
    }
  },
  
  /**
   * Update the UI based on the current tutorial step
   */
  updateUI: function() {
    const step = this.steps[this.currentStep];
    
    // Update background image
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.style.backgroundImage = `url('${step.backgroundImage}')`;
    }
  },
  
  /**
   * Initialize the tutorial
   */
  init: function() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI for initial state
    this.updateUI();
    
    console.log('Tutorial manager initialized');
  },
  
  /**
   * Set up event listeners for tutorial navigation
   */
  setupEventListeners: function() {
    // Listen for execute button click to advance to step 2
    const executeButton = document.getElementById('executeStoredReads');
    if (executeButton) {
      executeButton.addEventListener('click', () => {
        // Wait a short time to allow any existing functionality to complete
        setTimeout(() => {
          this.goToStep(2);
        }, 500);
      });
    }
    
    // Listen for meter balance tutorial button to advance to step 3
    const meterBalanceButton = document.getElementById('meterbalancetutorial');
    if (meterBalanceButton) {
      meterBalanceButton.addEventListener('click', () => {
        this.goToStep(3);
      });
    }
    
    // Listen for emergency credit tutorial button to advance to step 4
    const emergencyCreditButton = document.getElementById('emergencycredittutorial');
    if (emergencyCreditButton) {
      emergencyCreditButton.addEventListener('click', () => {
        this.goToStep(4);
      });
    }
    
    // Listen for NDCID tutorial button to advance to step 5
    const ndcidButton = document.getElementById('ndcidtutorial');
    if (ndcidButton) {
      ndcidButton.addEventListener('click', () => {
        this.goToStep(5);
      });
    }
  }
};

// Initialize the tutorial when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if this is a bronze level page AND specifically the readprepaymentsettings page
  if (document.body.getAttribute('data-level') === 'bronze' && 
      window.location.pathname.includes('readprepaymentsettings.html')) {
    tutorialState.init();
  }
}); 