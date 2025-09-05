// Financial Calculator Core Functions - ENHANCED with Investment Data Integration
class FinancialCalculator {
  constructor() {
    this.results = {};
  }

  // Enhanced main calculation method with investment data
  calculate(data) {
    const {
      age, timeline, lifeExpectancy, income, expenses, savings, 
      existingEmi, returns, inflation, goals,
      existingInvestments, currentSip, sipDuration
    } = data;

    // Calculate basic metrics
    const expenseRatio = (expenses / income) * 100;
    const disposableIncome = income - expenses - existingEmi;
    
    // Calculate total goal cost
    const totalGoalCost = this.calculateTotalGoalCost(goals);
    
    // Enhanced calculation with existing investments
    const investmentData = this.calculateInvestmentProjections(
      existingInvestments, currentSip, sipDuration, returns, timeline
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
    
    // Enhanced financial health with investment factors
    const financialHealth = this.calculateEnhancedFinancialHealth(
      expenseRatio, savingsRate, timeRequired, timeline, savings, expenses, 
      existingEmi, income, investmentData
    );

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
      sipEfficiency: this.calculateSipEfficiency(currentSip, investmentData.projectedSipValue, sipDuration)
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

  // New method: Calculate investment projections
  calculateInvestmentProjections(existingInvestments = 0, currentSip = 0, sipDuration = 0, returns = 12, timeline = 15) {
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
      investmentPortfolioStrength: this.assessPortfolioStrength(existingInvestments, currentSip, sipDuration)
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

  // Enhanced financial health calculation
  calculateEnhancedFinancialHealth(expenseRatio, savingsRate, timeRequired, timeline, savings, expenses, existingEmi, income, investmentData) {
    let healthScore = 60; // Start higher due to investment considerations
    
    // Basic financial health factors (50 points)
    if (expenseRatio > 70) healthScore -= 15;
    else if (expenseRatio < 50) healthScore += 10;
    
    if (savingsRate > 25) healthScore += 15;
    else if (savingsRate > 15) healthScore += 10;
    else if (savingsRate < 10) healthScore -= 15;
    
    if (timeRequired <= timeline) healthScore += 10;
    else healthScore -= 10;
    
    // Emergency fund assessment (15 points)
    const emergencyMonths = savings / expenses;
    if (emergencyMonths >= 6) healthScore += 15;
    else if (emergencyMonths >= 3) healthScore += 8;
    else if (emergencyMonths < 1) healthScore -= 10;
    
    // EMI burden (10 points)
    const emiRatio = (existingEmi / income) * 100;
    if (emiRatio > 30) healthScore -= 15;
    else if (emiRatio < 20) healthScore += 5;
    
    // Investment portfolio health (25 points - significant weight)
    const portfolioStrength = investmentData.investmentPortfolioStrength;
    if (portfolioStrength >= 80) healthScore += 25;
    else if (portfolioStrength >= 60) healthScore += 20;
    else if (portfolioStrength >= 40) healthScore += 15;
    else if (portfolioStrength >= 20) healthScore += 10;
    else if (portfolioStrength > 0) healthScore += 5;
    
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
    console.log('generateBalancePlans called with data:', data);
    console.log('Calculator results:', this.results);
    
    if (!this.results) {
      console.error('Calculator results not available, running calculation first');
      this.calculateResults(data);
    }
    
    if (!this.results) {
      console.error('Still no calculator results after running calculation');
      return [];
    }
    
    const age = data.age || 30;
    const lifeStage = this.determineLifeStage(age);
    const { monthlyInvestment = 0, investmentData = {} } = this.results;
    
    // Ensure investmentData has all required properties with defaults
    const safeInvestmentData = {
      existingInvestments: 0,
      currentSip: 0,
      sipDuration: 0,
      projectedValue: 0,
      investmentPortfolioStrength: 0,
      projectedSipValue: 0,
      remainingSipMonths: 0,
      ...investmentData
    };
    
    const totalGoals = data.goals ? Object.values(data.goals)
      .filter(goal => goal && goal.enabled)
      .reduce((sum, goal) => sum + (goal.amount || 0), 0) : 0;
    
    console.log('Calculated values:', { age, lifeStage, monthlyInvestment, totalGoals, safeInvestmentData });
    
    return this.generateLifeStageSpecificPlans(lifeStage, data, {
      monthlyInvestment,
      investmentData: safeInvestmentData,
      totalGoals
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
    
    if (investmentData.investmentPortfolioStrength < 60) {
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
}

// Export the calculator
if (typeof window !== 'undefined') {
  window.FinancialCalculator = FinancialCalculator;
}