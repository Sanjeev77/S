// UI Management Module - FIXED Scenario Display
class UIManager {
  constructor() {
    this.activeTab = 'goals';
    this.toastTimeout = null;
    this.investmentSummaryVisible = false;
    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupTooltips();
    this.setupModalHandlers();
    this.setupFormValidation();
    this.setupInvestmentFieldHandlers();
    this.setupResizeHandler();
  }

  // NEW: Setup investment field handlers
  setupInvestmentFieldHandlers() {
    const investmentFields = ['existing-investments', 'current-sip', 'sip-duration'];
    
    investmentFields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        // Real-time validation and formatting
        input.addEventListener('input', (e) => {
          this.handleInvestmentFieldInput(fieldId, e.target.value);
        });
        
        // Blur validation
        input.addEventListener('blur', (e) => {
          this.validateInvestmentField(fieldId, e.target.value);
        });
        
        // Focus highlighting
        input.addEventListener('focus', (e) => {
          this.highlightInvestmentField(fieldId);
        });
      }
    });
  }

  // NEW: Handle investment field input
  handleInvestmentFieldInput(fieldId, value) {
    const numValue = parseFloat(value) || 0;
    
    // Provide immediate feedback for investment fields
    switch (fieldId) {
      case 'existing-investments':
        this.updateInvestmentFieldFeedback(fieldId, numValue, [
          { threshold: 2000000, message: 'Substantial portfolio base', type: 'success' },
          { threshold: 1000000, message: 'Strong investment base', type: 'success' },
          { threshold: 500000, message: 'Good foundation', type: 'info' },
          { threshold: 100000, message: 'Building wealth', type: 'info' },
          { threshold: 0, message: 'Start investing', type: 'warning' }
        ]);
        break;
        
      case 'current-sip':
        this.updateInvestmentFieldFeedback(fieldId, numValue, [
          { threshold: 25000, message: 'Aggressive wealth building', type: 'success' },
          { threshold: 15000, message: 'Strong SIP discipline', type: 'success' },
          { threshold: 10000, message: 'Good investment habit', type: 'info' },
          { threshold: 5000, message: 'Building consistency', type: 'info' },
          { threshold: 1000, message: 'Good start', type: 'info' },
          { threshold: 0, message: 'Start SIP journey', type: 'warning' }
        ]);
        break;
        
      case 'sip-duration':
        this.updateInvestmentFieldFeedback(fieldId, numValue, [
          { threshold: 5, message: 'Excellent discipline', type: 'success' },
          { threshold: 3, message: 'Good consistency', type: 'success' },
          { threshold: 1, message: 'Building habit', type: 'info' },
          { threshold: 0.5, message: 'Recently started', type: 'info' },
          { threshold: 0, message: 'Begin SIP journey', type: 'warning' }
        ]);
        break;
    }
  }

  // NEW: Update investment field feedback
  updateInvestmentFieldFeedback(fieldId, value, thresholds) {
    const feedback = thresholds.find(t => value >= t.threshold);
    if (!feedback) return;
    
    // Create or update feedback element
    let feedbackElement = document.getElementById(`${fieldId}-feedback`);
    if (!feedbackElement) {
      feedbackElement = document.createElement('small');
      feedbackElement.id = `${fieldId}-feedback`;
      feedbackElement.style.cssText = 'display: block; margin-top: 5px; font-size: 0.8rem; transition: all 0.3s ease;';
      
      const input = document.getElementById(fieldId);
      if (input && input.parentNode) {
        input.parentNode.appendChild(feedbackElement);
      }
    }
    
    // Update feedback content and style
    feedbackElement.textContent = feedback.message;
    feedbackElement.className = `investment-feedback ${feedback.type}`;
    
    const colors = {
      success: '#28a745',
      info: '#17a2b8',
      warning: '#ffc107',
      danger: '#dc3545'
    };
    
    feedbackElement.style.color = colors[feedback.type] || colors.info;
  }

  // NEW: Validate investment field
  validateInvestmentField(fieldId, value) {
    const numValue = parseFloat(value) || 0;
    const rules = CONFIG.validation[fieldId];
    
    if (rules && (numValue < rules.min || numValue > rules.max)) {
      this.showToast(`${fieldId.replace('-', ' ')} must be between ${UTILS.formatCurrency(rules.min)} and ${UTILS.formatCurrency(rules.max)}`, 'warning');
      return false;
    }
    
    // Investment-specific validation
    if (fieldId === 'current-sip' && numValue > 0) {
      const income = parseFloat(document.getElementById('income')?.value) || 0;
      if (income > 0 && (numValue * 12 / income) > 0.5) {
        this.showToast('SIP amount seems very high relative to income. Please verify.', 'warning');
      }
    }
    
    return true;
  }

  // NEW: Highlight investment field
  highlightInvestmentField(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
      input.style.borderColor = 'var(--primary)';
      input.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
      
      // Show contextual help
      this.showInvestmentContextualHelp(fieldId);
    }
  }

  // NEW: Show contextual help for investment fields
  showInvestmentContextualHelp(fieldId) {
    const helpTexts = {
      'existing-investments': 'Include all mutual funds, stocks, bonds, and other investments',
      'current-sip': 'Total monthly SIP amount across all funds',
      'sip-duration': 'How long you have been investing via SIP consistently'
    };
    
    const helpText = helpTexts[fieldId];
    if (helpText) {
      // Only show if no current toast
      if (!document.querySelector('.toast.show')) {
        this.showToast(helpText, 'info');
      }
    }
  }

  // NEW: Setup window resize handler for responsive chart
  setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Re-render chart if it exists to handle mobile/desktop switching
        if (window.lastGoalsData) {
          this.updateVisualization(window.lastGoalsData);
        }
      }, 250);
    });
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      this.activeTab = tabName;
    }

    // Ensure proper section navigation on both mobile and desktop
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Make sure home section is visible on mobile
      const homeSection = document.getElementById('home-section');
      const resultsSection = document.getElementById('results-section');
      if (homeSection && resultsSection) {
        homeSection.classList.remove('mobile-hidden');
        resultsSection.classList.add('mobile-hidden');
        
        // Update mobile nav to show home as active
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        const homeMobileNav = document.querySelector('.mobile-nav-item[data-section="home"]');
        if (homeMobileNav) {
          homeMobileNav.classList.add('active');
        }
      }
    }

    // Scroll to sections on both mobile and desktop
    this.scrollToSection(tabName);
    
    this.showToast(`Viewing ${tabName} section`, 'info');
  }

  scrollToSection(tabName) {
    let targetElement = null;
    
    // First try to find section by data attribute (most reliable)
    targetElement = document.querySelector(`[data-section="${tabName}"]`);
    
    // If not found, fallback to text/icon matching
    if (!targetElement) {
      const sections = document.querySelectorAll('.section');
      
      sections.forEach((section, index) => {
        if (targetElement) return; // Stop searching once found
        
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
          const titleText = sectionTitle.textContent.toLowerCase();
          const iconElement = sectionTitle.querySelector('i');
          const iconClass = iconElement ? iconElement.className : '';
          
          // Check by tab name and content
          switch(tabName) {
            case 'goals':
              if (titleText.includes('goals') || titleText.includes('goal') || iconClass.includes('flag')) {
                targetElement = section;
              }
              break;
            case 'finances':
              if (titleText.includes('finances') || titleText.includes('financial') || iconClass.includes('money') || iconClass.includes('dollar')) {
                targetElement = section;
              }
              break;
            case 'investments':
              if (titleText.includes('investment') || titleText.includes('assumptions') || iconClass.includes('chart-line')) {
                targetElement = section;
              }
              break;
            case 'visualization':
              if (titleText.includes('visualization') || titleText.includes('visual') || iconClass.includes('chart-bar')) {
                targetElement = section;
              }
              break;
          }
        }
      });
    }

    if (targetElement) {
      const isMobile = window.innerWidth <= 768;
      
      // Try different scroll approaches
      this.performScroll(targetElement, isMobile);
      
      // Highlight the section
      targetElement.style.transition = 'background-color 0.5s ease';
      targetElement.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
      
      setTimeout(() => {
        targetElement.style.backgroundColor = '';
      }, 2000);
      
    } else {
      // Fallback: preserve scroll position if section not found
      this.showToast(`Section "${tabName}" not found. Scroll position preserved.`, 'warning');
    }
  }

  performScroll(targetElement, isMobile) {
    const leftPanel = document.querySelector('.left-panel');
    const headerOffset = isMobile ? 120 : 80;
    
    // Method 1: Try scrolling the left panel if it's scrollable
    if (leftPanel && leftPanel.scrollHeight > leftPanel.clientHeight) {
      const panelRect = leftPanel.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const targetPosition = leftPanel.scrollTop + (targetRect.top - panelRect.top) - 20;
      
      leftPanel.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      return;
    }
    
    // Method 2: Scroll the window (for mobile or when left panel isn't scrollable)
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Method 3: Fallback using element.scrollIntoView
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  }
  
  fallbackScroll(tabName) {
    let fallbackElement = null;
    
    switch(tabName) {
      case 'goals':
        fallbackElement = document.getElementById('goals-container') || 
                         document.querySelector('[id*="goal"]');
        break;
      case 'finances':
        fallbackElement = document.getElementById('income') || 
                         document.getElementById('expenses');
        break;
      case 'investments':
        fallbackElement = document.getElementById('returns') || 
                         document.getElementById('existing-investments');
        break;
      case 'visualization':
        fallbackElement = document.getElementById('goal-chart') ||
                         document.querySelector('.visualization');
        break;
    }
    
    if (fallbackElement) {
      const isMobile = window.innerWidth <= 768;
      
      // Skip scrolling on mobile to preserve user's scroll position
      if (!isMobile) {
        fallbackElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
        
        setTimeout(() => {
          const currentPosition = window.pageYOffset;
          window.scrollTo({
            top: currentPosition - 50,
            behavior: 'smooth'
          });
        }, 100);
      }
      
      fallbackElement.style.border = '3px solid var(--primary)';
      fallbackElement.style.borderRadius = '8px';
      
      setTimeout(() => {
        fallbackElement.style.border = '';
        fallbackElement.style.borderRadius = '';
      }, 2000);
    } else {
      this.showToast('Section not found. Please scroll manually.', 'warning');
    }
  }

  setupTooltips() {
    const infoIcons = document.querySelectorAll('.info-icon');
    infoIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        const tooltipText = icon.getAttribute('title');
        if (tooltipText) {
          this.showToast(tooltipText, 'info');
        }
      });

      icon.addEventListener('mouseenter', (e) => {
        icon.style.transform = 'scale(1.1)';
      });

      icon.addEventListener('mouseleave', (e) => {
        icon.style.transform = 'scale(1)';
      });
    });
  }

  setupModalHandlers() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  setupFormValidation() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => {
        this.validateInput(e.target);
      });

      input.addEventListener('input', (e) => {
        this.clearValidationErrors(e.target);
      });
    });
  }

  validateInput(input) {
    const fieldName = input.id;
    const value = input.value;
    
    if (UTILS.validateInput(value, fieldName)) {
      input.classList.remove('error');
      input.style.borderColor = '';
      return true;
    } else {
      input.classList.add('error');
      input.style.borderColor = 'var(--danger)';
      
      const rules = CONFIG.validation[fieldName];
      if (rules) {
        this.showToast(`${fieldName} must be between ${rules.min} and ${rules.max}`, 'warning');
      }
      return false;
    }
  }

  clearValidationErrors(input) {
    input.classList.remove('error');
    input.style.borderColor = '';
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;

    const icon = toast.querySelector('i');
    if (icon) {
      icon.className = this.getToastIcon(type);
    }

    this.toastTimeout = setTimeout(() => {
      toast.className = 'toast';
    }, CONFIG.ui.toastDuration);
  }

  getToastIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      danger: 'fas fa-exclamation-circle'
    };
    return icons[type] || icons.info;
  }

  // ENHANCED: Update elements with investment context
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      
      // Add visual feedback for investment-related updates
      if (id.includes('investment') || id.includes('sip')) {
        this.addInvestmentUpdateAnimation(element);
      }
    }
  }

  // NEW: Add animation for investment updates
  addInvestmentUpdateAnimation(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    element.style.borderRadius = '4px';
    element.style.padding = '2px 6px';
    
    setTimeout(() => {
      element.style.backgroundColor = '';
      element.style.padding = '';
    }, 1000);
  }

  updateProgressBar(id, percentage) {
    const progressBar = document.getElementById(id);
    if (progressBar) {
      const clampedPercentage = Math.min(100, Math.max(0, percentage));
      progressBar.style.width = clampedPercentage + '%';
      
      // Enhanced progress bar animation for investment metrics
      if (id.includes('financial-health') || id.includes('investment')) {
        progressBar.style.transition = 'width 0.8s ease-in-out';
      }
    }
  }

  // ENHANCED: Update results with investment data integration
  updateResults(results) {
    console.log('Enhanced UIManager updateResults with investment data:', results);
    
    // Standard KPI updates
    this.updateElement('total-cost', UTILS.formatCurrency(results.totalGoalCost));
    this.updateElement('monthly-needed', UTILS.formatCurrency(results.monthlyInvestment));
    this.updateElement('time-required', UTILS.formatYears(results.timeRequired));
    this.updateElement('savings-rate', UTILS.formatPercentage(results.savingsRate));

    // Enhanced updates with investment context
    this.updateElement('expense-ratio', UTILS.formatPercentage(results.expenseRatio));
    this.updateProgressBar('expense-progress', results.expenseRatio);

    // Investment-aware balance meter
    this.updateEnhancedBalanceMeter(results);

    // Investment-enhanced financial health
    this.updateElement('financial-health-value', UTILS.formatPercentage(results.financialHealth));
    this.updateProgressBar('financial-health-bar', results.financialHealth);
    
    // NEW: Update investment-specific achievements
    this.updateInvestmentAchievements(results);
    
    console.log('All UI elements updated with investment context');
  }

  // ENHANCED: Balance meter with investment considerations
  updateEnhancedBalanceMeter(results) {
    const indicator = document.getElementById('balance-indicator');
    const status = document.getElementById('balance-status');
    const button = document.getElementById('balance-button');

    if (!indicator || !status || !button) return;

    const investmentData = results.investmentData || {};
    const portfolioStrength = investmentData.investmentPortfolioStrength || 0;
    const balanceScore = results.balanceScore || 50;
    
    // Adjust balance score based on investment strength
    const investmentAdjustedScore = Math.min(100, balanceScore + (portfolioStrength * 0.2));
    
    indicator.style.left = investmentAdjustedScore + '%';

    // Enhanced status text with investment context
    if (investmentAdjustedScore >= 80) {
      status.textContent = portfolioStrength >= 60 ? 'Excellent Balance with Strong Portfolio' : 'Excellent Balance';
      status.style.backgroundColor = '#d1ecf1';
      status.style.color = '#0c5460';
      button.style.display = 'none';
    } else if (investmentAdjustedScore >= 60) {
      status.textContent = portfolioStrength >= 40 ? 'Good Balance with Growing Portfolio' : 'Good Balance';
      status.style.backgroundColor = '#d4edda';
      status.style.color = '#155724';
      button.style.display = 'block';
      button.textContent = 'Enhance Further';
    } else if (investmentAdjustedScore >= 40) {
      status.textContent = portfolioStrength < 40 ? 'Needs Investment Strategy' : 'Moderate Balance';
      status.style.backgroundColor = '#fff3cd';
      status.style.color = '#856404';
      button.style.display = 'block';
      button.textContent = portfolioStrength < 40 ? 'Start Investing' : 'Improve Balance';
    } else {
      status.textContent = 'Needs Major Improvement';
      status.style.backgroundColor = '#f8d7da';
      status.style.color = '#721c24';
      button.style.display = 'block';
      button.textContent = 'Emergency Plan';
    }
  }

  // NEW: Update investment achievements
  updateInvestmentAchievements(results) {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    const investmentData = results.investmentData || {};
    const portfolioStrength = investmentData.investmentPortfolioStrength || 0;
    const existingInvestments = investmentData.existingInvestments || 0;
    const currentSip = investmentData.currentSip || 0;
    const sipDuration = investmentData.sipDuration || 0;
    
    let achievements = '';

    // Portfolio strength achievements
    if (portfolioStrength >= 80) {
      achievements += '<div class="achievement-badge"><i class="fas fa-trophy"></i> Investment Expert</div>';
    } else if (portfolioStrength >= 60) {
      achievements += '<div class="achievement-badge"><i class="fas fa-star"></i> Strong Investor</div>';
    } else if (portfolioStrength >= 40) {
      achievements += '<div class="achievement-badge"><i class="fas fa-chart-line"></i> Growing Portfolio</div>';
    } else if (portfolioStrength > 0) {
      achievements += '<div class="achievement-badge"><i class="fas fa-seedling"></i> Investment Beginner</div>';
    }

    // Investment base achievements
    if (existingInvestments >= 2000000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-gem"></i> Substantial Portfolio</div>';
    } else if (existingInvestments >= 1000000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-coins"></i> Millionaire Investor</div>';
    } else if (existingInvestments >= 500000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-piggy-bank"></i> Half Million Club</div>';
    }

    // SIP discipline achievements
    if (currentSip >= 25000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-rocket"></i> SIP Champion</div>';
    } else if (currentSip >= 15000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-medal"></i> SIP Leader</div>';
    } else if (currentSip >= 10000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-award"></i> SIP Expert</div>';
    } else if (currentSip >= 5000) {
      achievements += '<div class="achievement-badge"><i class="fas fa-certificate"></i> SIP Steady</div>';
    }

    // Duration achievements
    if (sipDuration >= 5) {
      achievements += '<div class="achievement-badge"><i class="fas fa-clock"></i> Long-term Investor</div>';
    } else if (sipDuration >= 3) {
      achievements += '<div class="achievement-badge"><i class="fas fa-calendar-check"></i> Consistent Investor</div>';
    } else if (sipDuration >= 1) {
      achievements += '<div class="achievement-badge"><i class="fas fa-play-circle"></i> Investment Started</div>';
    }

    // Financial health achievements
    if (results.financialHealth >= 80) {
      achievements += '<div class="achievement-badge"><i class="fas fa-heart"></i> Financial Wellness</div>';
    } else if (results.financialHealth >= 60) {
      achievements += '<div class="achievement-badge"><i class="fas fa-thumbs-up"></i> Good Health</div>';
    }

    // Balance achievements
    if (results.balanceScore >= 70) {
      achievements += '<div class="achievement-badge"><i class="fas fa-balance-scale"></i> Life Balance</div>';
    }

    container.innerHTML = achievements || '<p style="text-align: center; color: #6c757d; font-style: italic;">Complete your profile to unlock achievements</p>';
  }

  updateInsights(insights) {
    const container = document.getElementById('insights-list');
    if (!container) return;

    let html = '';
    insights.forEach(insight => {
      html += `
        <div class="insight ${insight.type}">
          <div class="insight-header">
            <i class="${insight.icon}"></i> ${insight.title}
          </div>
          <div>${insight.message}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // FIXED: Update scenarios with proper formatting
  updateScenarios(scenarios) {
    const container = document.getElementById('scenarios-list');
    if (!container) return;

    let html = '';
    scenarios.forEach(scenario => {
      html += `
        <div class="scenario ${scenario.type}">
          <div class="scenario-title">
            <i class="${scenario.icon}"></i> ${scenario.title}
          </div>
          <div class="scenario-detail">${scenario.description}</div>
          <div class="scenario-metrics">
            <div class="scenario-metric">
              <div class="scenario-metric-value">${UTILS.formatCurrency(Math.round(scenario.monthlyInvestment || 0))}</div>
              <div>Monthly Investment</div>
            </div>
            <div class="scenario-metric">
              <div class="scenario-metric-value">${UTILS.formatYears(scenario.timeRequired || 0)}</div>
              <div>Time Required</div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  updateActionPlans() {
    const container = document.getElementById('action-plans-list');
    if (!container) return;

    let html = '';
    Object.values(CONFIG.actionPlans).forEach(plan => {
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

  // ENHANCED: Balance modal with investment-aware plans
  showBalanceModal(plans) {
    console.log('showBalanceModal called with plans:', plans); // Debug log
    const modal = document.getElementById('balance-modal');
    const planOptions = document.getElementById('plan-options');
    
    console.log('Modal element:', modal); // Debug log
    console.log('Plan options element:', planOptions); // Debug log
    
    if (!modal || !planOptions) {
      console.error('Modal or plan options element not found');
      return;
    }

    let html = `
      <div style="padding-bottom: 15px; border-bottom: 1px solid #e9ecef; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #333;">Investment-Aware Balance Plans</h3>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 0.9rem;">Select plans that consider your investment portfolio and goals</p>
      </div>
      
      <div style="max-height: 400px; overflow-y: auto; padding-right: 8px; margin-bottom: 15px;">
    `;
    
    plans.forEach((plan) => {
      // Enhanced plan display with investment context
      const isInvestmentPlan = ['start-sip-early', 'build-investment-base', 'strengthen-portfolio', 
                                'step-up-sip', 'optimize-portfolio'].includes(plan.id);
      
      html += `
        <div class="plan-option ${isInvestmentPlan ? 'investment-plan' : ''}" 
             onclick="toggleMultiplePlan(this)" 
             data-plan-id="${plan.id}" 
             style="border: 2px solid ${isInvestmentPlan ? '#e8f4f8' : '#e9ecef'}; 
                    border-radius: 8px; padding: 15px; margin-bottom: 12px; 
                    cursor: pointer; transition: all 0.3s ease; position: relative;
                    ${isInvestmentPlan ? 'background: linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%);' : ''}">
          
          <div style="position: absolute; top: 12px; right: 12px;">
            <input type="checkbox" class="plan-checkbox" style="transform: scale(1.2);">
          </div>
          
          ${isInvestmentPlan ? '<div style="position: absolute; top: 8px; left: 12px; background: var(--info); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">INVESTMENT</div>' : ''}
          
          <div class="plan-title" style="display: flex; align-items: center; margin-bottom: 8px; padding-right: 30px; ${isInvestmentPlan ? 'margin-top: 20px;' : ''}">
            <i class="${plan.icon}" style="margin-right: 10px; color: ${isInvestmentPlan ? 'var(--info)' : 'var(--primary)'}; font-size: 1.1rem;"></i>
            <span style="font-weight: 600; font-size: 1rem;">${plan.title}</span>
          </div>
          
          <div class="plan-details" style="color: #666; margin-bottom: 12px; line-height: 1.4;">
            ${plan.description}
          </div>
          
          <div class="plan-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
            ${Object.entries(plan.impact).map(([key, value]) => `
              <div class="plan-metric" style="background: ${isInvestmentPlan ? '#f0f8ff' : '#f8f9fa'}; padding: 8px; border-radius: 4px; text-align: center;">
                <div class="plan-metric-value" style="font-weight: bold; color: ${isInvestmentPlan ? 'var(--info)' : 'var(--primary)'}; font-size: 0.9rem;">${value}</div>
                <div class="plan-metric-label" style="font-size: 0.75rem; color: #666; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `
      </div>
      
      <div style="border-top: 1px solid #e9ecef; padding-top: 15px;">
        <div id="selection-summary" style="font-size: 0.9rem; color: #666; margin-bottom: 12px; min-height: 20px;">
          No plans selected
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn" onclick="applySelectedPlans()" 
                  style="background: var(--primary); color: white; padding: 12px 24px; border-radius: 6px; border: none; font-weight: 600; flex: 1;">
            Apply Selected Plans
          </button>
          <button class="btn" onclick="previewSelectedPlans()" 
                  style="background: #6c757d; color: white; padding: 12px 20px; border-radius: 6px; border: none; font-weight: 600;">
            Preview
          </button>
        </div>
      </div>
    `;

    planOptions.innerHTML = html;
    console.log('Setting modal display to flex'); // Debug log
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.classList.add('show');
    console.log('Modal display style after setting:', modal.style.display); // Debug log
    console.log('Modal computed style:', getComputedStyle(modal).display); // Debug log
    
    // Force modal to appear above everything on mobile
    if (window.innerWidth <= 768) {
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.zIndex = '9999';
      modal.style.background = 'rgba(0,0,0,0.5)';
      console.log('Applied mobile-specific modal styles'); // Debug log
    }
    
    updateSelectionSummary();
  }

  closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.opacity = '0';
      modal.classList.remove('show');
      // Reset mobile-specific styles
      modal.style.position = '';
      modal.style.top = '';
      modal.style.left = '';
      modal.style.width = '';
      modal.style.height = '';
      modal.style.zIndex = '';
      modal.style.background = '';
    });
  }

  selectPlan(element) {
    document.querySelectorAll('.plan-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    element.classList.add('selected');
  }

  getSelectedPlan() {
    const selected = document.querySelector('.plan-option.selected');
    return selected ? selected.getAttribute('data-plan-id') : null;
  }

  getSelectedPlans() {
    const selected = document.querySelectorAll('.plan-option.selected');
    return Array.from(selected).map(el => el.getAttribute('data-plan-id'));
  }

  // ENHANCED: Visualization with investment context
  updateVisualization(goalsData) {
    const chartContainer = document.getElementById('goal-chart');
    if (!chartContainer) return;

    // Store goals data for resize handling
    window.lastGoalsData = goalsData;

    const activeGoals = Object.keys(goalsData).filter(goalId => goalsData[goalId].enabled);
    const totalValue = activeGoals.reduce((sum, goalId) => sum + goalsData[goalId].amount, 0);

    if (activeGoals.length === 0 || totalValue === 0) {
      this.showEmptyChart(chartContainer);
      return;
    }

    // Simple, direct goal metadata without complex CONFIG dependencies
    const goalInfo = {
      house: { title: 'Housing', icon: 'fas fa-home', color: '#667eea' },
      vehicle: { title: 'Vehicle', icon: 'fas fa-car', color: '#764ba2' },
      travel: { title: 'Travel', icon: 'fas fa-plane', color: '#f093fb' },
      education: { title: 'Education', icon: 'fas fa-graduation-cap', color: '#4facfe' },
      emergency: { title: 'Emergency Fund', icon: 'fas fa-shield-alt', color: '#43e97b' },
      other: { title: 'Other Goals', icon: 'fas fa-star', color: '#ffecd2' }
    };

    const chartData = activeGoals.map(goalId => {
      const goal = goalsData[goalId];
      const percentage = (goal.amount / totalValue) * 100;
      const info = goalInfo[goalId] || { title: goalId, icon: 'fas fa-star', color: '#95a5a6' };
      
      return {
        id: goalId,
        title: info.title,
        icon: info.icon,
        amount: goal.amount,
        percentage: percentage,
        color: info.color
      };
    }).sort((a, b) => b.amount - a.amount);

    this.renderEnhancedPieChart(chartContainer, chartData, totalValue);
    
    // Fallback: if chart didn't render, show simple list
    setTimeout(() => {
      if (chartContainer.children.length === 0) {
        chartContainer.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h4>Active Goals</h4>
            ${chartData.map(item => `
              <div style="margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center;">
                <i class="${item.icon}" style="margin-right: 10px; color: ${item.color};"></i>
                <span>${item.title}: ${item.percentage.toFixed(1)}% (${UTILS.formatCurrency(item.amount)})</span>
              </div>
            `).join('')}
          </div>
        `;
      }
    }, 100);
  }

  // ENHANCED: Pie chart with investment context
  renderEnhancedPieChart(container, data, totalValue) {
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? 160 : 180; // Compact size on mobile
    const center = size / 2;
    const radius = size * 0.4;
    const innerRadius = radius * 0.5;

    let html = `
      <div class="pie-chart-wrapper" style="display: flex; ${isMobile ? 'flex-direction: column; align-items: center;' : 'align-items: flex-start; justify-content: space-between;'} padding: ${isMobile ? '8px 5px' : '10px'}; gap: ${isMobile ? '12px' : '15px'};">
        <div class="pie-chart-svg" style="${isMobile ? 'flex-shrink: 0;' : 'flex-shrink: 0;'}">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width: 100%; height: auto;">
    `;

    let currentAngle = 0;

    data.forEach((segment) => {
      const segmentAngle = (segment.percentage / 100) * 2 * Math.PI;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);
      
      const ix1 = center + innerRadius * Math.cos(startAngle);
      const iy1 = center + innerRadius * Math.sin(startAngle);
      const ix2 = center + innerRadius * Math.cos(endAngle);
      const iy2 = center + innerRadius * Math.sin(endAngle);
      
      const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${ix1} ${iy1}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
        'Z'
      ].join(' ');

      html += `
        <path d="${pathData}" 
              fill="${segment.color}" 
              stroke="white" 
              stroke-width="2"
              style="cursor: pointer; transition: all 0.3s ease;"
              onmouseover="this.style.transform='scale(1.05)'; this.style.transformOrigin='${center}px ${center}px';"
              onmouseout="this.style.transform='scale(1)';"
              title="${segment.title}: ${UTILS.formatCurrency(segment.amount)} (${segment.percentage.toFixed(1)}%)">
        </path>
      `;
      
      currentAngle += segmentAngle;
    });

    html += `
      <text x="${center}" y="${center - 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">
        ${data.length} Goals
      </text>
      <text x="${center}" y="${center + 10}" text-anchor="middle" font-size="11" fill="#666">
        ${UTILS.formatCurrency(totalValue)}
      </text>
          </svg>
        </div>
        
        <div class="pie-chart-metrics" style="${isMobile ? 'width: 100%; max-width: 350px; max-height: none; overflow: visible;' : 'flex: 1; min-width: 0; max-height: 350px; overflow-y: auto; padding-bottom: 10px;'}">
          <div style="margin-bottom: ${isMobile ? '8px' : '10px'};">
    `;

    // Show all goals on both mobile and desktop
    const visibleGoals = data;
    const hiddenGoals = [];

    visibleGoals.forEach(segment => {
      html += `
        <div class="pie-chart-metric-row ${isMobile ? 'mobile' : 'desktop'}" style="display: flex; align-items: center; justify-content: space-between; padding: ${isMobile ? '8px 10px' : '4px 8px'}; margin-bottom: ${isMobile ? '6px' : '3px'}; background: #f8f9fa; border-radius: 8px; border-left: 3px solid ${segment.color};">
          <div class="pie-chart-metric-left" style="display: flex; align-items: center; min-width: 0; flex: 1;">
            <i class="pie-chart-metric-icon ${segment.icon}" style="margin-right: ${isMobile ? '10px' : '6px'}; color: ${segment.color}; width: ${isMobile ? '16px' : '12px'}; font-size: ${isMobile ? '1rem' : '0.8rem'}; flex-shrink: 0;"></i>
            <span class="pie-chart-metric-title" style="font-weight: 600; color: #333; font-size: ${isMobile ? '0.9rem' : '0.75rem'}; ${isMobile ? 'flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' : 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'}">${segment.title}</span>
          </div>
          <div class="pie-chart-metric-right" style="text-align: right; flex-shrink: 0; margin-left: ${isMobile ? '10px' : '8px'}; display: flex; flex-direction: column; align-items: flex-end; background: none; border: none; padding: 0;">
            <div class="pie-chart-metric-percentage" style="font-weight: bold; color: var(--primary); font-size: ${isMobile ? '1rem' : '0.75rem'}; line-height: 1.1;">${segment.percentage.toFixed(1)}%</div>
            <div class="pie-chart-metric-amount" style="color: #666; font-size: ${isMobile ? '0.8rem' : '0.7rem'}; line-height: 1.1;">${this.formatCompactCurrency(segment.amount)}</div>
          </div>
        </div>
      `;
    });

    if (hiddenGoals.length > 0) {
      const hiddenTotal = hiddenGoals.reduce((sum, goal) => sum + goal.amount, 0);
      const hiddenPercentage = hiddenGoals.reduce((sum, goal) => sum + goal.percentage, 0);
      
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: ${isMobile ? '8px 12px' : '4px 8px'}; margin-bottom: ${isMobile ? '6px' : '3px'}; background: #e9ecef; border-radius: 6px; border-left: 3px solid #6c757d;">
          <div style="display: flex; align-items: center; min-width: 0; flex: 1;">
            <i class="fas fa-ellipsis-h" style="margin-right: ${isMobile ? '10px' : '6px'}; color: #6c757d; width: ${isMobile ? '18px' : '12px'}; font-size: ${isMobile ? '1.1rem' : '0.8rem'}; flex-shrink: 0;"></i>
            <span style="font-weight: 600; color: #666; font-size: ${isMobile ? '0.9rem' : '0.75rem'}; ${isMobile ? 'flex: 1; display: block;' : ''}">+${hiddenGoals.length} more</span>
          </div>
          <div style="text-align: right; flex-shrink: 0; margin-left: ${isMobile ? '12px' : '8px'};">
            <div style="font-weight: bold; color: #666; font-size: ${isMobile ? '0.9rem' : '0.75rem'};">${hiddenPercentage.toFixed(1)}%</div>
            <div style="color: #888; font-size: ${isMobile ? '0.8rem' : '0.7rem'};">${this.formatCompactCurrency(hiddenTotal)}</div>
          </div>
        </div>
      `;
    }

    html += `
          </div>
          
          <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border-radius: 6px; padding: ${isMobile ? '12px' : '8px'}; font-size: ${isMobile ? '0.9rem' : '0.75rem'}; ${isMobile ? 'margin-top: 15px;' : ''}">
            <div style="display: flex; justify-content: space-between; margin-bottom: ${isMobile ? '6px' : '4px'};">
              <span style="display: flex; align-items: center; min-width: 0; flex: 1;"><i class="fas fa-coins" style="margin-right: ${isMobile ? '6px' : '4px'}; font-size: ${isMobile ? '0.85rem' : '0.7rem'}; flex-shrink: 0;"></i>Total</span>
              <span style="font-weight: bold; flex-shrink: 0; margin-left: ${isMobile ? '8px' : '6px'};">${this.formatCompactCurrency(totalValue)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="display: flex; align-items: center; min-width: 0; flex: 1;"><i class="fas fa-chart-line" style="margin-right: ${isMobile ? '6px' : '4px'}; font-size: ${isMobile ? '0.85rem' : '0.7rem'}; flex-shrink: 0;"></i>Top</span>
              <span style="font-weight: bold; flex-shrink: 0; margin-left: ${isMobile ? '8px' : '6px'};">${data[0].title}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  showEmptyChart(container) {
    const isMobile = window.innerWidth <= 768;
    container.innerHTML = `
      <div style="text-align: center; padding: ${isMobile ? '30px 15px' : '40px 20px'}; color: #6c757d;">
        <i class="fas fa-chart-pie" style="font-size: ${isMobile ? '3rem' : '4rem'}; margin-bottom: 15px; opacity: 0.3;"></i>
        <p style="font-size: ${isMobile ? '1rem' : '1.1rem'}; margin-bottom: 8px;">No active goals</p>
        <p style="font-size: ${isMobile ? '0.85rem' : '0.9rem'};">Enable goals above to see visualization</p>
      </div>
    `;
  }

  formatCompactCurrency(amount) {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount >= 10000000) {
      return '₹' + (numAmount / 10000000).toFixed(1) + 'Cr';
    } else if (numAmount >= 100000) {
      return '₹' + (numAmount / 100000).toFixed(0) + 'L';
    } else if (numAmount >= 1000) {
      return '₹' + (numAmount / 1000).toFixed(0) + 'K';
    } else {
      return '₹' + numAmount.toString();
    }
  }

  getGoalColor(goalId) {
    const colors = {
      house: '#667eea',
      vehicle: '#764ba2',
      travel: '#f093fb',
      education: '#4facfe',
      emergency: '#43e97b',
      other: '#ffecd2'
    };
    return colors[goalId] || '#95a5a6';
  }

  updateTimelineVisualization(age, timeline) {
    const currentAge = parseInt(age) || 35;
    const goalTimeline = parseInt(timeline) || 15;
    const targetAge = currentAge + goalTimeline;

    const currentMarker = document.querySelector('.timeline-visual .timeline-marker:first-child');
    const targetMarker = document.querySelector('.timeline-visual .timeline-marker:last-child');
    const currentLabel = document.querySelector('.timeline-visual .timeline-label:first-child');
    const targetLabel = document.querySelector('.timeline-visual .timeline-label:last-child');

    if (currentMarker && targetMarker && currentLabel && targetLabel) {
      const currentPosition = 20;
      const targetPosition = 80;

      currentMarker.style.left = currentPosition + '%';
      currentLabel.style.left = currentPosition + '%';
      currentLabel.textContent = `Age ${currentAge}`;

      targetMarker.style.left = targetPosition + '%';
      targetLabel.style.left = targetPosition + '%';
      targetLabel.textContent = `Age ${targetAge}`;
    }
  }

  animateValue(elementId, start, end, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();
    const startValue = parseFloat(start) || 0;
    const endValue = parseFloat(end) || 0;
    const difference = endValue - startValue;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easeOutCubic);
      
      element.textContent = Math.round(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  highlightChangedValues(previousResults, currentResults) {
    const keysToCheck = ['totalGoalCost', 'monthlyInvestment', 'timeRequired', 'savingsRate'];
    
    keysToCheck.forEach(key => {
      if (previousResults && previousResults[key] !== currentResults[key]) {
        const elementId = this.getElementIdForKey(key);
        const element = document.getElementById(elementId);
        
        if (element) {
          element.style.background = 'rgba(102, 126, 234, 0.1)';
          element.style.transition = 'background 0.3s ease';
          
          setTimeout(() => {
            element.style.background = '';
          }, 2000);
        }
      }
    });
  }

  getElementIdForKey(key) {
    const mapping = {
      totalGoalCost: 'total-cost',
      monthlyInvestment: 'monthly-needed',
      timeRequired: 'time-required',
      savingsRate: 'savings-rate'
    };
    return mapping[key];
  }

  // NEW: Show investment portfolio summary
  showInvestmentPortfolioSummary(investmentData) {
    const summaryContainer = document.getElementById('investment-summary');
    if (!summaryContainer || !investmentData) return;

    if (investmentData.existingInvestments > 0 || investmentData.currentSip > 0) {
      summaryContainer.style.display = 'block';
      
      // Animate the summary appearance
      summaryContainer.style.opacity = '0';
      summaryContainer.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        summaryContainer.style.transition = 'all 0.5s ease';
        summaryContainer.style.opacity = '1';
        summaryContainer.style.transform = 'translateY(0)';
      }, 100);
      
    } else {
      summaryContainer.style.display = 'none';
    }
  }

  // NEW: Update investment strength indicator
  updateInvestmentStrengthIndicator(strength) {
    // Create or update investment strength indicator
    let indicator = document.getElementById('investment-strength-indicator');
    
    if (!indicator) {
      // Create indicator if it doesn't exist
      const investmentSection = document.querySelector('.section:has(#existing-investments)');
      if (investmentSection) {
        indicator = document.createElement('div');
        indicator.id = 'investment-strength-indicator';
        indicator.style.cssText = `
          margin-top: 15px; padding: 12px; background: #f8f9fa; 
          border-radius: 6px; border-left: 4px solid var(--info);
          transition: all 0.3s ease;
        `;
        investmentSection.appendChild(indicator);
      }
    }
    
    if (indicator && strength > 0) {
      const strengthLevel = strength >= 80 ? 'Excellent' :
                           strength >= 60 ? 'Strong' :
                           strength >= 40 ? 'Moderate' :
                           strength >= 20 ? 'Developing' : 'Starter';
      
      const color = strength >= 80 ? '#28a745' :
                   strength >= 60 ? '#17a2b8' :
                   strength >= 40 ? '#ffc107' : '#dc3545';
      
      indicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #495057;">
            <i class="fas fa-chart-line" style="margin-right: 8px; color: ${color};"></i>
            Portfolio Strength: ${strengthLevel}
          </span>
          <span style="font-weight: bold; color: ${color};">${strength}/100</span>
        </div>
        <div style="height: 6px; background: #e9ecef; border-radius: 3px; margin-top: 8px; overflow: hidden;">
          <div style="height: 100%; background: ${color}; width: ${strength}%; transition: width 0.8s ease;"></div>
        </div>
      `;
      
      indicator.style.borderLeftColor = color;
      indicator.style.display = 'block';
    } else if (indicator) {
      indicator.style.display = 'none';
    }
  }

  addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .error {
        border-color: var(--danger) !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
      }
      
      .loading {
        position: relative;
        overflow: hidden;
      }
      
      .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      /* NEW: Investment-specific styles */
      .investment-feedback {
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .investment-feedback.success {
        color: #28a745 !important;
      }

      .investment-feedback.info {
        color: #17a2b8 !important;
      }

      .investment-feedback.warning {
        color: #ffc107 !important;
      }

      .investment-plan {
        position: relative;
        overflow: hidden;
      }

      .investment-plan::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(23, 162, 184, 0.1), transparent);
        animation: investment-highlight 2s ease-in-out;
        pointer-events: none;
      }

      @keyframes investment-highlight {
        0% { left: -100%; }
        50% { left: 0%; }
        100% { left: 100%; }
      }

      .plan-option.investment-plan:hover {
        border-color: var(--info) !important;
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.15);
        transform: translateY(-2px);
      }

      .plan-option.investment-plan.selected {
        border-color: var(--info) !important;
        background: linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%) !important;
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.2);
      }

      /* Investment summary animation */
      #investment-summary {
        transition: all 0.5s ease;
      }

      #investment-summary.updating {
        opacity: 0.7;
        transform: scale(0.98);
      }

      /* Enhanced achievement badges for investments */
      .achievement-badge {
        background: linear-gradient(135deg, var(--light) 0%, #e8f4f8 100%);
        border: 1px solid rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
      }

      .achievement-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.UIManager = UIManager;
}