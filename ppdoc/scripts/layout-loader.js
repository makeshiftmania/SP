function loadPPDOCLayout({ lowerImage, coreImage, lowerFragment, coreFragment, backgroundFragment }) {
    const backgroundFields = document.getElementById('background-fields');
    const lower = document.getElementById('lowerbox');
    const core = document.getElementById('corebox');
    const lowerFields = document.getElementById('lowerbox-fields');
    const coreFields = document.getElementById('corebox-fields');
    
  
    lower.style.opacity = 0;
    core.style.opacity = 0;
  
    setTimeout(() => {
      lower.src = lowerImage;
      core.src = coreImage;
      lower.onload = () => lower.style.opacity = 1;
      core.onload = () => core.style.opacity = 1;
    }, 150);
  
    fetch(backgroundFragment)
      .then(res => res.text())
      .then(html => backgroundFields.innerHTML = html);

    fetch(lowerFragment)
      .then(res => res.text())
      .then(html => lowerFields.innerHTML = html);
    
    fetch(coreFragment)
      .then(res => res.text())
      .then(html => coreFields.innerHTML = html)
      .then(() => {
       // all three fetch chains completed
       document.dispatchEvent(new Event('smartui:fragmentsReady'));
       });
    
  }

// Function to load core fragments when navigation buttons are clicked
function loadCoreFragment(element) {
    const core = document.getElementById('corebox');
    const coreFields = document.getElementById('corebox-fields');
    const fragmentPath = '../fragments/' + element.dataset.fragment;
    const imagePath = '../images/' + element.dataset.image;
    
    // Reset all core nav buttons to active state (normal state)
    const allCoreButtons = document.querySelectorAll('.nav-button[data-fragment]');
    allCoreButtons.forEach(btn => {
        const prefix = btn.dataset.imgprefix;
        btn.src = `../images/buttons/${prefix}-active.png`;
        btn.dataset.mode = 'standard'; // Make them hoverable (changed from 'active' to 'standard')
    });
    
    // Set clicked button to rollover state (to show it's current)
    const prefix = element.dataset.imgprefix;
    element.src = `../images/buttons/${prefix}-rollover.png`;
    element.dataset.mode = 'always'; // Keep it in rollover state, no hover effect
    
    // Fade out core image
    core.style.opacity = 0;
    
    setTimeout(() => {
        // Change the core background image
        core.src = imagePath;
        core.onload = () => core.style.opacity = 1;
    }, 150);
    
    // Load the new fragment
    fetch(fragmentPath)
        .then(res => res.text())
        .then(html => coreFields.innerHTML = html)
        .then(() => {
            // Dispatch event when fragment is ready
            document.dispatchEvent(new Event('smartui:fragmentsReady'));
        })
        .catch(error => {
            console.error('Error loading core fragment:', error);
        });
}

// Function to load just the lower section (used by dropdown and other triggers)
function loadLowerSection(lowerImage, lowerFragment, preserveSelection = null) {
    const lower = document.getElementById('lowerbox');
    const lowerFields = document.getElementById('lowerbox-fields');
    
    if (!lower || !lowerFields) {
        console.error('[LAYOUT-LOADER] Lower elements not found');
        return;
    }
    
    console.log('[LAYOUT-LOADER] Loading lower section:', lowerFragment);
    
    // Fade out lower image (consistent with main loader)
    lower.style.opacity = 0;
    
    setTimeout(() => {
        // Change the lower background image
        lower.src = lowerImage;
        lower.onload = () => lower.style.opacity = 1;
    }, 150); // Same timing as existing system
    
    // Load the new lower fragment
    fetch(lowerFragment)
        .then(res => res.text())
        .then(html => {
            lowerFields.innerHTML = html;
            
            // If we need to preserve a selection (like dropdown value), do it after DOM update
            if (preserveSelection) {
                setTimeout(() => {
                    const dropdown = document.getElementById('replacementKeyReason');
                    if (dropdown) {
                        dropdown.value = preserveSelection;
                        console.log('[LAYOUT-LOADER] Restored selection to:', preserveSelection);
                    }
                }, 50);
            }
            
            // Dispatch event that lower fragment is ready
            document.dispatchEvent(new Event('lowerFragment:ready'));
        })
        .catch(error => {
            console.error('[LAYOUT-LOADER] Error loading lower fragment:', error);
        });
}
  
      // Default load on page open
      window.onload = function () {
      loadPPDOCLayout({
    lowerImage: '../images/lower-default.png',
    coreImage: '../images/core-customerinfo.png',
    lowerFragment: '../fragments/lower-default.html',
    coreFragment: '../fragments/core-customerinfo.html',
    backgroundFragment: '../fragments/bg-shell.html'
  });
      };