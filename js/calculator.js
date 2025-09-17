// Financial Calculator Core Functions - ENHANCED with Investment Data Integration
class FinancialCalculator {
  constructor() {
    this.results = {};
  }

  // Enhanced main calculation method with investment data and loan details
  calculate(data) {
    const {
      age, timeline, lifeExpectancy, income, expenses, savings, 
      existingEmi, returns, inflation, goals,
      existingInvestments, currentSip, sipDuration,
      loanData = null
    } = data;

    // Calculate basic metrics
    const expenseRatio = (expenses / income) * 100;
    const disposableIncome = income - expenses - existingEmi;
    
    // Calculate total goal cost
    const totalGoalCost = this.calculateTotalGoalCost(goals);
    
    // Enhanced calculation with existing investments and savings
    const investmentData = this.calculateInvestmentProjections(
      existingInvestments, currentSip, sipDuration, returns, timeline, savings, existingEmi
    );
    
    // FIXED: Calculate monthly investment needed for USER'S TIMELINE
    const monthlyInvestment = this.calculateEnhancedMonthlyInvestment(
      totalGoalCost, savings, timeline, returns, inflation, investmentData
    );
    
    // FIXED: Time required should be USER'S TIMELINE if achievable
    const timeRequired = this.calculateTimeRequiredRespectingUserTimeline(
      totalGoalCost, savings, monthlyInvestment, returns, inflation, investmentData, timeline
    );
    
    // Enhanced savings rate calculation
    const totalMonthlySavings = monthlyInvestment + (currentSip || 0);
    const savingsRate = disposableIncome > 0 ? (totalMonthlySavings / disposableIncome) * 100 : 0;
    
    // Enhanced balance score with investment context
    const balanceScore = this.calculateEnhancedBalanceScore(
      expenseRatio, savingsRate, timeRequired, timeline, investmentData
    );
    
    // Enhanced financial health with investment factors, life expectancy, and loan details
    const financialHealth = this.calculateEnhancedFinancialHealth(
      expenseRatio, savingsRate, timeRequired, timeline, savings, expenses, 
      existingEmi, income, investmentData, age, lifeExpectancy, loanData
    );

    // NEW: Predicted Lifespan Analysis
    console.log('🔍 Calculating life stage insights with params:', {age, timeline, lifeExpectancy, income, expenses, totalGoalCost});

    let lifeStageInsights = null;
    if (age && timeline && lifeExpectancy && age > 0 && timeline > 0 && lifeExpectancy > age) {
      lifeStageInsights = this.calculateLifeStageInsights(
        age, timeline, lifeExpectancy, income, expenses, totalGoalCost, investmentData
      );
      console.log('✅ Generated life stage insights:', lifeStageInsights);
    } else {
      console.log('❌ Insufficient data for life stage insights. Required: age, timeline, lifeExpectancy');
      console.log('❌ Current values:', {age, timeline, lifeExpectancy});
    }

    this.results = {
      totalGoalCost,
      monthlyInvestment,
      timeRequired,
      savingsRate,
      expenseRatio,
      disposableIncome,
      balanceScore,
      financialHealth,
      emergencyMonths: Math.round(savings / expenses),
      emiPercentage: (existingEmi / income) * 100,
      // New investment-related results
      investmentData,
      totalMonthlySavings,
      investmentMaturity: investmentData.projectedValue,
      investmentGap: Math.max(0, totalGoalCost - investmentData.projectedValue - savings),
      sipEfficiency: this.calculateSipEfficiency(currentSip, investmentData.projectedSipValue, sipDuration),
      // NEW: Predicted Lifespan Insights
      lifeStageInsights
    };

    return this.results;
  }

  // NEW METHOD: Calculate time required while respecting user timeline
  calculateTimeRequiredRespectingUserTimeline(totalGoalCost, currentSavings, monthlyInvestment, returns, inflation, investmentData, userTimeline) {
    if (totalGoalCost <= 0) return 0;
    
    // First check: Can goals be achieved within user's timeline with current monthly investment?
    const requiredMonthlyForUserTimeline = this.calculateEnhancedMonthlyInvestment(
      totalGoalCost, currentSavings, userTimeline, returns, inflation, investmentData
    );
    
    const currentSip = investmentData.currentSip || 0;
    const totalCurrentMonthlyCapacity = monthlyInvestment + currentSip;
    
    // If current monthly capacity is sufficient for user timeline, return user timeline
    if (totalCurrentMonthlyCapacity >= requiredMonthlyForUserTimeline * 0.95) { // 5% tolerance
      return userTimeline;
    }
    
    // Otherwise, calculate actual time needed with current capacity
    const monthlyRate = returns / 100 / 12;
    let currentValue = currentSavings + (investmentData.existingInvestments || 0);
    let totalMonthlySavings = monthlyInvestment + currentSip;
    
    if (totalMonthlySavings <= 0 && currentValue < totalGoalCost) return 999;
    
    let months = 0;
    const maxMonths = 600;
    
    while (months < maxMonths) {
      months++;
      currentValue = currentValue * (1 + monthlyRate) + totalMonthlySavings;
      const inflatedGoalCost = totalGoalCost * Math.pow(1 + inflation / 100, months / 12);
      
      if (currentValue >= inflatedGoalCost) {
        break;
      }
    }
    
    return Math.round((months / 12) * 10) / 10;
  }

  // Enhanced method: Calculate investment projections with savings and EMI data
  calculateInvestmentProjections(existingInvestments = 0, currentSip = 0, sipDuration = 0, returns = 12, timeline = 15, currentSavings = 0, existingEmi = 0) {
    const monthlyRate = returns / 100 / 12;
    
    // Project existing investment value
    const projectedExistingValue = existingInvestments * Math.pow(1 + returns / 100, timeline);
    
    // Calculate current SIP projected value for remaining timeline
    const remainingSipMonths = Math.max(0, (timeline * 12) - (sipDuration * 12));
    let projectedSipValue = 0;
    
    if (currentSip > 0) {
      // Value of SIPs already invested
      const sipValueAtEnd = currentSip * 12 * sipDuration * Math.pow(1 + returns / 100, timeline);
      
      // Future value of continuing current SIP
      if (remainingSipMonths > 0 && monthlyRate > 0) {
        const futureSipValue = currentSip * (Math.pow(1 + monthlyRate, remainingSipMonths) - 1) / monthlyRate;
        projectedSipValue = sipValueAtEnd + futureSipValue;
      } else {
        projectedSipValue = sipValueAtEnd;
      }
    }
    
    const totalProjectedValue = projectedExistingValue + projectedSipValue;
    
    return {
      existingInvestments: existingInvestments || 0,
      currentSip: currentSip || 0,
      sipDuration: sipDuration || 0,
      projectedExistingValue,
      projectedSipValue,
      projectedValue: totalProjectedValue,
      remainingSipMonths,
      investmentPortfolioStrength: this.assessPortfolioStrength(existingInvestments, currentSip, sipDuration),
      // Additional data for sustainability calculation
      currentSavings: currentSavings || 0,
      existingEmi: existingEmi || 0,
      timeline: timeline || 5
    };
  }

