const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let assistantToken, studentToken, professorToken;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  ai: (msg) => console.log(`${colors.yellow}🤖 ${msg}${colors.reset}`)
};

async function testEndpoint(name, fn) {
  try {
    log.test(name);
    await fn();
    log.success(`${name} - PASSED`);
    return true;
  } catch (error) {
    log.error(`${name} - FAILED: ${error.message}`);
    if (error.response?.data) {
      console.log('  Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function runTests() {
  console.log('\n🎯 API ENDPOINT TEST SUITE');
  console.log('=========================\n');

  let passed = 0, failed = 0;

  // Test 1: Health Check
  if (await testEndpoint('Health Check', async () => {
    const { data } = await axios.get(`${BASE_URL}/health`);
    if (data.status !== 'OK') throw new Error('Health check failed');
    log.info(`Status: ${data.status}`);
  })) passed++; else failed++;

  // Test 2: Login Lab Assistant
  if (await testEndpoint('Login (Lab Assistant)', async () => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'assistant1',
      password: '123456'
    });
    assistantToken = data.token;
    if (!assistantToken) throw new Error('No token received');
    log.info(`User: ${data.user.username} (${data.user.role})`);
  })) passed++; else failed++;

  // Test 3: Login Student
  if (await testEndpoint('Login (Student)', async () => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'student1',
      password: '123456'
    });
    studentToken = data.token;
    if (!studentToken) throw new Error('No token received');
  })) passed++; else failed++;

  // Test 4: Login Professor
  if (await testEndpoint('Login (Professor)', async () => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'professor1',
      password: '123456'
    });
    professorToken = data.token;
    if (!professorToken) throw new Error('No token received');
  })) passed++; else failed++;

  // Test 5: Get All Labs
  if (await testEndpoint('Get All Labs', async () => {
    const { data } = await axios.get(`${BASE_URL}/labs`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.labs || data.labs.length === 0) throw new Error('No labs found');
    log.info(`Found ${data.labs.length} labs: ${data.labs.map(l => l.name).join(', ')}`);
  })) passed++; else failed++;

  // Test 6: Get Lab Materials
  if (await testEndpoint('Get Lab Materials', async () => {
    const { data } = await axios.get(`${BASE_URL}/labs/computer-lab/materials`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.materials) throw new Error('No materials returned');
    log.info(`Found ${data.materials.length} materials in computer-lab`);
  })) passed++; else failed++;

  // Test 7: Get All Materials
  if (await testEndpoint('Get All Materials', async () => {
    const { data } = await axios.get(`${BASE_URL}/materials`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    log.info(`Total materials: ${data.materials.length}`);
  })) passed++; else failed++;

  // Test 8: AI Categorization
  if (await testEndpoint('AI Categorization', async () => {
    const { data } = await axios.post(
      `${BASE_URL}/materials/categorize`,
      {
        name: 'Arduino Uno',
        description: 'Microcontroller board for embedded projects'
      },
      { headers: { Authorization: `Bearer ${assistantToken}` } }
    );
    if (!data.category || !data.tags) throw new Error('Invalid AI response');
    log.ai(`Category: ${data.category}`);
    log.ai(`Tags: ${data.tags.join(', ')}`);
  })) passed++; else failed++;

  // Test 9: Add Material (with AI)
  if (await testEndpoint('Add Material (AI-powered)', async () => {
    // First, get the electronics lab to get its ObjectId
    const { data: labsData } = await axios.get(`${BASE_URL}/labs`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    const electronicsLab = labsData.labs.find(lab => lab.id === 'electronics-lab');
    if (!electronicsLab) throw new Error('Electronics lab not found');
    
    const { data } = await axios.post(
      `${BASE_URL}/materials`,
      {
        name: 'Test Resistor',
        description: '10k ohm carbon film resistor',
        quantity: 100,
        lab: electronicsLab._id,
        labId: 'electronics-lab'
      },
      { headers: { Authorization: `Bearer ${assistantToken}` } }
    );
    if (!data.material) throw new Error('Material not created');
    log.info(`Created: ${data.material.name} (${data.material.category})`);
  })) passed++; else failed++;

  // Test 10: Student Request Material
  if (await testEndpoint('Student Request Material', async () => {
    const { data: materials } = await axios.get(`${BASE_URL}/labs/computer-lab/materials`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const materialId = materials.materials[0]._id;
    
    const { data } = await axios.post(
      `${BASE_URL}/requests`,
      {
        materialId,
        quantity: 2,
        purpose: 'Test request'
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    if (!data.request) throw new Error('Request not created');
    log.info(`Request created for: ${data.request.material.name}`);
  })) passed++; else failed++;

  // Test 11: AI Material Suggestion (NEW!)
  if (await testEndpoint('AI Material Suggestion', async () => {
    const { data } = await axios.post(
      `${BASE_URL}/requests/ai-suggest`,
      {
        projectDescription: 'I need to build a simple LED circuit with Arduino for my electronics project',
        labId: 'electronics-lab'
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    if (!data.suggestions || data.suggestions.length === 0) throw new Error('No suggestions returned');
    log.ai(`AI suggested ${data.suggestions.length} materials`);
    log.info(`Example: ${data.suggestions[0].name} - ${data.suggestions[0].reason}`);
  })) passed++; else failed++;

  // Test 12: AI Natural Language Search (NEW!)
  if (await testEndpoint('AI Natural Language Search', async () => {
    const { data } = await axios.post(
      `${BASE_URL}/materials/search`,
      {
        query: 'Show me all Arduino compatible components',
        labId: 'electronics-lab'
      },
      { 
        headers: { Authorization: `Bearer ${assistantToken}` },
        timeout: 60000 // 60 second timeout for AI processing
      }
    );
    if (!data.materials) throw new Error('No materials returned');
    log.ai(`Found ${data.totalResults} materials${data.aiPowered ? ' (AI-powered)' : ' (keyword fallback)'}`);
    if (data.intent) log.info(`Intent: ${data.intent}`);
  })) passed++; else failed++;

  // Test 13: Get Pending Requests
  if (await testEndpoint('Get Pending Requests', async () => {
    const { data } = await axios.get(`${BASE_URL}/requests/pending`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    log.info(`Pending requests: ${data.requests.length}`);
  })) passed++; else failed++;

  // Test 14: Professor Schedule Lab
  if (await testEndpoint('Professor Schedule Lab', async () => {
    // Get physics lab ObjectId
    const { data: labsData } = await axios.get(`${BASE_URL}/labs`, {
      headers: { Authorization: `Bearer ${professorToken}` }
    });
    const physicsLab = labsData.labs.find(lab => lab.id === 'physics-lab');
    if (!physicsLab) throw new Error('Physics lab not found');
    
    // Use a unique future date to avoid conflicts
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 30); // 30-60 days ahead
    const dateStr = futureDate.toISOString().split('T')[0];
    const { data } = await axios.post(
      `${BASE_URL}/schedules`,
      {
        labId: physicsLab._id,
        date: dateStr,
        startTime: '09:00',
        endTime: '11:00',
        courseName: 'Physics 101 - Test',
        className: 'Test Section',
        expectedStudents: 30,
        purpose: 'Automated test schedule'
      },
      { headers: { Authorization: `Bearer ${professorToken}` } }
    );
    if (!data.schedule) throw new Error('Schedule not created');
    log.info(`Scheduled: ${data.schedule.lab.name} on ${data.schedule.date}`);
  })) passed++; else failed++;

  // Test 15: Get Current User (Auth Me)
  if (await testEndpoint('Get Current User', async () => {
    const { data } = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.user) throw new Error('User not returned');
    log.info(`User: ${data.user.username} (${data.user.role})`);
  })) passed++; else failed++;

  // Test 16: Get Lab by ID
  if (await testEndpoint('Get Lab by ID', async () => {
    const { data: labsData } = await axios.get(`${BASE_URL}/labs`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    const labId = labsData.labs[0]._id;
    
    const { data } = await axios.get(`${BASE_URL}/labs/${labId}`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.lab) throw new Error('Lab not returned');
    log.info(`Lab: ${data.lab.name} (${data.lab.labId})`);
  })) passed++; else failed++;

  // Test 17: Update Material
  if (await testEndpoint('Update Material', async () => {
    const { data: materials } = await axios.get(`${BASE_URL}/materials`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    const materialId = materials.materials[0]._id;
    
    const { data } = await axios.put(
      `${BASE_URL}/materials/${materialId}`,
      {
        quantity: materials.materials[0].quantity + 50,
        minThreshold: 15
      },
      { headers: { Authorization: `Bearer ${assistantToken}` } }
    );
    if (!data.material) throw new Error('Material not updated');
    log.info(`Updated: ${data.material.name} - New quantity: ${data.material.quantity}`);
  })) passed++; else failed++;

  // Test 18: Get My Requests (Student)
  if (await testEndpoint('Get My Requests (Student)', async () => {
    const { data } = await axios.get(`${BASE_URL}/requests/my-requests`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!data.requests) throw new Error('Requests not returned');
    log.info(`Student has ${data.requests.length} requests`);
  })) passed++; else failed++;

  // Test 19: Approve Request
  if (await testEndpoint('Approve Request', async () => {
    const { data: pendingData } = await axios.get(`${BASE_URL}/requests/pending`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    
    if (pendingData.requests.length === 0) {
      log.info('No pending requests to approve - SKIPPED');
      return true;
    }
    
    const requestId = pendingData.requests[0]._id;
    const { data } = await axios.put(
      `${BASE_URL}/requests/${requestId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${assistantToken}` } }
    );
    if (!data.request) throw new Error('Request not approved');
    log.info(`Approved request for: ${data.request.material?.name || 'material'}`);
  })) passed++; else failed++;

  // Test 20: Check Schedule Availability
  if (await testEndpoint('Check Schedule Availability', async () => {
    // Get physics lab ObjectId
    const { data: labsData } = await axios.get(`${BASE_URL}/labs`, {
      headers: { Authorization: `Bearer ${professorToken}` }
    });
    const physicsLab = labsData.labs.find(lab => lab.id === 'physics-lab');
    if (!physicsLab) throw new Error('Physics lab not found');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    const { data } = await axios.get(`${BASE_URL}/schedules/check-availability`, {
      params: {
        labId: physicsLab._id,
        date: dateStr,
        time: '10:00-12:00'
      },
      headers: { Authorization: `Bearer ${professorToken}` }
    });
    log.info(`Availability: ${data.available ? 'Available' : 'Not Available'}`);
  })) passed++; else failed++;

  // Test 21: Get My Schedules (Professor)
  if (await testEndpoint('Get My Schedules (Professor)', async () => {
    const { data } = await axios.get(`${BASE_URL}/schedules/my-schedules`, {
      headers: { Authorization: `Bearer ${professorToken}` }
    });
    if (!data.schedules) throw new Error('Schedules not returned');
    log.info(`Professor has ${data.schedules.length} schedules`);
  })) passed++; else failed++;

  // Test 22: Get All Schedules
  if (await testEndpoint('Get All Schedules', async () => {
    const { data } = await axios.get(`${BASE_URL}/schedules`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.schedules) throw new Error('Schedules not returned');
    log.info(`Total schedules: ${data.schedules.length}`);
  })) passed++; else failed++;

  // Test 23: AI Chat
  if (await testEndpoint('AI Chat', async () => {
    const { data } = await axios.post(
      `${BASE_URL}/chat`,
      {
        message: 'What materials are available in the electronics lab?',
        conversationHistory: []
      },
      { 
        headers: { Authorization: `Bearer ${studentToken}` },
        timeout: 60000
      }
    );
    if (!data.response) throw new Error('No chat response');
    log.ai(`Chat response: ${data.response.substring(0, 80)}...`);
  })) passed++; else failed++;

  // Test 24: Get Chat Suggestions
  if (await testEndpoint('Get Chat Suggestions', async () => {
    const { data } = await axios.get(`${BASE_URL}/chat/suggestions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!data.suggestions || data.suggestions.length === 0) throw new Error('No suggestions returned');
    log.info(`Got ${data.suggestions.length} chat suggestions`);
  })) passed++; else failed++;

  // Test 25: Get Analytics Data
  if (await testEndpoint('Get Analytics Data', async () => {
    const { data } = await axios.get(`${BASE_URL}/analytics/data`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    if (!data.data || !data.data.materials) throw new Error('Analytics data incomplete');
    log.info(`Analytics: ${data.data.materials.length} materials, ${data.data.labs.length} labs, ${data.data.requests.length} requests`);
  })) passed++; else failed++;

  // Test 26: Generate Analytics AI Summary
  if (await testEndpoint('Generate Analytics AI Summary', async () => {
    const { data } = await axios.post(
      `${BASE_URL}/analytics/generate-summary`,
      {},
      { 
        headers: { Authorization: `Bearer ${assistantToken}` },
        timeout: 60000
      }
    );
    if (!data.summary) throw new Error('No summary generated');
    log.ai(`Summary: ${data.summary.substring(0, 100)}...`);
  })) passed++; else failed++;

  // Test 27: Delete Material
  if (await testEndpoint('Delete Material', async () => {
    // Find Test Resistor created in Test 9
    const { data: materials } = await axios.get(`${BASE_URL}/materials`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    const testMaterial = materials.materials.find(m => m.name === 'Test Resistor');
    
    if (!testMaterial) {
      log.info('Test Resistor not found - SKIPPED');
      return true;
    }
    
    await axios.delete(`${BASE_URL}/materials/${testMaterial._id}`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    log.info(`Deleted: ${testMaterial.name}`);
  })) passed++; else failed++;

  // Summary
  console.log('\n=========================');
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);
  console.log('=========================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
