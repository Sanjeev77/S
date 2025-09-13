// Goals Management Module
class GoalsManager {
  constructor() {
    this.goals = {};
    this.progressData = {};
    this.init();
  }

  init() {
    // Initialize goals with completely empty/disabled state
    Object.keys(CONFIG.defaultGoals).forEach(goalId => {
      this.goals[goalId] = {
        ...CONFIG.defaultGoals[goalId],
        enabled: false,  // All goals start disabled
        amount: 0        // All amounts start at zero
      };
    });

    // Set up progress tracking with empty data
    this.initializeProgress();
    
    // Render goals UI
    this.renderGoals();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  initializeProgress() {
    // Initialize with empty progress data
    this.progressData = {
      house: { current: 0, target: 0, percentage: 0 },
      vehicle: { current: 0, target: 0, percentage: 0 },
      travel: { current: 0, target: 0, percentage: 0 },
      education: { current: 0, target: 0, percentage: 0 },
      emergency: { current: 0, target: 0, percentage: 0 },
      other: { current: 0, target: 0, percentage: 0 }
    };
  }

  renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;

    let html = '';
    
    // Sort goals by priority
    const sortedGoals = Object.keys(this.goals).sort((a, b) => {
      return CONFIG.goalMeta[a].priority - CONFIG.goalMeta[b].priority;
    });

    sortedGoals.forEach(goalId => {
      const goal = this.goals[goalId];
      const meta = CONFIG.goalMeta[goalId];
      const progress = this.progressData[goalId];
      
      html += this.createGoalHTML(goalId, goal, meta, progress);
    });

    container.innerHTML = html;
  }