  // Assess investment portfolio strength
  assessPortfolioStrength(existingInvestments, currentSip, sipDuration) {
    let strength = 0;
    
    // Existing investment base strength (0-30 points)
    if (existingInvestments >= 1000000) strength += 30;
    else if (existingInvestments >= 500000) strength += 20;
    else if (existingInvestments >= 100000) strength += 10;
    else if (existingInvestments > 0) strength += 5;
    
    // SIP consistency strength (0-40 points)
    if (currentSip >= 20000 && sipDuration >= 3) strength += 40;
    else if (currentSip >= 10000 && sipDuration >= 2) strength += 30;
    else if (currentSip >= 5000 && sipDuration >= 1) strength += 20;
    else if (currentSip > 0) strength += 10;
    
    // Investment discipline (0-30 points)
    if (sipDuration >= 5) strength += 30;
    else if (sipDuration >= 3) strength += 20;
    else if (sipDuration >= 1) strength += 10;
    
    return Math.min(100, strength);
  }

  // Enhanced monthly investment calculation
  calculateEnhancedMonthlyInvestment(totalGoalCost, currentSavings, timeline, returns, inflation, investmentData) {
    if (totalGoalCost <= 0 || timeline <= 0) return 0;
    
    // USE USER'S TIMELINE - NOT CALCULATED TIME
    const userTimeline = timeline; // This should be the user input (20 years)
    
    // Adjust goal cost for inflation over USER'S timeline
    const futureGoalCost = totalGoalCost * Math.pow(1 + inflation / 100, userTimeline);
    
    // Calculate future value of current savings over USER'S timeline
    const futureSavingsValue = currentSavings * Math.pow(1 + returns / 100, userTimeline);
    
    // Calculate future value of existing investments over USER'S timeline
    const futureInvestmentValue = (investmentData.existingInvestments || 0) * Math.pow(1 + returns / 100, userTimeline);
    
    // Calculate future value of current SIP over USER'S timeline
    const currentSip = investmentData.currentSip || 0;
    let futureSipValue = 0;
    
    if (currentSip > 0) {
      const monthlyRate = returns / 100 / 12;
      const months = userTimeline * 12;
      
      if (monthlyRate > 0) {
        futureSipValue = currentSip * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      } else {
        futureSipValue = currentSip * months;
      }
    }
    
    // Total future assets available
    const totalFutureAssets = futureSavingsValue + futureInvestmentValue + futureSipValue;
    
    // Additional amount needed to reach goals in USER'S timeline
    const additionalNeeded = Math.max(0, futureGoalCost - totalFutureAssets);
    
    if (additionalNeeded <= 0) return 0;
    
    // Calculate additional monthly investment needed for USER'S timeline
    const monthlyRate = returns / 100 / 12;
    const months = userTimeline * 12;
    
    if (monthlyRate === 0) {
      return Math.round(additionalNeeded / months);
    }
    
    const additionalMonthlyInvestment = additionalNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(additionalMonthlyInvestment);
  }

  // Enhanced time calculation
  calculateEnhancedTimeRequired(totalGoalCost, currentSavings, monthlyInvestment, returns, inflation, investmentData, userTimeline) {
    if (totalGoalCost <= 0) return 0;
    
    // Check if goals are achievable within user's timeline
    const requiredMonthlyForUserTimeline = this.calculateEnhancedMonthlyInvestment(
      totalGoalCost, currentSavings, userTimeline, returns, inflation, investmentData
    );
    
    const currentSip = investmentData.currentSip || 0;
    const totalMonthlyCapacity = monthlyInvestment + currentSip;
    
    // If user has sufficient monthly capacity for their timeline, return user timeline
    if (totalMonthlyCapacity >= requiredMonthlyForUserTimeline) {
      return userTimeline;
    }
    
    // Otherwise, calculate actual time needed with current capacity
    const monthlyRate = returns / 100 / 12;
    let currentValue = currentSavings + (investmentData.existingInvestments || 0);
    let totalMonthlySavings = monthlyInvestment + currentSip;
    
    if (totalMonthlySavings <= 0 && currentValue < totalGoalCost) return 999;
    
    let months = 0;
    const maxMonths = 600;
    
    while (months < maxMonths) {
      months++;
      currentValue = currentValue * (1 + monthlyRate) + totalMonthlySavings;
      const inflatedGoalCost = totalGoalCost * Math.pow(1 + inflation / 100, months / 12);
      
      if (currentValue >= inflatedGoalCost) {
        break;
      }
    }
    
    return Math.round((months / 12) * 10) / 10;
  }

