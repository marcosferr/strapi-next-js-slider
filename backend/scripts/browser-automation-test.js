/**
 * Advanced Clean Bot Attack Simulation using Playwright
 * 
 * This script launches a real browser (headless or headed) to simulate
 * a sophisticated bot that can execute JavaScript and generate valid
 * ALTCHA tokens.
 * 
 * Prerequisites:
 *  - npm install playwright
 *  - npx playwright install chromium
 * 
 * Usage: 
 *  node backend/scripts/browser-automation-test.js
 */

const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000/contact';

(async () => {
  console.log('🤖 Starting Advanced Bot Attack Simulation...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false, // Set to true for faster, invisible execution
      slowMo: 100 // Slow down operations to see what's happening
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();

    console.log(`📍 Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL);

    // Fill out the form
    console.log('✍️  Filling out form...');
    await page.fill('input[name="nombre"]', 'Playwright Bot');
    await page.fill('input[name="email"]', 'bot@automated-test.com');
    await page.fill('textarea[name="consulta"]', 'This is an automated test using Playwright to generate a real ALTCHA token.');

    // Wait for ALTCHA widget to complete verification
    console.log('⏳ Waiting for ALTCHA widget to verify...');
    await page.waitForSelector('altcha-widget[data-state="verified"]', { timeout: 30000 }).catch(() => {
      console.log('⏳ ALTCHA widget not auto-verified, waiting for manual interaction...');
    });

    // Setup response listener to intercept the verification
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/messages') && response.request().method() === 'POST'
    );

    // Click submit
    console.log('🔘 Clicking submit (triggering ALTCHA proof-of-work)...');
    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for API response...');
    const response = await responsePromise;
    const status = response.status();
    const body = await response.json();

    console.log('---------------------------------------------------');
    console.log(`📊 Attack Result: HTTP ${status}`);
    
    if (status === 200 || status === 201) {
      console.log('✅ SUCCESS (for the bot): Form submitted successfully.');
      console.log('⚠️  WARNING: The automated browser successfully solved the ALTCHA challenge.');
      console.log('   This is expected behavior - ALTCHA uses proof-of-work which automated browsers can solve.');
      console.log('   The protection comes from computational cost, not blocking automated browsers.');
    } else {
      console.log('🛡️  BLOCKED: The request was rejected.');
      console.log('   Reason:', body);
    }
    console.log('---------------------------------------------------');

    // Extract the token from the request for inspection
    const request = response.request();
    const postData = JSON.parse(request.postData());
    console.log('🎫 Captured ALTCHA Payload (Partial):', postData.altcha?.substring(0, 30) + '...');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ ERROR: Playwright is not installed.');
      console.error('Please run: npm install playwright && npx playwright install chromium\n');
    } else {
      console.error('❌ An error occurred:', error);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
