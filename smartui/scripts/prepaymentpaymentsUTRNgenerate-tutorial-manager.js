/**
 * Prepayment Payments UTRN Generate Tutorial Manager
 * 
 * Handles a simple two-step tutorial on bronze/prepaymentpaymentsUTRNgenerate.html.
 *   • Step 1: default background (prepaymentpaymentsUTRNgeneratedualbronze.png)
 *   • Step 2: after clicking the "Execute" button (id="utrnGenerateExecute"), swap to
 *             prepaymentpaymentsUTRNgeneratedualbronze2.png.
 */

const utrnGenerateTutorialState = {
  // Current step
  currentStep: 1,
  // Total number of steps
  totalSteps: 2,
  // Background mapping
  steps: {
    1: {
      backgroundImage: '../images/prepaymentpaymentsUTRNgeneratedualbronze.png'
    },
    2: {
      backgroundImage: '../images/prepaymentpaymentsUTRNgeneratedualbronze2.png'
    }
  },

  /** Advance to next step */
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateUI();
      console.log(`Advanced to tutorial step ${this.currentStep}`);
    }
  },

  /** Jump to a specific step */
  goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
      this.updateUI();
      console.log(`Jumped to tutorial step ${this.currentStep}`);
    }
  },

  /** Update wrapper background */
  updateUI() {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      const stepCfg = this.steps[this.currentStep];
      wrapper.style.backgroundImage = `url('${stepCfg.backgroundImage}')`;
    }
  },

  /** Initialise: set listeners and initial UI */
  init() {
    this.setupEventListeners();
    this.updateUI();
    console.log('UTRN Generate Tutorial manager initialized');
  },

  /** Button listener */
  setupEventListeners() {
    const executeBtn = document.getElementById('utrnGenerateExecute');
    if (executeBtn) {
      executeBtn.addEventListener('click', () => {
        // Delay slightly to let any original click handling finish
        setTimeout(() => this.goToStep(2), 300);
      });
    }
  }
};

// Auto-init on correct page

document.addEventListener('DOMContentLoaded', () => {
  if (
    document.body.getAttribute('data-level') === 'bronze' &&
    window.location.pathname.includes('prepaymentpaymentsUTRNgenerate.html')
  ) {
    utrnGenerateTutorialState.init();
  }
}); 