  createGoalHTML(goalId, goal, meta, progress) {
    const isEnabled = goal.enabled;
    const displayValue = isEnabled && goal.amount > 0 ? UTILS.formatCurrency(goal.amount) : '—';
    const progressPercent = progress.percentage || 0;
    const sliderValue = isEnabled && goal.amount > 0 ? goal.amount : goal.min;
    const inputValue = isEnabled && goal.amount > 0 ? UTILS.formatNumberWithCommas(goal.amount) : '';

    return `
      <div class="goal-item ${isEnabled ? 'active' : ''}" id="goal-${goalId}">
        <div class="goal-header">
          <input type="checkbox" class="goal-checkbox" id="${goalId}-check" ${isEnabled ? 'checked' : ''}>
          <span class="goal-title">
            <i class="${meta.icon}"></i> ${meta.title}
          </span>
        </div>
        <div class="goal-controls">
          <input type="text" 
                 class="goal-input" 
                 id="${goalId}-amount" 
                 placeholder="Enter amount" 
                 value="${inputValue}"
                 ${!isEnabled ? 'disabled' : ''}
                 inputmode="numeric">
          <span class="amount-display" id="${goalId}-display">${displayValue}</span>
        </div>
        <input type="range" 
               class="slider" 
               id="${goalId}-slider" 
               min="${goal.min}" 
               max="${goal.max}" 
               step="${goal.step}" 
               value="${sliderValue}"
               ${!isEnabled ? 'disabled' : ''}>
        ${progressPercent > 0 ? `
        <div class="progress-container">
          <div class="progress-label">
            <span>Progress</span>
            <span>${progressPercent}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
        ` : ''}
        <div class="goal-description" style="font-size: 0.8rem; color: #6c757d; margin-top: 8px;">
          ${meta.description}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Checkbox event listeners
    Object.keys(this.goals).forEach(goalId => {
      const checkbox = document.getElementById(`${goalId}-check`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          this.toggleGoal(goalId, e.target.checked);
        });
      }

      // Amount input listeners
      const amountInput = document.getElementById(`${goalId}-amount`);
      if (amountInput) {
        // Setup comma formatting for goal input
        this.setupGoalCommaFormatting(amountInput);
        
        amountInput.addEventListener('input', UTILS.debounce((e) => {
          this.updateGoalAmount(goalId, UTILS.removeCommas(e.target.value), 'input');
        }, CONFIG.ui.debounceDelay));

        amountInput.addEventListener('blur', (e) => {
          this.validateAndFixInput(goalId, UTILS.removeCommas(e.target.value));
        });

        // Handle Enter key to trigger calculations
        amountInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            e.target.blur(); // This will trigger the blur event which includes calculations
          }
        });
      }

      // Slider listeners - immediate updates for better UX
      const slider = document.getElementById(`${goalId}-slider`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.updateGoalAmount(goalId, e.target.value, 'slider');
          // Immediate calculation trigger for sliders
          if (window.calculateResults) {
            window.calculateResults();
          }
        });
      }
    });
  }

  // NEW: Setup comma formatting for goal amount inputs
  setupGoalCommaFormatting(inputElement) {
    if (!inputElement) return;

    // Prevent invalid characters from being entered
    inputElement.addEventListener('keypress', function(e) {
      // Allow backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return;
      }
      
      // Ensure that it is a number or decimal point and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode !== 190 && e.keyCode !== 110)) {
        e.preventDefault();
      }
    });

    // Format on input (while typing)
    inputElement.addEventListener('input', function(e) {
      const cursorPosition = e.target.selectionStart;
      const oldValue = e.target.value;
      const newValue = UTILS.formatNumberWithCommas(oldValue);
      
      // Only update if formatting actually changed the value
      if (newValue !== oldValue) {
        e.target.value = newValue;
        
        // Calculate proper cursor position accounting for added commas
        const cleanOldValue = oldValue.replace(/[^0-9.]/g, '');
        const cleanNewValue = newValue.replace(/[^0-9.]/g, '');
        
        // If the numeric content is the same, adjust cursor position for commas
        if (cleanOldValue === cleanNewValue) {
          // Count commas before cursor position in old and new values
          const oldCommasBeforeCursor = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
          const newCommasBeforeCursor = (newValue.substring(0, cursorPosition).match(/,/g) || []).length;
          
          // Adjust cursor position based on comma difference
          const newCursorPosition = cursorPosition + (newCommasBeforeCursor - oldCommasBeforeCursor);
          
          // Ensure cursor position is within bounds
          const finalCursorPosition = Math.min(Math.max(newCursorPosition, 0), newValue.length);
          
          e.target.setSelectionRange(finalCursorPosition, finalCursorPosition);
        } else {
          // If content changed (digits added/removed), place cursor at end
          e.target.setSelectionRange(newValue.length, newValue.length);
        }
      }
    });
  }

  toggleGoal(goalId, enabled) {
    this.goals[goalId].enabled = enabled;
    
    const amountInput = document.getElementById(`${goalId}-amount`);
    const slider = document.getElementById(`${goalId}-slider`);
    const display = document.getElementById(`${goalId}-display`);
    const goalItem = document.getElementById(`goal-${goalId}`);

    if (amountInput && slider && display && goalItem) {
      amountInput.disabled = !enabled;
      slider.disabled = !enabled;

      if (enabled) {
        // Set default value if empty
        if (!amountInput.value || amountInput.value === '0') {
          const defaultValue = CONFIG.defaultGoals[goalId].value;
          this.goals[goalId].amount = defaultValue;
          amountInput.value = UTILS.formatNumberWithCommas(defaultValue);
          slider.value = defaultValue;
        }
        this.updateDisplay(goalId);
        goalItem.classList.add('active');
      } else {
        display.textContent = '—';
        goalItem.classList.remove('active');
        this.goals[goalId].amount = 0;
      }
    }

    // Trigger calculation update
    this.triggerCalculationUpdate();
    
    // Show feedback
    const meta = CONFIG.goalMeta[goalId];
    const message = enabled ? `${meta.title} goal enabled` : `${meta.title} goal disabled`;
    window.showToast(message, enabled ? 'success' : 'info');
  }

  updateGoalAmount(goalId, value, source = 'input') {
    if (!this.goals[goalId].enabled) return;

    const numericValue = UTILS.getSafeNumber(value, 0);
    const goal = this.goals[goalId];
    
    // Allow input values beyond slider max, but keep minimum constraint
    let finalValue;
    if (source === 'input') {
      // For manual input, only enforce minimum (allow beyond maximum)
      finalValue = Math.max(goal.min, numericValue);
    } else {
      // For slider, clamp to slider's range
      finalValue = Math.max(goal.min, Math.min(goal.max, numericValue));
    }
    
    this.goals[goalId].amount = finalValue;

    // Update UI elements
    if (source === 'input') {
      const slider = document.getElementById(`${goalId}-slider`);
      if (slider) {
        // Update slider to max if input exceeds slider range
        slider.value = Math.min(finalValue, goal.max);
      }
    } else if (source === 'slider') {
      const input = document.getElementById(`${goalId}-amount`);
      if (input) input.value = UTILS.formatNumberWithCommas(finalValue);
    }

    this.updateDisplay(goalId);
    this.triggerCalculationUpdate();
  }

  validateAndFixInput(goalId, value) {
    if (!this.goals[goalId].enabled) return;

    const numericValue = UTILS.getSafeNumber(value, 0);
    const goal = this.goals[goalId];

    // Only validate minimum, allow values beyond maximum for manual input
    if (numericValue < goal.min) {
      const input = document.getElementById(`${goalId}-amount`);
      if (input) {
        input.value = UTILS.formatNumberWithCommas(goal.min);
        this.updateGoalAmount(goalId, goal.min, 'input');
      }
      
      const meta = CONFIG.goalMeta[goalId];
      window.showToast(`${meta.title} amount adjusted to minimum value`, 'warning');
    } else if (numericValue > goal.max) {
      // Show info message for values beyond slider range, but don't clamp
      // Still update the goal amount to trigger calculations
      this.updateGoalAmount(goalId, numericValue, 'input');
      const meta = CONFIG.goalMeta[goalId];
      window.showToast(`${meta.title} amount exceeds slider range - calculation will use your entered value`, 'info');
    } else {
      // For normal valid values, update the goal amount to trigger calculations
      this.updateGoalAmount(goalId, numericValue, 'input');
    }
  }

  updateDisplay(goalId) {
    const display = document.getElementById(`${goalId}-display`);
    if (display && this.goals[goalId].enabled) {
      const amount = this.goals[goalId].amount;
      const goal = this.goals[goalId];
      
      display.textContent = UTILS.formatCurrency(amount);
      
      // Add visual indicator if amount exceeds slider range
      if (amount > goal.max) {
        display.style.color = '#28a745'; // Green color to indicate custom amount
        display.title = 'Custom amount beyond slider range';
      } else {
        display.style.color = ''; // Reset to default color
        display.title = '';
      }
    }
  }

  // Update all goal displays (useful for currency changes)
  updateAllGoalDisplays() {
    Object.keys(this.goals).forEach(goalId => {
      if (this.goals[goalId].enabled) {
        this.updateDisplay(goalId);
      }
    });
  }

  triggerCalculationUpdate() {
    // Immediate calculation trigger - no debouncing for better responsiveness
    if (window.calculateResults) {
      window.calculateResults();
    }
  }

  getGoalsData() {
    return { ...this.goals };
  }

  updateProgress(goalId, currentAmount) {
    if (!this.progressData[goalId]) return;
    
    this.progressData[goalId].current = currentAmount;
    this.progressData[goalId].percentage = this.goals[goalId].amount > 0 
      ? Math.round((currentAmount / this.goals[goalId].amount) * 100)
      : 0;
    
    // Update progress bar if it exists
    const progressBar = document.querySelector(`#goal-${goalId} .progress-fill`);
    const progressLabel = document.querySelector(`#goal-${goalId} .progress-label span:last-child`);
    
    if (progressBar && progressLabel) {
      progressBar.style.width = this.progressData[goalId].percentage + '%';
      progressLabel.textContent = this.progressData[goalId].percentage + '%';
    }
  }