  // Enhanced balance score calculation
  calculateEnhancedBalanceScore(expenseRatio, savingsRate, timeRequired, timeline, investmentData) {
    let score = 50;
    
    // Base financial ratios (40 points total)
    if (expenseRatio < 50) score += 15;
    else if (expenseRatio > 70) score -= 20;
    else if (expenseRatio <= 60) score += 5;
    
    if (savingsRate >= 30) score += 15;
    else if (savingsRate >= 20) score += 10;
    else if (savingsRate < 10) score -= 15;
    
    // Timeline alignment (20 points)
    if (timeRequired <= timeline * 0.8) score += 15;
    else if (timeRequired <= timeline) score += 5;
    else if (timeRequired <= timeline * 1.2) score -= 10;
    else score -= 20;
    
    // Investment portfolio strength bonus (20 points)
    const portfolioStrength = investmentData.investmentPortfolioStrength;
    if (portfolioStrength >= 80) score += 20;
    else if (portfolioStrength >= 60) score += 15;
    else if (portfolioStrength >= 40) score += 10;
    else if (portfolioStrength >= 20) score += 5;
    
    // SIP discipline bonus (10 points)
    if (investmentData.sipDuration >= 3) score += 10;
    else if (investmentData.sipDuration >= 1) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Enhanced financial health calculation with comprehensive loan analysis
  calculateEnhancedFinancialHealth(expenseRatio, savingsRate, timeRequired, timeline, savings, expenses, existingEmi, income, investmentData, age, lifeExpectancy, loanData = null) {
    let healthScore = 60; // Start higher due to investment considerations
    
    // Log loan data impact for debugging
    if (loanData && loanData.totalOutstanding > 0) {
      console.log('🏦 Financial Health: Loan data detected', {
        totalOutstanding: loanData.totalOutstanding,
        emiRatio: (existingEmi / income) * 100,
        debtBurden: (loanData.totalOutstanding / (income * 12)) * 100,
        averageRate: loanData.averageInterestRate,
        loanCount: loanData.loanCount
      });
    }
    
    // Basic financial health factors (40 points)
    if (expenseRatio > 70) healthScore -= 15;
    else if (expenseRatio < 50) healthScore += 10;
    
    if (savingsRate > 25) healthScore += 15;
    else if (savingsRate > 15) healthScore += 10;
    else if (savingsRate < 10) healthScore -= 15;
    
    if (timeRequired <= timeline) healthScore += 10;
    else healthScore -= 10;
    
    // Enhanced emergency fund assessment considering net worth (15 points)
    const emergencyMonths = savings / expenses;
    const totalDebt = loanData ? loanData.totalOutstanding : 0;
    const netWorth = savings - totalDebt;
    const netWorthRatio = totalDebt > 0 ? netWorth / totalDebt : 1;
    
    // Base emergency fund score
    let emergencyScore = 0;
    if (emergencyMonths >= 6) emergencyScore = 15;
    else if (emergencyMonths >= 3) emergencyScore = 8;
    else if (emergencyMonths < 1) emergencyScore = -10;
    
    // Adjust emergency fund bonus based on net worth when massive debt exists
    if (totalDebt > 0 && netWorthRatio < 0) {
      // Negative net worth - significantly reduce emergency fund benefit
      emergencyScore = Math.round(emergencyScore * 0.3); // 70% reduction
      console.log('⚠️ Emergency Fund Adjusted: Negative net worth detected', {
        savings: savings,
        totalDebt: totalDebt,
        netWorth: netWorth,
        adjustedEmergencyScore: emergencyScore
      });
    } else if (totalDebt > 0 && netWorthRatio < 0.2) {
      // Very low net worth - reduce emergency fund benefit
      emergencyScore = Math.round(emergencyScore * 0.6); // 40% reduction
    }
    
    healthScore += emergencyScore;
    
    // Enhanced EMI and Debt Analysis (20 points)
    const emiRatio = (existingEmi / income) * 100;
    const totalDebtBurden = loanData ? (loanData.totalOutstanding / (income * 12)) * 100 : 0;
    
    // EMI to income ratio assessment
    if (emiRatio > 40) healthScore -= 20; // Severe EMI burden
    else if (emiRatio > 30) healthScore -= 15; // High EMI burden
    else if (emiRatio > 20) healthScore -= 5;  // Moderate EMI burden
    else if (emiRatio < 10) healthScore += 5;  // Low EMI burden
    
    // Enhanced debt to annual income ratio assessment with realistic penalties
    if (totalDebtBurden > 3000) healthScore -= 60; // Catastrophic debt burden (>30x annual income)
    else if (totalDebtBurden > 2000) healthScore -= 45; // Severe debt burden (>20x annual income)
    else if (totalDebtBurden > 1000) healthScore -= 30; // Extreme debt burden (>10x annual income)
    else if (totalDebtBurden > 500) healthScore -= 15; // Very high debt burden (>5x annual income)
    else if (totalDebtBurden > 300) healthScore -= 10; // High debt burden (>3x annual income)
    else if (totalDebtBurden > 200) healthScore -= 5;  // Moderate debt burden (>2x annual income)
    else if (totalDebtBurden > 100) healthScore -= 2;  // Manageable debt burden (>1x annual income)
    else if (totalDebtBurden > 0) healthScore += 2;    // Low debt burden
    
    // Loan diversity penalty (having too many loans can be risky)
    if (loanData && loanData.loanCount > 4) healthScore -= 5;
    else if (loanData && loanData.loanCount > 2) healthScore -= 2;
    
    // Interest rate efficiency bonus/penalty
    if (loanData && loanData.averageInterestRate) {
      if (loanData.averageInterestRate > 15) healthScore -= 8; // High interest debt
      else if (loanData.averageInterestRate > 12) healthScore -= 5; // Moderate interest debt
      else if (loanData.averageInterestRate < 8) healthScore += 5; // Low interest debt
    }
    
    // Debt Sustainability Analysis - Critical for massive debts
    if (loanData && loanData.totalOutstanding > 0 && loanData.averageInterestRate) {
      const annualEMI = existingEmi * 12;
      const annualInterestDue = (loanData.totalOutstanding * loanData.averageInterestRate) / 100;
      const interestCoverageRatio = annualEMI > 0 ? (annualEMI / annualInterestDue) * 100 : 0;
      
      console.log('💀 Debt Sustainability Analysis:', {
        totalOutstanding: loanData.totalOutstanding,
        annualEMI: annualEMI,
        annualInterestDue: annualInterestDue,
        interestCoverageRatio: interestCoverageRatio.toFixed(2) + '%'
      });
      
      // Interest Coverage Ratio Assessment
      if (interestCoverageRatio < 25) healthScore -= 25; // Debt growing rapidly
      else if (interestCoverageRatio < 50) healthScore -= 15; // Debt growing slowly
      else if (interestCoverageRatio < 75) healthScore -= 10; // Barely sustainable
      else if (interestCoverageRatio < 100) healthScore -= 5; // Interest covered, minimal principal
      // Above 100% gets no penalty - sustainable debt repayment
      
      // Debt Growth Warning - if EMI doesn't even cover interest
      if (interestCoverageRatio < 100) {
        healthScore -= 15; // Additional penalty for growing debt
        console.log('⚠️ WARNING: Debt is growing - EMI does not cover full interest');
      }
    }
    
    // Investment portfolio health (25 points - significant weight)
    const portfolioStrength = investmentData.investmentPortfolioStrength;
    if (portfolioStrength >= 80) healthScore += 25;
    else if (portfolioStrength >= 60) healthScore += 20;
    else if (portfolioStrength >= 40) healthScore += 15;
    else if (portfolioStrength >= 20) healthScore += 10;
    else if (portfolioStrength > 0) healthScore += 5;
    
    // NEW: Predicted Lifespan and Life-Stage Health Assessment (15 points)
    if (age && lifeExpectancy) {
      const remainingYears = lifeExpectancy - age;
      const postGoalYears = Math.max(0, lifeExpectancy - (age + timeline));
      
      // Life stage appropriateness
      if (age <= 30) {
        // Young age - bonus for having long-term thinking
        if (lifeExpectancy >= 80) healthScore += 5;
        if (postGoalYears >= 30) healthScore += 3; // Good long-term planning
      } else if (age <= 50) {
        // Mid-life - focus on realistic planning
        if (postGoalYears >= 15 && postGoalYears <= 35) healthScore += 5; // Realistic post-goal life
        if (lifeExpectancy >= age + 25) healthScore += 3; // Sufficient remaining life
      } else {
        // Pre-retirement/Senior - focus on sustainability
        if (postGoalYears >= 5) healthScore += 5; // Has post-goal life planned
        if (lifeExpectancy >= age + 10) healthScore += 3; // Realistic life expectancy
      }
      
      // Post-goal sustainability bonus
      const totalGoalCost = 0; // We don't have access to totalGoalCost here, so use 0 for health calculation
      const postGoalSustainability = this.calculatePostGoalSustainability(
        age + timeline, lifeExpectancy, income, expenses, totalGoalCost, investmentData
      );
      
      if (postGoalSustainability.sustainable) {
        healthScore += 7; // Major bonus for sustainable life plan
      } else if (postGoalSustainability.sustainabilityRatio <= 150) {
        healthScore += 3; // Partial credit for near-sustainability
      } else {
        healthScore -= 5; // Penalty for unsustainable plan
      }
      
      // Timeline vs Predicted Lifespan validation
      if (lifeExpectancy < age + timeline) {
        healthScore -= 10; // Major penalty for unrealistic timeline
      }
      
      // Remaining life years consideration
      if (remainingYears < 20) {
        healthScore -= 3; // Lower score for very short remaining life
      } else if (remainingYears >= 50) {
        healthScore += 2; // Bonus for long remaining life
      }
    }
    
    return Math.max(0, Math.min(100, healthScore));
  }

  // Calculate SIP efficiency
  calculateSipEfficiency(currentSip, projectedSipValue, sipDuration) {
    if (!currentSip || sipDuration <= 0) return 0;
    
    const totalInvested = currentSip * 12 * sipDuration;
    if (totalInvested <= 0) return 0;
    
    return ((projectedSipValue - totalInvested) / totalInvested) * 100;
  }

  calculateTotalGoalCost(goals) {
    let total = 0;
    Object.keys(goals).forEach(goalId => {
      if (goals[goalId].enabled && goals[goalId].amount > 0) {
        total += goals[goalId].amount;
      }
    });
    return total;
  }

  // Enhanced insights generation with investment data
  generateInsights(data) {
    const insights = [];
    const {
      expenseRatio, savingsRate, timeRequired, timeline, 
      emergencyMonths, emiPercentage, disposableIncome, investmentData
    } = this.results;

    if (!data.income || !data.expenses || expenseRatio <= 0) {
      return [];
    }

    const hasActiveGoals = Object.values(data.goals).some(goal => goal.enabled && goal.amount > 0);
    if (!hasActiveGoals) {
      return [];
    }

    // Investment Portfolio Insights
    if (investmentData.existingInvestments > 0 || investmentData.currentSip > 0) {
      insights.push(...this.generateInvestmentInsights(data, investmentData));
    }

    // Goal achievability with investment context
    if (timeRequired > 0 && timeRequired < 999 && timeline > 0) {
      if (timeRequired <= timeline) {
        const investmentContribution = investmentData.projectedValue > 0 ? 
          ` Your existing investments (${UTILS.formatCurrency(investmentData.existingInvestments)}) and SIP (${UTILS.formatCurrency(investmentData.currentSip)}/month) significantly accelerate this timeline.` : '';
        
        insights.push({
          type: 'success',
          icon: 'fas fa-check-circle',
          title: 'Goals are achievable with investment boost',
          message: `Your current plan allows you to reach your goals in ${UTILS.formatYears(timeRequired)}, which is within your ${timeline}-year timeline.${investmentContribution}`
        });
      } else {
        const shortfall = investmentData.investmentGap || 0;
        insights.push({
          type: 'warning',
          icon: 'fas fa-exclamation-triangle',
          title: 'Investment strategy needs enhancement',
          message: `Even with your existing investments, you'll need ${UTILS.formatYears(timeRequired)} to reach goals. Consider increasing your SIP from ${UTILS.formatCurrency(investmentData.currentSip)} or adding ${UTILS.formatCurrency(shortfall/timeline/12)}/month to bridge the gap.`
        });
      }
    }

    // Other standard insights...
    if (data.existingEmi > 0 && data.income > 0 && emiPercentage > 0) {
      if (emiPercentage > 30) {
        insights.push({
          type: 'danger',
          icon: 'fas fa-exclamation-triangle',
          title: 'EMI burden limiting investment growth',
          message: `Your EMIs (${UTILS.formatPercentage(emiPercentage)}) severely limit investment capacity. With existing investments of ${UTILS.formatCurrency(investmentData.existingInvestments)}, focus on debt reduction to unlock more investment potential.`
        });
      }
    }

    return insights;
  }

  // New method: Generate investment-specific insights
  generateInvestmentInsights(data, investmentData) {
    const insights = [];
    const portfolioStrength = investmentData.investmentPortfolioStrength;
    
    // Portfolio strength assessment
    if (portfolioStrength >= 80) {
      insights.push({
        type: 'success',
        icon: 'fas fa-trophy',
        title: 'Excellent Investment Foundation',
        message: `Your investment portfolio shows exceptional strength (${portfolioStrength}/100). With ${UTILS.formatCurrency(investmentData.existingInvestments)} existing investments and ${UTILS.formatCurrency(investmentData.currentSip)}/month SIP for ${investmentData.sipDuration} years, you're projected to have ${UTILS.formatCurrency(investmentData.projectedValue)} by timeline end.`
      });
    } else if (portfolioStrength >= 60) {
      insights.push({
        type: 'success',
        icon: 'fas fa-chart-line',
        title: 'Strong Investment Progress',
        message: `Your investment discipline is paying off (${portfolioStrength}/100 strength). Current trajectory projects ${UTILS.formatCurrency(investmentData.projectedValue)} by timeline end. Consider increasing SIP to accelerate growth.`
      });
    } else if (portfolioStrength >= 40) {
      insights.push({
        type: 'info',
        icon: 'fas fa-seedling',
        title: 'Investment Portfolio Developing',
        message: `Your investment foundation is developing (${portfolioStrength}/100). With consistent effort, your ${UTILS.formatCurrency(investmentData.currentSip)}/month SIP can grow significantly. Consider increasing frequency or amount.`
      });
    } else if (portfolioStrength > 0) {
      insights.push({
        type: 'warning',
        icon: 'fas fa-chart-line',
        title: 'Investment Portfolio Needs Attention',
        message: `Your current investment approach needs strengthening. With only ${UTILS.formatCurrency(investmentData.existingInvestments)} invested and minimal SIP history, focus on building consistency and increasing investment amounts.`
      });
    }

    // SIP efficiency insight
    if (investmentData.currentSip > 0 && investmentData.sipDuration >= 1) {
      const sipEfficiency = this.calculateSipEfficiency(
        investmentData.currentSip, 
        investmentData.projectedSipValue, 
        investmentData.sipDuration
      );
      
      if (sipEfficiency >= 15) {
        insights.push({
          type: 'success',
          icon: 'fas fa-rocket',
          title: 'SIP Strategy Performing Well',
          message: `Your SIP is generating ${UTILS.formatPercentage(sipEfficiency)} projected returns over ${investmentData.sipDuration} years. Your disciplined ${UTILS.formatCurrency(investmentData.currentSip)}/month approach is building substantial wealth.`
        });
      }
    }

    // Investment gap analysis
    if (investmentData.investmentGap > 0) {
      const monthlyGapAmount = Math.round(investmentData.investmentGap / data.timeline / 12);
      insights.push({
        type: 'info',
        icon: 'fas fa-target',
        title: 'Investment Gap Identified',
        message: `After considering your existing investments (${UTILS.formatCurrency(investmentData.projectedValue)} projected), you still need ${UTILS.formatCurrency(investmentData.investmentGap)} more. Consider increasing monthly investments by ${UTILS.formatCurrency(monthlyGapAmount)} to bridge this gap.`
      });
    }

    return insights;
  }

  // Enhanced scenarios with investment context
  // FIXED: Enhanced scenarios with proper calculation logic
  generateScenarios(data, results = null) {
    const scenarios = [];
    // Use provided results or fall back to this.results
    const calculationResults = results || this.results;
    if (!calculationResults || !calculationResults.totalGoalCost) {
      return scenarios;
    }
    const { monthlyInvestment, timeRequired, investmentData, totalGoalCost } = calculationResults;
    const { timeline, returns, inflation, savings } = data;

    // Safety checks
    if (!monthlyInvestment || monthlyInvestment <= 0 || !totalGoalCost || totalGoalCost <= 0) {
      console.warn('Scenarios: Invalid base values', { monthlyInvestment, totalGoalCost });
      return scenarios;
    }

    // Helper function to recalculate monthly investment needed for a given timeline
    const calculateMonthlyForTimeline = (targetTimeline, goalCost = totalGoalCost) => {
      const futureGoalCost = goalCost * Math.pow(1 + inflation / 100, targetTimeline);
      const futureSavingsValue = savings * Math.pow(1 + returns / 100, targetTimeline);
      const futureInvestmentValue = investmentData.projectedValue * Math.pow(1 + returns / 100, targetTimeline - timeline);
      
      const totalFutureAssets = futureSavingsValue + futureInvestmentValue;
      const additionalNeeded = Math.max(0, futureGoalCost - totalFutureAssets);
      
      if (additionalNeeded <= 0) return 0;
      
      const monthlyRate = returns / 100 / 12;
      const months = targetTimeline * 12;
      
      if (monthlyRate === 0) {
        return Math.round(additionalNeeded / months);
      }
      
      return Math.round(additionalNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));
    };

    // Helper function to calculate time needed for a given monthly investment
    const calculateTimeForMonthly = (monthlyAmount, goalCost = totalGoalCost) => {
      const monthlyRate = returns / 100 / 12;
      let currentValue = savings + (investmentData.existingInvestments || 0);
      let months = 0;
      const maxMonths = 600;
      
      while (months < maxMonths) {
        months++;
        currentValue = currentValue * (1 + monthlyRate) + monthlyAmount;
        const inflatedGoalCost = goalCost * Math.pow(1 + inflation / 100, months / 12);
        
        if (currentValue >= inflatedGoalCost) {
          break;
        }
      }
      
      return Math.round((months / 12) * 10) / 10;
    };

    // 1. Enhanced SIP Strategy (if user has existing SIP)
    if (investmentData.currentSip > 0) {
      const enhancedSip = Math.round(investmentData.currentSip * 1.5);
      const sipIncrease = enhancedSip - investmentData.currentSip;
      const newMonthlyNeeded = Math.max(0, monthlyInvestment - sipIncrease);
      const newTimeRequired = calculateTimeForMonthly(newMonthlyNeeded + enhancedSip);
      
      scenarios.push({
        type: 'success',
        icon: 'fas fa-chart-line',
        title: 'Enhanced SIP Strategy',
        description: `Increase your current SIP from ${UTILS.formatCurrency(investmentData.currentSip)} to ${UTILS.formatCurrency(enhancedSip)} to accelerate goal achievement.`,
        monthlyInvestment: newMonthlyNeeded,
        timeRequired: newTimeRequired
      });
    }

    // 2. Aggressive Investment Plan
    const aggressiveMonthly = Math.round(monthlyInvestment * 1.5);
    const aggressiveTime = calculateTimeForMonthly(aggressiveMonthly);
    
    if (aggressiveMonthly > monthlyInvestment && aggressiveTime > 0 && aggressiveTime < timeRequired) {
      scenarios.push({
        type: 'success',
        icon: 'fas fa-rocket',
        title: 'Aggressive Investment Plan',
        description: `Increase monthly investments to ${UTILS.formatCurrency(aggressiveMonthly)} to achieve goals in ${UTILS.formatYears(aggressiveTime)} instead of ${UTILS.formatYears(timeRequired)}.`,
        monthlyInvestment: aggressiveMonthly,
        timeRequired: aggressiveTime
      });
    }

    // 3. Extended Timeline Plan
    const extendedTimeline = Math.round(timeline + 3);
    const extendedMonthly = calculateMonthlyForTimeline(extendedTimeline);
    
    if (extendedMonthly > 0 && extendedMonthly < monthlyInvestment) {
      scenarios.push({
        type: 'info',
        icon: 'fas fa-calendar-plus',
        title: 'Extended Timeline Plan',
        description: `Extend your timeline to ${extendedTimeline} years to reduce monthly investment to ${UTILS.formatCurrency(extendedMonthly)}.`,
        monthlyInvestment: extendedMonthly,
        timeRequired: extendedTimeline
      });
    }

    // 4. Conservative Approach
    const conservativeMonthly = Math.round(monthlyInvestment * 0.75);
    const conservativeTime = calculateTimeForMonthly(conservativeMonthly);
    
    if (conservativeMonthly > 0 && conservativeTime > 0 && conservativeTime > timeRequired) {
      scenarios.push({
        type: 'warning',
        icon: 'fas fa-shield-alt',
        title: 'Conservative Approach',
        description: `Reduce monthly investment to ${UTILS.formatCurrency(conservativeMonthly)} accepting longer timeline of ${UTILS.formatYears(conservativeTime)}.`,
        monthlyInvestment: conservativeMonthly,
        timeRequired: conservativeTime
      });
    }

    // 5. Portfolio Optimization (if user has existing investments)
    if (investmentData.existingInvestments > 100000) {
      // Simulate 2% better returns through optimization
      const optimizedReturns = returns + 2;
      const optimizedData = { ...data, returns: optimizedReturns };
      
      // Recalculate with better returns
      const optimizedInvestmentData = this.calculateInvestmentProjections(
        investmentData.existingInvestments, 
        investmentData.currentSip, 
        investmentData.sipDuration, 
        optimizedReturns, 
        timeline
      );
      
      const optimizedMonthly = this.calculateEnhancedMonthlyInvestment(
        totalGoalCost, savings, timeline, optimizedReturns, inflation, optimizedInvestmentData
      );
      
      const optimizedTime = this.calculateEnhancedTimeRequired(
        totalGoalCost, savings, optimizedMonthly, optimizedReturns, inflation, optimizedInvestmentData
      );
      
      scenarios.push({
        type: 'info',
        icon: 'fas fa-sync-alt',
        title: 'Portfolio Optimization',
        description: `Optimize your ${UTILS.formatCurrency(investmentData.existingInvestments)} portfolio for 2% better returns through rebalancing and tax efficiency.`,
        monthlyInvestment: Math.round(optimizedMonthly),
        timeRequired: Math.round(optimizedTime * 10) / 10
      });
    }

    // Add fallback scenarios if no scenarios were generated
    if (scenarios.length === 0) {
      // Basic scenarios based on user's current situation
      scenarios.push({
        type: 'info',
        icon: 'fas fa-chart-line',
        title: 'Current Plan',
        description: `Continue with your current plan: invest ${UTILS.formatCurrency(monthlyInvestment)} monthly for ${UTILS.formatYears(timeRequired)}.`,
        monthlyInvestment: monthlyInvestment,
        timeRequired: timeRequired
      });

      // Add a simple improvement scenario
      const improvedMonthly = Math.round(monthlyInvestment * 1.2);
      const improvedTime = calculateTimeForMonthly(improvedMonthly);
      
      if (improvedTime > 0 && improvedTime < timeRequired) {
        scenarios.push({
          type: 'success',
          icon: 'fas fa-arrow-up',
          title: 'Improved Plan',
          description: `Increase monthly investment by 20% to ${UTILS.formatCurrency(improvedMonthly)} and achieve goals faster in ${UTILS.formatYears(improvedTime)}.`,
          monthlyInvestment: improvedMonthly,
          timeRequired: improvedTime
        });
      }
    }

    return scenarios;
  }

