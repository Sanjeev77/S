// Main Application Controller - ENHANCED with Investment Data Integration
class FinancialPlannerApp {
  constructor() {
    this.calculator = new FinancialCalculator();
    this.goalsManager = new GoalsManager();
    this.uiManager = new UIManager();
    this.previousResults = null;
    this.userIsScrolling = false;
    this.scrollTimeout = null;
    this.lastTouchTime = 0;
    this.touchEndTimeout = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.uiManager.addCustomStyles();
    this.setupGoToTop();
    this.setupInvestmentSummaryTracking();
    this.setupMobileNavigation();
    this.uiManager.showToast('Financial planner loaded successfully!', 'success');
  }

  // NEW: Setup investment summary tracking
  setupInvestmentSummaryTracking() {
    const investmentFields = ['existing-investments', 'current-sip', 'sip-duration'];
    investmentFields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        input.addEventListener('input', UTILS.debounce(() => {
          this.updateInvestmentSummary();
          this.calculateResults();
        }, 300));
      }
    });
  }

  // NEW: Update investment summary display
  updateInvestmentSummary() {
    const existingInvestments = parseFloat(document.getElementById('existing-investments')?.value) || 0;
    const currentSip = parseFloat(document.getElementById('current-sip')?.value) || 0;
    const sipDuration = parseFloat(document.getElementById('sip-duration')?.value) || 0;
    const returns = parseFloat(document.getElementById('returns')?.value) || 12;
    const timeline = parseFloat(document.getElementById('timeline')?.value) || 15;

    const summaryDiv = document.getElementById('investment-summary');
    if (!summaryDiv) return;

    // Show summary only if there's investment data
    if (existingInvestments > 0 || currentSip > 0) {
      summaryDiv.style.display = 'block';
      
      // Calculate projections
      const projectedExisting = existingInvestments * Math.pow(1 + returns / 100, timeline);
      const monthlyRate = returns / 100 / 12;
      const totalMonths = timeline * 12;
      
      let projectedSip = 0;
      if (currentSip > 0 && monthlyRate > 0) {
        projectedSip = currentSip * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
      }
      
      const totalProjected = projectedExisting + projectedSip;
      
      // Calculate total goal cost for comparison
      const totalGoalCost = Object.values(this.goalsManager.getGoalsData())
        .filter(goal => goal.enabled)
        .reduce((sum, goal) => sum + goal.amount, 0);
      
      const additionalNeeded = Math.max(0, totalGoalCost - totalProjected);
      
      // Update summary elements
      this.uiManager.updateElement('summary-current-value', UTILS.formatCurrency(existingInvestments));
      this.uiManager.updateElement('summary-sip-amount', UTILS.formatCurrency(currentSip));
      this.uiManager.updateElement('summary-projected-value', UTILS.formatCurrency(totalProjected));
      this.uiManager.updateElement('summary-additional-needed', UTILS.formatCurrency(additionalNeeded));
      
    } else {
      summaryDiv.style.display = 'none';
    }
  }

  setupGoToTop() {
    const goToTopBtn = document.getElementById('go-to-top');
    if (!goToTopBtn) {
      console.warn('Go-to-top button not found in DOM');
      return;
    }

    let isScrolling = false;
    const handleScroll = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          goToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
          isScrolling = false;
        });
        isScrolling = true;
      }
    };

    // Add touch event listeners to track user interaction
    let touchStartTime = 0;
    document.addEventListener('touchstart', () => {
      touchStartTime = Date.now();
      this.userIsScrolling = true;
      clearTimeout(this.scrollTimeout);
      clearTimeout(this.touchEndTimeout);
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      this.lastTouchTime = Date.now();
      // Keep userIsScrolling true for longer after touch ends to account for momentum
      this.touchEndTimeout = setTimeout(() => {
        this.userIsScrolling = false;
      }, 2500); // Extended to 2.5 seconds after touch end
      
      // Extra protection: temporarily disable any potential scrollTo calls during momentum
      const originalScrollTo = window.scrollTo;
      window.scrollTo = function(...args) {
        const timeSinceTouch = Date.now() - window.financialPlannerApp.lastTouchTime;
        if (timeSinceTouch < 2000) {
          console.log('Blocked scrollTo during momentum period');
          return; // Block the scroll call
        }
        return originalScrollTo.apply(window, args);
      };
      
      // Restore original scrollTo after momentum period
      setTimeout(() => {
        window.scrollTo = originalScrollTo;
      }, 2500);
    }, { passive: true });
    
    document.addEventListener('touchcancel', () => {
      this.lastTouchTime = Date.now();
      this.touchEndTimeout = setTimeout(() => {
        this.userIsScrolling = false;
      }, 2000);
    }, { passive: true });

    // Add passive listener to improve performance and prevent interference
    window.addEventListener('scroll', (e) => {
      // Track user scrolling to prevent conflicts
      this.userIsScrolling = true;
      clearTimeout(this.scrollTimeout);
      
      // Much longer timeout to account for momentum scrolling
      this.scrollTimeout = setTimeout(() => {
        // Only allow scroll to stop if it's been a while since last touch
        const timeSinceTouch = Date.now() - this.lastTouchTime;
        if (timeSinceTouch > 1500) { // 1.5 seconds since last touch
          this.userIsScrolling = false;
        }
      }, 500); // 500ms after scroll stops
      
      handleScroll(e);
    }, { passive: true });
    handleScroll();

    goToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isMobile = window.innerWidth <= 768;
      window.scrollTo({ 
        top: 0, 
        behavior: isMobile ? 'auto' : 'smooth' 
      });
      this.uiManager.showToast('Scrolled to top', 'info');
    });

    // Handle window resize for mobile navigation
    window.addEventListener('resize', () => {
      this.handleMobileResize();
    });
  }

  // NEW: Setup mobile navigation
  setupMobileNavigation() {
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const homeSection = document.getElementById('home-section');
    const resultsSection = document.getElementById('results-section');
    
    if (!mobileNavItems.length || !homeSection || !resultsSection) return;

    // Initially show home section and hide results on mobile
    this.showMobileSection('home');
    
    // Handle initial page load
    this.handleMobileResize();

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        // Update active nav item
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected section
        this.showMobileSection(section);
        
        // Show appropriate toast message
        const sectionName = section === 'home' ? 'Input Form' : 'Results Dashboard';
        this.uiManager.showToast(`Switched to ${sectionName}`, 'info');
      });
    });
  }

  showMobileSection(section) {
    const homeSection = document.getElementById('home-section');
    const resultsSection = document.getElementById('results-section');
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile || !homeSection || !resultsSection) return;

    // Check if user is actively filling a form
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.tagName === 'SELECT'
    );

    if (section === 'home') {
      homeSection.classList.remove('mobile-hidden');
      resultsSection.classList.add('mobile-hidden');
      // DISABLED: Don't auto-scroll to top on mobile section switch to prevent conflicts
      // Users can use the go-to-top button if they want to scroll up
      // This prevents the finger-lift scroll-to-top issue completely
    } else if (section === 'results') {
      homeSection.classList.add('mobile-hidden');
      resultsSection.classList.remove('mobile-hidden');
      // DISABLED: Complete removal of auto-scroll to prevent finger-lift scroll-to-top issue
      // Users can use the go-to-top button if they want to scroll up
      // This ensures no automatic scrolling interferes with momentum scrolling
    }
  }

  // NEW: Handle window resize for mobile navigation
  handleMobileResize() {
    const homeSection = document.getElementById('home-section');
    const resultsSection = document.getElementById('results-section');
    const isMobile = window.innerWidth <= 768;
    
    if (!homeSection || !resultsSection) return;

    if (!isMobile) {
      // On desktop, show both sections
      homeSection.classList.remove('mobile-hidden');
      resultsSection.classList.remove('mobile-hidden');
    } else {
      // On mobile, maintain current active section
      const activeNavItem = document.querySelector('.mobile-nav-item.active');
      if (activeNavItem) {
        const section = activeNavItem.dataset.section;
        this.showMobileSection(section);
      } else {
        this.showMobileSection('home');
      }
    }
  }

  setupEventListeners() {
    // Enhanced input configurations with investment fields
    const inputConfigs = {
      immediate: ['returns', 'inflation', 'existing-investments', 'current-sip', 'sip-duration'],
      debounced: ['income', 'expenses', 'savings', 'existing-emi'],
      normal: ['age', 'timeline', 'life-expectancy']
    };

    Object.entries(inputConfigs).forEach(([type, ids]) => {
      ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          const handler = type === 'immediate' ? 
            () => this.calculateResults() :
            UTILS.debounce(() => this.calculateResults(), 
              type === 'normal' ? 200 : CONFIG.ui.debounceDelay);
          
          input.addEventListener('input', handler);
        }
      });
    });

    const balanceButton = document.getElementById('balance-button');
    if (balanceButton) {
      balanceButton.addEventListener('click', () => this.showBalanceOptions());
    }

    this.setupActionButtons();
  }

  setupActionButtons() {
    const globalFunctions = {
      shareResults: () => this.shareResults(),
      copyResults: () => this.copyResults(),
      downloadResults: () => this.downloadResults(),
      resetAll: () => this.resetAll(),
      savePlan: () => this.savePlan(),
      addLoan: () => this.addLoan(),
      removeLoan: (loanId) => this.removeLoan(loanId),
      calculateLoanSummary: (loanId) => this.calculateLoanSummary(loanId),
      showBalanceOptions: () => this.showBalanceOptions(),
      closeModal: () => this.uiManager.closeModal(),
      selectPlan: (element) => this.uiManager.selectPlan(element),
      togglePlan: (element) => this.togglePlan(element),
      applyBalancePlan: () => this.applyBalancePlan(),
      previewPlans: () => this.previewPlans(),
      calculateResults: () => this.calculateResults(),
      showToast: (message, type) => this.uiManager.showToast(message, type),
      toggleMultiplePlan: (element) => this.toggleMultiplePlan(element),
      previewSelectedPlans: () => this.previewSelectedPlans(),
      updateSelectionSummary: () => this.updateSelectionSummary(),
      applySelectedPlans: () => this.applySelectedPlans(),
      submitFeedback: () => this.submitFeedback()
    };

    Object.assign(window, globalFunctions);
  }

  submitFeedback() {
    const message = document.getElementById('feedback-message').value.trim();
    const rating = document.querySelectorAll('.star.active').length;
    
    if (rating === 0) {
      this.uiManager.showToast('Please provide a rating', 'warning');
      return;
    }
    
    if (!message) {
      this.uiManager.showToast('Please enter your feedback', 'warning');
      return;
    }

    this.uiManager.showToast('Sending feedback...', 'info');
    
    emailjs.send('service_jwcrvm3', 'template_ivpj2z8', { 
      rating: `${rating}/5 stars`,
      message: message,
      timestamp: new Date().toLocaleString(),
      page_url: window.location.href
    })
    .then(() => {
      this.uiManager.showToast('Thank you for your anonymous feedback!', 'success');
      document.getElementById('feedback-message').value = '';
      document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    })
    .catch((error) => {
      console.error('EmailJS Error:', error);
      this.uiManager.showToast('Failed to send feedback. Please try again.', 'danger');
    });
  }

  toggleMultiplePlan(element) {
    const checkbox = element.querySelector('.plan-checkbox');
    const isSelected = element.classList.contains('selected');
    
    element.classList.toggle('selected', !isSelected);
    element.style.border = isSelected ? '2px solid #e9ecef' : '2px solid var(--primary)';
    element.style.background = isSelected ? '' : 'rgba(102, 126, 234, 0.05)';
    checkbox.checked = !isSelected;
    
    this.updateSelectionSummary();
  }

  updateSelectionSummary() {
    const selectedPlans = document.querySelectorAll('.plan-option.selected');
    const summaryElement = document.getElementById('selection-summary');
    
    if (!summaryElement) return;
    
    if (selectedPlans.length === 0) {
      summaryElement.textContent = 'No plans selected';
      summaryElement.style.color = '#666';
    } else if (selectedPlans.length === 1) {
      const planTitle = selectedPlans[0].querySelector('.plan-title span').textContent;
      summaryElement.innerHTML = `<strong>1 plan selected:</strong> ${planTitle}`;
      summaryElement.style.color = 'var(--primary)';
    } else {
      summaryElement.innerHTML = `<strong>${selectedPlans.length} plans selected</strong> - Multiple optimizations will be applied`;
      summaryElement.style.color = 'var(--primary)';
    }
  }

  previewSelectedPlans() {
    const selectedPlans = document.querySelectorAll('.plan-option.selected');
    
    if (selectedPlans.length === 0) {
      this.uiManager.showToast('Please select at least one plan to preview', 'warning');
      return;
    }

    const planDescriptions = {
      'start-sip-early': '   • Begin aggressive SIP investment strategy\n   • Leverage compound growth over time\n',
      'build-investment-base': '   • Establish strong investment foundation\n   • Focus on equity-heavy portfolio\n',
      'strengthen-portfolio': '   • Increase SIP amounts and diversify\n   • Improve portfolio strength score\n',
      'step-up-sip': '   • Implement annual SIP increase strategy\n   • Match investment growth with income growth\n',
      'optimize-portfolio': '   • Review and rebalance existing investments\n   • Improve tax efficiency and returns\n',
      'reduce-housing': '   • Housing goal will be reduced by 15%\n   • Lower monthly pressure on housing investment\n',
      'extend-timeline': '   • Timeline will be extended by 3 years\n   • Reduced monthly investment requirements\n',
      'increase-income': '   • Income assumption will increase by 15%\n   • More funds available for goal achievement\n'
    };

    let previewText = `Preview of ${selectedPlans.length} selected plan(s):\n\n`;
    
    selectedPlans.forEach((planElement, index) => {
      const planId = planElement.getAttribute('data-plan-id');
      const planTitle = planElement.querySelector('.plan-title span').textContent;
      
      previewText += `${index + 1}. ${planTitle}\n`;
      previewText += planDescriptions[planId] || '   • Custom optimization\n';
      previewText += '\n';
    });

    previewText += 'These changes will be applied simultaneously to optimize your financial balance.';
    
    this.showPreviewModal(previewText);
  }

  showPreviewModal(previewText) {
    const previewModal = document.createElement('div');
    previewModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 10000;
    `;
    
    previewModal.innerHTML = `
      <div style="background: white; padding: 25px; border-radius: 10px; max-width: 500px; 
                  margin: 20px; max-height: 80vh; overflow-y: auto;" 
           onclick="event.stopPropagation()">
        <h3 style="margin: 0 0 15px 0; color: #333;">Plan Preview</h3>
        <pre style="white-space: pre-wrap; font-family: system-ui; font-size: 14px; 
                    line-height: 1.5; color: #555; background: #f8f9fa; padding: 15px; 
                    border-radius: 6px; margin: 15px 0;">${previewText}</pre>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <button id="preview-close-btn" 
                  style="padding: 8px 16px; border: 1px solid #ddd; background: white; 
                         border-radius: 6px; cursor: pointer;">Close</button>
          <button id="preview-apply-btn"
                  style="padding: 8px 16px; background: var(--primary); color: white; 
                         border: none; border-radius: 6px; cursor: pointer;">Apply Now</button>
        </div>
      </div>
    `;
    
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) previewModal.remove();
    });
    
    previewModal.querySelector('#preview-close-btn').addEventListener('click', () => previewModal.remove());
    previewModal.querySelector('#preview-apply-btn').addEventListener('click', () => {
      previewModal.remove();
      this.applySelectedPlans();
    });
    
    document.body.appendChild(previewModal);
  }

  applySelectedPlans() {
    const selectedPlans = document.querySelectorAll('.plan-option.selected');
    
    if (selectedPlans.length === 0) {
      this.uiManager.showToast('Please select at least one plan to apply', 'warning');
      return;
    }

    const planActions = {
      // Investment-focused actions
      'start-sip-early': () => { this.applyStartSipEarly(); return 'SIP strategy initiated'; },
      'build-investment-base': () => { this.applyBuildInvestmentBase(); return 'Investment base enhanced'; },
      'strengthen-portfolio': () => { this.applyStrengthenPortfolio(); return 'Portfolio strengthened'; },
      'step-up-sip': () => { this.applyStepUpSip(); return 'SIP step-up applied'; },
      'optimize-portfolio': () => { this.applyOptimizePortfolio(); return 'Portfolio optimized'; },
      // Standard actions
      'reduce-housing': () => { this.applyHousingReduction(); return 'Housing goal reduced'; },
      'extend-timeline': () => { this.applyTimelineExtension(); return 'Timeline extended'; },
      'increase-income': () => { this.applyIncomeIncrease(); return 'Income increased'; }
    };

    const appliedChanges = [];
    
    selectedPlans.forEach(planElement => {
      const planId = planElement.getAttribute('data-plan-id');
      const action = planActions[planId];
      if (action) {
        appliedChanges.push(action());
      }
    });

    this.uiManager.closeModal();
    
    const message = selectedPlans.length === 1 ? 
      `Applied: ${appliedChanges[0]}` : 
      `Applied ${selectedPlans.length} optimizations: ${appliedChanges.join(', ')}`;
      
    this.uiManager.showToast(message, 'success');
    this.calculateResults();
  }

  // NEW: Investment-focused action methods
  applyStartSipEarly() {
    const currentSipInput = document.getElementById('current-sip');
    if (currentSipInput) {
      const currentSip = parseFloat(currentSipInput.value) || 0;
      const enhancedSip = Math.max(5000, currentSip + 5000);
      currentSipInput.value = enhancedSip;
      this.uiManager.showToast(`SIP increased to ${UTILS.formatCurrency(enhancedSip)} for early wealth building`, 'success');
    }
  }

  applyBuildInvestmentBase() {
    const existingInvestmentsInput = document.getElementById('existing-investments');
    const currentSipInput = document.getElementById('current-sip');
    
    if (existingInvestmentsInput) {
      const current = parseFloat(existingInvestmentsInput.value) || 0;
      const enhanced = current + 100000; // Add 1L to investment base
      existingInvestmentsInput.value = enhanced;
    }
    
    if (currentSipInput) {
      const currentSip = parseFloat(currentSipInput.value) || 0;
      const enhancedSip = Math.max(3000, currentSip + 2000);
      currentSipInput.value = enhancedSip;
    }
    
    this.uiManager.showToast('Investment foundation strengthened with base amount and SIP', 'success');
  }

  applyStrengthenPortfolio() {
    const currentSipInput = document.getElementById('current-sip');
    const returnsInput = document.getElementById('returns');
    
    if (currentSipInput) {
      const currentSip = parseFloat(currentSipInput.value) || 0;
      const strengthenedSip = Math.round(currentSip * 1.5); // 50% increase
      currentSipInput.value = strengthenedSip;
    }
    
    if (returnsInput) {
      const currentReturns = parseFloat(returnsInput.value) || 12;
      const optimizedReturns = Math.min(currentReturns + 1, 16); // Slight improvement through diversification
      returnsInput.value = optimizedReturns;
    }
    
    this.uiManager.showToast('Portfolio strengthened with increased SIP and optimized allocation', 'success');
  }

  applyStepUpSip() {
    const currentSipInput = document.getElementById('current-sip');
    const sipDurationInput = document.getElementById('sip-duration');
    
    if (currentSipInput) {
      const currentSip = parseFloat(currentSipInput.value) || 0;
      const steppedUpSip = Math.round(currentSip * 1.15); // 15% annual step-up simulation
      currentSipInput.value = steppedUpSip;
    }
    
    if (sipDurationInput) {
      const currentDuration = parseFloat(sipDurationInput.value) || 0;
      const enhancedDuration = currentDuration + 1; // Add consistency
      sipDurationInput.value = enhancedDuration;
    }
    
    this.uiManager.showToast('SIP step-up strategy applied with increased amount and duration', 'success');
  }

  applyOptimizePortfolio() {
    const returnsInput = document.getElementById('returns');
    const existingInvestmentsInput = document.getElementById('existing-investments');
    
    if (returnsInput) {
      const currentReturns = parseFloat(returnsInput.value) || 12;
      const optimizedReturns = Math.min(currentReturns + 2, 18); // Better optimization
      returnsInput.value = optimizedReturns;
    }
    
    if (existingInvestmentsInput) {
      const current = parseFloat(existingInvestmentsInput.value) || 0;
      if (current > 0) {
        const optimized = Math.round(current * 1.1); // 10% optimization through rebalancing
        existingInvestmentsInput.value = optimized;
      }
    }
    
    this.uiManager.showToast('Portfolio optimized for better returns and tax efficiency', 'success');
  }

  // ENHANCED: Get form data with investment fields
  getFormData() {
    const getData = (id) => {
      const element = document.getElementById(id);
      const value = element ? parseFloat(element.value) : 0;
      return isNaN(value) || element.value === '' ? 0 : value;
    };

    return {
      age: getData('age'),
      timeline: getData('timeline'), 
      lifeExpectancy: getData('life-expectancy'),
      income: getData('income'),
      expenses: getData('expenses'),
      savings: getData('savings'),
      existingEmi: getData('existing-emi'),
      returns: getData('returns'),
      inflation: getData('inflation'),
      // NEW: Investment data fields
      existingInvestments: getData('existing-investments'),
      currentSip: getData('current-sip'),
      sipDuration: getData('sip-duration'),
      goals: this.goalsManager.getGoalsData()
    };
  }

  calculateResults() {
    try {
      const formData = this.getFormData();
      this.updateInvestmentSummary(); // Update investment summary
      
      // On mobile, check if user is actively filling forms - if so, delay calculations
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          activeElement.tagName === 'SELECT'
        );
        
        // If user is actively typing, delay the calculation to avoid interrupting
        if (isInputFocused) {
          // Use a longer delay to avoid triggering while user is still typing
          clearTimeout(this.calculationDelayTimer);
          this.calculationDelayTimer = setTimeout(() => {
            this.updateProgressiveResults(formData);
          }, 1500); // Wait 1.5 seconds after user stops typing
          return;
        }
      }
      
      this.updateProgressiveResults(formData);
    } catch (error) {
      console.error('Calculation error:', error);
      this.uiManager.showToast('Error in calculations. Please check your inputs.', 'danger');
    }
  }

  // ENHANCED: Progressive results with investment data
  updateProgressiveResults(formData) {
    console.log('Enhanced progressive calculation with investment data:', formData);
    
    try {
      const loanData = this.collectAndStoreLoanData();
      
      // Removed timeline visualization
      
      if (formData.income > 0 && formData.expenses > 0) {
        this.updateEnhancedFinancialHealth(formData, loanData);
      }
      
      this.updateEnhancedLoanBasedInsights(formData, loanData);
      
      const hasActiveGoals = Object.values(formData.goals).some(goal => goal.enabled && goal.amount > 0);
      
      if (hasActiveGoals && formData.income > 0 && formData.expenses > 0) {
        try {
          const results = this.calculator.calculate(formData);
          const insights = this.calculator.generateInsights(formData);
          const scenarios = this.calculator.generateScenarios(formData, results);
          
          console.log('Generated scenarios:', scenarios);
          
          this.uiManager.updateResults(results);
          this.enhanceInsightsWithInvestmentData(formData, loanData, insights, results);
          this.uiManager.updateScenarios(scenarios);
          this.updateEnhancedActionPlans(results);
          
          this.previousResults = { ...results };
        } catch (goalError) {
          console.error('Goal calculation error:', goalError);
        }
      } else {
        this.clearGoalSpecificResults();
      }
      
      this.uiManager.updateVisualization(formData.goals);
      
    } catch (error) {
      console.error('Enhanced progressive results error:', error);
    }
  }


  // ENHANCED: Financial health calculation with investment context
  updateEnhancedFinancialHealth(formData, loanData) {
    const expenseRatio = (formData.expenses / formData.income) * 100;
    const totalEmi = formData.existingEmi || 0;
    const disposableIncome = formData.income - formData.expenses - totalEmi;
    
    // Calculate investment strength
    const investmentStrength = this.calculateInvestmentStrength(formData);
    
    let healthScore = 50;
    
    // Standard financial factors (60% weight)
    const factors = [
      { 
        value: expenseRatio,
        thresholds: [40, 50, 60, 70, 80, 90],
        scores: [15, 10, 5, 0, -10, -20, -25]
      },
      { 
        value: totalEmi > 0 ? (totalEmi / formData.income) * 100 : 0,
        thresholds: [15, 25, 35, 45],
        scores: [5, 0, -10, -20, -25],
        condition: totalEmi > 0
      }
    ];

    factors.forEach(factor => {
      if (factor.condition !== false) {
        for (let i = 0; i < factor.thresholds.length; i++) {
          if (factor.value <= factor.thresholds[i]) {
            healthScore += factor.scores[i];
            break;
          }
        }
        if (factor.value > factor.thresholds[factor.thresholds.length - 1]) {
          healthScore += factor.scores[factor.scores.length - 1];
        }
      }
    });

    // Investment strength bonus (40% weight)
    if (investmentStrength >= 80) healthScore += 25;
    else if (investmentStrength >= 60) healthScore += 20;
    else if (investmentStrength >= 40) healthScore += 15;
    else if (investmentStrength >= 20) healthScore += 10;
    else if (investmentStrength > 0) healthScore += 5;
    
    // Emergency fund factor
    if (formData.savings > 0 && formData.expenses > 0) {
      const emergencyMonths = formData.savings / formData.expenses;
      if (emergencyMonths >= 12) healthScore += 15;
      else if (emergencyMonths >= 6) healthScore += 10;
      else if (emergencyMonths >= 3) healthScore += 5;
      else if (emergencyMonths < 1) healthScore -= 5;
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    // Update UI elements
    this.uiManager.updateElement('financial-health-value', UTILS.formatPercentage(healthScore));
    this.uiManager.updateProgressBar('financial-health-bar', healthScore);
    this.uiManager.updateElement('expense-ratio', UTILS.formatPercentage(expenseRatio));
    this.uiManager.updateProgressBar('expense-progress', expenseRatio);
    
    const savingsRate = disposableIncome > 0 ? (disposableIncome / formData.income) * 100 : 0;
    this.uiManager.updateElement('savings-rate', UTILS.formatPercentage(Math.max(0, savingsRate)));
    
    this.updateEnhancedWorkLifeBalance(formData, loanData, healthScore, investmentStrength);
    
    return healthScore;
  }

  // NEW: Calculate investment strength
  calculateInvestmentStrength(formData) {
    let strength = 0;
    
    // Existing investment base (0-40 points)
    const existingInvestments = formData.existingInvestments || 0;
    if (existingInvestments >= 2000000) strength += 40;
    else if (existingInvestments >= 1000000) strength += 30;
    else if (existingInvestments >= 500000) strength += 20;
    else if (existingInvestments >= 100000) strength += 10;
    else if (existingInvestments > 0) strength += 5;
    
    // SIP consistency (0-35 points)
    const currentSip = formData.currentSip || 0;
    const sipDuration = formData.sipDuration || 0;
    if (currentSip >= 25000 && sipDuration >= 3) strength += 35;
    else if (currentSip >= 15000 && sipDuration >= 2) strength += 25;
    else if (currentSip >= 10000 && sipDuration >= 1) strength += 20;
    else if (currentSip >= 5000) strength += 15;
    else if (currentSip > 0) strength += 10;
    
    // Investment discipline (0-25 points)
    if (sipDuration >= 5) strength += 25;
    else if (sipDuration >= 3) strength += 20;
    else if (sipDuration >= 1) strength += 15;
    else if (sipDuration > 0) strength += 10;
    
    return Math.min(100, strength);
  }

  // ENHANCED: Work-life balance with investment considerations
  updateEnhancedWorkLifeBalance(formData, loanData, healthScore, investmentStrength) {
    const elements = {
      indicator: document.getElementById('balance-indicator'),
      status: document.getElementById('balance-status'),
      button: document.getElementById('balance-button')
    };
    
    if (!elements.indicator || !elements.status || !elements.button) return;
    
    const age = formData.age || 30;
    const lifeStage = this.determineLifeStage(age);
    const balanceAnalysis = this.calculateInvestmentAwareBalance(formData, loanData, lifeStage, investmentStrength);
    
    const meterPosition = balanceAnalysis.needsImprovement ? 
      Math.max(10, 40 - (balanceAnalysis.severity * 8)) :
      Math.min(90, 60 + (balanceAnalysis.positivity * 8));
    
    elements.indicator.style.left = meterPosition + '%';
    elements.status.textContent = balanceAnalysis.statusText;
    elements.status.style.backgroundColor = balanceAnalysis.bgColor;
    elements.status.style.color = balanceAnalysis.textColor;
    elements.button.style.display = balanceAnalysis.needsImprovement ? 'block' : 'none';
    elements.button.textContent = balanceAnalysis.buttonText;
  }

  // ENHANCED: Balance calculation with investment awareness
  calculateInvestmentAwareBalance(formData, loanData, lifeStage, investmentStrength) {
    const totalGoals = Object.values(formData.goals)
      .filter(goal => goal.enabled)
      .reduce((sum, goal) => sum + goal.amount, 0);
    const goalToIncomeRatio = totalGoals / (formData.income * 12);
    const debtBurden = loanData.totalOutstanding > 0 ? 
      (loanData.totalOutstanding / (formData.income * 12)) * 100 : 0;
    
    // Investment-aware analysis
    const analysis = this.getInvestmentAwareLifeStageAnalysis(
      lifeStage, formData, loanData, goalToIncomeRatio, debtBurden, investmentStrength
    );
    
    return analysis;
  }

  // NEW: Investment-aware life stage analysis
  getInvestmentAwareLifeStageAnalysis(lifeStage, formData, loanData, goalToIncomeRatio, debtBurden, investmentStrength) {
    const disposableIncome = formData.income - formData.expenses - (formData.existingEmi || 0);
    const savingsRate = disposableIncome > 0 ? (disposableIncome / formData.income) * 100 : 0;
    
    // Base analysis with investment strength modifier
    switch (lifeStage) {
      case 'early-career':
        return this.analyzeEarlyCareerWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate);
      case 'building':
        return this.analyzeBuildingWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate);
      case 'peak-earning':
        return this.analyzePeakEarningWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate);
      case 'pre-retirement':
        return this.analyzePreRetirementWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate);
      case 'senior':
        return this.analyzeSeniorWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate);
      default:
        return this.createBalanceAnalysis(false, 1, 'Balanced', '#d4edda', '#155724', 'Optimize Balance');
    }
  }

  // Investment-aware life stage analyses
  analyzeEarlyCareerWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate) {
    // Crisis scenarios
    if (debtBurden > 300 || savingsRate < 0) {
      return this.createBalanceAnalysis(true, 4, 'Financial Crisis - Focus on Basics', '#f8d7da', '#721c24', 'Emergency Plan');
    }
    
    // High pressure scenarios
    if (debtBurden > 200 || goalToIncomeRatio > 6 || savingsRate < 5) {
      return this.createBalanceAnalysis(true, 3, 'High Pressure - Build Investment Discipline', '#fff3cd', '#856404', 'Start SIP Journey');
    }
    
    // Investment-based success scenarios
    if (investmentStrength >= 60 && savingsRate >= 20 && debtBurden <= 100) {
      return this.createBalanceAnalysis(false, 3, 'Outstanding Early Investment Success', '#d1ecf1', '#0c5460', 'Accelerate Wealth');
    }
    
    if (investmentStrength >= 40 && savingsRate >= 15) {
      return this.createBalanceAnalysis(false, 2, 'Good Investment Foundation Building', '#d4edda', '#155724', 'Continue Growing');
    }
    
    if (investmentStrength >= 20 || savingsRate >= 10) {
      return this.createBalanceAnalysis(false, 1, 'Investment Journey Started', '#d4edda', '#155724', 'Build Consistency');
    }
    
    return this.createBalanceAnalysis(true, 2, 'Start Investment Discipline', '#e2e3e5', '#495057', 'Begin SIP Journey');
  }

  analyzeBuildingWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate) {
    // Critical scenarios
    if (debtBurden > 400 || savingsRate < 5 || goalToIncomeRatio > 8) {
      return this.createBalanceAnalysis(true, 4, 'Crisis - Reset Investment Strategy', '#f8d7da', '#721c24', 'Restructure Everything');
    }
    
    // High pressure with investment context
    if (debtBurden > 250 || savingsRate < 10 || (goalToIncomeRatio > 6 && investmentStrength < 40)) {
      return this.createBalanceAnalysis(true, 3, 'High Pressure - Strengthen Investments', '#fff3cd', '#856404', 'Boost Portfolio');
    }
    
    // Excellent performance with strong investments
    if (investmentStrength >= 80 && savingsRate >= 25 && debtBurden <= 100) {
      return this.createBalanceAnalysis(false, 3, 'Exceptional Building Success', '#d1ecf1', '#0c5460', 'Maximize Growth');
    }
    
    // Good performance
    if (investmentStrength >= 60 && savingsRate >= 20) {
      return this.createBalanceAnalysis(false, 2, 'Strong Building Phase', '#d4edda', '#155724', 'Maintain Momentum');
    }
    
    if (investmentStrength >= 40 || savingsRate >= 15) {
      return this.createBalanceAnalysis(false, 1, 'Steady Building Progress', '#d4edda', '#155724', 'Enhance Strategy');
    }
    
    return this.createBalanceAnalysis(true, 2, 'Investment Strategy Needs Work', '#e2e3e5', '#495057', 'Strengthen Portfolio');
  }

  analyzePeakEarningWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate) {
    // Peak years with strong investments
    if (investmentStrength >= 80 && savingsRate >= 25 && debtBurden <= 100) {
      return this.createBalanceAnalysis(false, 3, 'Peak Performance Achieved', '#d1ecf1', '#0c5460', 'Maintain Excellence');
    }
    
    // Good peak years performance
    if (investmentStrength >= 60 && savingsRate >= 20) {
      return this.createBalanceAnalysis(false, 2, 'Strong Peak Years Progress', '#d4edda', '#155724', 'Optimize Further');
    }
    
    // Under-optimized peak years
    if (investmentStrength < 60 || savingsRate < 15 || debtBurden > 200) {
      return this.createBalanceAnalysis(true, 3, 'Peak Years Under-Optimized', '#fff3cd', '#856404', 'Maximize Peak Years');
    }
    
    return this.createBalanceAnalysis(false, 1, 'Decent Peak Years Progress', '#d4edda', '#155724', 'Fine-tune Balance');
  }

  analyzePreRetirementWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate) {
    // Retirement readiness with strong portfolio
    if (investmentStrength >= 80 && debtBurden <= 50) {
      return this.createBalanceAnalysis(false, 3, 'Retirement Ready with Strong Portfolio', '#d1ecf1', '#0c5460', 'Enjoy Transition');
    }
    
    // Good retirement preparation
    if (investmentStrength >= 60 && debtBurden <= 100) {
      return this.createBalanceAnalysis(false, 2, 'Good Retirement Preparation', '#d4edda', '#155724', 'Fine-tune Portfolio');
    }
    
    // Retirement concerns
    if (investmentStrength < 60 || debtBurden > 100 || goalToIncomeRatio > 2) {
      return this.createBalanceAnalysis(true, 3, 'Retirement Preparation Concerns', '#fff3cd', '#856404', 'Strengthen Retirement Plan');
    }
    
    return this.createBalanceAnalysis(false, 1, 'Preparing for Retirement', '#d4edda', '#155724', 'Enhance Readiness');
  }

  analyzeSeniorWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate) {
    // Peaceful golden years with strong portfolio
    if (investmentStrength >= 70 && debtBurden <= 25 && (formData.existingEmi || 0) === 0) {
      return this.createBalanceAnalysis(false, 3, 'Peaceful Golden Years with Strong Portfolio', '#d1ecf1', '#0c5460', 'Enjoy Life');
    }
    
    // Concerns about senior years
    if (investmentStrength < 50 || debtBurden > 25 || (formData.existingEmi || 0) > 0) {
      return this.createBalanceAnalysis(true, 4, 'Golden Years Need Simplification', '#f8d7da', '#721c24', 'Simplify for Peace');
    }
    
    return this.createBalanceAnalysis(false, 2, 'Golden Years in Progress', '#d4edda', '#155724', 'Optimize for Enjoyment');
  }

  createBalanceAnalysis(needsImprovement, severity, statusText, bgColor, textColor, buttonText) {
    return {
      needsImprovement,
      severity: needsImprovement ? severity : 1,
      positivity: needsImprovement ? 1 : severity,
      statusText,
      bgColor,
      textColor,
      buttonText,
      recommendations: []
    };
  }

  // ENHANCED: Loan insights with investment context
  updateEnhancedLoanBasedInsights(formData, loanData) {
    const containers = {
      insights: document.getElementById('insights-list'),
      scenarios: document.getElementById('scenarios-list')
    };
    
    const totalEmi = formData.existingEmi || 0;
    const actualDisposableIncome = formData.income - formData.expenses - totalEmi;
    const savingsRate = actualDisposableIncome > 0 ? (actualDisposableIncome / formData.income) * 100 : 0;
    const investmentStrength = this.calculateInvestmentStrength(formData);
    
    const insightId = Date.now();
    let insights = '';
    let scenarios = '';
    
    // Enhanced insights with investment context
    insights += this.generateEnhancedFinancialOverview(formData, totalEmi, actualDisposableIncome, savingsRate, investmentStrength, insightId);
    insights += this.generateInvestmentContextualInsights(formData, savingsRate, actualDisposableIncome, totalEmi, investmentStrength, insightId);
    insights += this.generateEnhancedSavingsAnalysis(formData, investmentStrength, insightId);
    insights += this.generateInvestmentAwareLoanInsights(loanData, formData, investmentStrength, insightId);
    insights += this.generateInvestmentEnhancedEmergencyFund(formData, loanData, investmentStrength, insightId);
    
    // Enhanced scenarios with investment context
    scenarios += this.generateInvestmentAwareLoanScenarios(formData, loanData, investmentStrength, insightId);
    
    if (insights === '') {
      insights = `<div data-id="${insightId}-empty"><p style="text-align: center; color: #6c757d; padding: 20px;">Enter your financial details to see personalized insights</p></div>`;
    }
    
    if (scenarios === '') {
      scenarios = `<div data-id="${insightId}-scenarios-empty"><p style="text-align: center; color: #6c757d; padding: 20px;">Add goals or loan details to see financial scenarios</p></div>`;
    }
    
    containers.insights.innerHTML = insights;
    containers.scenarios.innerHTML = scenarios;
    
    this.forceVisualRefresh(containers.insights, containers.scenarios);
  }

  // ENHANCED: Financial overview with investment context
  generateEnhancedFinancialOverview(formData, totalEmi, actualDisposableIncome, savingsRate, investmentStrength, insightId) {
    if (formData.income <= 0) return '';
    
    const existingInvestments = formData.existingInvestments || 0;
    const currentSip = formData.currentSip || 0;
    const investmentPart = existingInvestments > 0 || currentSip > 0 ? 
      ` | Investments: ${UTILS.formatCurrency(existingInvestments)} + ${UTILS.formatCurrency(currentSip)}/month SIP (Strength: ${investmentStrength}/100)` : '';
    
    return `<div class="insight info" data-id="${insightId}-overview">
      <div class="insight-header"><i class="fas fa-chart-line"></i> Your Enhanced Financial Overview</div>
      <div>Monthly Income: ${UTILS.formatCurrency(formData.income)} | Expenses: ${UTILS.formatCurrency(formData.expenses)} (${((formData.expenses/formData.income)*100).toFixed(1)}%) | 
      ${totalEmi > 0 ? `EMI: ${UTILS.formatCurrency(totalEmi)} (${((totalEmi/formData.income)*100).toFixed(1)}%) | ` : ''}
      Available: ${UTILS.formatCurrency(actualDisposableIncome)} (${savingsRate.toFixed(1)}%)${investmentPart}</div>
    </div>`;
  }

  // NEW: Investment contextual insights
  generateInvestmentContextualInsights(formData, savingsRate, actualDisposableIncome, totalEmi, investmentStrength, insightId) {
    if (formData.income <= 0) return '';
    
    const existingInvestments = formData.existingInvestments || 0;
    const currentSip = formData.currentSip || 0;
    
    // Investment strength based insights
    if (investmentStrength >= 80) {
      return `<div class="insight success" data-id="${insightId}-investment-excellent">
        <div class="insight-header"><i class="fas fa-trophy"></i> Excellent Investment Foundation</div>
        <div>Your investment strength of ${investmentStrength}/100 is outstanding! With ${UTILS.formatCurrency(existingInvestments)} existing investments and ${UTILS.formatCurrency(currentSip)}/month SIP, you have ${UTILS.formatCurrency(actualDisposableIncome)} available for additional goal funding. This strong foundation accelerates all your financial objectives.</div>
      </div>`;
    } else if (investmentStrength >= 60) {
      return `<div class="insight success" data-id="${insightId}-investment-good">
        <div class="insight-header"><i class="fas fa-chart-line"></i> Strong Investment Progress</div>
        <div>Your investment discipline shows with ${investmentStrength}/100 strength score. Current portfolio: ${UTILS.formatCurrency(existingInvestments)} + ${UTILS.formatCurrency(currentSip)}/month SIP. With ${UTILS.formatCurrency(actualDisposableIncome)} monthly capacity, consider increasing investments to reach the next level.</div>
      </div>`;
    } else if (investmentStrength >= 40) {
      return `<div class="insight info" data-id="${insightId}-investment-developing">
        <div class="insight-header"><i class="fas fa-seedling"></i> Investment Foundation Developing</div>
        <div>Your investment journey is progressing (${investmentStrength}/100). With current investments of ${UTILS.formatCurrency(existingInvestments)} and ${UTILS.formatCurrency(currentSip)}/month SIP, you have good potential. Available capacity: ${UTILS.formatCurrency(actualDisposableIncome)} - consider increasing investment consistency.</div>
      </div>`;
    } else if (investmentStrength >= 20) {
      return `<div class="insight warning" data-id="${insightId}-investment-early">
        <div class="insight-header"><i class="fas fa-chart-line"></i> Early Investment Stage</div>
        <div>Your investment strength (${investmentStrength}/100) needs development. ${existingInvestments > 0 ? `Current base: ${UTILS.formatCurrency(existingInvestments)}` : 'No existing investment base'} ${currentSip > 0 ? `+ ${UTILS.formatCurrency(currentSip)}/month SIP` : ''}. With ${UTILS.formatCurrency(actualDisposableIncome)} available, focus on building investment discipline.</div>
      </div>`;
    } else {
      return `<div class="insight warning" data-id="${insightId}-investment-start">
        <div class="insight-header"><i class="fas fa-exclamation-triangle"></i> Investment Strategy Needed</div>
        <div>Your investment strength is minimal (${investmentStrength}/100). ${existingInvestments === 0 && currentSip === 0 ? 'No current investments detected.' : `Limited investments: ${UTILS.formatCurrency(existingInvestments)} + ${UTILS.formatCurrency(currentSip)}/month.`} With ${UTILS.formatCurrency(actualDisposableIncome)} monthly capacity, start building investment discipline immediately.</div>
      </div>`;
    }
  }

  // ENHANCED: Savings analysis with investment context
  generateEnhancedSavingsAnalysis(formData, investmentStrength, insightId) {
    if (formData.savings <= 0 || formData.income <= 0) return '';
    
    const savingsToIncomeRatio = (formData.savings / (formData.income * 12)) * 100;
    const existingInvestments = formData.existingInvestments || 0;
    const totalLiquidWealth = formData.savings + existingInvestments;
    const totalWealthRatio = (totalLiquidWealth / (formData.income * 12)) * 100;
    
    if (totalWealthRatio >= 150) {
      return `<div class="insight success" data-id="${insightId}-wealth-excellent">
        <div class="insight-header"><i class="fas fa-gem"></i> Exceptional Wealth Foundation</div>
        <div>Your combined wealth of ${UTILS.formatCurrency(totalLiquidWealth)} (${totalWealthRatio.toFixed(0)}% of annual income) shows outstanding financial discipline. Savings: ${UTILS.formatCurrency(formData.savings)} + Investments: ${UTILS.formatCurrency(existingInvestments)}. This exceptional foundation provides tremendous financial flexibility and security.</div>
      </div>`;
    } else if (totalWealthRatio >= 100) {
      return `<div class="insight success" data-id="${insightId}-wealth-strong">
        <div class="insight-header"><i class="fas fa-shield-check"></i> Strong Combined Wealth</div>
        <div>Your total wealth of ${UTILS.formatCurrency(totalLiquidWealth)} (${totalWealthRatio.toFixed(0)}% of annual income) demonstrates good financial planning. Split: ${UTILS.formatCurrency(formData.savings)} in savings + ${UTILS.formatCurrency(existingInvestments)} in investments. This provides excellent security and growth potential.</div>
      </div>`;
    } else if (totalWealthRatio >= 50) {
      return `<div class="insight info" data-id="${insightId}-wealth-building">
        <div class="insight-header"><i class="fas fa-chart-line"></i> Building Wealth Foundation</div>
        <div>Your combined wealth (${UTILS.formatCurrency(totalLiquidWealth)}) represents ${totalWealthRatio.toFixed(0)}% of annual income. Current allocation: ${UTILS.formatCurrency(formData.savings)} savings + ${UTILS.formatCurrency(existingInvestments)} investments. Consider rebalancing for optimal growth - target 100%+ wealth-to-income ratio.</div>
      </div>`;
    } else {
      return `<div class="insight warning" data-id="${insightId}-wealth-limited">
        <div class="insight-header"><i class="fas fa-piggy-bank"></i> Limited Total Wealth</div>
        <div>Your total wealth of ${UTILS.formatCurrency(totalLiquidWealth)} provides limited cushion (${totalWealthRatio.toFixed(0)}% of annual income). Focus on both emergency savings and systematic investments to build a stronger financial foundation. Target: 50-100% wealth-to-income ratio.</div>
      </div>`;
    }
  }

  // ENHANCED: Loan insights with investment awareness
  generateInvestmentAwareLoanInsights(loanData, formData, investmentStrength, insightId) {
    if (loanData.totalOutstanding <= 0) return '';
    
    let insights = '';
    const debtToIncomeRatio = (loanData.totalOutstanding / (formData.income * 12)) * 100;
    const existingInvestments = formData.existingInvestments || 0;
    const netWorth = existingInvestments - loanData.totalOutstanding;
    
    // Net worth analysis
    if (netWorth > 0 && investmentStrength >= 60) {
      insights += `<div class="insight success" data-id="${insightId}-networth-positive">
        <div class="insight-header"><i class="fas fa-balance-scale"></i> Positive Net Worth Despite Debt</div>
        <div>Your investments (${UTILS.formatCurrency(existingInvestments)}) exceed debt burden (${UTILS.formatCurrency(loanData.totalOutstanding)}), creating positive net worth of ${UTILS.formatCurrency(netWorth)}. With ${investmentStrength}/100 investment strength, you're managing debt while building wealth effectively.</div>
      </div>`;
    } else if (netWorth < 0) {
      insights += `<div class="insight warning" data-id="${insightId}-networth-negative">
        <div class="insight-header"><i class="fas fa-exclamation-triangle"></i> Negative Net Worth Situation</div>
        <div>Your debt (${UTILS.formatCurrency(loanData.totalOutstanding)}) exceeds investments (${UTILS.formatCurrency(existingInvestments)}) by ${UTILS.formatCurrency(Math.abs(netWorth))}. Focus on aggressive debt reduction while maintaining minimal investment discipline. Target: simultaneous debt reduction and wealth building.</div>
      </div>`;
    }
    
    // Debt burden with investment context
    if (debtToIncomeRatio > 300) {
      insights += `<div class="insight danger" data-id="${insightId}-debt-extreme">
        <div class="insight-header"><i class="fas fa-exclamation-circle"></i> Extreme Debt Blocking Investment Growth</div>
        <div>Your massive debt burden (${debtToIncomeRatio.toFixed(0)}% of annual income) severely limits investment capacity. Even with ${UTILS.formatCurrency(existingInvestments)} existing investments, focus entirely on debt elimination before pursuing new investments. Interest burden: ${UTILS.formatCurrency(loanData.totalInterestBurden)}.</div>
      </div>`;
    } else if (debtToIncomeRatio > 200) {
      insights += `<div class="insight warning" data-id="${insightId}-debt-high-investment">
        <div class="insight-header"><i class="fas fa-balance-scale"></i> High Debt Limiting Investment Potential</div>
        <div>Debt burden (${debtToIncomeRatio.toFixed(0)}% of income) significantly impacts investment growth. Current investments: ${UTILS.formatCurrency(existingInvestments)} with ${formData.currentSip ? UTILS.formatCurrency(formData.currentSip) + '/month SIP' : 'no active SIP'}. Strategy: balance modest investment continuation with aggressive debt reduction on high-rate loans.</div>
      </div>`;
    }
    
    return insights;
  }

  // ENHANCED: Emergency fund with investment context
  generateInvestmentEnhancedEmergencyFund(formData, loanData, investmentStrength, insightId) {
    if (formData.expenses <= 0) return '';
    
    const emergencyMonths = (formData.savings || 0) / formData.expenses;
    const existingInvestments = formData.existingInvestments || 0;
    const totalLiquidWealth = formData.savings + existingInvestments;
    const totalEmergencyMonths = totalLiquidWealth / formData.expenses;
    
    if (emergencyMonths < 3 && totalEmergencyMonths >= 6) {
      return `<div class="insight info" data-id="${insightId}-emergency-investment-covered">
        <div class="insight-header"><i class="fas fa-shield-alt"></i> Emergency Coverage via Investments</div>
        <div>While your pure emergency fund covers only ${emergencyMonths.toFixed(1)} months, your total liquid wealth (${UTILS.formatCurrency(totalLiquidWealth)}) provides ${totalEmergencyMonths.toFixed(1)} months coverage. Your ${UTILS.formatCurrency(existingInvestments)} investment portfolio acts as extended emergency backup, though maintain 3-6 months in cash for immediate access.</div>
      </div>`;
    } else if (emergencyMonths < 3) {
      return `<div class="insight danger" data-id="${insightId}-emergency-critical-investments">
        <div class="insight-header"><i class="fas fa-shield-alt"></i> Critical Emergency Gap Despite Investments</div>
        <div>Your emergency fund covers only ${emergencyMonths.toFixed(1)} months vs. recommended 6 months. Even with ${UTILS.formatCurrency(existingInvestments)} investments, maintain liquid emergency funds separate from investment portfolio. Gap: ${UTILS.formatCurrency(Math.max(0, (formData.expenses * 6) - (formData.savings || 0)))}. ${loanData.totalOutstanding > 0 ? 'This gap is critical given your debt obligations.' : ''}</div>
      </div>`;
    } else if (emergencyMonths < 6 && investmentStrength >= 60) {
      return `<div class="insight info" data-id="${insightId}-emergency-good-investments">
        <div class="insight-header"><i class="fas fa-shield-alt"></i> Emergency Fund Adequate with Investment Backup</div>
        <div>Your ${emergencyMonths.toFixed(1)} months emergency fund, combined with strong investment portfolio (${investmentStrength}/100 strength), provides good financial security. Total accessible wealth: ${UTILS.formatCurrency(totalLiquidWealth)}. Consider completing 6-month emergency target: additional ${UTILS.formatCurrency((formData.expenses * 6) - (formData.savings || 0))}.</div>
      </div>`;
    }
    
    return '';
  }

  // ENHANCED: Investment-aware loan scenarios
  generateInvestmentAwareLoanScenarios(formData, loanData, investmentStrength, insightId) {
    if (loanData.totalOutstanding <= 0) return '';
    
    let scenarios = '';
    const existingInvestments = formData.existingInvestments || 0;
    const returns = formData.returns || 12;
    
    // Investment vs. Debt scenario
    if (existingInvestments > 0 && loanData.weightedAvgRate > 0) {
      const debtVsInvestmentComparison = loanData.weightedAvgRate > returns ? 'debt reduction' : 'investment growth';
      const smartMove = loanData.weightedAvgRate > returns ? 
        'prioritize debt prepayment over new investments' : 
        'continue investments while making regular EMI payments';
      
      scenarios += `<div class="scenario ${loanData.weightedAvgRate > returns ? 'warning' : 'success'}" data-id="${insightId}-scenario-vs-investment">
        <div class="scenario-title"><i class="fas fa-balance-scale"></i> Investment vs. Debt Strategy</div>
        <div class="scenario-detail">Your loan rate (${loanData.weightedAvgRate.toFixed(1)}%) vs. expected investment returns (${returns}%) suggests focusing on <strong>${debtVsInvestmentComparison}</strong>. With ${UTILS.formatCurrency(existingInvestments)} existing investments, ${smartMove} for optimal financial growth.</div>
      </scenarios>`;
    }
    
    // Prepayment scenario with investment consideration
    if (existingInvestments > 100000) {
      const maxPrepayment = Math.min(existingInvestments * 0.2, loanData.totalOutstanding * 0.25);
      if (maxPrepayment > 50000) {
        scenarios += `<div class="scenario info" data-id="${insightId}-scenario-prepay-investment">
          <div class="scenario-title"><i class="fas fa-coins"></i> Strategic Debt Prepayment from Investments</div>
          <div class="scenario-detail">Consider using ${UTILS.formatCurrency(maxPrepayment)} (20% of investments) for loan prepayment. This reduces debt burden while maintaining ${UTILS.formatCurrency(existingInvestments - maxPrepayment)} investment base. Weigh against potential investment returns of ${returns}% vs. guaranteed saving of ${loanData.weightedAvgRate.toFixed(1)}% loan interest.</div>
        </div>`;
      }
    }
    
    return scenarios;
  }

  // ENHANCED: Action plans with investment considerations
  updateEnhancedActionPlans(results) {
    const container = document.getElementById('action-plans-list');
    if (!container) return;

    const investmentData = results.investmentData || {};
    const portfolioStrength = investmentData.investmentPortfolioStrength || 0;
    
    let html = '';
    
    // Investment-enhanced action plans
    const enhancedActionPlans = {
      shortTerm: {
        title: 'Short Term (0-6 months)',
        icon: 'fas fa-rocket',
        actions: [
          'Review and optimize existing investment portfolio allocation',
          portfolioStrength < 40 ? 'Start or increase SIP amount to build investment discipline' : 'Continue current SIP strategy and consider step-up SIP',
          'Ensure emergency fund is separate from investment portfolio',
          'Review loan interest rates vs. investment returns for strategy optimization',
          investmentData.currentSip > 0 ? 'Monitor SIP performance and consider diversification' : 'Research and select appropriate mutual funds for SIP'
        ]
      },
      mediumTerm: {
        title: 'Medium Term (6-18 months)',
        icon: 'fas fa-chart-line',
        actions: [
          portfolioStrength >= 60 ? 'Diversify investments across asset classes and geographies' : 'Build investment portfolio to meaningful size (₹5L+ target)',
          'Implement annual SIP increase strategy (10-15% yearly)',
          'Review and rebalance portfolio quarterly for optimal returns',
          investmentData.existingInvestments >= 500000 ? 'Consider tax-saving investment options (ELSS, PPF)' : 'Focus on growth-oriented equity mutual funds',
          'Track investment performance against benchmarks and adjust strategy'
        ]
      },
      longTerm: {
        title: 'Long Term (18+ months)',
        icon: 'fas fa-trophy',
        actions: [
          'Achieve target investment portfolio strength of 80+ through consistent investing',
          portfolioStrength >= 80 ? 'Consider alternative investments (REITs, international funds)' : 'Build core portfolio to ₹10L+ before exploring alternatives',
          'Plan for retirement corpus adequacy based on current investment trajectory',
          'Review estate planning and tax optimization strategies for large portfolios',
          'Establish legacy and wealth transfer planning if portfolio exceeds ₹50L'
        ]
      }
    };

    Object.values(enhancedActionPlans).forEach(plan => {
      html += `
        <div class="scenario">
          <div class="scenario-title">
            <i class="${plan.icon}"></i> ${plan.title}
          </div>
          <div class="scenario-detail">
            <ul style="padding-left: 20px; margin: 10px 0;">
              ${plan.actions.map(action => `<li>${action}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ENHANCED: Insights enhancement with investment data
  enhanceInsightsWithInvestmentData(formData, loanData, goalInsights, results) {
    const insightsContainer = document.getElementById('insights-list');
    let currentInsights = insightsContainer.innerHTML;
    
    if (goalInsights && Array.isArray(goalInsights) && goalInsights.length > 0) {
      const goalInsightId = Date.now() + 1000;
      goalInsights.forEach((insight, index) => {
        currentInsights += `<div class="insight ${insight.type}" data-id="${goalInsightId}-goal-${index}">
          <div class="insight-header"><i class="${insight.icon}"></i> ${insight.title}</div>
          <div>${insight.message}</div>
        </div>`;
      });
      
      insightsContainer.innerHTML = currentInsights;
      this.forceVisualRefresh(insightsContainer, insightsContainer);
    }
  }

  collectAndStoreLoanData() {
    const loanItems = document.querySelectorAll('.loan-item');
    let totalOutstanding = 0;
    let totalCalculatedEmi = 0;
    let totalInterestBurden = 0;
    let weightedAvgRate = 0;
    let maxTenure = 0;
    let loanCount = 0;

    loanItems.forEach(loanItem => {
      const principal = parseFloat(loanItem.querySelector('.loan-principal')?.value) || 0;
      const rate = parseFloat(loanItem.querySelector('.loan-rate')?.value) || 0;
      const tenureYears = parseFloat(loanItem.querySelector('.loan-tenure-years')?.value) || 0;
      const tenureMonths = parseFloat(loanItem.querySelector('.loan-tenure-months')?.value) || 0;
      
      if (principal > 0 && rate > 0 && (tenureYears > 0 || tenureMonths > 0)) {
        const totalTenure = tenureYears + (tenureMonths / 12);
        const totalMonths = (tenureYears * 12) + tenureMonths;
        const monthlyRate = rate / 100 / 12;
        
        let calculatedEmi;
        if (monthlyRate > 0) {
          calculatedEmi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                         (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
          calculatedEmi = principal / totalMonths;
        }
        
        const totalPayment = calculatedEmi * totalMonths;
        const interestBurden = totalPayment - principal;
        
        totalOutstanding += principal;
        totalCalculatedEmi += calculatedEmi;
        totalInterestBurden += interestBurden;
        weightedAvgRate += rate * principal;
        maxTenure = Math.max(maxTenure, totalTenure);
        loanCount++;
      }
    });

    if (totalOutstanding > 0) {
      weightedAvgRate = weightedAvgRate / totalOutstanding;
    }

    const loanData = {
      totalOutstanding,
      totalCalculatedEmi, 
      totalInterestBurden,
      weightedAvgRate,
      maxTenure,
      loanCount
    };

    const existingEmiInput = document.getElementById('existing-emi');
    if (existingEmiInput) {
      const dataAttributes = {
        'data-total-debt': totalOutstanding,
        'data-total-interest-burden': totalInterestBurden,
        'data-weighted-avg-rate': weightedAvgRate.toFixed(2),
        'data-max-tenure': maxTenure.toFixed(1),
        'data-loan-count': loanCount
      };
      
      Object.entries(dataAttributes).forEach(([attr, value]) => {
        existingEmiInput.setAttribute(attr, value);
      });
    }

    return loanData;
  }

  clearGoalSpecificResults() {
    const elements = ['total-cost', 'monthly-needed', 'time-required'];
    elements.forEach(id => this.uiManager.updateElement(id, id === 'time-required' ? '0y' : '₹0'));
  }

  forceVisualRefresh(insightsContainer, scenariosContainer) {
    insightsContainer.style.opacity = '0.8';
    scenariosContainer.style.opacity = '0.8';
    
    setTimeout(() => {
      insightsContainer.style.opacity = '1';
      scenariosContainer.style.opacity = '1';
    }, 100);
  }

  // Loan management methods
  addLoan() {
    const loanContainer = document.getElementById('loan-list');
    if (!loanContainer) return;

    loanContainer.style.display = 'block';
    
    const loanId = 'loan_' + Date.now();
    const loanItem = this.createLoanItemElement(loanId);
    
    loanContainer.appendChild(loanItem);
    this.setupLoanEventListeners(loanId);
    this.uiManager.showToast('Loan details added. Enter loan parameters for analysis.', 'info');
  }

  createLoanItemElement(loanId) {
    const loanItem = document.createElement('div');
    loanItem.className = 'loan-item';
    loanItem.id = loanId;
    
    loanItem.innerHTML = `
      <div class="loan-header">
        <div class="loan-title">Loan Details</div>
        <button class="loan-remove" onclick="removeLoan('${loanId}')">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
      
      <div class="loan-fields">
        <div class="form-group">
          <label><i class="fas fa-tag"></i> Loan Type</label>
          <select class="form-control loan-type">
            <option value="">Select Type</option>
            <option value="home">Home Loan</option>
            <option value="personal">Personal Loan</option>
            <option value="car">Car Loan</option>
            <option value="education">Education Loan</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-rupee-sign"></i> Outstanding Amount</label>
          <input type="number" class="form-control loan-principal" placeholder="Enter outstanding amount" 
                step="10000" min="0">
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-percentage"></i> Interest Rate (%)</label>
          <input type="number" class="form-control loan-rate" placeholder="Enter interest rate" 
                step="0.1" min="0" max="30">
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-credit-card"></i> Monthly EMI</label>
          <input type="number" class="form-control loan-emi" placeholder="Enter your actual EMI" 
                step="100" min="0">
          <small style="color: #6c757d; font-size: 0.8rem;">Enter the EMI you actually pay</small>
        </div>
        
        <div class="form-group">
          <label><i class="fas fa-calendar-alt"></i> Remaining Tenure</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <input type="number" class="form-control loan-tenure-years" placeholder="Years" 
                  step="1" min="0" max="30">
            <input type="number" class="form-control loan-tenure-months" placeholder="Months" 
                  step="1" min="0" max="11">
          </div>
          <small style="color: #6c757d; font-size: 0.8rem;">Enter remaining years and months</small>
        </div>
      </div>
      
      <div class="loan-summary" id="${loanId}_summary" style="display: none;">
        <div class="loan-summary-item">
          <span>Your Monthly EMI:</span>
          <span id="${loanId}_user_emi">₹0</span>
        </div>
        <div class="loan-summary-item">
          <span>Total Interest (Contract):</span>
          <span id="${loanId}_total_interest">₹0</span>
        </div>
        <div class="loan-summary-item">
          <span>Total Amount (Contract):</span>
          <span id="${loanId}_total_amount">₹0</span>
        </div>
        <div class="loan-summary-item">
          <span>Standard Completion:</span>
          <span id="${loanId}_completion_date">-</span>
        </div>
        <div class="loan-summary-item">
          <span>Remaining Months:</span>
          <span id="${loanId}_remaining_months">-</span>
        </div>
        
        <div id="${loanId}_emi_scenario" class="emi-scenario" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e9ecef;">
          <div class="scenario-header" style="font-weight: 600; color: #495057; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-rocket" style="color: #28a745;"></i>
            <span>With Your EMI Amount:</span>
          </div>
          <div class="loan-summary-item">
            <span>Early Completion:</span>
            <span id="${loanId}_emi_completion" style="color: #28a745; font-weight: 500;">-</span>
          </div>
          <div class="loan-summary-item">
            <span>Time Saved:</span>
            <span id="${loanId}_time_saved" style="color: #007bff; font-weight: 500;">-</span>
          </div>
          <div class="loan-summary-item">
            <span>Interest Saved:</span>
            <span id="${loanId}_interest_saved" style="color: #28a745; font-weight: 600;">-</span>
          </div>
        </div>
      </div>
    `;
    
    return loanItem;
  }

  updateTotalEMI() {
    const loanItems = document.querySelectorAll('.loan-item');
    let totalEMI = 0;
    
    loanItems.forEach(loanItem => {
      const emiInput = loanItem.querySelector('.loan-emi');
      const emi = parseFloat(emiInput?.value) || 0;
      
      if (emi > 0) {
        totalEMI += emi;
      }
    });
    
    const existingEmiInput = document.getElementById('existing-emi');
    if (existingEmiInput) {
      existingEmiInput.value = totalEMI;
    }
    
    return totalEMI;
  }

  setupLoanEventListeners(loanId) {
    const loanItem = document.getElementById(loanId);
    if (!loanItem) return;
    
    const inputs = loanItem.querySelectorAll('.loan-principal, .loan-rate, .loan-tenure-years, .loan-tenure-months, .loan-emi');
    
    const calculateHandler = UTILS.debounce(() => {
      this.calculateLoanSummary(loanId);
      this.updateTotalEMI();
    }, 500);
    
    inputs.forEach(input => {
      input.addEventListener('input', calculateHandler);
      input.addEventListener('blur', calculateHandler);
    });
  }

  extractLoanData(loanItem) {
    const principal = parseFloat(loanItem.querySelector('.loan-principal')?.value) || 0;
    const rate = parseFloat(loanItem.querySelector('.loan-rate')?.value) || 0;
    const emi = parseFloat(loanItem.querySelector('.loan-emi')?.value) || 0;
    const tenureYears = parseFloat(loanItem.querySelector('.loan-tenure-years')?.value) || 0;
    const tenureMonths = parseFloat(loanItem.querySelector('.loan-tenure-months')?.value) || 0;

    return { principal, rate, emi, tenureYears, tenureMonths };
  }

  calculateLoanSummary(loanId) {
    const loanItem = document.getElementById(loanId);
    if (!loanItem) return;

    const loanData = this.extractLoanData(loanItem);
    
    if (this.isValidLoanData(loanData)) {
      const calculations = this.performLoanCalculations(loanData);
      this.updateLoanSummaryDisplay(loanId, calculations);
      this.updateTotalEMI();
    }

    setTimeout(() => this.calculateResults(), 100);
  }

  isValidLoanData(loanData) {
    return loanData.principal > 0 && loanData.rate > 0 && 
           (loanData.tenureYears > 0 || loanData.tenureMonths > 0);
  }

  performLoanCalculations(loanData) {
    const totalMonths = (loanData.tenureYears * 12) + loanData.tenureMonths;
    const monthlyRate = loanData.rate / 100 / 12;
    
    let calculatedEmi;
    if (monthlyRate > 0) {
      calculatedEmi = loanData.principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                    (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      calculatedEmi = loanData.principal / totalMonths;
    }
    
    const totalAmountBasedOnLoan = calculatedEmi * totalMonths;
    const totalInterestBasedOnLoan = totalAmountBasedOnLoan - loanData.principal;
    
    const standardCompletionDate = new Date();
    standardCompletionDate.setMonth(standardCompletionDate.getMonth() + totalMonths);

    let emiBasedCompletion = null;
    let emiBasedMonths = null;
    let earlyCompletionSavings = 0;
    
    if (loanData.emi > 0 && Math.abs(loanData.emi - calculatedEmi) > 10 && monthlyRate > 0) {
      const principal = loanData.principal;
      const userEmi = loanData.emi;
      const minRequiredEmi = principal * monthlyRate;
      
      if (userEmi > minRequiredEmi) {
        try {
          emiBasedMonths = Math.log(1 + (principal * monthlyRate) / (userEmi - principal * monthlyRate)) / 
                          Math.log(1 + monthlyRate);
          emiBasedMonths = Math.ceil(emiBasedMonths);
          
          emiBasedCompletion = new Date();
          emiBasedCompletion.setMonth(emiBasedCompletion.getMonth() + emiBasedMonths);
          
          const emiBasedTotalPayment = userEmi * emiBasedMonths;
          const emiBasedInterest = emiBasedTotalPayment - principal;
          earlyCompletionSavings = totalInterestBasedOnLoan - emiBasedInterest;
          
        } catch (error) {
          console.error('EMI calculation error:', error);
          emiBasedCompletion = null;
        }
      }
    }

    return {
      userEmi: loanData.emi,
      calculatedEmi: Math.round(calculatedEmi * 100) / 100,
      totalAmount: Math.round(totalAmountBasedOnLoan * 100) / 100,
      totalInterest: Math.round(totalInterestBasedOnLoan * 100) / 100,
      completionDate: standardCompletionDate,
      totalMonths,
      emiBasedCompletion,
      emiBasedMonths,
      earlyCompletionSavings: Math.round(earlyCompletionSavings * 100) / 100,
      showEmiScenario: emiBasedCompletion !== null
    };
  }

  updateLoanSummaryDisplay(loanId, calculations) {
    const summaryDiv = document.getElementById(`${loanId}_summary`);
    if (!summaryDiv) return;
    
    summaryDiv.style.display = 'block';
    
    const displayEmi = calculations.userEmi > 0 ? calculations.userEmi : calculations.calculatedEmi;
    
    const updates = [
      { id: `${loanId}_user_emi`, value: UTILS.formatCurrency(displayEmi) },
      { id: `${loanId}_total_interest`, value: UTILS.formatCurrency(calculations.totalInterest) },
      { id: `${loanId}_total_amount`, value: UTILS.formatCurrency(calculations.totalAmount) },
      { id: `${loanId}_completion_date`, value: calculations.completionDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) },
      { id: `${loanId}_remaining_months`, value: `${calculations.totalMonths} months` }
    ];

    updates.forEach(update => {
      const element = document.getElementById(update.id);
      if (element) element.textContent = update.value;
    });

    const emiScenarioDiv = document.getElementById(`${loanId}_emi_scenario`);
    
    if (emiScenarioDiv) {
      if (calculations.showEmiScenario && calculations.emiBasedCompletion) {
        emiScenarioDiv.style.display = 'block';
        
        const monthsSaved = calculations.totalMonths - calculations.emiBasedMonths;
        const yearsSaved = Math.floor(monthsSaved / 12);
        const remainingMonths = monthsSaved % 12;
        
        let timeSavedText = '';
        if (monthsSaved <= 0) {
          timeSavedText = 'No time saved';
        } else if (yearsSaved > 0 && remainingMonths > 0) {
          timeSavedText = `${yearsSaved}y ${remainingMonths}m`;
        } else if (yearsSaved > 0) {
          timeSavedText = `${yearsSaved} year${yearsSaved > 1 ? 's' : ''}`;
        } else {
          timeSavedText = `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        
        const emiScenarioUpdates = [
          { id: `${loanId}_emi_completion`, value: calculations.emiBasedCompletion.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) },
          { id: `${loanId}_time_saved`, value: timeSavedText },
          { id: `${loanId}_interest_saved`, value: UTILS.formatCurrency(Math.max(0, calculations.earlyCompletionSavings)) }
        ];

        emiScenarioUpdates.forEach(update => {
          const element = document.getElementById(update.id);
          if (element) {
            element.textContent = update.value;
          }
        });
        
      } else {
        emiScenarioDiv.style.display = 'none';
      }
    }
  }

  removeLoan(loanId) {
    const loanItem = document.getElementById(loanId);
    if (loanItem) {
      loanItem.remove();
      this.calculateResults();
      this.uiManager.showToast('Loan removed successfully', 'success');
      
      const loanContainer = document.getElementById('loan-list');
      const remainingLoans = loanContainer.querySelectorAll('.loan-item');
      if (remainingLoans.length === 0) {
        loanContainer.style.display = 'none';
      }
    }
  }

  // Balance and plan methods
  togglePlan(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('.plan-checkbox');
    if (checkbox) {
      checkbox.checked = element.classList.contains('selected');
    }
  }

  showBalanceOptions() {
    const formData = this.getFormData();
    const plans = this.calculator.generateBalancePlans(formData);
    this.uiManager.showBalanceModal(plans);
  }

  applyBalancePlan() {
    const selectedPlanId = this.uiManager.getSelectedPlan();
    
    if (!selectedPlanId) {
      this.uiManager.showToast('Please select a plan first', 'warning');
      return;
    }

    this.applySinglePlan(selectedPlanId);
    this.uiManager.closeModal();
    this.uiManager.showToast('Balance plan applied successfully', 'success');
    this.calculateResults();
  }

  applySinglePlan(planId) {
    const planActions = {
      // Investment plans
      'start-sip-early': () => this.applyStartSipEarly(),
      'build-investment-base': () => this.applyBuildInvestmentBase(),
      'strengthen-portfolio': () => this.applyStrengthenPortfolio(),
      'step-up-sip': () => this.applyStepUpSip(),
      'optimize-portfolio': () => this.applyOptimizePortfolio(),
      // Standard plans
      'reduce-housing': () => this.applyHousingReduction(),
      'extend-timeline': () => this.applyTimelineExtension(),
      'increase-income': () => this.applyIncomeIncrease()
    };
    
    const action = planActions[planId];
    if (action) action();
  }

  applyHousingReduction() {
    const houseGoal = this.goalsManager.goals.house;
    if (houseGoal && houseGoal.enabled) {
      const newAmount = Math.round(houseGoal.amount * 0.85);
      this.goalsManager.updateGoalAmount('house', newAmount);
      
      ['house-amount', 'house-slider'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = newAmount;
      });
    }
  }

  applyTimelineExtension() {
    const timelineInput = document.getElementById('timeline');
    if (timelineInput) {
      const currentTimeline = parseInt(timelineInput.value) || 15;
      timelineInput.value = currentTimeline + 3;
    }
  }

  applyIncomeIncrease() {
    const incomeInput = document.getElementById('income');
    if (incomeInput) {
      const currentIncome = parseInt(incomeInput.value) || 95000;
      incomeInput.value = Math.round(currentIncome * 1.15);
    }
  }

  determineLifeStage(age) {
    if (age < 25) return 'early-career';
    if (age < 35) return 'building';
    if (age < 50) return 'peak-earning';
    if (age < 65) return 'pre-retirement';
    return 'senior';
  }

  // Export and utility methods
  shareResults() {
    if (navigator.share) {
      const results = this.previousResults || {};
      const shareData = {
        title: 'My Financial Plan',
        text: this.formatResultsText(results),
        url: window.location.href
      };
      
      navigator.share(shareData).catch(() => this.copyResults());
    } else {
      this.uiManager.showToast('Share feature not supported. Results copied instead.', 'info');
      this.copyResults();
    }
  }

  copyResults() {
    const results = this.previousResults || {};
    const textToCopy = this.formatResultsText(results);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => this.uiManager.showToast('Results copied to clipboard!', 'success'))
        .catch(() => this.fallbackCopy(textToCopy));
    } else {
      this.fallbackCopy(textToCopy);
    }
  }

  formatResultsText(results) {
    const investmentData = results.investmentData || {};
    
    return `Financial Goals Summary:

Total Goal Cost: ${UTILS.formatCurrency(results.totalGoalCost || 0)}
Monthly Investment Needed: ${UTILS.formatCurrency(results.monthlyInvestment || 0)}
Time Required: ${UTILS.formatYears(results.timeRequired || 0)}
Savings Rate: ${UTILS.formatPercentage(results.savingsRate || 0)}
Financial Health Score: ${UTILS.formatPercentage(results.financialHealth || 0)}

Investment Portfolio:
Existing Investments: ${UTILS.formatCurrency(investmentData.existingInvestments || 0)}
Current SIP: ${UTILS.formatCurrency(investmentData.currentSip || 0)}/month
Portfolio Strength: ${investmentData.investmentPortfolioStrength || 0}/100
Projected Value: ${UTILS.formatCurrency(investmentData.projectedValue || 0)}

Generated with Advanced Goal Alignment Calculator`;
  }

  fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position: fixed; opacity: 0;';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.uiManager.showToast('Results copied to clipboard!', 'success');
    } catch (err) {
      this.uiManager.showToast('Copy failed. Please copy manually.', 'warning');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  downloadResults() {
    const results = this.previousResults || {};
    const formData = this.getFormData();
    
    const data = {
      summary: {
        totalGoalCost: results.totalGoalCost || 0,
        monthlyInvestment: results.monthlyInvestment || 0,
        timeRequired: results.timeRequired || 0,
        savingsRate: results.savingsRate || 0,
        financialHealth: results.financialHealth || 0
      },
      personalDetails: {
        age: formData.age,
        timeline: formData.timeline,
        income: formData.income,
        expenses: formData.expenses,
        savings: formData.savings
      },
      investmentPortfolio: {
        existingInvestments: formData.existingInvestments,
        currentSip: formData.currentSip,
        sipDuration: formData.sipDuration,
        returns: formData.returns,
        inflation: formData.inflation,
        portfolioStrength: results.investmentData?.investmentPortfolioStrength || 0,
        projectedValue: results.investmentData?.projectedValue || 0
      },
      goals: this.goalsManager.exportGoals(),
      timestamp: new Date().toISOString()
    };

    this.createAndDownloadFile(data, 'financial-plan.json', 'application/json');
    this.uiManager.showToast('Financial plan downloaded successfully!', 'success');
  }

  createAndDownloadFile(data, filename, mimeType) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  resetAll() {
    if (!confirm('Are you sure you want to reset all values to default?')) return;

    // Reset all form inputs including investment fields
    const inputIds = ['age', 'timeline', 'life-expectancy', 'income', 'expenses', 'savings', 'existing-emi', 'returns', 'inflation', 'existing-investments', 'current-sip', 'sip-duration'];
    inputIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });

    this.goalsManager.resetToEmpty();
    this.resetLoanContainer();
    this.resetResultsDisplay();
    this.resetInvestmentSummary();
    
    this.uiManager.showToast('All values have been reset', 'success');
  }

  // NEW: Reset investment summary
  resetInvestmentSummary() {
    const summaryDiv = document.getElementById('investment-summary');
    if (summaryDiv) {
      summaryDiv.style.display = 'none';
    }
  }

  resetLoanContainer() {
    const loanContainer = document.getElementById('loan-list');
    if (loanContainer) {
      loanContainer.innerHTML = '<h4 style="margin: 20px 0 15px 0; color: #495057;"><i class="fas fa-list"></i> Loan Details</h4>';
      loanContainer.style.display = 'none';
    }
  }

  resetResultsDisplay() {
    const resultResets = [
      { id: 'total-cost', value: '₹0' },
      { id: 'monthly-needed', value: '₹0' },
      { id: 'time-required', value: '0y' },
      { id: 'savings-rate', value: '0%' },
      { id: 'expense-ratio', value: '0%' },
      { id: 'financial-health-value', value: '0%' }
    ];

    resultResets.forEach(reset => this.uiManager.updateElement(reset.id, reset.value));

    ['expense-progress', 'financial-health-bar'].forEach(id => this.uiManager.updateProgressBar(id, 0));
    
    this.resetBalanceMeter();
    this.resetContainers();
  }

  resetBalanceMeter() {
    const elements = {
      indicator: document.getElementById('balance-indicator'),
      status: document.getElementById('balance-status'),
      button: document.getElementById('balance-button')
    };
    
    if (elements.indicator) elements.indicator.style.left = '50%';
    if (elements.status) {
      elements.status.textContent = 'Enter your financial details';
      elements.status.style.backgroundColor = '#f8f9fa';
      elements.status.style.color = '#6c757d';
    }
    if (elements.button) elements.button.style.display = 'none';
  }

  resetContainers() {
    const containers = [
      { id: 'achievements-container', content: '' },
      { id: 'insights-list', content: '<p style="text-align: center; color: #6c757d; padding: 20px;">Enter your financial details to see insights</p>' },
      { id: 'scenarios-list', content: '<p style="text-align: center; color: #6c757d; padding: 20px;">Complete your profile to see scenarios</p>' }
    ];

    containers.forEach(container => {
      const element = document.getElementById(container.id);
      if (element) element.innerHTML = container.content;
    });

    const chartContainer = document.getElementById('goal-chart');
    if (chartContainer) this.uiManager.showEmptyChart(chartContainer);
  }

  savePlan() {
    const planData = {
      formData: this.getFormData(),
      results: this.previousResults,
      goals: this.goalsManager.exportGoals(),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('financialPlan', JSON.stringify(planData));
    this.uiManager.showToast('Financial plan saved successfully!', 'success');
  }

  previewPlans() {
    const selectedPlanIds = this.uiManager.getSelectedPlans();
    
    if (selectedPlanIds.length === 0) {
      this.uiManager.showToast('Please select at least one plan to preview', 'warning');
      return;
    }

    const previewText = this.generatePreviewText(selectedPlanIds);
    alert(previewText);
  }

  generatePreviewText(selectedPlanIds) {
    let previewText = "Preview of changes:\n\n";
    
    const planDescriptions = {
      'start-sip-early': "• Start aggressive SIP investment strategy\n",
      'build-investment-base': "• Establish strong investment foundation\n",
      'strengthen-portfolio': "• Increase SIP amounts and diversify\n",
      'step-up-sip': "• Implement annual SIP increase strategy\n",
      'optimize-portfolio': "• Review and rebalance existing investments\n",
      'reduce-housing': "• Housing goal will be reduced by 15%\n",
      'extend-timeline': "• Timeline will be extended by 3 years\n",
      'increase-income': "• Income assumption will increase by 15%\n"
    };
    
    selectedPlanIds.forEach(planId => {
      previewText += planDescriptions[planId] || "• Custom optimization\n";
    });

    return previewText;
  }

  // NEW: Download financial data as JSON
  downloadJSON() {
    const planData = {
      formData: this.getFormData(),
      results: this.previousResults,
      goals: this.goalsManager.exportGoals(),
      timestamp: new Date().toISOString(),
      appVersion: "1.0",
      description: "Advanced Goal Alignment Calculator Data"
    };

    const jsonString = JSON.stringify(planData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.uiManager.showToast('JSON data downloaded successfully!', 'success');
  }

  // NEW: Load financial data from JSON
  loadJSON() {
    const fileInput = document.getElementById('json-file-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  // NEW: Handle JSON file loading
  handleJSONLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      this.uiManager.showToast('Please select a valid JSON file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const planData = JSON.parse(e.target.result);
        
        // Validate the JSON structure
        if (!planData.formData || !planData.goals) {
          throw new Error('Invalid financial plan file format');
        }

        // Load form data
        this.setFormData(planData.formData);
        
        // Load goals
        this.goalsManager.importGoals(planData.goals);
        
        // Recalculate results
        this.calculateResults();
        
        this.uiManager.showToast('Financial plan loaded successfully!', 'success');
        
        // Reset file input
        event.target.value = '';
        
      } catch (error) {
        console.error('Error loading JSON:', error);
        this.uiManager.showToast('Error loading file: Invalid format', 'error');
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  }

  // ENHANCED: Generate professional social media image with comprehensive financial data
  async shareToSocialMedia() {
    try {
      // Check if calculations have been performed
      const totalCostEl = document.getElementById('total-cost');
      if (!totalCostEl || totalCostEl.textContent === '₹0' || totalCostEl.textContent === '') {
        this.uiManager.showToast('Please complete your financial calculation first!', 'warning');
        return;
      }
      
      // Create canvas for high-quality infographic
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions for social media (1080x1080 Instagram square)
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Choose random design variation
      const designs = ['modern', 'corporate', 'minimalist', 'gradient', 'dashboard'];
      const selectedDesign = designs[Math.floor(Math.random() * designs.length)];
      
      // Get financial data
      const totalCost = document.getElementById('total-cost')?.textContent || '₹0';
      const monthlyNeeded = document.getElementById('monthly-needed')?.textContent || '₹0';
      const timeRequired = document.getElementById('time-required')?.textContent || '0y';
      const savingsRate = document.getElementById('savings-rate')?.textContent || '0%';
      const healthValue = document.getElementById('financial-health-value')?.textContent || '0%';
      const balanceStatus = document.getElementById('balance-status')?.textContent || 'Calculate your balance';
      
      if (selectedDesign === 'modern') {
        this.drawModernDesign(ctx, canvas, {totalCost, monthlyNeeded, timeRequired, savingsRate, healthValue, balanceStatus});
      } else if (selectedDesign === 'corporate') {
        this.drawCorporateDesign(ctx, canvas, {totalCost, monthlyNeeded, timeRequired, savingsRate, healthValue, balanceStatus});
      } else if (selectedDesign === 'minimalist') {
        this.drawMinimalistDesign(ctx, canvas, {totalCost, monthlyNeeded, timeRequired, savingsRate, healthValue, balanceStatus});
      } else if (selectedDesign === 'gradient') {
        this.drawGradientDesign(ctx, canvas, {totalCost, monthlyNeeded, timeRequired, savingsRate, healthValue, balanceStatus});
      } else if (selectedDesign === 'dashboard') {
        this.drawDashboardDesign(ctx, canvas, {totalCost, monthlyNeeded, timeRequired, savingsRate, healthValue, balanceStatus});
      }
      
      // Download the image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-dashboard-${selectedDesign}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.uiManager.showToast(`${selectedDesign.charAt(0).toUpperCase() + selectedDesign.slice(1)} infographic generated! 🎨✨`, 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Error generating share image:', error);
      this.uiManager.showToast('Error generating infographic: ' + error.message, 'error');
    }
  }

  drawModernDesign(ctx, canvas, data) {
    // Modern glass morphism design
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#667eea');
    bgGradient.addColorStop(0.5, '#764ba2');
    bgGradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dot pattern overlay
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < canvas.width; i += 40) {
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    
    this.drawModernContent(ctx, canvas, data);
  }

  drawCorporateDesign(ctx, canvas, data) {
    // Professional corporate design
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= canvas.height; j += 30) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
    
    this.drawCorporateContent(ctx, canvas, data);
  }

  drawMinimalistDesign(ctx, canvas, data) {
    // Clean minimalist design
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtle geometric lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 2;
    
    // Diagonal lines
    for (let i = -canvas.width; i < canvas.width * 2; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.width, canvas.height);
      ctx.stroke();
    }
    
    this.drawMinimalistContent(ctx, canvas, data);
  }

  drawGradientDesign(ctx, canvas, data) {
    // Dynamic gradient design
    const gradients = [
      ['#ff9a9e', '#fecfef', '#fecfef'],
      ['#a8edea', '#fed6e3', '#d299c2'],
      ['#ffecd2', '#fcb69f', '#ff8c94'],
      ['#89f7fe', '#66a6ff', '#667eea']
    ];
    
    const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];
    
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, selectedGradient[0]);
    bgGradient.addColorStop(0.5, selectedGradient[1]);
    bgGradient.addColorStop(1, selectedGradient[2]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Floating circles
    ctx.globalAlpha = 0.1;
    const circles = [
      {x: 150, y: 200, r: 80},
      {x: 900, y: 150, r: 120},
      {x: 200, y: 800, r: 100},
      {x: 850, y: 750, r: 90},
      {x: 500, y: 100, r: 60}
    ];
    
    circles.forEach(circle => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    this.drawGradientContent(ctx, canvas, data);
  }

  drawDashboardDesign(ctx, canvas, data) {
    // Clean dashboard design like the reference
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    this.drawDashboardContent(ctx, canvas, data);
  }

  drawModernContent(ctx, canvas, data) {
    const containerPadding = 40;
    const containerX = containerPadding;
    const containerY = 60;
    const containerWidth = canvas.width - (containerPadding * 2);
    const containerHeight = canvas.height - 120;
    
    // Glass container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.roundRect(containerX, containerY, containerWidth, containerHeight, 20);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(containerX, containerY, containerWidth, containerHeight, 20);
    ctx.stroke();
    
    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('💰 FINANCIAL DASHBOARD', canvas.width / 2, containerY + 50);
    
    // Circular metrics layout
    this.drawCircularMetrics(ctx, canvas, data, containerY);
    
    // Balance meter
    this.drawBalanceMeter(ctx, canvas, data, containerY + containerHeight - 120, 'rgba(255, 255, 255, 0.3)');
    
    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px system-ui';
    ctx.fillText('Advanced Goal Alignment Calculator', canvas.width / 2, canvas.height - 30);
  }

  drawCorporateContent(ctx, canvas, data) {
    // Professional layout with cards
    const cardPadding = 60;
    
    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FINANCIAL PERFORMANCE REPORT', canvas.width / 2, 80);
    
    ctx.font = '18px system-ui';
    ctx.fillStyle = '#94a3b8';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    ctx.fillText(currentDate, canvas.width / 2, 110);
    
    // Draw professional metric cards
    const metrics = [
      {label: 'Total Goals', value: data.totalCost, color: '#3b82f6', x: cardPadding, y: 160},
      {label: 'Monthly Investment', value: data.monthlyNeeded, color: '#10b981', x: canvas.width - 300 - cardPadding, y: 160},
      {label: 'Time Required', value: data.timeRequired, color: '#8b5cf6', x: cardPadding, y: 320},
      {label: 'Savings Rate', value: data.savingsRate, color: '#f59e0b', x: canvas.width - 300 - cardPadding, y: 320}
    ];
    
    metrics.forEach(metric => {
      // Card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(metric.x, metric.y, 300, 120, 12);
      ctx.fill();
      
      // Left accent
      ctx.fillStyle = metric.color;
      ctx.fillRect(metric.x, metric.y, 4, 120);
      
      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(metric.value, metric.x + 20, metric.y + 55);
      
      // Label
      ctx.font = '16px system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(metric.label, metric.x + 20, metric.y + 80);
    });
    
    // Health score section
    const healthY = 500;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(cardPadding, healthY, canvas.width - (cardPadding * 2), 100, 12);
    ctx.fill();
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.healthValue, canvas.width / 2, healthY + 60);
    
    ctx.font = '18px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('FINANCIAL HEALTH SCORE', canvas.width / 2, healthY + 85);
    
    // Balance status
    this.drawBalanceMeter(ctx, canvas, data, healthY + 140, 'rgba(255, 255, 255, 0.1)');
  }

  drawMinimalistContent(ctx, canvas, data) {
    // Clean, typography-focused design
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Financial Overview', canvas.width / 2, 100);
    
    // Simple metric rows
    const metrics = [
      {label: 'Total Goals', value: data.totalCost, y: 200},
      {label: 'Monthly Investment', value: data.monthlyNeeded, y: 280},
      {label: 'Time Required', value: data.timeRequired, y: 360},
      {label: 'Savings Rate', value: data.savingsRate, y: 440}
    ];
    
    metrics.forEach(metric => {
      // Label
      ctx.font = '20px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, 100, metric.y);
      
      // Value
      ctx.font = 'bold 32px system-ui';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'right';
      ctx.fillText(metric.value, canvas.width - 100, metric.y);
      
      // Divider line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, metric.y + 20);
      ctx.lineTo(canvas.width - 100, metric.y + 20);
      ctx.stroke();
    });
    
    // Health score highlight
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(100, 520, canvas.width - 200, 120, 8);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.healthValue + ' Health Score', canvas.width / 2, 590);
    
    // Simple balance indicator
    ctx.fillStyle = '#64748b';
    ctx.font = '18px system-ui';
    ctx.fillText(data.balanceStatus, canvas.width / 2, 720);
  }

  drawGradientContent(ctx, canvas, data) {
    // Colorful, modern design
    const containerPadding = 50;
    const containerY = 80;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(containerPadding, containerY, canvas.width - (containerPadding * 2), canvas.height - 160, 25);
    ctx.fill();
    
    // Header with shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.font = 'bold 44px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Financial Dashboard', canvas.width / 2 + 2, containerY + 52);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Financial Dashboard', canvas.width / 2, containerY + 50);
    
    // Colorful metric cards in grid
    const cardSize = 180;
    const spacing = 50;
    const startX = (canvas.width - (cardSize * 2 + spacing)) / 2;
    const startY = containerY + 120;
    
    const metrics = [
      {label: 'Goals', value: data.totalCost, color: '#ff6b6b', x: startX, y: startY},
      {label: 'Monthly', value: data.monthlyNeeded, color: '#4ecdc4', x: startX + cardSize + spacing, y: startY},
      {label: 'Timeline', value: data.timeRequired, color: '#45b7d1', x: startX, y: startY + cardSize + spacing},
      {label: 'Rate', value: data.savingsRate, color: '#f9ca24', x: startX + cardSize + spacing, y: startY + cardSize + spacing}
    ];
    
    metrics.forEach(metric => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.roundRect(metric.x + 5, metric.y + 5, cardSize, cardSize, 20);
      ctx.fill();
      
      // Card
      ctx.fillStyle = metric.color;
      ctx.beginPath();
      ctx.roundRect(metric.x, metric.y, cardSize, cardSize, 20);
      ctx.fill();
      
      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(metric.value, metric.x + cardSize/2, metric.y + cardSize/2 - 10);
      
      // Label
      ctx.font = '16px system-ui';
      ctx.fillText(metric.label, metric.x + cardSize/2, metric.y + cardSize/2 + 15);
    });
    
    // Health score at center
    const centerX = canvas.width / 2;
    const centerY = startY + cardSize/2 + spacing/2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText(data.healthValue, centerX, centerY - 5);
    
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Health', centerX, centerY + 15);
  }

  drawCircularMetrics(ctx, canvas, data, containerY) {
    const centerX = canvas.width / 2;
    const centerY = containerY + 320;
    const radius = 140;
    
    const metrics = [
      {label: 'TOTAL GOALS', value: data.totalCost, icon: '🎯', color: '#ff6b6b', angle: 0},
      {label: 'MONTHLY SIP', value: data.monthlyNeeded, icon: '💰', color: '#4ecdc4', angle: Math.PI / 2},
      {label: 'TIME FRAME', value: data.timeRequired, icon: '⏰', color: '#45b7d1', angle: Math.PI},
      {label: 'SAVINGS RATE', value: data.savingsRate, icon: '📈', color: '#f9ca24', angle: (3 * Math.PI) / 2}
    ];
    
    metrics.forEach(metric => {
      const x = centerX + Math.cos(metric.angle) * radius;
      const y = centerY + Math.sin(metric.angle) * radius;
      const cardSize = 120;
      
      // Card shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x - cardSize/2 + 3, y - cardSize/2 + 3, cardSize, cardSize, 15);
      ctx.fill();
      
      // Card
      ctx.fillStyle = metric.color;
      ctx.beginPath();
      ctx.roundRect(x - cardSize/2, y - cardSize/2, cardSize, cardSize, 15);
      ctx.fill();
      
      // Content
      ctx.font = '32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(metric.icon, x, y - 15);
      
      ctx.font = 'bold 16px system-ui';
      ctx.fillText(metric.value, x, y + 10);
      
      ctx.font = '10px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(metric.label, x, y + 25);
    });
    
    // Central health score
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 77, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.healthValue, centerX, centerY - 5);
    
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText('HEALTH SCORE', centerX, centerY + 15);
  }

  drawDashboardContent(ctx, canvas, data) {
    const padding = 50;
    
    // Header section with title and health badge
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('💰 FINANCIAL DASHBOARD', padding, 70);
    
    // Health score badge (top right)
    const badgeWidth = 260;
    const badgeHeight = 45;
    const badgeX = canvas.width - badgeWidth - padding;
    const badgeY = 35;
    
    const healthPercent = parseFloat(data.healthValue.replace('%', '')) || 0;
    let badgeColor = '#10b981';
    if (healthPercent < 50) badgeColor = '#ef4444';
    else if (healthPercent < 75) badgeColor = '#f59e0b';
    
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`+${data.healthValue} Financial Health`, badgeX + badgeWidth/2, badgeY + 28);
    
    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '15px system-ui';
    ctx.textAlign = 'left';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    ctx.fillText(`${currentDate} | Complete Financial Analysis & Life Balance Assessment`, padding, 95);
    
    // === WORK ↔ LIFE BALANCE SECTION ===
    const balanceY = 130;
    const balanceWidth = 500;
    const balanceHeight = 100;
    
    // Balance card background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(padding, balanceY, balanceWidth, balanceHeight, 15);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Balance title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('⚖️ Work ↔ Life Balance', padding + 20, balanceY + 30);
    
    // Balance meter
    const meterX = padding + 20;
    const meterY = balanceY + 45;
    const meterWidth = balanceWidth - 40;
    const meterHeight = 8;
    
    // Meter gradient
    const meterGradient = ctx.createLinearGradient(meterX, meterY, meterX + meterWidth, meterY);
    meterGradient.addColorStop(0, '#ef4444');
    meterGradient.addColorStop(0.5, '#f59e0b');
    meterGradient.addColorStop(1, '#10b981');
    
    ctx.fillStyle = meterGradient;
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterWidth, meterHeight, 4);
    ctx.fill();
    
    // Balance indicator
    const balanceIndicator = document.getElementById('balance-indicator');
    let balancePosition = 50;
    if (balanceIndicator && balanceIndicator.style.left) {
      const leftStyle = balanceIndicator.style.left;
      if (leftStyle && leftStyle !== '50%') {
        balancePosition = parseInt(leftStyle.replace('%', ''));
      }
    }
    
    const indicatorX = meterX + (meterWidth * balancePosition / 100);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(indicatorX, meterY + meterHeight/2, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Balance status
    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.balanceStatus, meterX + meterWidth/2, meterY + 30);
    
    // === KEY METRICS SECTION ===
    const metricsY = balanceY + balanceHeight + 30;
    
    // Key Metrics title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('📊 Key Metrics', padding, metricsY);
    
    // Four key metric cards in a row
    const metricCardWidth = (canvas.width - (padding * 2) - 60) / 4;
    const metricCardHeight = 90;
    const metricSpacing = 20;
    const metricY = metricsY + 30;
    
    const keyMetrics = [
      {label: 'Total Goal Cost', value: data.totalCost, color: '#3b82f6', icon: '🎯'},
      {label: 'Monthly Needed', value: data.monthlyNeeded, color: '#10b981', icon: '💰'},
      {label: 'Time Required', value: data.timeRequired, color: '#8b5cf6', icon: '⏰'},
      {label: 'Savings Rate', value: data.savingsRate, color: '#f59e0b', icon: '📈'}
    ];
    
    keyMetrics.forEach((metric, index) => {
      const metricX = padding + (metricCardWidth + metricSpacing) * index;
      
      // Card background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(metricX, metricY, metricCardWidth, metricCardHeight, 12);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Left colored accent
      ctx.fillStyle = metric.color;
      ctx.fillRect(metricX, metricY, 4, metricCardHeight);
      
      // Icon
      ctx.font = '20px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(metric.icon, metricX + 15, metricY + 30);
      
      // Value
      ctx.fillStyle = metric.color;
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(metric.value, metricX + metricCardWidth/2, metricY + 35);
      
      // Label
      ctx.font = '11px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.fillText(metric.label, metricX + metricCardWidth/2, metricY + 55);
    });
    
    // === FINANCIAL HEALTH SECTION ===
    const healthSectionY = metricY + metricCardHeight + 30;
    const healthSectionWidth = canvas.width - (padding * 2);
    const healthSectionHeight = 110;
    
    // Health section background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(padding, healthSectionY, healthSectionWidth, healthSectionHeight, 15);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Health title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 Financial Health', padding + 20, healthSectionY + 30);
    
    // Health score circle (centered)
    const healthCircleX = padding + healthSectionWidth/2;
    const healthCircleY = healthSectionY + 65;
    const healthRadius = 35;
    
    // Health circle background
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(healthCircleX, healthCircleY, healthRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Health circle border
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(healthCircleX, healthCircleY, healthRadius - 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Health percentage
    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.healthValue, healthCircleX, healthCircleY + 5);
    
    // Health progress bar
    const healthBarY = healthSectionY + 45;
    const healthBarWidth = healthSectionWidth - 200;
    const healthBarX = padding + 100;
    const healthBarHeight = 6;
    
    // Progress bar background
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight, 3);
    ctx.fill();
    
    // Progress bar fill
    const healthProgress = healthPercent / 100;
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY, healthBarWidth * healthProgress, healthBarHeight, 3);
    ctx.fill();
    
    // === SUMMARY HIGHLIGHT SECTION ===
    const summaryY = healthSectionY + healthSectionHeight + 25;
    const summaryHeight = 70;
    
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.roundRect(padding, summaryY, healthSectionWidth, summaryHeight, 15);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(data.totalCost, canvas.width/2, summaryY + 30);
    
    ctx.font = '14px system-ui';
    ctx.fillText('Total Financial Goals - Your Investment Journey Starts Here!', canvas.width/2, summaryY + 50);
    
    // === RIGHT SIDE PROGRESS INDICATORS ===
    const rightX = padding + 520;
    const rightWidth = canvas.width - rightX - padding;
    
    // Progress title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('📈 Monthly Progress', rightX, balanceY + 25);
    
    // Create small progress boxes
    const progressBoxes = [
      {label: 'Health', value: data.healthValue, color: badgeColor},
      {label: 'Balance', value: balancePosition > 60 ? 'Good' : 'Moderate', color: '#3b82f6'},
      {label: 'Goals', value: 'Active', color: '#10b981'},
      {label: 'Track', value: '✓', color: '#8b5cf6'}
    ];
    
    const progressBoxSize = (rightWidth - 15) / 2;
    const progressSpacing = 15;
    
    progressBoxes.forEach((box, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const boxX = rightX + col * (progressBoxSize + progressSpacing);
      const boxY = balanceY + 45 + row * (progressBoxSize + progressSpacing);
      
      ctx.fillStyle = box.color;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, progressBoxSize, progressBoxSize, 12);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(box.value, boxX + progressBoxSize/2, boxY + progressBoxSize/2 - 5);
      
      ctx.font = '10px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(box.label, boxX + progressBoxSize/2, boxY + progressBoxSize/2 + 10);
    });
    
    // Footer branding
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Advanced Goal Alignment Calculator - Complete Financial Dashboard', canvas.width/2, canvas.height - 25);
  }

  drawBalanceMeter(ctx, canvas, data, y, bgColor) {
    const statusBarWidth = canvas.width - 160;
    const statusBarX = 80;
    const statusBarHeight = 50;
    
    // Status background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(statusBarX, y, statusBarWidth, statusBarHeight, 25);
    ctx.fill();
    
    // Status text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚖️ ' + data.balanceStatus, canvas.width / 2, y + 32);
    
    // Meter
    const meterY = y + 70;
    const meterWidth = statusBarWidth - 100;
    const meterHeight = 8;
    const meterX = statusBarX + 50;
    
    // Meter gradient
    const meterGradient = ctx.createLinearGradient(meterX, meterY, meterX + meterWidth, meterY);
    meterGradient.addColorStop(0, '#ef4444');
    meterGradient.addColorStop(0.5, '#f59e0b');
    meterGradient.addColorStop(1, '#10b981');
    
    ctx.fillStyle = meterGradient;
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterWidth, meterHeight, 4);
    ctx.fill();
    
    // Balance indicator
    const balanceIndicator = document.getElementById('balance-indicator');
    let balancePosition = 50;
    if (balanceIndicator && balanceIndicator.style.left) {
      const leftStyle = balanceIndicator.style.left;
      if (leftStyle && leftStyle !== '50%') {
        balancePosition = parseInt(leftStyle.replace('%', ''));
      }
    }
    
    const indicatorX = meterX + (meterWidth * balancePosition / 100);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(indicatorX, meterY + meterHeight/2, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Helper function to wrap text for canvas
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Helper method to set form data
  setFormData(formData) {
    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = formData[key];
        // Trigger input event to update calculations
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.financialPlannerApp = new FinancialPlannerApp();
    
    // Expose functions globally for HTML onclick attributes
    window.downloadJSON = () => window.financialPlannerApp.downloadJSON();
    window.loadJSON = () => window.financialPlannerApp.loadJSON();
    window.handleJSONLoad = (event) => window.financialPlannerApp.handleJSONLoad(event);
    window.shareToSocialMedia = () => window.financialPlannerApp.shareToSocialMedia();
    window.resetAll = () => window.financialPlannerApp.resetAll();
    
  } catch (error) {
    console.error('Error initializing application:', error);
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
      toastMessage.textContent = 'Error loading application. Please refresh the page.';
      toast.className = 'toast show danger';
    }
  }
});

// Star rating functionality
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;
    
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        currentRating = index + 1;
        stars.forEach((s, i) => {
          s.classList.toggle('active', i < currentRating);
        });
      });
    });
  }, 100);
});