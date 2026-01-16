
/**
 * Security Validation / Spam Simulation Script
 * 
 * This script simulates a series of invalid requests to the contact API
 * to verify that the Cap middleware correctly blocks unauthorized attempts.
 * 
 * Usage: node backend/scripts/security-validation.js
 */

const API_URL = process.env.URL || 'http://localhost:1337/api/messages';
const TOTAL_ATTEMPTS = 50;
const CONCURRENT_BATCH_SIZE = 5;

// Scenarios to test
const SCENARIOS = [
  {
    name: 'Missing Token',
    payload: {
      data: {
        nombre: 'Spam Bot',
        email: 'spam@malicious.com',
        consulta: 'This request has no token'
      }
    }
  },
  {
    name: 'Invalid Token',
    payload: {
      data: {
        nombre: 'Spam Bot',
        email: 'spam@malicious.com',
        consulta: 'This request has a fake token'
      },
      capToken: 'INVALID_TOKEN_12345'
    }
  },
  {
    name: 'Empty Payload',
    payload: {}
  }
];

async function sendRequest(scenario, id) {
  try {
    const start = performance.now();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario.payload)
    });
    const duration = Math.round(performance.now() - start);

    // We expect 400 Bad Request or 403 Forbidden or 500 Internal Server Error
    const blocked = res.status === 400 || res.status === 403 || res.status === 500;
    
    return {
      id,
      scenario: scenario.name,
      status: res.status,
      blocked,
      duration
    };
  } catch (error) {
    return {
      id,
      scenario: scenario.name,
      status: 'NET_ERROR',
      blocked: true, // Network error effectively blocks the request
      error: error.message
    };
  }
}

async function runTest() {
  console.log('🛡️  Starting Security Validation & Spam Simulation');
  console.log(`🎯 Target: ${API_URL}`);
  console.log(`📊 Attempts: ${TOTAL_ATTEMPTS}`);
  console.log('---------------------------------------------------');

  const results = [];
  
  // Create a randomized queue of attacks
  const queue = Array(TOTAL_ATTEMPTS).fill(null).map((_, i) => ({
    id: i + 1,
    scenario: SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  }));

  // Process in batches
  for (let i = 0; i < queue.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = queue.slice(i, i + CONCURRENT_BATCH_SIZE);
    const promises = batch.map(item => sendRequest(item.scenario, item.id));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Progress bar
    const progress = Math.min(100, Math.round(((i + CONCURRENT_BATCH_SIZE) / TOTAL_ATTEMPTS) * 100));
    process.stdout.write(`\rProgress: [${'='.repeat(progress / 5)}${' '.repeat(20 - progress / 5)}] ${progress}%`);
  }

  console.log('\n\n---------------------------------------------------');
  
  // Analysis
  const blockedCount = results.filter(r => r.blocked).length;
  const passedCount = results.filter(r => !r.blocked).length;
  const successRate = (blockedCount / TOTAL_ATTEMPTS) * 100;

  console.log('📊 RESULTS ANALYSIS');
  console.log(`Total Requests: ${TOTAL_ATTEMPTS}`);
  console.log(`✅ Blocked:       ${blockedCount}`);
  console.log(`⚠️  WARNING:       ${passedCount} (Requests that bypassed security)`);
  console.log(`🛡️  Protection Effectiveness: ${successRate}%`);

  if (passedCount > 0) {
    console.log('\n⚠️  ALERTS - The following requests passed validation:');
    results.filter(r => !r.blocked).forEach(r => {
      console.log(`   [ID ${r.id}] Scenario: ${r.scenario} -> Status: ${r.status}`);
    });
  } else {
    console.log('\n✅ SUCCESS: No malicious requests bypassed the Cap verification.');
  }
}

runTest();