  // Enhanced balance plans with investment considerations
  generateBalancePlans(data) {
    const age = data.age || 30;
    const lifeStage = this.determineLifeStage(age);
    
    // Ensure results exist and have proper data structure
    if (!this.results || typeof this.results !== 'object') {
      console.warn('Results not available, running calculation first...');
      // Run a basic calculation to populate results
      this.calculate(data);
    }
    
    const monthlyInvestment = this.results.monthlyInvestment || 0;
    const investmentData = this.results.investmentData || {
      existingValue: 0,
      monthlyAmount: 0,
      expectedReturns: 12,
      projectedValue: 0,
      investmentPortfolioStrength: 0,
      riskLevel: 'moderate'
    };
    
    return this.generateLifeStageSpecificPlans(lifeStage, data, {
      monthlyInvestment,
      investmentData,
      totalGoals: Object.values(data.goals || {})
        .filter(goal => goal && goal.enabled)
        .reduce((sum, goal) => sum + (goal.amount || 0), 0)
    });
  }

  determineLifeStage(age) {
    if (age <= 28) return 'early-career';
    if (age <= 35) return 'building';
    if (age <= 45) return 'peak-earning';
    if (age <= 55) return 'pre-retirement';
    return 'senior';
  }

  generateLifeStageSpecificPlans(lifeStage, data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    // Investment-enhanced plans based on life stage
    switch (lifeStage) {
      case 'early-career':
        plans.push(...this.getEnhancedEarlyCareerPlans(data, metrics));
        break;
      case 'building':
        plans.push(...this.getEnhancedBuildingYearPlans(data, metrics));
        break;
      case 'peak-earning':
        plans.push(...this.getEnhancedPeakEarningPlans(data, metrics));
        break;
      case 'pre-retirement':
        plans.push(...this.getEnhancedPreRetirementPlans(data, metrics));
        break;
      case 'senior':
        plans.push(...this.getEnhancedSeniorYearPlans(data, metrics));
        break;
    }
    
    return plans;
  }

