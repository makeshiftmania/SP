/**
 * Prepayment Payments PID Tutorial Manager
 * 
 * Handles the simple two-step tutorial on bronze/prepaymentpaymentsPID.html.
 * Step 1 – default background (prepaymentpaymentsPIDbronze.png)
 * Step 2 – after clicking "Request Barcode" button, swap to prepaymentpaymentsPIDbronze2.png.
 */

// Tutorial state management
const pidTutorialState = {
  // Current step in the tutorial
  currentStep: 1,

  // Total number of steps in the tutorial
  totalSteps: 2,

  // Configuration for each step
  steps: {
    1: {
      backgroundImage: '../images/prepaymentpaymentsPIDbronze.png'
    },
    2: {
      backgroundImage: '../images/prepaymentpaymentsPIDbronze2.png'
    }
  },

  /**
   * Advance to the next step in the tutorial
   */
  nextStep: function () {
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
   * @param {number} stepNumber – desired tutorial step (1-based)
   */
  goToStep: function (stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
      this.updateUI();
      console.log(`Jumped to tutorial step ${this.currentStep}`);
    }
  },

  /**
   * Update the UI based on the current tutorial step
   */
  updateUI: function () {
    const step = this.steps[this.currentStep];

    // Update background image
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.style.backgroundImage = `url('${step.backgroundImage}')`;
    }
  },

  /**
   * Initialize the tutorial – set up listeners & initial state
   */
  init: function () {
    this.setupEventListeners();
    this.updateUI();
    console.log('PID Tutorial manager initialized');
  },

  /**
   * Set up event listeners for tutorial navigation
   */
  setupEventListeners: function () {
    // Listen for Request Barcode button click to advance to step 2
    const requestBarcodeBtn = document.getElementById('requestBarcodeBtn');
    if (requestBarcodeBtn) {
      requestBarcodeBtn.addEventListener('click', () => {
        // Allow any existing functionality to complete first, then switch background
        setTimeout(() => {
          this.goToStep(2);
        }, 300);
      });
    }
  }
};

// Initialise the tutorial when the DOM is ready and on the correct page
document.addEventListener('DOMContentLoaded', () => {
  if (
    document.body.getAttribute('data-level') === 'bronze' &&
    window.location.pathname.includes('prepaymentpaymentsPID.html')
  ) {
    pidTutorialState.init();
  }
}); 