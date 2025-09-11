// Configuration and constants - ENHANCED for Investment Data Integration
const CONFIG = {
  // Default goal values - all disabled and zero by default
  defaultGoals: {
    house: { value: 0, enabled: false, min: 0, max: 20000000, step: 100000 },
    vehicle: { value: 0, enabled: false, min: 0, max: 10000000, step: 50000 },
    travel: { value: 0, enabled: false, min: 0, max: 5000000, step: 25000 },
    education: { value: 0, enabled: false, min: 0, max: 3000000, step: 25000 },
    emergency: { value: 0, enabled: false, min: 0, max: 2000000, step: 50000 },
    other: { value: 0, enabled: false, min: 0, max: 10000000, step: 100000 }
  },

  // Goal metadata
  goalMeta: {
    house: { 
      title: 'Housing', 
      icon: 'fas fa-home', 
      description: 'Home purchase or renovation costs',
      priority: 1
    },
    vehicle: { 
      title: 'Vehicle', 
      icon: 'fas fa-car', 
      description: 'Car, bike, or other vehicle purchase',
      priority: 2
    },
    travel: { 
      title: 'Travel', 
      icon: 'fas fa-plane', 
      description: 'Vacation and travel expenses',
      priority: 3
    },
    education: { 
      title: 'Education', 
      icon: 'fas fa-graduation-cap', 
      description: 'Education costs for self or family',
      priority: 4
    },
    emergency: { 
      title: 'Emergency Fund', 
      icon: 'fas fa-shield-alt', 
      description: 'Emergency fund for unexpected expenses',
      priority: 5
    },
    other: { 
      title: 'Other Goals', 
      icon: 'fas fa-star', 
      description: 'Any other financial goals',
      priority: 6
    }
  },

  // ENHANCED: Default values including investment fields
  defaults: {
    age: '',
    timeline: '',
    lifeExpectancy: '',
    income: '',
    expenses: '',
    savings: '',
    existingEmi: '',
    returns: '12',
    inflation: '6',
    // NEW: Investment assumption defaults
    existingInvestments: '',
    currentSip: '',
    sipDuration: ''
  },

  // ENHANCED: Investment assumption ranges and recommendations
  investmentAssumptions: {
    returns: {
      conservative: 8,
      moderate: 12,
      aggressive: 15,
      description: 'Expected annual return on investments'
    },
    inflation: {
      low: 4,
      moderate: 6,
      high: 8,
      description: 'Expected annual inflation rate'
    },
    realReturn: {
      minimum: 2,
      target: 6,
      optimal: 9,
      description: 'Inflation-adjusted returns'
    },
    // NEW: Investment portfolio benchmarks
    portfolioStrength: {
      excellent: 80,
      good: 60,
      moderate: 40,
      developing: 20,
      description: 'Overall investment portfolio strength score'
    },
    sipBenchmarks: {
      aggressive: 25000,     // Monthly SIP for aggressive wealth building
      moderate: 15000,       // Monthly SIP for steady growth
      starter: 5000,         // Monthly SIP for beginners
      minimum: 1000,         // Minimum viable SIP amount
      description: 'Monthly SIP amount benchmarks'
    },
    investmentBase: {
      substantial: 2000000,  // Substantial existing investment base
      good: 1000000,         // Good existing investment base
      moderate: 500000,      // Moderate existing investment base
      starter: 100000,       // Starter investment base
      description: 'Existing investment value benchmarks'
    }
  },

  // ENHANCED: Calculation constants with investment factors
  calculations: {
    minEmergencyMonths: 6,
    idealSavingsRate: 20,
    maxExpenseRatio: 70,
    maxEmiRatio: 30,
    compoundingFrequency: 12,
    minimumInvestmentPeriod: 1,
    maximumInvestmentPeriod: 50,
    inflationBufferPercent: 10,
    // NEW: Investment calculation constants
    minSipDurationForBenefit: 1,        // Minimum SIP duration to show meaningful projections
    maxSipProjectionYears: 30,          // Maximum years for SIP projections
    portfolioStrengthWeightage: 0.4,    // 40% weight to portfolio strength in health score
    investmentToIncomeOptimalRatio: 1.5, // Optimal investment-to-annual-income ratio
    sipStepUpRate: 0.1,                 // 10% annual SIP increase recommendation
    rebalancingFrequencyMonths: 6       // Portfolio rebalancing frequency
  },

  // UI constants
  ui: {
    toastDuration: 3000,
    animationDuration: 300,
    debounceDelay: 300,
    assumptionHighlightDuration: 1500,
    assumptionValidationDelay: 800,
    // NEW: Investment UI constants
    investmentSummaryUpdateDelay: 200,   // Quick updates for investment summary
    portfolioVisualizationDelay: 500,   // Delayed portfolio visualization updates
    sipCalculationDelay: 400            // SIP calculation debounce
  },

  // ENHANCED: Validation rules with investment fields
  validation: {
    age: { min: 1, max: 150 },
    timeline: { min: 1, max: 100 },
    lifeExpectancy: { min: 30, max: 150 },
    income: { min: 0, max: 100000000 },
    expenses: { min: 0, max: 100000000 },
    savings: { min: 0, max: 1000000000 },
    existingEmi: { min: 0, max: 10000000 },
    returns: { min: 1, max: 50 },
    inflation: { min: 0, max: 25 },
    // NEW: Investment field validation
    existingInvestments: { min: 0, max: 10000000000 },  // Up to 1000 Cr
    currentSip: { min: 0, max: 1000000 },               // Up to 10L monthly SIP
    sipDuration: { min: 0, max: 50 }                    // Up to 50 years SIP duration
  },

  // ENHANCED: Messages with investment feedback
  messages: {
    calculationComplete: 'Calculation completed with investment data integration',
    dataSaved: 'Financial plan with investment portfolio saved successfully!',
    dataReset: 'All values including investment data have been reset',
    copiedToClipboard: 'Results with investment summary copied to clipboard!',
    featureComingSoon: 'Feature coming soon!',
    selectPlanFirst: 'Please select a plan first',
    balancePlanApplied: 'Balance plan with investment optimization applied successfully',
    confirmReset: 'Are you sure you want to reset all values including investment data?',
    assumptionsApplied: 'Investment assumptions updated and applied to calculations',
    assumptionsValidated: 'Investment assumptions are within reasonable ranges',
    assumptionsWarning: 'Please review your investment assumptions - they may be too optimistic or pessimistic',
    realReturnLow: 'Your real return (after inflation) is quite low. Consider reviewing your assumptions.',
    realReturnHigh: 'Your assumptions show very high real returns. Ensure this aligns with your risk tolerance.',
    // NEW: Investment-specific messages
    investmentDataUpdated: 'Investment portfolio data updated successfully',
    sipProjectionCalculated: 'SIP projections calculated based on your investment history',
    portfolioStrengthCalculated: 'Portfolio strength assessment completed',
    investmentGapIdentified: 'Investment gap analysis completed - see insights for details',
    sipOptimizationSuggested: 'SIP optimization opportunities identified',
    portfolioRebalancingRecommended: 'Portfolio rebalancing recommendations generated'
  },

  // ENHANCED: Action plan templates with investment guidance
  actionPlans: {
    shortTerm: {
      title: 'Short Term (0-6 months)',
      icon: 'fas fa-money-bill-transfer',
      actions: [
        'Review existing investment portfolio performance and allocation',
        'Set up or optimize systematic investment plan (SIP) amounts',
        'Create detailed budget including investment contributions',
        'Research tax-efficient investment options (ELSS, PPF)',
        'Establish investment account if not already available'
      ]
    },
    mediumTerm: {
      title: 'Medium Term (6-18 months)',
      icon: 'fas fa-chart-line',
      actions: [
        'Implement SIP step-up strategy with annual increases',
        'Build investment portfolio to achieve 40+ strength score',
        'Diversify across equity, debt, and hybrid fund categories',
        'Monitor and rebalance portfolio every 6 months',
        'Track investment returns against expected performance'
      ]
    },
    longTerm: {
      title: 'Long Term (18+ months)',
      icon: 'fas fa-house-circle-check',
      actions: [
        'Achieve target portfolio strength of 80+ through consistent investing',
        'Consider alternative investments once core portfolio exceeds ₹10L',
        'Plan retirement corpus adequacy based on investment projections',
        'Implement tax optimization strategies for large portfolios',
        'Review estate planning and wealth transfer strategies'
      ]
    }
  },

  // ENHANCED: Investment assumption guidance with portfolio context
  assumptionGuidance: {
    returns: {
      ranges: {
        '8-10': 'Conservative: Debt funds, FDs, conservative hybrid funds',
        '10-12': 'Moderate: Balanced funds, diversified equity funds, index funds',
        '12-15': 'Aggressive: Growth equity funds, sectoral funds, international equity',
        '15+': 'Very Aggressive: Small cap funds, thematic funds, direct equity'
      },
      warnings: {
        tooLow: 'Returns below 8% may not beat inflation effectively',
        tooHigh: 'Returns above 18% are very optimistic and high-risk'
      },
      // NEW: Portfolio context guidance
      portfolioContext: {
        withExistingBase: 'With existing investments, can afford moderate risk approach',
        withoutBase: 'Without investment base, consider starting with conservative approach',
        largeSip: 'Large SIP amounts allow for diversified risk approach',
        smallSip: 'Small SIP amounts should focus on consistent low-cost index funds'
      }
    },
    inflation: {
      ranges: {
        '3-5': 'Low inflation environment (developed market levels)',
        '5-7': 'Moderate inflation (India historical average)',
        '7-10': 'High inflation periods (economic uncertainty)',
        '10+': 'Very high inflation (crisis scenarios)'
      },
      warnings: {
        tooLow: 'Inflation below 3% is historically rare for India',
        tooHigh: 'Inflation above 12% indicates severe economic stress'
      }
    },
    // NEW: Investment-specific guidance
    portfolioStrength: {
      ranges: {
        '80-100': 'Excellent: Strong base + consistent SIP + good duration',
        '60-79': 'Good: Either strong base OR good SIP consistency',
        '40-59': 'Moderate: Building investment discipline',
        '20-39': 'Developing: Early stage investment journey',
        '0-19': 'Starter: Minimal or no investment foundation'
      },
      improvement: {
        increaseBase: 'Add lump sum to existing investments',
        increaseSip: 'Increase monthly SIP amount',
        improveDuration: 'Maintain SIP consistency for longer periods',
        diversify: 'Diversify across different asset classes'
      }
    },
    sipStrategy: {
      beginner: 'Start with ₹1,000-5,000 monthly in diversified equity funds',
      intermediate: 'Scale to ₹5,000-15,000 with step-up SIP strategy',
      advanced: 'Optimize ₹15,000+ SIP across multiple asset classes',
      expert: 'Manage ₹25,000+ SIP with tax optimization and alternatives'
    }
  },

  // NEW: Investment calculation formulas and constants
  investmentCalculations: {
    // Portfolio strength calculation weights
    strengthWeights: {
      existingInvestmentBase: 0.4,    // 40% weight to existing investments
      sipConsistency: 0.35,           // 35% weight to SIP amount and consistency
      investmentDiscipline: 0.25      // 25% weight to SIP duration
    },
    
    // SIP efficiency benchmarks
    sipEfficiency: {
      excellent: 15,      // 15%+ annual returns
      good: 12,           // 12%+ annual returns
      moderate: 10,       // 10%+ annual returns
      poor: 8             // Below 8% annual returns
    },
    
    // Investment portfolio allocation suggestions
    allocationSuggestions: {
      conservative: { equity: 30, debt: 60, gold: 10 },
      moderate: { equity: 60, debt: 30, gold: 10 },
      aggressive: { equity: 80, debt: 15, gold: 5 }
    },
    
    // Rebalancing triggers
    rebalancingTriggers: {
      portfolioValueChange: 0.2,      // 20% change triggers rebalancing
      allocationDrift: 0.1,           // 10% allocation drift triggers rebalancing
      timeBasedMonths: 6              // 6 months triggers time-based rebalancing
    }
  },

  // NEW: Multi-currency support configuration
  currencies: {
    INR: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      locale: 'en-IN',
      exchangeRate: 1, // Base currency
      decimalPlaces: 0,
      largeNumberFormat: {
        crore: { value: 10000000, suffix: 'Cr' },
        lakh: { value: 100000, suffix: 'L' }
      }
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      locale: 'en-US',
      exchangeRate: 0.012, // 1 INR = 0.012 USD (approximate)
      decimalPlaces: 2,
      largeNumberFormat: {
        billion: { value: 1000000000, suffix: 'B' },
        million: { value: 1000000, suffix: 'M' },
        thousand: { value: 1000, suffix: 'K' }
      }
    },
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      locale: 'en-DE',
      exchangeRate: 0.011, // 1 INR = 0.011 EUR (approximate)
      decimalPlaces: 2,
      largeNumberFormat: {
        billion: { value: 1000000000, suffix: 'B' },
        million: { value: 1000000, suffix: 'M' },
        thousand: { value: 1000, suffix: 'K' }
      }
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      locale: 'en-GB',
      exchangeRate: 0.0095, // 1 INR = 0.0095 GBP (approximate)
      decimalPlaces: 2,
      largeNumberFormat: {
        billion: { value: 1000000000, suffix: 'B' },
        million: { value: 1000000, suffix: 'M' },
        thousand: { value: 1000, suffix: 'K' }
      }
    },
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      locale: 'ja-JP',
      exchangeRate: 1.8, // 1 INR = 1.8 JPY (approximate)
      decimalPlaces: 0,
      largeNumberFormat: {
        oku: { value: 100000000, suffix: '億' }, // 100 million
        man: { value: 10000, suffix: '万' }      // 10 thousand
      }
    },
    CNY: {
      code: 'CNY',
      symbol: '元',
      name: 'Chinese Yuan',
      locale: 'zh-CN',
      exchangeRate: 0.087, // 1 INR = 0.087 CNY (approximate)
      decimalPlaces: 2,
      largeNumberFormat: {
        yi: { value: 100000000, suffix: '亿' },   // 100 million
        wan: { value: 10000, suffix: '万' }       // 10 thousand
      }
    },
    AED: {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
      locale: 'ar-AE',
      exchangeRate: 0.044, // 1 INR = 0.044 AED (approximate)
      decimalPlaces: 2,
      largeNumberFormat: {
        million: { value: 1000000, suffix: 'M' },
        thousand: { value: 1000, suffix: 'K' }
      }
    }
  },

  // Default currency (can be changed by user)
  defaultCurrency: 'INR'
};