  // Enhanced plan methods with investment context
  getEnhancedEarlyCareerPlans(data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    if (investmentData.currentSip < 5000) {
      plans.push({
        id: 'start-sip-early',
        title: 'Start Aggressive SIP Early',
        icon: 'fas fa-seedling',
        description: 'Leverage your young age with consistent SIP investments. Time is your biggest advantage for compounding.',
        impact: {
          sipIncrease: '+₹5,000/month',
          timelineImprovement: '-3 years',
          compoundingBenefit: '+40%'
        },
        priority: 1
      });
    }

    if (investmentData.existingInvestments < 100000) {
      plans.push({
        id: 'build-investment-base',
        title: 'Build Investment Foundation',
        icon: 'fas fa-building',
        description: 'Create a strong investment base now while expenses are lower. Focus on equity-heavy portfolios.',
        impact: {
          portfolioGrowth: '₹2-3L in 5 years',
          riskCapacity: 'High',
          goalAcceleration: '+25%'
        },
        priority: 1
      });
    }

    return plans;
  }

  getEnhancedBuildingYearPlans(data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    // Only show "strengthen portfolio" if user has SOME investment foundation (not zero)
    if (investmentData.investmentPortfolioStrength > 0 && investmentData.investmentPortfolioStrength < 60) {
      plans.push({
        id: 'strengthen-portfolio',
        title: 'Strengthen Investment Portfolio',
        icon: 'fas fa-chart-line',
        description: 'Your current portfolio strength is below optimal. Increase SIP amounts and diversify investments.',
        impact: {
          portfolioStrength: `${investmentData.investmentPortfolioStrength}% → 75%+`,
          monthlyCommitment: '+₹8,000',
          goalTimeline: '-2 years'
        },
        priority: 1
      });
    }

    // For users with no investment data, suggest starting investments
    if (investmentData.investmentPortfolioStrength === 0) {
      plans.push({
        id: 'start-investing',
        title: 'Start Your Investment Journey',
        icon: 'fas fa-seedling',
        description: 'Begin building wealth with a systematic investment plan. Start with mutual funds and gradually increase your investment.',
        impact: {
          startingSip: '₹5,000/month',
          projectedWealth: '₹15-20L in 10 years',
          riskLevel: 'Moderate to High'
        },
        priority: 1
      });
    }

    if (investmentData.currentSip > 0 && investmentData.sipDuration >= 2) {
      plans.push({
        id: 'step-up-sip',
        title: 'SIP Step-Up Strategy',
        icon: 'fas fa-stairs',
        description: 'Increase your existing SIP by 10-15% annually to match salary growth and beat inflation.',
        impact: {
          currentSip: UTILS.formatCurrency(investmentData.currentSip),
          projectedSip: UTILS.formatCurrency(investmentData.currentSip * 1.5),
          additionalWealth: UTILS.formatCurrency(investmentData.projectedValue * 0.3)
        },
        priority: 1
      });
    }

    return plans;
  }

