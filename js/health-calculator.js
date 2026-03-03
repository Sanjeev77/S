/**
 * Health Insurance Gap Calculator
 * Logic to estimate medical coverage gap based on user inputs.
 */

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Main Calculation Function
function calculateGap() {
    // 1. Get Inputs
    const cityTier = document.getElementById('cityTier').value;
    
    // Get Family Size
    let adults = 2; // Default
    const adultRadios = document.getElementsByName('adults');
    for (const radio of adultRadios) {
        if (radio.checked) adults = parseInt(radio.value);
    }

    let children = 0; // Default
    const childRadios = document.getElementsByName('children');
    for (const radio of childRadios) {
        if (radio.checked) children = (radio.value === '3+') ? 3 : parseInt(radio.value);
    }

    // Risk Inputs
    let seniors = false;
    const seniorRadios = document.getElementsByName('seniors');
    for (const radio of seniorRadios) {
        if (radio.checked) seniors = (radio.value === 'yes');
    }

    const chronic = document.getElementById('chronicIllness').value; // none, one, multiple
    const hospitalization = document.getElementById('hospitalization').value; // no, once, multiple

    // Current Cover
    let currentCover = parseFloat(document.getElementById('currentCover').value);
    if (isNaN(currentCover)) currentCover = 0;


    // 2. Base Hospitalization Cost
    let baseCost = 0;
    switch (cityTier) {
        case 'tier1': baseCost = 500000; break;
        case 'tier2': baseCost = 350000; break;
        case 'tier3': baseCost = 250000; break;
        default: baseCost = 500000;
    }

    // 3. Risk Multipliers
    let riskMultiplier = 1.0;

    // Senior Citizen (1.5x)
    if (seniors) riskMultiplier *= 1.5;

    // Chronic Illness (1.3x for One, 1.6x for Multiple)
    if (chronic === 'one') riskMultiplier *= 1.3;
    else if (chronic === 'multiple') riskMultiplier *= 1.6;

    // Past Hospitalization (1.2x for Once, 1.4x for Multiple)
    if (hospitalization === 'once') riskMultiplier *= 1.2;
    else if (hospitalization === 'multiple') riskMultiplier *= 1.4;

    // 4. Family Size Adjustment
    // Each additional adult after first -> +20%
    // Each child -> +10%
    let familyMultiplier = 1.0;
    if (adults > 1) {
        familyMultiplier += (adults - 1) * 0.20;
    }
    if (children > 0) {
        familyMultiplier += children * 0.10;
    }

    // 5. Final Calculation
    // Formula: Base City Cost × Risk Multipliers × Family Size Adjustment
    const estimatedCost = Math.round(baseCost * riskMultiplier * familyMultiplier);
    
    const gap = estimatedCost - currentCover;

    // 6. Update UI
    const resultCard = document.getElementById('resultCard');
    resultCard.style.display = 'block';

    // Scroll to result on mobile
    if (window.innerWidth < 768) {
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }

    // Elements
    const estimatedEl = document.getElementById('estimatedCost');
    const userCoverEl = document.getElementById('userCover');
    const gapAmountEl = document.getElementById('gapAmount');
    const resultLabelEl = document.getElementById('resultLabel');
    const riskBadgeEl = document.getElementById('riskBadge');
    const explanationEl = document.getElementById('resultExplanation');

    // Set Values
    estimatedEl.textContent = formatCurrency(estimatedCost);
    userCoverEl.textContent = formatCurrency(currentCover);

    if (gap <= 0) {
        // Adequate
        gapAmountEl.textContent = "₹0"; // Or "Surplus"
        gapAmountEl.style.color = "var(--success-color)";
        resultLabelEl.textContent = "You are likely adequately covered";
        
        riskBadgeEl.textContent = "Likely Safe";
        riskBadgeEl.className = "risk-badge green";

        explanationEl.innerHTML = `Great news! Based on our estimates for a <strong>${cityTier === 'tier1' ? 'Metro' : (cityTier === 'tier2' ? 'Tier 2' : 'Tier 3')} city</strong>, your current cover of <strong>${formatCurrency(currentCover)}</strong> appears sufficient for a major medical event involving your family size.`;
    } else {
        // Gap
        gapAmountEl.textContent = formatCurrency(gap);
        resultLabelEl.textContent = "Potential Coverage Gap";
        
        // Severity
        const gapPercentage = (gap / estimatedCost) * 100;
        if (gapPercentage > 50) {
            gapAmountEl.style.color = "var(--danger-color)";
            riskBadgeEl.textContent = "High Risk Gap";
            riskBadgeEl.className = "risk-badge red";
        } else {
            gapAmountEl.style.color = "var(--warning-color)";
            riskBadgeEl.textContent = "Moderate Gap";
            riskBadgeEl.className = "risk-badge yellow";
        }

        explanationEl.innerHTML = `Based on your city and family profile, a major hospitalization could cost around <strong>${formatCurrency(estimatedCost)}</strong>. Your current cover falls short by approximately <strong>${formatCurrency(gap)}</strong>. Consider topping up your policy.`;
    }
}

// Add event listener for real-time recalculation (optional, but good for UX)
// We only calculate on button click as per requirements "Calculate Gap" button
