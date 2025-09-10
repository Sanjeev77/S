// Legal Pages Modal Handler
function showLegalModal(title, content) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('legal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'legal-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content legal-modal-content">
        <div class="modal-header">
          <div class="modal-title" id="legal-modal-title"></div>
          <button class="close-modal" onclick="closeLegalModal()">&times;</button>
        </div>
        <div id="legal-modal-body" class="legal-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById('legal-modal-title').innerHTML = `<i class="fas fa-file-text"></i> ${title}`;
  document.getElementById('legal-modal-body').innerHTML = content;
  modal.style.display = 'flex';
}

function closeLegalModal() {
  const modal = document.getElementById('legal-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function showPrivacyPolicy(e) {
  e.preventDefault();
  const content = `
    <h3>Privacy Policy</h3>
    <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h4>1. Information We Collect</h4>
    <p>Zero Balanced is a client-side financial calculator. We do not collect, store, or transmit any personal financial data. All calculations are performed locally in your browser.</p>
    
    <h4>2. How We Use Information</h4>
    <p>• All financial calculations remain on your device</p>
    <p>• No personal data is sent to our servers</p>
    <p>• Optional feedback forms use EmailJS service</p>
    
    <h4>3. Cookies and Local Storage</h4>
    <p>We may use local storage to save your preferences and settings locally on your device. No cookies are used for tracking.</p>
    
    <h4>4. Third-Party Services</h4>
    <p>• Google AdSense: May use cookies for ad personalization</p>
    <p>• EmailJS: For contact form submissions</p>
    <p>• Font Awesome: For icons (no data collection)</p>
    
    <h4>5. Data Security</h4>
    <p>Since all calculations are performed client-side, your financial data never leaves your device, ensuring maximum privacy and security.</p>
    
    <h4>6. Your Rights</h4>
    <p>You have the right to:</p>
    <p>• Clear your browser's local storage at any time</p>
    <p>• Disable cookies in your browser settings</p>
    <p>• Use the calculator without providing any personal information</p>
    
    <h4>7. Contact Us</h4>
    <p>If you have questions about this Privacy Policy, please contact us through our feedback form.</p>
  `;
  showLegalModal('Privacy Policy', content);
}

function showTermsOfService(e) {
  e.preventDefault();
  const content = `
    <h3>Terms of Service</h3>
    <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h4>1. Acceptance of Terms</h4>
    <p>By using Zero Balanced financial calculator, you agree to these terms of service.</p>
    
    <h4>2. Description of Service</h4>
    <p>Zero Balanced is a free financial planning calculator that helps users estimate financial goals and investment strategies. All calculations are performed client-side for maximum privacy.</p>
    
    <h4>3. User Responsibilities</h4>
    <p>• Use the calculator for personal financial planning only</p>
    <p>• Understand that results are estimates, not financial advice</p>
    <p>• Consult qualified financial advisors for professional guidance</p>
    
    <h4>4. Disclaimer of Warranties</h4>
    <p>This calculator is provided "as is" without warranties. We do not guarantee the accuracy of calculations and are not liable for any financial decisions based on the results.</p>
    
    <h4>5. Limitation of Liability</h4>
    <p>Zero Balanced and its creators are not liable for any damages resulting from the use of this calculator. Users are responsible for their own financial decisions.</p>
    
    <h4>6. Financial Advice Disclaimer</h4>
    <p>This calculator does not provide financial advice. Results are estimates only. Always consult with qualified financial professionals before making investment decisions.</p>
    
    <h4>7. Modifications</h4>
    <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
    
    <h4>8. Contact Information</h4>
    <p>For questions about these terms, please contact us through our feedback form.</p>
  `;
  showLegalModal('Terms of Service', content);
}

function showCookiePolicy(e) {
  e.preventDefault();
  const content = `
    <h3>Cookie Policy</h3>
    <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h4>1. What Are Cookies</h4>
    <p>Cookies are small text files stored on your device by websites you visit. They help websites remember your preferences and improve your experience.</p>
    
    <h4>2. How We Use Cookies</h4>
    <p><strong>Essential Cookies:</strong></p>
    <p>• Local storage for saving your calculator settings</p>
    <p>• Session storage for temporary calculations</p>
    
    <p><strong>Third-Party Cookies:</strong></p>
    <p>• Google AdSense: For displaying relevant advertisements</p>
    <p>• Analytics cookies: To understand how users interact with our calculator</p>
    
    <h4>3. Cookie Types We Use</h4>
    <p>• <strong>Functional:</strong> Remember your preferences and settings</p>
    <p>• <strong>Advertising:</strong> Deliver relevant ads (Google AdSense)</p>
    <p>• <strong>Analytics:</strong> Help us understand usage patterns</p>
    
    <h4>4. Managing Cookies</h4>
    <p>You can control cookies through your browser settings:</p>
    <p>• Block all cookies</p>
    <p>• Delete existing cookies</p>
    <p>• Set preferences for specific websites</p>
    
    <h4>5. Impact of Disabling Cookies</h4>
    <p>Disabling cookies may affect:</p>
    <p>• Ability to save your calculator settings</p>
    <p>• Ad personalization</p>
    <p>• Some website functionality</p>
    
    <h4>6. Updates to This Policy</h4>
    <p>We may update this cookie policy periodically. Please check this page for the latest information.</p>
  `;
  showLegalModal('Cookie Policy', content);
}

function showAboutUs(e) {
  e.preventDefault();
  const content = `
    <h3>About Zero Balanced</h3>
    
    <h4>Our Mission</h4>
    <p>Zero Balanced is dedicated to making financial planning accessible to everyone. Our free, privacy-first calculator helps individuals understand their financial goals and create actionable investment strategies.</p>
    
    <h4>What We Offer</h4>
    <p>• <strong>Comprehensive Planning:</strong> Set multiple financial goals with realistic timelines</p>
    <p>• <strong>Investment Tracking:</strong> Monitor your existing investments and SIP performance</p>
    <p>• <strong>Smart Scenarios:</strong> Explore different financial strategies and their outcomes</p>
    <p>• <strong>Privacy First:</strong> All calculations happen on your device - no data transmission</p>
    
    <h4>Why Choose Zero Balanced?</h4>
    <p><strong>100% Free:</strong> No hidden costs, premium plans, or subscription fees</p>
    <p><strong>Privacy Protected:</strong> Your financial data never leaves your browser</p>
    <p><strong>Easy to Use:</strong> Intuitive interface designed for everyone</p>
    <p><strong>Comprehensive:</strong> Covers goals, investments, loans, and life balance</p>
    
    <h4>Our Approach</h4>
    <p>We believe financial planning should be:</p>
    <p>• Transparent and easy to understand</p>
    <p>• Accessible without sharing personal data</p>
    <p>• Focused on practical, achievable goals</p>
    <p>• Supported by clear insights and recommendations</p>
    
    <h4>Disclaimer</h4>
    <p>Zero Balanced provides financial calculations and insights for educational purposes. We are not financial advisors, and our tools should not replace professional financial advice. Always consult qualified professionals for important financial decisions.</p>
    
    <h4>Contact Us</h4>
    <p>Have suggestions or feedback? We'd love to hear from you through our feedback form!</p>
  `;
  showLegalModal('About Zero Balanced', content);
}

function showContactInfo(e) {
  e.preventDefault();
  const content = `
    <h3>Contact Information</h3>
    
    <h4>Get in Touch</h4>
    <p>We value your feedback and are here to help with any questions about Zero Balanced financial calculator.</p>
    
    <h4>Feedback Form</h4>
    <p>The best way to reach us is through our built-in feedback form at the bottom of the results panel. Your messages help us improve the calculator and add new features.</p>
    
    <h4>What You Can Contact Us About:</h4>
    <p>• Calculator bugs or issues</p>
    <p>• Feature requests and suggestions</p>
    <p>• Questions about financial calculations</p>
    <p>• Privacy and data concerns</p>
    <p>• General feedback about user experience</p>
    
    <h4>Response Time</h4>
    <p>We aim to respond to all feedback within 48-72 hours during business days. Technical issues receive priority attention.</p>
    
    <h4>Technical Support</h4>
    <p>For technical issues:</p>
    <p>• Try refreshing the page first</p>
    <p>• Clear your browser cache if calculations seem incorrect</p>
    <p>• Ensure JavaScript is enabled in your browser</p>
    <p>• Check that you're using a modern browser (Chrome, Firefox, Safari, Edge)</p>
    
    <h4>Privacy Commitment</h4>
    <p>All feedback is handled confidentially. We never share personal information and only use feedback to improve our service.</p>
    
    <p><strong>Thank you for using Zero Balanced!</strong></p>
  `;
  showLegalModal('Contact Information', content);
}

function showDisclaimer(e) {
  e.preventDefault();
  const content = `
    <h3>Financial Disclaimer</h3>
    
    <h4>Important Notice</h4>
    <p><strong>Zero Balanced is an educational financial calculator tool only. It is not financial advice and should not be used as the sole basis for financial decisions.</strong></p>
    
    <h4>What This Calculator Provides</h4>
    <p>• Mathematical estimates based on your inputs</p>
    <p>• Projected scenarios using standard financial formulas</p>
    <p>• General insights about financial planning concepts</p>
    <p>• Educational information about investment strategies</p>
    
    <h4>What This Calculator Does NOT Provide</h4>
    <p>• Professional financial advice</p>
    <p>• Investment recommendations</p>
    <p>• Tax planning guidance</p>
    <p>• Guaranteed returns or outcomes</p>
    <p>• Risk assessment for specific investments</p>
    
    <h4>Limitations and Assumptions</h4>
    <p>• All calculations are estimates based on mathematical models</p>
    <p>• Market returns can vary significantly from projections</p>
    <p>• Inflation rates and economic conditions change over time</p>
    <p>• Personal circumstances may affect actual outcomes</p>
    <p>• Tax implications are not considered in calculations</p>
    
    <h4>Professional Advice Recommended</h4>
    <p>Before making any financial decisions, please consult with:</p>
    <p>• Certified Financial Planners (CFP)</p>
    <p>• Investment advisors registered with regulatory authorities</p>
    <p>• Tax professionals for tax-related questions</p>
    <p>• Estate planning attorneys for inheritance matters</p>
    
    <h4>Risk Acknowledgment</h4>
    <p>All investments carry risk, including potential loss of principal. Past performance does not guarantee future results. Market volatility can significantly impact investment outcomes.</p>
    
    <h4>Accuracy Disclaimer</h4>
    <p>While we strive for accuracy, we make no warranties about the correctness of calculations. Users are responsible for verifying results and making informed decisions.</p>
    
    <p><strong>Use this calculator as a starting point for financial planning, not as professional financial advice.</strong></p>
  `;
  showLegalModal('Financial Disclaimer', content);
}

function showHowToUse(e) {
  e.preventDefault();
  const content = `
    <h3>How to Use Zero Balanced</h3>
    
    <h4>Getting Started</h4>
    <p>Zero Balanced is designed to be intuitive, but here's a quick guide to help you get the most accurate results:</p>
    
    <h4>Step 1: Personal Details</h4>
    <p>• <strong>Current Age:</strong> Your age today</p>
    <p>• <strong>Goal Timeline:</strong> How many years to achieve your goals</p>
    <p>• <strong>Predicted Lifespan:</strong> Used for retirement planning calculations</p>
    
    <h4>Step 2: Monthly Finances</h4>
    <p>• <strong>Monthly Income:</strong> Your total monthly income after taxes</p>
    <p>• <strong>Monthly Expenses:</strong> All your monthly expenses including rent, food, utilities</p>
    <p>• <strong>Current Savings:</strong> Money you have saved right now</p>
    <p>• <strong>Loans:</strong> Click "Add Loan Details" to include EMIs</p>
    
    <h4>Step 3: Investment Assumptions</h4>
    <p>• <strong>Existing Investments:</strong> Current value of all your investments</p>
    <p>• <strong>Monthly SIP:</strong> How much you invest via SIP currently</p>
    <p>• <strong>SIP Duration:</strong> How long you've been doing SIP</p>
    <p>• <strong>Expected Returns:</strong> 8-12% is typical for equity mutual funds</p>
    <p>• <strong>Inflation Rate:</strong> 5-7% is typical for India</p>
    
    <h4>Step 4: Set Your Goals</h4>
    <p>• Check the boxes for goals you want to achieve</p>
    <p>• Use sliders or type amounts directly</p>
    <p>• You can exceed slider maximums by typing larger amounts</p>
    
    <h4>Understanding Results</h4>
    <p>• <strong>Work-Life Balance Meter:</strong> Shows if your financial plan is sustainable</p>
    <p>• <strong>Monthly Investment Needed:</strong> Additional investment required beyond current SIP</p>
    <p>• <strong>Financial Health:</strong> Overall assessment of your financial situation</p>
    <p>• <strong>Insights:</strong> Personalized recommendations based on your data</p>
    <p>• <strong>Scenarios:</strong> Different strategies to achieve your goals</p>
    
    <h4>Tips for Accurate Results</h4>
    <p>• Be honest with your income and expenses</p>
    <p>• Include all existing investments and SIPs</p>
    <p>• Set realistic timelines for your goals</p>
    <p>• Conservative assumptions lead to more achievable plans</p>
    
    <h4>Using Balance Plans</h4>
    <p>Click "Make It More Balanced" to see personalized recommendations based on your age and financial situation.</p>
    
    <h4>Saving and Sharing</h4>
    <p>• Use "Download JSON" to save your inputs</p>
    <p>• Use "Load JSON" to restore saved data</p>
    <p>• Use "Share Image" to create a shareable summary</p>
  `;
  showLegalModal('How to Use', content);
}

function showFAQ(e) {
  e.preventDefault();
  const content = `
    <h3>Frequently Asked Questions</h3>
    
    <h4>General Questions</h4>
    
    <p><strong>Q: Is Zero Balanced completely free?</strong></p>
    <p>A: Yes! Zero Balanced is 100% free with no hidden costs, premium features, or subscription plans.</p>
    
    <p><strong>Q: Is my financial data safe?</strong></p>
    <p>A: Absolutely. All calculations happen in your browser. No financial data is sent to our servers or stored online.</p>
    
    <p><strong>Q: Do I need to create an account?</strong></p>
    <p>A: No account required. You can use the calculator immediately and save data locally if needed.</p>
    
    <h4>Calculation Questions</h4>
    
    <p><strong>Q: How accurate are the calculations?</strong></p>
    <p>A: Calculations use standard financial formulas and are mathematically accurate. However, they're estimates based on your assumptions about future returns and inflation.</p>
    
    <p><strong>Q: What return rate should I use?</strong></p>
    <p>A: For Indian equity mutual funds, 10-12% is reasonable. For conservative planning, use 8-10%. For debt funds, use 6-8%.</p>
    
    <p><strong>Q: Why is my monthly investment requirement so high?</strong></p>
    <p>A: This usually means either your goals are very ambitious for the timeline, or your existing investments are insufficient. Try extending the timeline or adjusting goal amounts.</p>
    
    <h4>Feature Questions</h4>
    
    <p><strong>Q: Can I set goals beyond the slider maximum?</strong></p>
    <p>A: Yes! Type any amount directly in the input field, even if it exceeds the slider range.</p>
    
    <p><strong>Q: How do I include multiple loans?</strong></p>
    <p>A: Click "Add Loan Details" and enter each loan separately. The calculator will sum all EMIs automatically.</p>
    
    <p><strong>Q: What's the difference between existing investments and SIP?</strong></p>
    <p>A: Existing investments are what you have today. SIP is your monthly investment amount. Both are used to calculate your future wealth.</p>
    
    <h4>Technical Questions</h4>
    
    <p><strong>Q: The calculator isn't working properly. What should I do?</strong></p>
    <p>A: Try refreshing the page, clearing your browser cache, or using a different browser. Ensure JavaScript is enabled.</p>
    
    <p><strong>Q: Can I use this on mobile?</strong></p>
    <p>A: Yes! The calculator is fully responsive and works great on mobile devices.</p>
    
    <p><strong>Q: How do I save my calculations?</strong></p>
    <p>A: Use the "Download JSON" button in the Export section to save all your inputs to a file.</p>
    
    <h4>Still Have Questions?</h4>
    <p>Use our feedback form at the bottom of the results panel to ask specific questions!</p>
  `;
  showLegalModal('Frequently Asked Questions', content);
}

function showTermsAndConditions(e) {
  e.preventDefault();
  const content = `
    <h3>Terms and Conditions</h3>
    
    <p>Welcome to Zero Balanced Terms and Conditions section. Please select from the following policies and legal documents:</p>
    
    <div class="legal-links-section">
      <div class="legal-links-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <a href="#" onclick="showPrivacyPolicy(event)" class="legal-link" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease;">
          <i class="fas fa-user-shield" style="font-size: 2rem; margin-right: 15px; color: var(--primary);"></i>
          <div>
            <strong style="color: var(--primary);">Privacy Policy</strong>
            <small style="display: block; color: #6c757d; margin-top: 5px;">How we protect your data and ensure your privacy</small>
          </div>
        </a>
        
        <a href="#" onclick="showTermsOfService(event)" class="legal-link" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease;">
          <i class="fas fa-file-contract" style="font-size: 2rem; margin-right: 15px; color: var(--primary);"></i>
          <div>
            <strong style="color: var(--primary);">Terms of Service</strong>
            <small style="display: block; color: #6c757d; margin-top: 5px;">Usage terms and conditions for our service</small>
          </div>
        </a>
        
        <a href="#" onclick="showCookiePolicy(event)" class="legal-link" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease;">
          <i class="fas fa-cookie-bite" style="font-size: 2rem; margin-right: 15px; color: var(--primary);"></i>
          <div>
            <strong style="color: var(--primary);">Cookie Policy</strong>
            <small style="display: block; color: #6c757d; margin-top: 5px;">How we use cookies and similar technologies</small>
          </div>
        </a>
        
        <a href="#" onclick="showDisclaimer(event)" class="legal-link" style="display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease;">
          <i class="fas fa-info-circle" style="font-size: 2rem; margin-right: 15px; color: var(--primary);"></i>
          <div>
            <strong style="color: var(--primary);">Full Disclaimer</strong>
            <small style="display: block; color: #6c757d; margin-top: 5px;">Important financial and legal disclaimers</small>
          </div>
        </a>
      </div>
    </div>
    
    <div class="disclaimer-box" style="background: #f8f9fa; border-left: 4px solid var(--warning); padding: 15px; margin-top: 20px; border-radius: 4px;">
      <i class="fas fa-exclamation-triangle" style="color: var(--warning); margin-right: 10px;"></i>
      <strong>Important:</strong> Please read all policies carefully. By using Zero Balanced, you agree to comply with all terms and conditions outlined in these documents.
    </div>
  `;
  showLegalModal('Terms and Conditions', content);
}

function showSitemap(e) {
  e.preventDefault();
  const content = `
    <h3>Sitemap</h3>
    
    <h4>Main Sections</h4>
    <p><strong>Financial Calculator</strong></p>
    <p>• Personal Details Input</p>
    <p>• Monthly Finances Setup</p>
    <p>• Investment Assumptions</p>
    <p>• Goals Configuration</p>
    <p>• Results Dashboard</p>
    <p>• Balance Meter</p>
    <p>• Financial Health Assessment</p>
    
    <h4>Legal Pages</h4>
    <p>• Privacy Policy</p>
    <p>• Terms of Service</p>
    <p>• Cookie Policy</p>
    <p>• Financial Disclaimer</p>
    
    <h4>About & Support</h4>
    <p>• About Zero Balanced</p>
    <p>• Contact Information</p>
    <p>• How to Use Guide</p>
    <p>• Frequently Asked Questions</p>
    <p>• Support & Help</p>
    
    <h4>Features</h4>
    <p>• Goal Planning (House, Vehicle, Travel, Education, Emergency, Other)</p>
    <p>• Investment Tracking</p>
    <p>• Loan Management</p>
    <p>• Financial Scenarios</p>
    <p>• Balance Plans</p>
    <p>• Data Export/Import</p>
    <p>• Feedback System</p>
    
    <h4>Tools</h4>
    <p>• Work-Life Balance Calculator</p>
    <p>• SIP Calculator</p>
    <p>• Goal Visualization Charts</p>
    <p>• Financial Health Scoring</p>
    <p>• EMI Calculator Integration</p>
    
    <p><em>All features are accessible from the main calculator interface.</em></p>
  `;
  showLegalModal('Sitemap', content);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('legal-modal');
  if (modal && e.target === modal) {
    closeLegalModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLegalModal();
  }
});