  getEnhancedPeakEarningPlans(data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    if (investmentData.existingInvestments >= 500000) {
      plans.push({
        id: 'optimize-portfolio',
        title: 'Peak Years Portfolio Optimization',
        icon: 'fas fa-cogs',
        description: 'Review and optimize your substantial portfolio for tax efficiency and better returns.',
        impact: {
          currentPortfolio: UTILS.formatCurrency(investmentData.existingInvestments),
          taxOptimization: '₹50k-1L annually',
          returnImprovement: '+1-2%'
        },
        priority: 1
      });
    }

    if (investmentData.currentSip >= 10000) {
      plans.push({
        id: 'diversify-investments',
        title: 'Advanced Investment Diversification',
        icon: 'fas fa-chart-pie',
        description: 'Diversify beyond SIPs into direct equity, real estate, and alternative investments.',
        impact: {
          diversification: 'Multi-asset',
          riskOptimization: 'Balanced',
          wealthAcceleration: '+20%'
        },
        priority: 2
      });
    }

    return plans;
  }

  getEnhancedPreRetirementPlans(data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    plans.push({
      id: 'retirement-corpus-check',
      title: 'Retirement Corpus Assessment',
      icon: 'fas fa-umbrella-beach',
      description: 'Ensure your investment portfolio can sustain post-retirement lifestyle. Shift to conservative allocations.',
      impact: {
        currentProjection: UTILS.formatCurrency(investmentData.projectedValue),
        sustainabilityCheck: 'Complete',
        allocationShift: 'Conservative'
      },
      priority: 1
    });

    if (investmentData.currentSip > 15000) {
      plans.push({
        id: 'maximize-retirement-savings',
        title: 'Maximize Pre-Retirement Savings',
        icon: 'fas fa-piggy-bank',
        description: 'Leverage your peak earning years to maximize retirement corpus through increased investments.',
        impact: {
          finalCorpus: UTILS.formatCurrency(investmentData.projectedValue * 1.3),
          retirementReady: '5 years earlier',
          lifestyleMaintenance: '100%'
        },
        priority: 1
      });
    }

    return plans;
  }