  resetToEmpty() {
    // Reset all goals to disabled and zero amounts
    Object.keys(this.goals).forEach(goalId => {
      this.goals[goalId] = {
        ...CONFIG.defaultGoals[goalId],
        enabled: false,
        amount: 0
      };
    });

    this.initializeProgress();
    this.renderGoals();
    this.setupEventListeners();
  }

  exportGoals() {
    return {
      goals: this.getGoalsData(),
      progress: this.progressData,
      totalValue: Object.values(this.goals)
        .filter(goal => goal.enabled)
        .reduce((sum, goal) => sum + goal.amount, 0)
    };
  }

  importGoals(data) {
    if (data.goals) {
      this.goals = { ...data.goals };
      this.renderGoals();
      this.setupEventListeners();
      this.triggerCalculationUpdate();
    }
  }

  addCustomGoal(name, amount, icon = 'fas fa-star') {
    const goalId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    this.goals[goalId] = {
      value: amount,
      enabled: true,
      min: 0,
      max: 10000000,
      step: 10000,
      amount: amount
    };

    CONFIG.goalMeta[goalId] = {
      title: name,
      icon: icon,
      description: 'Custom goal',
      priority: Object.keys(CONFIG.goalMeta).length + 1
    };

    this.progressData[goalId] = {
      current: 0,
      target: amount,
      percentage: 0
    };

    this.renderGoals();
    this.setupEventListeners();
    this.triggerCalculationUpdate();
    
    window.showToast(`Custom goal "${name}" added successfully`, 'success');
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.GoalsManager = GoalsManager;
}