// ENHANCED: Utility functions with investment calculations
const UTILS = {
  // Get current selected currency or default
  getCurrentCurrency: () => {
    return localStorage.getItem('selectedCurrency') || CONFIG.defaultCurrency;
  },

  // Set current currency and save to localStorage
  setCurrentCurrency: (currencyCode) => {
    if (CONFIG.currencies[currencyCode]) {
      localStorage.setItem('selectedCurrency', currencyCode);
      // Trigger currency change event if function exists
      if (window.onCurrencyChange && typeof window.onCurrencyChange === 'function') {
        window.onCurrencyChange(currencyCode);
      }
      return true;
    }
    return false;
  },

  // Convert amount from INR to specified currency
  convertCurrency: (amount, fromCurrency = 'INR', toCurrency = null) => {
    if (!toCurrency) toCurrency = UTILS.getCurrentCurrency();
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = CONFIG.currencies[fromCurrency]?.exchangeRate || 1;
    const toRate = CONFIG.currencies[toCurrency]?.exchangeRate || 1;
    
    // Convert to INR first, then to target currency
    const inrAmount = amount / fromRate;
    return inrAmount * toRate;
  },

  // Format currency for display with multi-currency support
  formatCurrency: (amount, currencyCode = null) => {
    const currency = currencyCode || UTILS.getCurrentCurrency();
    const config = CONFIG.currencies[currency];
    
    if (!config) {
      // Fallback to INR if currency not found
      return UTILS.formatCurrency(amount, 'INR');
    }

    // Convert amount if not already in the target currency
    let numAmount = Math.round(parseFloat(amount) || 0);
    
    // Format large numbers with appropriate suffixes
    const largeFormat = config.largeNumberFormat;
    
    // Check for large number formatting
    for (const [key, format] of Object.entries(largeFormat)) {
      if (numAmount >= format.value) {
        const formattedValue = (numAmount / format.value).toFixed(1);
        return config.symbol + formattedValue + format.suffix;
      }
    }

    // For smaller amounts, use locale-specific formatting
    if (numAmount >= 1000) {
      try {
        const formatted = new Intl.NumberFormat(config.locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: config.decimalPlaces
        }).format(numAmount);
        return config.symbol + formatted;
      } catch (e) {
        // Fallback if Intl is not available
        return config.symbol + numAmount.toLocaleString();
      }
    } else {
      return config.symbol + numAmount.toString();
    }
  },

  // Format currency input (for form fields)
  formatCurrencyInput: (amount, currencyCode = null) => {
    const currency = currencyCode || UTILS.getCurrentCurrency();
    const config = CONFIG.currencies[currency];
    
    if (!config) return amount;
    
    const numAmount = parseFloat(amount) || 0;
    
    try {
      return new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: config.decimalPlaces
      }).format(numAmount);
    } catch (e) {
      return numAmount.toLocaleString();
    }
  },

  // Get currency symbol for current currency
  getCurrencySymbol: (currencyCode = null) => {
    const currency = currencyCode || UTILS.getCurrentCurrency();
    return CONFIG.currencies[currency]?.symbol || '₹';
  },

  // Format percentage
  formatPercentage: (value) => {
    return (parseFloat(value) || 0).toFixed(1) + '%';
  },

  // Format years
  formatYears: (years) => {
    return (parseFloat(years) || 0).toFixed(1) + 'y';
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // ENHANCED: Validate input with investment field support
  validateInput: (value, field) => {
    const rules = CONFIG.validation[field];
    if (!rules) return true;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    
    const isInRange = numValue >= rules.min && numValue <= rules.max;
    
    // Investment-specific validation warnings
    if (field === 'existingInvestments' && isInRange) {
      if (numValue > 50000000) console.warn('Very large investment portfolio - ensure accurate entry');
    }
    
    if (field === 'currentSip' && isInRange) {
      if (numValue > 100000) console.warn('Very large SIP amount - ensure this is sustainable');
      if (numValue > 0 && numValue < 1000) console.warn('Very small SIP amount - consider increasing for meaningful impact');
    }
    
    if (field === 'sipDuration' && isInRange) {
      if (numValue > 20) console.warn('Very long SIP duration - ensure timeline alignment');
    }
    
    // Existing validation for returns and inflation
    if (field === 'returns' && isInRange) {
      if (numValue < 6) console.warn('Very conservative return assumption');
      if (numValue > 18) console.warn('Very aggressive return assumption');
    }
    
    if (field === 'inflation' && isInRange) {
      if (numValue < 3) console.warn('Very low inflation assumption for India');
      if (numValue > 10) console.warn('Very high inflation assumption');
    }
    
    return isInRange;
  },

  // ENHANCED: Safe number extraction with investment field defaults
  getSafeNumber: (value, defaultValue = 0, field = null) => {
    const num = parseFloat(value);
    
    if (isNaN(num) || num < 0) {
      // Smart defaults for investment fields
      if (field === 'returns') return 12;
      if (field === 'inflation') return 6;
      if (field === 'existingInvestments') return 0;
      if (field === 'currentSip') return 0;
      if (field === 'sipDuration') return 0;
      return defaultValue;
    }
    
    return num;
  },

  // Calculate compound growth
  compoundGrowth: (principal, rate, time) => {
    return principal * Math.pow(1 + rate / 100, time);
  },

  // Calculate future value of annuity (SIP calculations)
  futureValueAnnuity: (payment, rate, periods) => {
    if (rate === 0) return payment * periods;
    const monthlyRate = rate / 100 / 12;
    return payment * (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate;
  },

  // Calculate present value of annuity
  presentValueAnnuity: (payment, rate, periods) => {
    if (rate === 0) return payment * periods;
    const monthlyRate = rate / 100 / 12;
    return payment * (1 - Math.pow(1 + monthlyRate, -periods)) / monthlyRate;
  },

  // Calculate real return (inflation-adjusted)
  calculateRealReturn: (nominalReturn, inflationRate) => {
    const real = ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(real * 10) / 10;
  },

  // Validate investment assumption combination
  validateAssumptionCombination: (returns, inflation) => {
    const realReturn = UTILS.calculateRealReturn(returns, inflation);
    
    return {
      realReturn,
      isReasonable: realReturn >= 2 && realReturn <= 12,
      warning: realReturn < 2 ? 'Real return too low for effective goal planning' :
               realReturn > 12 ? 'Real return very high - ensure risk tolerance matches' :
               null,
      category: realReturn < 4 ? 'conservative' :
                realReturn < 8 ? 'moderate' :
                'aggressive'
    };
  },

  // Get assumption guidance
  getAssumptionGuidance: (field, value) => {
    const guidance = CONFIG.assumptionGuidance[field];
    if (!guidance) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    
    for (const [range, description] of Object.entries(guidance.ranges)) {
      const [min, max] = range.split('-').map(r => parseFloat(r.replace('+', '')));
      if (range.includes('+')) {
        if (numValue >= min) return description;
      } else {
        if (numValue >= min && numValue <= max) return description;
      }
    }
    
    return null;
  },

  // NEW: Investment-specific utility functions
  
  // Calculate SIP maturity value
  calculateSipMaturity: (monthlyAmount, annualRate, years) => {
    if (monthlyAmount <= 0 || years <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) return monthlyAmount * months;
    
    return monthlyAmount * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  },

  // Calculate investment portfolio allocation
  calculateOptimalAllocation: (age, riskTolerance = 'moderate') => {
    const baseEquityPercent = Math.max(20, Math.min(80, 100 - age));
    
    const allocations = {
      conservative: {
        equity: Math.max(20, baseEquityPercent - 20),
        debt: Math.min(70, 80 - baseEquityPercent + 20),
        gold: 10
      },
      moderate: {
        equity: baseEquityPercent,
        debt: Math.max(15, 90 - baseEquityPercent),
        gold: 10
      },
      aggressive: {
        equity: Math.min(90, baseEquityPercent + 20),
        debt: Math.max(5, 90 - baseEquityPercent - 20),
        gold: 5
      }
    };
    
    return allocations[riskTolerance] || allocations.moderate;
  },

  // Calculate investment vs debt decision
  calculateInvestmentVsDebtDecision: (loanRate, expectedReturns, riskTolerance = 'moderate') => {
    const riskAdjustedReturns = expectedReturns * (riskTolerance === 'conservative' ? 0.8 : 
                                                   riskTolerance === 'aggressive' ? 1.1 : 1.0);
    
    return {
      recommendation: loanRate > riskAdjustedReturns ? 'prepay_debt' : 'invest',
      rateDifference: Math.abs(loanRate - riskAdjustedReturns),
      confidence: Math.abs(loanRate - riskAdjustedReturns) > 2 ? 'high' : 'moderate'
    };
  },

  // Calculate portfolio rebalancing need
  calculateRebalancingNeed: (currentAllocation, targetAllocation) => {
    let maxDrift = 0;
    Object.keys(targetAllocation).forEach(asset => {
      const drift = Math.abs((currentAllocation[asset] || 0) - targetAllocation[asset]);
      maxDrift = Math.max(maxDrift, drift);
    });
    
    return {
      needsRebalancing: maxDrift > CONFIG.investmentCalculations.rebalancingTriggers.allocationDrift * 100,
      maxDrift,
      urgency: maxDrift > 20 ? 'high' : maxDrift > 10 ? 'moderate' : 'low'
    };
  },

  // NEW: Investment health assessment
  assessInvestmentHealth: (existingInvestments, currentSip, sipDuration, age, income) => {
    const annualIncome = income * 12;
    const investmentToIncomeRatio = existingInvestments / annualIncome;
    const sipToIncomeRatio = (currentSip * 12) / annualIncome;
    
    let score = 0;
    let feedback = [];
    
    // Investment base assessment
    if (investmentToIncomeRatio >= 2) {
      score += 40;
      feedback.push('Excellent investment base relative to income');
    } else if (investmentToIncomeRatio >= 1) {
      score += 30;
      feedback.push('Good investment base');
    } else if (investmentToIncomeRatio >= 0.5) {
      score += 20;
      feedback.push('Moderate investment base - room for growth');
    } else if (existingInvestments > 0) {
      score += 10;
      feedback.push('Investment journey started - focus on growth');
    } else {
      feedback.push('No existing investment base - start building immediately');
    }
    
    // SIP assessment
    if (sipToIncomeRatio >= 0.3) {
      score += 35;
      feedback.push('Outstanding SIP commitment');
    } else if (sipToIncomeRatio >= 0.2) {
      score += 25;
      feedback.push('Good SIP discipline');
    } else if (sipToIncomeRatio >= 0.1) {
      score += 15;
      feedback.push('Moderate SIP - consider increasing');
    } else if (currentSip > 0) {
      score += 10;
      feedback.push('SIP started - build consistency');
    } else {
      feedback.push('No SIP - start systematic investing');
    }
    
    // Duration assessment
    if (sipDuration >= 5) {
      score += 25;
      feedback.push('Excellent investment discipline');
    } else if (sipDuration >= 3) {
      score += 20;
      feedback.push('Good investment consistency');
    } else if (sipDuration >= 1) {
      score += 15;
      feedback.push('Building investment habit');
    } else if (sipDuration > 0) {
      score += 10;
      feedback.push('Recently started investing');
    }
    
    return {
      score: Math.min(100, score),
      feedback,
      recommendations: UTILS.generateInvestmentRecommendations(score, investmentToIncomeRatio, sipToIncomeRatio, age)
    };
  },

  // Generate investment recommendations
  generateInvestmentRecommendations: (score, investmentRatio, sipRatio, age) => {
    const recommendations = [];
    
    if (score < 40) {
      recommendations.push('Start with small, consistent SIP of ₹1,000-3,000');
      recommendations.push('Build emergency fund before large investments');
      recommendations.push('Focus on low-cost index funds for simplicity');
    } else if (score < 60) {
      recommendations.push('Increase SIP amount to ₹5,000-10,000 monthly');
      recommendations.push('Consider step-up SIP with annual increases');
      recommendations.push('Diversify across large-cap and mid-cap funds');
    } else if (score < 80) {
      recommendations.push('Scale SIP to ₹15,000+ with diversification');
      recommendations.push('Add international equity exposure');
      recommendations.push('Consider tax-saving investments (ELSS)');
    } else {
      recommendations.push('Optimize portfolio with alternative investments');
      recommendations.push('Focus on tax efficiency and estate planning');
      recommendations.push('Consider direct equity for better returns');
    }
    
    // Age-specific recommendations
    if (age < 30) {
      recommendations.push('Maximize equity allocation (80%+) due to young age');
    } else if (age < 45) {
      recommendations.push('Maintain balanced equity-debt allocation');
    } else {
      recommendations.push('Gradually shift to conservative allocation');
    }
    
    return recommendations;
  },

  // NEW: Calculate investment timeline projections
  calculateInvestmentTimeline: (existingInvestments, monthlyInvestment, targetAmount, annualReturn) => {
    if (targetAmount <= existingInvestments) return 0;
    
    const monthlyRate = annualReturn / 100 / 12;
    let currentValue = existingInvestments;
    let months = 0;
    const maxMonths = 600; // 50 years max
    
    while (currentValue < targetAmount && months < maxMonths) {
      months++;
      currentValue = currentValue * (1 + monthlyRate) + monthlyInvestment;
    }
    
    return months / 12;
  },

  // NEW: Calculate optimal SIP amount for goal
  calculateOptimalSipForGoal: (targetAmount, timelineYears, existingInvestments, annualReturn) => {
    const futureValueExisting = existingInvestments * Math.pow(1 + annualReturn / 100, timelineYears);
    const remainingAmount = Math.max(0, targetAmount - futureValueExisting);
    
    if (remainingAmount <= 0) return 0;
    
    const monthlyRate = annualReturn / 100 / 12;
    const months = timelineYears * 12;
    
    if (monthlyRate === 0) return remainingAmount / months;
    
    return remainingAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  },

  // NEW: Portfolio diversification score
  calculateDiversificationScore: (portfolioSize, sipAmount, age) => {
    let score = 0;
    
    // Portfolio size factor
    if (portfolioSize >= 1000000) score += 40;
    else if (portfolioSize >= 500000) score += 30;
    else if (portfolioSize >= 100000) score += 20;
    else if (portfolioSize > 0) score += 10;
    
    // SIP consistency factor
    if (sipAmount >= 20000) score += 30;
    else if (sipAmount >= 10000) score += 20;
    else if (sipAmount >= 5000) score += 15;
    else if (sipAmount > 0) score += 10;
    
    // Age-appropriate risk factor
    const optimalEquityPercent = Math.max(20, 100 - age);
    if (age < 35) score += 20; // Young age bonus
    else if (age < 50) score += 15;
    else if (age < 65) score += 10;
    else score += 5;
    
    // SIP to portfolio ratio (should be balanced)
    const annualSip = sipAmount * 12;
    if (portfolioSize > 0 && annualSip > 0) {
      const ratio = annualSip / portfolioSize;
      if (ratio >= 0.1 && ratio <= 0.5) score += 10; // Balanced growth
    }
    
    return Math.min(100, score);
  },

  // NEW: Investment risk assessment
  assessInvestmentRisk: (allocation, age, timeline) => {
    const equityPercent = allocation.equity || 60;
    const ageBasedMaxEquity = 100 - age;
    const timelineBasedMaxEquity = Math.min(90, timeline * 5 + 30);
    
    const recommendedMaxEquity = Math.min(ageBasedMaxEquity, timelineBasedMaxEquity);
    
    return {
      currentRisk: equityPercent > 70 ? 'high' : equityPercent > 40 ? 'moderate' : 'low',
      appropriateRisk: equityPercent <= recommendedMaxEquity,
      recommendedEquity: recommendedMaxEquity,
      riskAdjustment: equityPercent - recommendedMaxEquity
    };
  },

  // NEW: Calculate compound annual growth rate (CAGR)
  calculateCAGR: (beginningValue, endingValue, years) => {
    if (beginningValue <= 0 || endingValue <= 0 || years <= 0) return 0;
    return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  },

  // NEW: Format investment duration
  formatInvestmentDuration: (years) => {
    if (years >= 1) {
      const wholeYears = Math.floor(years);
      const months = Math.round((years - wholeYears) * 12);
      
      if (months === 0) {
        return `${wholeYears} year${wholeYears > 1 ? 's' : ''}`;
      } else {
        return `${wholeYears}y ${months}m`;
      }
    } else {
      const months = Math.round(years * 12);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  },

  // NEW: Calculate investment tax impact
  calculateTaxOptimizedReturns: (returns, investmentType = 'equity') => {
    const taxRates = {
      equity: 0.1,      // 10% LTCG for equity after 1 year
      debt: 0.2,        // 20% LTCG for debt after 3 years
      gold: 0.2,        // 20% LTCG for gold after 3 years
      elss: 0           // Tax-free after 3 years lock-in
    };
    
    const applicableTax = taxRates[investmentType] || taxRates.equity;
    const postTaxReturns = returns * (1 - applicableTax);
    
    return {
      preTaxReturns: returns,
      postTaxReturns,
      taxImpact: returns - postTaxReturns,
      taxRate: applicableTax * 100
    };
  },

  // NEW: Format number with commas for input fields
  formatNumberWithCommas: (value) => {
    if (!value || value === '') return '';
    
    // Convert to string and remove existing commas and non-numeric characters except decimal point
    const cleanValue = value.toString().replace(/[^0-9.]/g, '');
    
    // Handle empty or invalid input
    if (!cleanValue || cleanValue === '.' || cleanValue === '') return cleanValue;
    
    // Handle multiple decimal points - keep only the first one
    const decimalParts = cleanValue.split('.');
    let numericValue = decimalParts[0];
    if (decimalParts.length > 1) {
      numericValue += '.' + decimalParts.slice(1).join('');
    }
    
    // Split by decimal point
    const parts = numericValue.split('.');
    
    // Add commas to integer part only if it has digits
    if (parts[0] && parts[0].length > 0) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Return formatted number (with decimal if it exists)
    return parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
  },

  // NEW: Remove commas from formatted number to get numeric value
  removeCommas: (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  },

  // NEW: Setup real-time comma formatting for amount inputs
  setupCommaFormatting: (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Mark this input as having comma formatting to avoid conflicts
    input.setAttribute('data-comma-formatting', 'true');

    // Prevent invalid characters from being entered
    input.addEventListener('keypress', function(e) {
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
    input.addEventListener('input', function(e) {
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
        
        // Trigger calculations if global function exists
        if (window.calculateResults && typeof window.calculateResults === 'function') {
          // Use setTimeout to avoid potential conflicts with other event handlers
          setTimeout(() => {
            window.calculateResults();
          }, 50);
        }
      }
    });

    // Clean up on blur for processing
    input.addEventListener('blur', function(e) {
      // Store the clean numeric value in a data attribute for calculations
      const cleanValue = UTILS.removeCommas(e.target.value);
      e.target.setAttribute('data-numeric-value', cleanValue);
      
      // Trigger calculations when user moves away from input
      if (window.calculateResults && typeof window.calculateResults === 'function') {
        window.calculateResults();
      }
    });

    // Handle Enter key to trigger calculations
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.target.blur(); // This will trigger the blur event which includes calculations
      }
    });

    // Format existing value on page load
    if (input.value) {
      input.value = UTILS.formatNumberWithCommas(input.value);
      input.setAttribute('data-numeric-value', UTILS.removeCommas(input.value));
    }
  },

  // NEW: Get numeric value from comma-formatted input
  getNumericValue: (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return 0;
    
    const numericValue = input.getAttribute('data-numeric-value') || UTILS.removeCommas(input.value);
    return parseFloat(numericValue) || 0;
  },

  // NEW: Update all currency displays when currency changes
  updateAllCurrencyDisplays: () => {
    // Update all elements with currency symbols
    const currencyElements = document.querySelectorAll('[data-currency-display]');
    const currentSymbol = UTILS.getCurrencySymbol();
    
    currencyElements.forEach(element => {
      const originalText = element.textContent;
      // Replace any existing currency symbol with the new one
      const currencies = Object.values(CONFIG.currencies).map(c => c.symbol);
      let newText = originalText;
      
      currencies.forEach(symbol => {
        newText = newText.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), currentSymbol);
      });
      
      element.textContent = newText;
    });
    
    // Trigger recalculation if function exists
    if (window.calculateResults && typeof window.calculateResults === 'function') {
      setTimeout(() => {
        window.calculateResults();
      }, 100);
    }
  },

  // NEW: Convert user input amount to INR for calculations
  convertInputToINR: (amount, inputCurrency = null) => {
    const currency = inputCurrency || UTILS.getCurrentCurrency();
    if (currency === 'INR') return amount;
    
    const exchangeRate = CONFIG.currencies[currency]?.exchangeRate || 1;
    return amount / exchangeRate; // Convert to INR
  },

  // NEW: Convert calculated INR amount to display currency
  convertINRToDisplay: (inrAmount, displayCurrency = null) => {
    const currency = displayCurrency || UTILS.getCurrentCurrency();
    if (currency === 'INR') return inrAmount;
    
    const exchangeRate = CONFIG.currencies[currency]?.exchangeRate || 1;
    return inrAmount * exchangeRate; // Convert from INR to display currency
  }
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.UTILS = UTILS;
  
  // Set up global currency change handler
  window.onCurrencyChange = (newCurrency) => {
    UTILS.updateAllCurrencyDisplays();
    
    // Update input field formatting
    const inputs = document.querySelectorAll('input[data-comma-formatting="true"]');
    inputs.forEach(input => {
      const currentValue = UTILS.removeCommas(input.value);
      if (currentValue) {
        input.value = UTILS.formatNumberWithCommas(currentValue, newCurrency);
        input.setAttribute('data-currency', newCurrency);
      }
    });
    
    // Update loan displays if app instance exists
    if (window.financialPlannerApp && window.financialPlannerApp.updateAllLoanDisplaysForCurrency) {
      window.financialPlannerApp.updateAllLoanDisplaysForCurrency();
    }
  };
}