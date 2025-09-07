// Main Application Controller - ENHANCED with Investment Data Integration
class FinancialPlannerApp {
  constructor() {
    this.calculator = new FinancialCalculator();
    this.goalsManager = new GoalsManager();
    this.uiManager = new UIManager();
    this.previousResults = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.uiManager.addCustomStyles();
    this.setupGoToTop();
    this.setupInvestmentSummaryTracking();
    this.setupMobileNavigation();
    
    // CRITICAL: Force financial health bar to 0% on mobile startup
    this.initializeFinancialHealthBar();
    
    this.uiManager.showToast('Financial planner loaded successfully!', 'success');
  }

  // CRITICAL: Initialize financial health bar to 0% on startup
  initializeFinancialHealthBar() {
    const financialHealthBar = document.getElementById('financial-health-bar');
    if (financialHealthBar) {
      // Force 0% width with important flag to override any CSS
      financialHealthBar.style.setProperty('width', '0%', 'important');
      // Also ensure it has proper transition
      financialHealthBar.style.setProperty('transition', 'width 0.5s ease', 'important');
    }
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

    const handleScroll = () => {
      goToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    goToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        // Show selected section with scroll
        this.showMobileSection(section, true);
        
        // Show appropriate toast message
        const sectionName = section === 'home' ? 'Input Form' : 'Results Dashboard';
        this.uiManager.showToast(`Switched to ${sectionName}`, 'info');
      });
    });
  }

  showMobileSection(section, shouldScroll = false) {
    const homeSection = document.getElementById('home-section');
    const resultsSection = document.getElementById('results-section');
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile || !homeSection || !resultsSection) return;

    if (section === 'home') {
      homeSection.classList.remove('mobile-hidden');
      resultsSection.classList.add('mobile-hidden');
      // Remove automatic scroll-to-top - preserve user's scroll position
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'results') {
      homeSection.classList.add('mobile-hidden');
      resultsSection.classList.remove('mobile-hidden');
      // Only scroll when explicitly requested (user clicked nav, not resize)
      if (shouldScroll) {
        setTimeout(() => {
          const resultsTop = resultsSection.offsetTop;
          window.scrollTo({ top: resultsTop, behavior: 'smooth' });
        }, 100);
      }
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
          
          // Add specific logging for savings field
          if (id === 'savings') {
            input.addEventListener('input', () => {
              console.log('💾 Savings field changed:', input.value);
            });
          }
          
          // Add age validation for specific fields
          if (['age', 'timeline', 'life-expectancy'].includes(id)) {
            input.addEventListener('blur', () => this.validateAgeFields());
          }
        }
      });
    });

    const balanceButton = document.getElementById('balance-button');
    if (balanceButton) {
      console.log('Balance button found, adding event listeners');
      balanceButton.addEventListener('click', (e) => {
        console.log('Balance button clicked!');
        e.preventDefault();
        e.stopPropagation();
        this.showBalanceOptions();
      });
      // Enhanced mobile support - add touch events
      balanceButton.addEventListener('touchend', (e) => {
        console.log('Balance button touched!');
        e.preventDefault();
        e.stopPropagation();
        this.showBalanceOptions();
      });
      // Force button to be visible for debugging
      balanceButton.style.display = 'block';
      balanceButton.style.visibility = 'visible';
      balanceButton.style.opacity = '1';
    } else {
      console.error('Balance button not found!');
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
    
    
    // Add global mobile section switching function
    window.switchMobileSection = (section) => {
      console.log('Switching to section:', section);
      if (window.financialPlannerApp) {
        window.financialPlannerApp.showMobileSection(section, true);
        
        // Update mobile nav active state
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        const targetNav = document.querySelector(`[data-section="${section}"]`);
        if (targetNav) targetNav.classList.add('active');
      } else {
        alert('App not ready yet!');
      }
    };
    
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
      const result = isNaN(value) || element.value === '' ? 0 : value;
      
      // Debug savings field specifically
      if (id === 'savings') {
        console.log('📊 Savings getData Debug:', {
          elementFound: !!element,
          rawValue: element?.value,
          parsedValue: value,
          finalResult: result,
          isEmpty: element?.value === ''
        });
      }
      
      return result;
    };

    const formData = {
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
    
    console.log('📋 Complete Form Data:', {
      savings: formData.savings,
      income: formData.income,
      expenses: formData.expenses,
      age: formData.age
    });
    
    return formData;
  }

  // NEW: Check if essential fields are completed
  hasEssentialInputs(formData) {
    return formData.age > 0 && 
           formData.timeline > 0 && 
           formData.lifeExpectancy > 0 && 
           formData.income > 0 && 
           formData.expenses > 0;
  }

  // NEW: Show message when essential data is incomplete
  showIncompleteDataMessage() {
    // Reset Key Goal Metrics
    const elements = {
      'total-cost': '₹--',
      'monthly-needed': '₹--',
      'time-required': '--',
      'savings-rate': '--%'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Reset Work-Life Balance
    const balanceStatus = document.getElementById('balance-status');
    const balanceIndicator = document.getElementById('balance-indicator');
    const balanceButton = document.getElementById('balance-button');
    
    if (balanceStatus) {
      balanceStatus.textContent = 'Please complete basic information to see your balance';
      balanceStatus.className = 'balance-status';
    }
    if (balanceIndicator) {
      balanceIndicator.style.left = '50%';
      balanceIndicator.className = 'meter-indicator';
    }
    if (balanceButton) {
      balanceButton.style.display = 'none';
    }

    // Reset Financial Health
    const financialHealthValue = document.getElementById('financial-health-value');
    const financialHealthBar = document.getElementById('financial-health-bar');
    const achievementsContainer = document.getElementById('achievements-container');
    
    if (financialHealthValue) financialHealthValue.textContent = '--%';
    if (financialHealthBar) financialHealthBar.style.width = '0%';
    if (achievementsContainer) {
      achievementsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Complete your basic information to see financial health insights</div>';
    }

    // Reset Insights
    const insightsList = document.getElementById('insights-list');
    if (insightsList) {
      insightsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Enter your financial details to get personalized insights</div>';
    }

    // Reset Scenarios
    const scenariosList = document.getElementById('scenarios-list');
    if (scenariosList) {
      scenariosList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Financial scenarios will appear once you complete the basic information</div>';
    }
  }

  calculateResults() {
    try {
      const formData = this.getFormData();
      this.updateInvestmentSummary(); // Update investment summary
      
      // Only show results if essential fields are completed
      if (!this.hasEssentialInputs(formData)) {
        this.showIncompleteDataMessage();
        return;
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
      
      // FIXED: Always update balance meter, even with partial data
      this.updateEnhancedFinancialHealth(formData, loanData);
      
      this.updateEnhancedLoanBasedInsights(formData, loanData);
      
      // Always update investment achievements regardless of goals
      if (formData.income > 0) {
        const mockResults = {
          financialHealth: 0, // Will be calculated separately
          investmentData: {
            investmentPortfolioStrength: this.calculateInvestmentStrength(formData),
            existingInvestments: formData.existingInvestments || 0,
            currentSip: formData.currentSip || 0,
            sipDuration: formData.sipDuration || 0
          }
        };
        this.uiManager.updateInvestmentAchievements(mockResults);
      }
      
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
          
          // IMPORTANT: Recalculate enhanced financial health after goals update
          // This ensures our emergency fund logic isn't overwritten by calculator's basic logic
          this.updateEnhancedFinancialHealth(formData, loanData);
          
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
    // FIXED: Handle cases where income might be 0 or empty
    const expenseRatio = formData.income > 0 ? (formData.expenses / formData.income) * 100 : 0;
    const totalEmi = formData.existingEmi || 0;
    const disposableIncome = formData.income - formData.expenses - totalEmi;
    
    // Calculate investment strength
    const investmentStrength = this.calculateInvestmentStrength(formData);
    
    let healthScore = 50;
    
    // Standard financial factors (60% weight) - Only calculate if income > 0
    const factors = [];
    
    if (formData.income > 0) {
      factors.push(
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
      );
    }

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
    
    // Enhanced emergency fund factor - massive funds provide strong protection
    if (formData.savings > 0 && formData.expenses > 0) {
      const emergencyMonths = formData.savings / formData.expenses;
      const totalMonthlyOutflow = formData.expenses + totalEmi;
      const sustainabilityMonths = totalMonthlyOutflow > 0 ? formData.savings / totalMonthlyOutflow : 0;
      
      console.log('💰 Emergency Fund Analysis:', {
        emergencyMonths: emergencyMonths,
        sustainabilityMonths: sustainabilityMonths,
        totalMonthlyOutflow: totalMonthlyOutflow
      });
      
      // Massive emergency fund provides substantial health boost
      if (sustainabilityMonths >= 120) healthScore += 35; // 10+ years sustainability
      else if (sustainabilityMonths >= 60) healthScore += 30; // 5+ years sustainability  
      else if (sustainabilityMonths >= 24) healthScore += 25; // 2+ years sustainability
      else if (emergencyMonths >= 12) healthScore += 15; // 1+ year emergency coverage
      else if (emergencyMonths >= 6) healthScore += 10;  // 6+ months emergency coverage
      else if (emergencyMonths >= 3) healthScore += 5;   // 3+ months emergency coverage
      else if (emergencyMonths < 1) healthScore -= 5;    // Less than 1 month
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    // Update UI elements
    this.uiManager.updateElement('financial-health-value', UTILS.formatPercentage(healthScore));
    this.uiManager.updateProgressBar('financial-health-bar', healthScore);
    this.uiManager.updateElement('expense-ratio', UTILS.formatPercentage(expenseRatio));
    this.uiManager.updateProgressBar('expense-progress', expenseRatio);
    
    const savingsRate = (disposableIncome > 0 && formData.income > 0) ? (disposableIncome / formData.income) * 100 : 0;
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
    // Double-check savings field at calculation time
    const savingsElement = document.getElementById('savings');
    console.log('🎯 Work-Life Balance Update Triggered:', {
      age: formData.age,
      income: formData.income,
      expenses: formData.expenses,
      savings: formData.savings,
      savingsElementExists: !!savingsElement,
      savingsElementValue: savingsElement?.value,
      existingInvestments: formData.existingInvestments,
      currentSip: formData.currentSip,
      loanOutstanding: loanData?.totalOutstanding || 0
    });
    
    const elements = {
      indicator: document.getElementById('balance-indicator'),
      status: document.getElementById('balance-status'),
      button: document.getElementById('balance-button')
    };
    
    if (!elements.indicator || !elements.status || !elements.button) {
      console.warn('❌ Work-Life Balance elements not found');
      return;
    }
    
    const age = formData.age || 30;
    const lifeStage = this.determineLifeStage(age);
    const balanceAnalysis = this.calculateInvestmentAwareBalance(formData, loanData, lifeStage, investmentStrength);
    
    const meterPosition = balanceAnalysis.needsImprovement ? 
      Math.max(0, 50 - (balanceAnalysis.severity * 12.5)) :
      Math.min(100, 50 + (balanceAnalysis.positivity * 12.5));
    
    // Set position with proper transform to center the indicator
    elements.indicator.style.left = meterPosition + '%';
    elements.indicator.style.transform = 'translateX(-50%)';
    elements.status.textContent = balanceAnalysis.statusText;
    elements.status.style.backgroundColor = balanceAnalysis.bgColor;
    elements.status.style.color = balanceAnalysis.textColor;
    elements.button.style.display = balanceAnalysis.needsImprovement ? 'block' : 'none';
    elements.button.textContent = balanceAnalysis.buttonText;
  }

  // ENHANCED: Balance calculation with investment awareness
  calculateInvestmentAwareBalance(formData, loanData, lifeStage, investmentStrength) {
    // Goals are NOT considered for Work-Life Balance calculation
    const goalToIncomeRatio = 0; // No goals in Work-Life Balance calculation
    const debtBurden = loanData.totalOutstanding > 0 ? 
      (loanData.totalOutstanding / (formData.income * 12)) * 100 : 0;
    
    // Investment-aware analysis without goals
    const analysis = this.getInvestmentAwareLifeStageAnalysis(
      lifeStage, formData, loanData, goalToIncomeRatio, debtBurden, investmentStrength
    );
    
    return analysis;
  }

  // NEW: Investment-aware life stage analysis
  getInvestmentAwareLifeStageAnalysis(lifeStage, formData, loanData, goalToIncomeRatio, debtBurden, investmentStrength) {
    const disposableIncome = formData.income - formData.expenses - (formData.existingEmi || 0);
    const savingsRate = formData.income > 0 ? (disposableIncome / formData.income) * 100 : -100;
    
    // Calculate emergency fund coverage (Personal Details: Savings)
    const emergencyMonths = (formData.savings > 0 && formData.expenses > 0) ? 
      formData.savings / formData.expenses : 0;
    
    console.log('💰 Emergency Fund Calculation:', {
      savings: formData.savings,
      expenses: formData.expenses, 
      emergencyMonths: emergencyMonths,
      condition: formData.savings > 0 && formData.expenses > 0
    });
    
    // Base analysis with investment strength modifier
    switch (lifeStage) {
      case 'early-career':
        return this.analyzeEarlyCareerWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths);
      case 'building':
        return this.analyzeBuildingWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths);
      case 'peak-earning':
        return this.analyzePeakEarningWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths);
      case 'pre-retirement':
        return this.analyzePreRetirementWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths);
      case 'senior':
        return this.analyzeSeniorWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths);
      default:
        return this.createBalanceAnalysis(false, 1, 'Balanced', '#d4edda', '#155724', 'Optimize Balance');
    }
  }

  // Investment-aware life stage analyses
  analyzeEarlyCareerWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths) {
    console.log('🔍 Early Career Analysis Debug:', {
      debtBurden, goalToIncomeRatio, investmentStrength, savingsRate, emergencyMonths
    });
    
    // Crisis scenarios - enhanced with emergency fund considerations
    const crisisCheck = debtBurden > 300 || savingsRate < 0 || (emergencyMonths < 1 && savingsRate < 10);
    console.log('❗ Crisis Check:', { 
      debtBurdenHigh: debtBurden > 300,
      negativeSavings: savingsRate < 0,
      lowEmergencyAndSavings: (emergencyMonths < 1 && savingsRate < 10),
      triggers: crisisCheck
    });
    
    if (crisisCheck) {
      console.log('🚨 TRIGGERED: Crisis scenario');
      return this.createBalanceAnalysis(true, 4, 'Financial Crisis - Focus on Basics', '#f8d7da', '#721c24', 'Emergency Plan');
    }
    
    // High pressure scenarios - include emergency fund weakness
    // BUT: Strong emergency fund (6+ months) can offset low savings rate
    const highPressureCheck = debtBurden > 200 || goalToIncomeRatio > 6 || 
        (savingsRate < 5 && emergencyMonths < 6) || 
        (emergencyMonths < 3 && investmentStrength < 40);
    console.log('⚠️  High Pressure Check:', {
      highDebt: debtBurden > 200,
      highGoals: goalToIncomeRatio > 6,
      lowSavingsAndEmergency: (savingsRate < 5 && emergencyMonths < 6),
      lowEmergencyAndInvestment: (emergencyMonths < 3 && investmentStrength < 40),
      triggers: highPressureCheck
    });
    
    if (highPressureCheck) {
      console.log('⚠️  TRIGGERED: High Pressure scenario');
      return this.createBalanceAnalysis(true, 3, 'High Pressure - Build Investment Discipline', '#fff3cd', '#856404', 'Start SIP Journey');
    }
    
    // Strong emergency fund scenarios (offset low savings rate)
    const strongEmergencyCheck = emergencyMonths >= 12 && debtBurden <= 100;
    console.log('💪 Strong Emergency Check:', {
      emergencyMonths: emergencyMonths >= 12,
      lowDebt: debtBurden <= 100,
      triggers: strongEmergencyCheck
    });
    
    if (strongEmergencyCheck) {
      console.log('💪 TRIGGERED: Strong Emergency Buffer');
      return this.createBalanceAnalysis(false, 2, 'Strong Emergency Buffer - Focus on Growth', '#d4edda', '#155724', 'Start Investing');
    }
    
    const goodEmergencyCheck = emergencyMonths >= 6 && debtBurden <= 100;
    console.log('👍 Good Emergency Check:', {
      emergencyMonths: emergencyMonths >= 6,
      lowDebt: debtBurden <= 100,
      triggers: goodEmergencyCheck
    });
    
    if (goodEmergencyCheck) {
      console.log('👍 TRIGGERED: Good Emergency Coverage');
      return this.createBalanceAnalysis(false, 1, 'Good Emergency Coverage - Build Income', '#d4edda', '#155724', 'Increase Earnings');
    }
    
    // Investment-based success scenarios
    if (investmentStrength >= 60 && savingsRate >= 20 && debtBurden <= 100) {
      console.log('🏆 TRIGGERED: Outstanding Investment Success');
      return this.createBalanceAnalysis(false, 3, 'Outstanding Early Investment Success', '#d1ecf1', '#0c5460', 'Accelerate Wealth');
    }
    
    if (investmentStrength >= 40 && savingsRate >= 15) {
      console.log('📈 TRIGGERED: Good Investment Foundation');
      return this.createBalanceAnalysis(false, 2, 'Good Investment Foundation Building', '#d4edda', '#155724', 'Continue Growing');
    }
    
    if (investmentStrength >= 20 || savingsRate >= 10) {
      console.log('🌱 TRIGGERED: Investment Journey Started');
      return this.createBalanceAnalysis(false, 1, 'Investment Journey Started', '#d4edda', '#155724', 'Build Consistency');
    }
    
    console.log('🎯 TRIGGERED: Default - Start Investment Discipline');
    return this.createBalanceAnalysis(true, 2, 'Start Investment Discipline', '#e2e3e5', '#495057', 'Begin SIP Journey');
  }

  analyzeBuildingWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths) {
    console.log('🔍 Building Years Analysis Debug:', {
      debtBurden, goalToIncomeRatio, investmentStrength, savingsRate, emergencyMonths
    });
    
    // Critical scenarios - BUT: Massive emergency fund (24+ months) can override debt crisis
    const crisisCheck = (debtBurden > 400 && emergencyMonths < 24) || 
                       (savingsRate < -10 && emergencyMonths < 12) || 
                       (savingsRate < 5 && emergencyMonths < 3) || 
                       goalToIncomeRatio > 8;
    console.log('❗ Crisis Check (Building):', { 
      highDebtLowEmergency: (debtBurden > 400 && emergencyMonths < 24),
      veryNegativeSavings: (savingsRate < -10 && emergencyMonths < 12),
      lowSavingsAndEmergency: (savingsRate < 5 && emergencyMonths < 3),
      highGoals: goalToIncomeRatio > 8,
      triggers: crisisCheck
    });
    
    if (crisisCheck) {
      console.log('🚨 TRIGGERED: Building Crisis scenario');
      return this.createBalanceAnalysis(true, 4, 'Crisis - Reset Investment Strategy', '#f8d7da', '#721c24', 'Restructure Everything');
    }
    
    // Massive emergency fund scenarios - can handle high debt
    if (emergencyMonths >= 200 && debtBurden > 200) {
      console.log('🏰 TRIGGERED: Building - Massive Wealth Buffer with Debt');
      return this.createBalanceAnalysis(false, 2, 'Massive Emergency Fund - Optimize Debt Strategy', '#d1ecf1', '#0c5460', 'Refinance & Invest');
    }
    
    if (emergencyMonths >= 50 && debtBurden > 200) {
      console.log('💎 TRIGGERED: Building - Very Strong Buffer with Debt');
      return this.createBalanceAnalysis(false, 1, 'Very Strong Emergency Fund - Consider Debt Payoff', '#d4edda', '#155724', 'Debt Strategy');
    }
    
    // Strong emergency fund scenarios (offset low savings rate) - SAME AS EARLY CAREER
    if (emergencyMonths >= 12 && debtBurden <= 100) {
      console.log('💪 TRIGGERED: Building - Strong Emergency Buffer');
      return this.createBalanceAnalysis(false, 2, 'Strong Emergency Buffer - Scale Investments', '#d4edda', '#155724', 'Boost SIP');
    }
    
    if (emergencyMonths >= 6 && debtBurden <= 100) {
      console.log('👍 TRIGGERED: Building - Good Emergency Coverage');
      return this.createBalanceAnalysis(false, 1, 'Good Emergency Coverage - Start Investing', '#d4edda', '#155724', 'Begin SIP');
    }
    
    // High pressure with investment context - BUT: Emergency fund protection
    const highPressureCheck = debtBurden > 250 || (savingsRate < 10 && emergencyMonths < 6) || (goalToIncomeRatio > 6 && investmentStrength < 40);
    console.log('⚠️  High Pressure Check (Building):', {
      highDebt: debtBurden > 250,
      lowSavingsAndEmergency: (savingsRate < 10 && emergencyMonths < 6),
      highGoalsLowInvestment: (goalToIncomeRatio > 6 && investmentStrength < 40),
      triggers: highPressureCheck
    });
    
    if (highPressureCheck) {
      console.log('⚠️  TRIGGERED: Building High Pressure scenario');
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

  analyzePeakEarningWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths) {
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

  analyzePreRetirementWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths) {
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

  analyzeSeniorWithInvestments(formData, goalToIncomeRatio, debtBurden, investmentStrength, savingsRate, emergencyMonths) {
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
      severity: needsImprovement ? severity : 0,
      positivity: needsImprovement ? 0 : severity,
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
            <i id="${loanId}_scenario_icon" class="fas fa-rocket" style="color: #28a745;"></i>
            <span>With Your EMI Amount:</span>
          </div>
          <div class="loan-summary-item">
            <span id="${loanId}_completion_label">Early Completion:</span>
            <span id="${loanId}_emi_completion" style="color: #28a745; font-weight: 500;">-</span>
          </div>
          <div class="loan-summary-item">
            <span id="${loanId}_time_label">Time Saved:</span>
            <span id="${loanId}_time_saved" style="color: #007bff; font-weight: 500;">-</span>
          </div>
          <div class="loan-summary-item">
            <span id="${loanId}_interest_label">Interest Saved:</span>
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
      this.calculateResults(); // Trigger Work-Life Balance update
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
    let completionSavings = 0;
    let completionType = 'standard'; // 'early', 'delayed', or 'standard'
    
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
          completionSavings = totalInterestBasedOnLoan - emiBasedInterest;
          
          // Determine completion type
          if (userEmi > calculatedEmi) {
            completionType = 'early';
          } else if (userEmi < calculatedEmi) {
            completionType = 'delayed';
          } else {
            completionType = 'standard';
          }
          
        } catch (error) {
          console.error('EMI calculation error:', error);
          emiBasedCompletion = null;
        }
      } else {
        // User EMI is less than minimum required, this will extend the loan
        completionType = 'delayed';
        // Calculate delayed completion (simplified approach)
        if (userEmi > 0) {
          emiBasedMonths = Math.ceil(principal / userEmi); // Very simplified
          emiBasedCompletion = new Date();
          emiBasedCompletion.setMonth(emiBasedCompletion.getMonth() + emiBasedMonths);
          
          const delayedTotalPayment = userEmi * emiBasedMonths;
          const delayedInterest = delayedTotalPayment - principal;
          completionSavings = totalInterestBasedOnLoan - delayedInterest; // Will be negative (additional cost)
        }
      }
    } else if (loanData.emi > 0 && Math.abs(loanData.emi - calculatedEmi) <= 10) {
      // EMI is very close to calculated EMI
      completionType = 'standard';
      emiBasedCompletion = standardCompletionDate;
      emiBasedMonths = totalMonths;
      completionSavings = 0;
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
      completionSavings: Math.round(completionSavings * 100) / 100,
      completionType,
      showEmiScenario: emiBasedCompletion !== null && loanData.emi > 0
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
        
        // Update labels and styling based on completion type
        const completionLabelElement = document.getElementById(`${loanId}_completion_label`);
        const timeLabelElement = document.getElementById(`${loanId}_time_label`);
        const interestLabelElement = document.getElementById(`${loanId}_interest_label`);
        const scenarioIconElement = document.getElementById(`${loanId}_scenario_icon`);
        const completionDateElement = document.getElementById(`${loanId}_emi_completion`);
        const timeSavedElement = document.getElementById(`${loanId}_time_saved`);
        const interestSavedElement = document.getElementById(`${loanId}_interest_saved`);
        
        let timeSavedText = '';
        
        if (calculations.completionType === 'early') {
          // Early completion
          if (completionLabelElement) completionLabelElement.textContent = 'Early Completion:';
          if (timeLabelElement) timeLabelElement.textContent = 'Time Saved:';
          if (interestLabelElement) interestLabelElement.textContent = 'Interest Saved:';
          if (scenarioIconElement) {
            scenarioIconElement.className = 'fas fa-rocket';
            scenarioIconElement.style.color = '#28a745';
          }
          if (completionDateElement) completionDateElement.style.color = '#28a745';
          if (timeSavedElement) timeSavedElement.style.color = '#28a745';
          if (interestSavedElement) interestSavedElement.style.color = '#28a745';
          
          if (monthsSaved <= 0) {
            timeSavedText = 'No time saved';
          } else if (yearsSaved > 0 && remainingMonths > 0) {
            timeSavedText = `${yearsSaved}y ${remainingMonths}m`;
          } else if (yearsSaved > 0) {
            timeSavedText = `${yearsSaved} year${yearsSaved > 1 ? 's' : ''}`;
          } else {
            timeSavedText = `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
          }
        } else if (calculations.completionType === 'delayed') {
          // Delayed completion
          if (completionLabelElement) completionLabelElement.textContent = 'Delayed Completion:';
          if (timeLabelElement) timeLabelElement.textContent = 'Additional Time:';
          if (interestLabelElement) interestLabelElement.textContent = 'Additional Interest:';
          if (scenarioIconElement) {
            scenarioIconElement.className = 'fas fa-clock';
            scenarioIconElement.style.color = '#dc3545';
          }
          if (completionDateElement) completionDateElement.style.color = '#dc3545';
          if (timeSavedElement) timeSavedElement.style.color = '#dc3545';
          if (interestSavedElement) interestSavedElement.style.color = '#dc3545';
          
          const monthsDelayed = Math.abs(monthsSaved);
          const yearsDelayed = Math.floor(monthsDelayed / 12);
          const remainingDelayedMonths = monthsDelayed % 12;
          
          if (monthsDelayed <= 0) {
            timeSavedText = 'No time difference';
          } else if (yearsDelayed > 0 && remainingDelayedMonths > 0) {
            timeSavedText = `+${yearsDelayed}y ${remainingDelayedMonths}m`;
          } else if (yearsDelayed > 0) {
            timeSavedText = `+${yearsDelayed} year${yearsDelayed > 1 ? 's' : ''}`;
          } else {
            timeSavedText = `+${remainingDelayedMonths} month${remainingDelayedMonths > 1 ? 's' : ''}`;
          }
        } else {
          // Standard completion
          if (completionLabelElement) completionLabelElement.textContent = 'Standard Completion:';
          if (timeLabelElement) timeLabelElement.textContent = 'Time Difference:';
          if (interestLabelElement) interestLabelElement.textContent = 'Interest Difference:';
          if (scenarioIconElement) {
            scenarioIconElement.className = 'fas fa-equals';
            scenarioIconElement.style.color = '#007bff';
          }
          if (completionDateElement) completionDateElement.style.color = '#007bff';
          if (timeSavedElement) timeSavedElement.style.color = '#007bff';
          if (interestSavedElement) interestSavedElement.style.color = '#007bff';
          
          timeSavedText = 'No time difference';
        }
        
        const emiScenarioUpdates = [
          { id: `${loanId}_emi_completion`, value: calculations.emiBasedCompletion.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) },
          { id: `${loanId}_time_saved`, value: timeSavedText },
          { id: `${loanId}_interest_saved`, value: UTILS.formatCurrency(Math.abs(calculations.completionSavings)) }
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
    console.log('showBalanceOptions called');
    
    try {
      // Ensure results section is visible on mobile
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        console.log('Mobile detected, switching to results section');
        this.showMobileSection('results', true);
        // Update mobile nav
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        const resultsNav = document.querySelector('[data-section="results"]');
        if (resultsNav) resultsNav.classList.add('active');
      }
      
      const formData = this.getFormData();
      console.log('Form data:', formData);
      
      if (!this.calculator) {
        alert('Calculator not found!');
        return;
      }
      
      const plans = this.calculator.generateBalancePlans(formData);
      console.log('Generated plans:', plans);
      
      if (!this.uiManager) {
        alert('UI Manager not found!');
        return;
      }
      
      console.log('Calling showBalanceModal');
      this.uiManager.showBalanceModal(plans);
      
    } catch (error) {
      alert('Error in showBalanceOptions: ' + error.message);
      console.error('Error:', error);
    }
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
    const loanData = this.collectAndStoreLoanData();
    
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
        lifeExpectancy: formData.lifeExpectancy,
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
      loanDetails: {
        totalOutstanding: loanData.totalOutstanding,
        totalCalculatedEmi: loanData.totalCalculatedEmi,
        totalInterestBurden: loanData.totalInterestBurden,
        weightedAvgRate: loanData.weightedAvgRate,
        maxTenure: loanData.maxTenure,
        loanCount: loanData.loanCount,
        individualLoans: this.collectIndividualLoans()
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
    
    if (elements.indicator) {
      elements.indicator.style.left = '50%';
      elements.indicator.style.transform = 'translateX(-50%)';
    }
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
    const loanSummary = this.collectAndStoreLoanData();
    const individualLoans = this.collectIndividualLoans();
    const planData = {
      formData: this.getFormData(),
      results: this.previousResults,
      goals: this.goalsManager.exportGoals(),
      loanData: {
        ...loanSummary,
        individualLoans: individualLoans
      },
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

        // On mobile, ensure home section is visible for form loading
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          this.showMobileSection('home');
        }
        
        // Load form data
        this.setFormData(planData.formData);
        
        // Load goals
        this.goalsManager.importGoals(planData.goals);
        
        // Check if we're on mobile and add delay if needed
        const delay = isMobile ? 500 : 0; // Increased delay for mobile
        
        setTimeout(() => {
          // Load loan data if available
          if (planData.loanData || planData.loanDetails) {
            this.restoreLoanData(planData.loanData || planData.loanDetails);
          }
          
          // Recalculate results
          this.calculateResults();
        }, delay);
        
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

  // NEW: Generate and share social media image matching screenshot design
  async shareToSocialMedia() {
    try {
      // Check if calculations have been performed
      const totalCostEl = document.getElementById('total-cost');
      if (!totalCostEl || totalCostEl.textContent === '₹0' || totalCostEl.textContent === '') {
        this.uiManager.showToast('Please complete your financial calculation first!', 'warning');
        return;
      }
      
      // Call the new clean share image function
      await this.createCleanShareImage();
    } catch (error) {
      console.error('Error generating share image:', error);
      this.uiManager.showToast('Error generating image: ' + error.message, 'error');
    }
  }

  async createCleanShareImage() {
    try {
      // Create canvas matching reference dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match reference image proportions
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Purple gradient background exactly like reference
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#7c3aed');   // Purple
      gradient.addColorStop(0.5, '#8b5cf6'); // Lighter purple
      gradient.addColorStop(1, '#a855f7');   // Even lighter purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Main title with money emoji like reference
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('💰 My Financial Plan Summary', canvas.width / 2, 80);
      
      // Reset any effects
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Layout setup to match reference exactly
      const topSection = { x: 50, y: 120, width: 980, height: 290 };
      const middleSection = { x: 50, y: 430, width: 980, height: 180 };
      const bottomSection = { x: 50, y: 630, width: 980, height: 350 };
      
      // Helper function to draw solid white card like reference
      const drawWhiteCard = (x, y, width, height, content) => {
        // Solid white background like reference
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 20);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        content(x, y, width, height);
      };

      // === TOP SECTION: KEY METRICS ===
      drawWhiteCard(topSection.x, topSection.y, topSection.width, topSection.height, (x, y, w, h) => {
        // Title with chart icon like reference
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Key Financial Metrics', x + w/2, y + 40);

        // Get key metrics data
        const totalCost = document.getElementById('total-cost')?.textContent || '₹0';
        const monthlyNeeded = document.getElementById('monthly-needed')?.textContent || '₹0';
        const timeRequired = document.getElementById('time-required')?.textContent || '0y';
        const savingsRate = document.getElementById('savings-rate')?.textContent || '0%';
        
        // Metrics array exactly like reference
        const metrics = [
          { label: 'Total Goal Cost', value: totalCost, icon: '🎯', color: '#ef4444' },
          { label: 'Monthly Needed', value: monthlyNeeded, icon: '💰', color: '#f59e0b' },
          { label: 'Time Required', value: timeRequired, icon: '⏰', color: '#10b981' },
          { label: 'Savings Rate', value: savingsRate, icon: '📈', color: '#8b5cf6' }
        ];
        
        // Draw metrics in 2x2 grid with proper sizing to fit within card
        const gridCols = 2;
        const cardPadding = 40;
        const availableWidth = w - (cardPadding * 2);
        const availableHeight = h - 100; // Leave space for title
        
        const metricWidth = (availableWidth - 30) / gridCols; // 30px gap between columns
        const metricHeight = (availableHeight - 25) / 2; // 25px gap between rows
        const spacingX = 30;
        const spacingY = 25;
        
        metrics.forEach((metric, index) => {
          const col = index % gridCols;
          const row = Math.floor(index / gridCols);
          
          const metricX = x + cardPadding + col * (metricWidth + spacingX);
          const metricY = y + 70 + row * (metricHeight + spacingY);
          
          // Light background for each metric
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(metricX, metricY, metricWidth, metricHeight, 12);
          ctx.fill();
          
          // Icon circle like reference
          const iconX = metricX + 35;
          const iconY = metricY + 35;
          const iconRadius = 22;
          
          ctx.fillStyle = metric.color;
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Icon emoji
          ctx.font = '20px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(metric.icon, iconX, iconY + 6);
          
          // Metric label
          ctx.font = '13px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'left';
          ctx.fillText(metric.label, metricX + 75, metricY + 25);
          
          // Metric value
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#111827';
          ctx.fillText(metric.value, metricX + 75, metricY + 55);
        });
      });
      
      // === MIDDLE SECTION: WORK-LIFE BALANCE ===
      drawWhiteCard(middleSection.x, middleSection.y, middleSection.width, middleSection.height, (x, y, w, h) => {
        // Title with balance scale emoji like reference
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText('⚖️ Work-Life Balance', x + w/2, y + 35);
        
        // Get balance data
        const balanceIndicator = document.getElementById('balance-indicator');
        let balancePosition = 85; // Default to good balance like reference
        if (balanceIndicator && balanceIndicator.style.left) {
          const leftStyle = balanceIndicator.style.left;
          if (leftStyle && leftStyle !== '50%') {
            balancePosition = parseInt(leftStyle.replace('%', ''));
          }
        }
        
        const balanceStatus = document.getElementById('balance-status')?.textContent || 'Excellent Balance with Strong Portfolio';
        
        // Balance meter like reference - properly sized within card
        const meterY = y + 60;
        const meterPadding = 60;
        const meterWidth = w - (meterPadding * 2);
        const meterHeight = 20;
        const meterX = x + meterPadding;
        
        // Meter gradient - red to orange to green like reference
        const meterGradient = ctx.createLinearGradient(meterX, meterY, meterX + meterWidth, meterY);
        meterGradient.addColorStop(0, '#ef4444');   // Red
        meterGradient.addColorStop(0.5, '#f59e0b'); // Orange
        meterGradient.addColorStop(1, '#10b981');   // Green
        
        ctx.fillStyle = meterGradient;
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, meterWidth, meterHeight, 10);
        ctx.fill();
        
        // Balance indicator circle like reference
        const indicatorX = meterX + (meterWidth * balancePosition / 100);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(indicatorX, meterY + meterHeight/2, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Balance labels like reference - positioned within card bounds
        ctx.font = '14px system-ui';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'left';
        ctx.fillText('💼 Overworked', meterX, meterY + 45);
        
        ctx.textAlign = 'center';
        ctx.fillText('⚖️ Balanced', x + w/2, meterY + 45);
        
        ctx.textAlign = 'right';
        ctx.fillText('❤️ Relaxed', meterX + meterWidth, meterY + 45);
        
        // Status text like reference
        ctx.font = 'bold 18px system-ui';
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.fillText(balanceStatus, x + w/2, y + 135);
      });
      
      // === BOTTOM SECTION: FINANCIAL HEALTH & ACHIEVEMENTS ===
      drawWhiteCard(bottomSection.x, bottomSection.y, bottomSection.width, bottomSection.height, (x, y, w, h) => {
        // Get health data
        const healthValue = document.getElementById('financial-health-value')?.textContent || '100.0%';
        const healthPercentage = parseFloat(healthValue) || 100;
        
        // Left side: Health score circle like reference
        const leftCenterX = x + 200;
        const centerY = y + 180;
        const radius = 80;
        
        // Background circle
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(leftCenterX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Progress circle - green like reference
        const progressAngle = (healthPercentage / 100) * 2 * Math.PI;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(leftCenterX, centerY, radius, -Math.PI/2, -Math.PI/2 + progressAngle);
        ctx.stroke();
        
        // Health percentage text - large and bold like reference
        ctx.font = 'bold 36px system-ui';
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.fillText(healthValue, leftCenterX, centerY + 12);
        
        // Health status label
        ctx.font = '16px system-ui';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Overall Health', leftCenterX, centerY + 120);
        
        // Right side: Achievements like reference
        const rightSideX = x + 480;
        const rightSideW = 450;
        
        // Achievements title with target emoji like reference
        ctx.font = 'bold 22px system-ui';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText('🎯 Achievements', rightSideX, y + 50);
        
        // Get actual achievement badges from Financial Health section
        const achievementsContainer = document.getElementById('achievements-container');
        const achievementBadges = achievementsContainer ? achievementsContainer.querySelectorAll('.achievement-badge') : [];
        
        let badgeTexts = [];
        if (achievementBadges.length > 0) {
          // Extract text from actual achievement badges, limit to first 3
          badgeTexts = Array.from(achievementBadges).slice(0, 3).map(badge => {
            // Clone the badge element to avoid modifying the original
            const clonedBadge = badge.cloneNode(true);
            // Remove the icon element to get just the text
            const iconElement = clonedBadge.querySelector('i');
            if (iconElement) {
              iconElement.remove();
            }
            // Get the remaining text content
            const achievementName = clonedBadge.textContent || clonedBadge.innerText || '';
            return achievementName.trim();
          });
        }
        
        // Fallback to default badges if no achievements found
        if (badgeTexts.length === 0) {
          badgeTexts = ['Strong Investor', 'SIP Champion', 'Long-term Investor'];
        }
        
        // Draw achievement badges
        badgeTexts.forEach((badge, index) => {
          const badgeY = y + 90 + (index * 60);
          
          // Badge background - light gray like reference
          ctx.fillStyle = '#f3f4f6';
          ctx.beginPath();
          ctx.roundRect(rightSideX, badgeY, rightSideW, 45, 12);
          ctx.fill();
          
          // Badge text
          ctx.font = 'bold 18px system-ui';
          ctx.fillStyle = '#374151';
          ctx.textAlign = 'left';
          ctx.fillText(badge, rightSideX + 20, badgeY + 28);
        });
      });
      
      // Add branding/watermark exactly like reference
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('Generated with Advanced Goal Alignment Calculator', canvas.width / 2, canvas.height - 35);
      
      // Add timestamp like reference
      const now = new Date();
      ctx.font = '12px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format like reference
      ctx.fillText(dateStr, canvas.width / 2, canvas.height - 15);
      
      // Download the clean image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-plan-summary-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.uiManager.showToast('Clean financial summary image generated! \ud83c\udf86', 'success');
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Error generating share image:', error);
      this.uiManager.showToast('Error generating image: ' + error.message, 'error');
    }
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
  setFormData(formData, retryCount = 0) {
    // Map of formData keys to actual HTML element IDs
    const keyMapping = {
      'lifeExpectancy': 'life-expectancy',
      'existingEmi': 'existing-emi',
      'existingInvestments': 'existing-investments',
      'currentSip': 'current-sip',
      'sipDuration': 'sip-duration'
    };

    console.log(`Setting form data (attempt ${retryCount + 1}):`, formData);

    let missingElements = [];

    Object.keys(formData).forEach(key => {
      // Skip the goals object as it's handled separately
      if (key === 'goals') return;
      
      // Use mapped element ID or original key
      const elementId = keyMapping[key] || key;
      const element = document.getElementById(elementId);
      
      if (element) {
        console.log(`Setting ${elementId} = ${formData[key]}`);
        element.value = formData[key];
        // Trigger input event to update calculations
        element.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.warn(`Element not found: ${elementId} for key: ${key}`);
        missingElements.push({key, elementId});
      }
    });

    // If we have missing elements and haven't retried too much, try again
    const isMobile = window.innerWidth <= 768;
    if (missingElements.length > 0 && retryCount < 2 && isMobile) {
      console.log(`Missing ${missingElements.length} elements on mobile, retrying in 200ms...`);
      setTimeout(() => {
        this.setFormData(formData, retryCount + 1);
      }, 200);
    }
  }

  // Collect individual loan entries for export
  collectIndividualLoans() {
    const loanItems = document.querySelectorAll('.loan-item');
    const loans = [];
    
    loanItems.forEach(loanItem => {
      const loanId = loanItem.id;
      const loanType = loanItem.querySelector('.loan-type')?.value || '';
      const principal = parseFloat(loanItem.querySelector('.loan-principal')?.value) || 0;
      const rate = parseFloat(loanItem.querySelector('.loan-rate')?.value) || 0;
      const tenureYears = parseFloat(loanItem.querySelector('.loan-tenure-years')?.value) || 0;
      const tenureMonths = parseFloat(loanItem.querySelector('.loan-tenure-months')?.value) || 0;
      const emi = parseFloat(loanItem.querySelector('.loan-emi')?.value) || 0;
      
      if (loanType || principal > 0 || rate > 0 || tenureYears > 0 || tenureMonths > 0 || emi > 0) {
        loans.push({
          id: loanId,
          loanType: loanType,
          principal: principal,
          rate: rate,
          tenureYears: tenureYears,
          tenureMonths: tenureMonths,
          emi: emi
        });
      }
    });
    
    return loans;
  }

  // Restore individual loan entries from JSON data
  restoreLoanData(loanData) {
    console.log('Restoring loan data from JSON:', loanData);
    
    // Handle both old format (summary only) and new format (with individual loans)
    if (loanData && loanData.individualLoans && Array.isArray(loanData.individualLoans)) {
      console.log(`Restoring ${loanData.individualLoans.length} individual loans`);
      
      // Clear existing loans first
      const loanContainer = document.getElementById('loan-list');
      if (loanContainer) {
        console.log('Found loan container, clearing existing loans...');
        
        // Remove existing loan items
        const existingLoans = loanContainer.querySelectorAll('.loan-item');
        existingLoans.forEach(loan => loan.remove());
        
        // Restore each loan
        loanData.individualLoans.forEach((loanEntry, index) => {
          console.log(`Restoring loan ${index + 1}:`, loanEntry);
          
          this.addLoan(); // Add a new loan slot
          
          // Find the most recently added loan item
          const loanItems = loanContainer.querySelectorAll('.loan-item');
          const newLoanItem = loanItems[loanItems.length - 1];
          
          if (newLoanItem) {
            console.log(`Found new loan item: ${newLoanItem.id}`);
            
            // Fill in the loan data
            const loanTypeSelect = newLoanItem.querySelector('.loan-type');
            const principalInput = newLoanItem.querySelector('.loan-principal');
            const rateInput = newLoanItem.querySelector('.loan-rate');
            const tenureYearsInput = newLoanItem.querySelector('.loan-tenure-years');
            const tenureMonthsInput = newLoanItem.querySelector('.loan-tenure-months');
            const emiInput = newLoanItem.querySelector('.loan-emi');
            
            // Debug element existence
            console.log('Loan form elements found:', {
              loanType: !!loanTypeSelect,
              principal: !!principalInput,
              rate: !!rateInput,
              tenureYears: !!tenureYearsInput,
              tenureMonths: !!tenureMonthsInput,
              emi: !!emiInput
            });
            
            if (loanTypeSelect) loanTypeSelect.value = loanEntry.loanType || '';
            if (principalInput) principalInput.value = loanEntry.principal || 0;
            if (rateInput) rateInput.value = loanEntry.rate || 0;
            if (tenureYearsInput) tenureYearsInput.value = loanEntry.tenureYears || 0;
            if (tenureMonthsInput) tenureMonthsInput.value = loanEntry.tenureMonths || 0;
            if (emiInput) emiInput.value = loanEntry.emi || 0;
            
            console.log(`Restored loan values - Type: ${loanEntry.loanType}, Principal: ${loanEntry.principal}, Rate: ${loanEntry.rate}`);
            
            // Trigger calculation for this loan
            if (newLoanItem.id) {
              this.calculateLoanSummary(newLoanItem.id);
            }
          } else {
            console.error('Failed to find newly added loan item');
          }
        });
        
        // Show loan container if we restored any loans
        if (loanData.individualLoans.length > 0) {
          console.log('Showing loan container...');
          loanContainer.style.display = 'block';
        }
      } else {
        console.error('Loan container not found!');
      }
    } else {
      console.log('No individual loans found in data or invalid format');
    }
    
    // Log summary for debugging
    if (loanData && loanData.totalOutstanding > 0) {
      console.log(`Restored loan summary: ${loanData.loanCount || 0} loans, total outstanding: ₹${loanData.totalOutstanding.toLocaleString()}`);
    }
  }

  // Age validation function
  validateAgeFields() {
    const age = parseInt(document.getElementById('age')?.value) || 0;
    const timeline = parseInt(document.getElementById('timeline')?.value) || 0;
    const lifeExpectancy = parseInt(document.getElementById('life-expectancy')?.value) || 0;
    
    let hasError = false;
    
    // Clear any existing validation styles
    ['age', 'timeline', 'life-expectancy'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.borderColor = '';
        element.style.backgroundColor = '';
      }
    });
    
    // Validation 1: Current Age should not be more than Life Expectancy
    if (age > 0 && lifeExpectancy > 0 && age > lifeExpectancy) {
      this.showValidationError('age', 'Current age cannot be more than life expectancy');
      this.showValidationError('life-expectancy', 'Life expectancy must be more than current age');
      hasError = true;
    }
    
    // Validation 2: Life Expectancy should not be less than Current Age + Goal Timeline
    if (age > 0 && timeline > 0 && lifeExpectancy > 0 && lifeExpectancy < (age + timeline)) {
      this.showValidationError('life-expectancy', `Life expectancy must be at least ${age + timeline} years (current age + timeline)`);
      this.showValidationError('timeline', `Timeline too long for life expectancy. Maximum: ${Math.max(0, lifeExpectancy - age)} years`);
      hasError = true;
    }
    
    // Show success message if all validations pass
    if (!hasError && age > 0 && timeline > 0 && lifeExpectancy > 0) {
      this.uiManager.showToast('Age validation passed ✓', 'success');
    }
  }
  
  // Helper function to show validation errors
  showValidationError(fieldId, message) {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.borderColor = '#dc3545';
      element.style.backgroundColor = '#fff5f5';
    }
    this.uiManager.showToast(message, 'error');
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