  getEnhancedSeniorYearPlans(data, metrics) {
    const plans = [];
    const { investmentData } = metrics;
    
    plans.push({
      id: 'preserve-wealth',
      title: 'Wealth Preservation Focus',
      icon: 'fas fa-shield-alt',
      description: 'Shift investment strategy to capital preservation and regular income generation.',
      impact: {
        capitalPreservation: '95%+',
        monthlyIncome: UTILS.formatCurrency(investmentData.projectedValue * 0.008),
        riskMinimization: 'Maximum'
      },
      priority: 1
    });

    if (investmentData.existingInvestments >= 1000000) {
      plans.push({
        id: 'legacy-planning',
        title: 'Legacy and Estate Planning',
        icon: 'fas fa-gift',
        description: 'Structure your investments for optimal legacy transfer and tax efficiency.',
        impact: {
          estatePlanning: 'Optimized',
          taxEfficiency: 'Maximum',
          legacyValue: UTILS.formatCurrency(investmentData.projectedValue * 0.9)
        },
        priority: 2
      });
    }

    return plans;
  }

  // NEW: Enhanced Predicted Lifespan Analysis
  calculateLifeStageInsights(age, timeline, lifeExpectancy, income, expenses, totalGoalCost, investmentData) {
    const currentYear = new Date().getFullYear();
    const goalAchievementAge = age + timeline;
    const remainingLifeYears = lifeExpectancy - age;
    const postGoalYears = lifeExpectancy - goalAchievementAge;
    
    // Life Stage Analysis
    const lifeStages = {
      currentToGoal: {
        phase: 'Goal Achievement Phase',
        ageRange: `${age} to ${goalAchievementAge} years`,
        duration: timeline,
        yearRange: `${currentYear} to ${currentYear + timeline}`,
        focus: this.getLifeStageStrategy(age, goalAchievementAge),
        financialPriority: 'Goal-focused investing and saving'
      },
      postGoal: {
        phase: 'Post-Goal Life Phase',
        ageRange: `${goalAchievementAge} to ${lifeExpectancy} years`,
        duration: Math.max(0, postGoalYears),
        yearRange: `${currentYear + timeline} to ${currentYear + (lifeExpectancy - age)}`,
        focus: this.getLifeStageStrategy(goalAchievementAge, lifeExpectancy),
        financialPriority: 'Wealth preservation and lifestyle maintenance'
      }
    };

    // Post-Goal Financial Sustainability
    const postGoalSustainability = this.calculatePostGoalSustainability(
      goalAchievementAge, lifeExpectancy, income, expenses, totalGoalCost, investmentData
    );

    // Predicted Lifespan Warnings/Insights
    const insights = this.generatePredictedLifespanInsights(
      age, timeline, lifeExpectancy, postGoalYears, postGoalSustainability
    );

    // Age-Appropriate Investment Strategy
    const investmentStrategy = this.getAgeAppropriateStrategy(age, goalAchievementAge, lifeExpectancy);

    return {
      remainingLifeYears,
      postGoalYears,
      lifeStages,
      postGoalSustainability,
      insights,
      investmentStrategy,
      lifeExpectancyValidation: {
        isRealistic: lifeExpectancy >= (age + timeline),
        hasPostGoalLife: postGoalYears > 0,
        recommendedMinLife: age + timeline + 5 // Minimum 5 years post-goal life
      }
    };
  }

  // Helper: Get life stage investment strategy
  getLifeStageStrategy(startAge, endAge) {
    const avgAge = (startAge + endAge) / 2;
    if (avgAge < 30) return 'Aggressive growth investing';
    if (avgAge < 45) return 'Balanced growth with some stability';
    if (avgAge < 60) return 'Conservative growth with capital preservation';
    return 'Capital preservation with minimal risk';
  }

  // Calculate post-goal financial sustainability with comprehensive wealth projection
  calculatePostGoalSustainability(goalAchievementAge, lifeExpectancy, income, expenses, totalGoalCost, investmentData) {
    const postGoalYears = Math.max(0, lifeExpectancy - goalAchievementAge);
    if (postGoalYears <= 0) {
      return {
        sustainable: false,
        yearsSupported: 0,
        monthlyShortfall: 0,
        totalRequiredCorpus: 0,
        message: 'No post-goal life years to analyze'
      };
    }

    // Estimate post-goal expenses (assuming 70% of pre-goal expenses)
    const postGoalMonthlyExpenses = expenses * 0.7;
    const totalPostGoalExpenses = postGoalMonthlyExpenses * 12 * postGoalYears;
    
    // FIXED: Calculate comprehensive available corpus after achieving goals  
    // Derive timeline years from the age difference passed through the function chain
    const timelineYears = investmentData.timeline || 5; // Default to 5 years if not available
    
    // 1. Project current savings growth (assuming investment returns)
    // Get current savings from various possible sources in investmentData
    const currentSavings = investmentData.currentSavings || 
                         investmentData.savings || 
                         investmentData.existingInvestments || 0;
    
    const expectedReturns = 0.08; // 8% default returns
    const projectedSavingsValue = currentSavings * Math.pow(1 + expectedReturns, timelineYears);
    
    // 2. Calculate monthly surplus accumulation over timeline
    const existingEMI = investmentData.monthlyEMI || investmentData.existingEmi || 0;
    const monthlyDisposableIncome = income - expenses - existingEMI;
    const currentSipAmount = investmentData.currentSip || 0;
    const monthlySurplus = Math.max(0, monthlyDisposableIncome - currentSipAmount);
    
    // Project surplus accumulation with compound returns
    const monthlyReturnRate = expectedReturns / 12;
    let totalSurplusAccumulated = 0;
    if (monthlySurplus > 0 && monthlyReturnRate > 0) {
      // Future value of monthly SIP formula for surplus accumulation
      const totalMonths = timelineYears * 12;
      totalSurplusAccumulated = monthlySurplus * 
        ((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate);
    } else {
      totalSurplusAccumulated = monthlySurplus * 12 * timelineYears;
    }
    
    // 3. Project investment portfolio value
    const projectedInvestmentValue = investmentData.projectedValue || 0;
    
    // Total available corpus = Projected savings + Surplus accumulation + Investment growth - Goal costs
    const totalProjectedWealth = projectedSavingsValue + totalSurplusAccumulated + projectedInvestmentValue;
    const availableCorpusPostGoal = Math.max(0, totalProjectedWealth - totalGoalCost);
    
    console.log('💰 Post-Goal Sustainability Calculation:', {
      currentSavings,
      projectedSavingsValue,
      monthlySurplus,
      totalSurplusAccumulated,
      projectedInvestmentValue,
      totalProjectedWealth,
      totalGoalCost,
      availableCorpusPostGoal,
      timelineYears
    });
    
    // Sustainability calculation (assuming 4% annual withdrawal rate)
    const sustainableWithdrawal = availableCorpusPostGoal * 0.04;
    const requiredAnnualIncome = postGoalMonthlyExpenses * 12;
    
    const isSustainable = sustainableWithdrawal >= requiredAnnualIncome;
    const monthlyShortfall = Math.max(0, postGoalMonthlyExpenses - (sustainableWithdrawal / 12));
    
    return {
      sustainable: isSustainable,
      postGoalYears,
      availableCorpus: availableCorpusPostGoal,
      requiredCorpus: totalPostGoalExpenses,
      monthlyNeed: postGoalMonthlyExpenses,
      sustainableWithdrawal: sustainableWithdrawal / 12, // Monthly
      monthlyShortfall,
      sustainabilityRatio: sustainableWithdrawal > 0 ? (requiredAnnualIncome / sustainableWithdrawal) * 100 : 0,
      recommendation: isSustainable ? 'Your plan supports your entire predicted lifespan' : 
                     'Consider increasing investments or reducing post-goal expenses'
    };
  }

  // Generate life expectancy insights and warnings
  generatePredictedLifespanInsights(age, timeline, lifeExpectancy, postGoalYears, sustainability) {
    const insights = [];
    
    // Age validation insights
    if (lifeExpectancy < age + timeline) {
      insights.push({
        type: 'error',
        title: 'Timeline vs Life Expectancy Conflict',
        message: `Your goal timeline extends beyond your life expectancy. Consider shortening the timeline or increasing life expectancy.`,
        priority: 'high'
      });
    }
    
    // Post-goal life insights
    if (postGoalYears <= 5) {
      insights.push({
        type: 'warning',
        title: 'Short Post-Goal Life',
        message: `You have only ${postGoalYears} years after achieving your goals. Consider extending your life expectancy or shortening goal timeline.`,
        priority: 'medium'
      });
    } else if (postGoalYears >= 30) {
      insights.push({
        type: 'info',
        title: 'Long Post-Goal Life',
        message: `You have ${postGoalYears} years after achieving goals. Ensure adequate financial planning for this extended period.`,
        priority: 'medium'
      });
    }
    
    // Sustainability insights
    if (!sustainability.sustainable) {
      insights.push({
        type: 'warning',
        title: 'Post-Goal Financial Gap',
        message: `Your current plan may not support your lifestyle for the entire predicted lifespan. Monthly shortfall: ${UTILS.formatCurrency(sustainability.monthlyShortfall)}`,
        priority: 'high'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Financially Sustainable Life Plan',
        message: `Your financial plan can support your predicted lifespan with the current investment strategy.`,
        priority: 'low'
      });
    }

    // Life stage specific insights
    if (age >= 50) {
      insights.push({
        type: 'info',
        title: 'Pre-Retirement Planning',
        message: `At ${age} years, focus on wealth preservation and gradually shift to conservative investments.`,
        priority: 'medium'
      });
    } else if (age <= 30) {
      insights.push({
        type: 'info',
        title: 'Youth Advantage',
        message: `At ${age} years, you have time advantage. Consider aggressive growth investments for maximum wealth creation.`,
        priority: 'low'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Get age-appropriate investment strategy
  getAgeAppropriateStrategy(currentAge, goalAge, lifeExpectancy) {
    const strategies = [];
    
    // Current to Goal phase strategy
    if (currentAge < 35) {
      strategies.push({
        phase: 'Current to Goal',
        allocation: { equity: 80, debt: 15, gold: 5 },
        riskLevel: 'High',
        rationale: 'Young age allows for aggressive growth'
      });
    } else if (currentAge < 50) {
      strategies.push({
        phase: 'Current to Goal',
        allocation: { equity: 65, debt: 30, gold: 5 },
        riskLevel: 'Moderate to High',
        rationale: 'Balanced approach with growth focus'
      });
    } else {
      strategies.push({
        phase: 'Current to Goal',
        allocation: { equity: 45, debt: 50, gold: 5 },
        riskLevel: 'Moderate',
        rationale: 'Conservative approach due to shorter timeline'
      });
    }

    // Post-goal phase strategy
    if (goalAge < 60) {
      strategies.push({
        phase: 'Post-Goal',
        allocation: { equity: 50, debt: 45, gold: 5 },
        riskLevel: 'Moderate',
        rationale: 'Balance growth and preservation'
      });
    } else {
      strategies.push({
        phase: 'Post-Goal',
        allocation: { equity: 30, debt: 65, gold: 5 },
        riskLevel: 'Conservative',
        rationale: 'Focus on capital preservation and regular income'
      });
    }

    return strategies;
  }
}

// Export the calculator
if (typeof window !== 'undefined') {
  window.FinancialCalculator = FinancialCalculator;
}