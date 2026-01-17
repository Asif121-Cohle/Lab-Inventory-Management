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
    const { data } = await axios.post(
      `${BASE_URL}/materials`,
      {
        name: 'Test Resistor',
        description: '10k ohm carbon film resistor',
        quantity: 100,
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

  // Test 12: Get Pending Requests
  if (await testEndpoint('Get Pending Requests', async () => {
    const { data } = await axios.get(`${BASE_URL}/requests/pending`, {
      headers: { Authorization: `Bearer ${assistantToken}` }
    });
    log.info(`Pending requests: ${data.requests.length}`);
  })) passed++; else failed++;

  // Test 13: Professor Schedule Lab
  if (await testEndpoint('Professor Schedule Lab', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    const { data } = await axios.post(
      `${BASE_URL}/schedules`,
      {
        labId: 'physics-lab',
        date: dateStr,
        startTime: '14:00',
        endTime: '16:00',
        courseName: 'Physics 101',
        className: 'Section A',
        expectedStudents: 30,
        purpose: 'Test lab session'
      },
      { headers: { Authorization: `Bearer ${professorToken}` } }
    );
    if (!data.schedule) throw new Error('Schedule not created');
    log.info(`Scheduled: ${data.schedule.lab.name} on ${data.schedule.date}`);
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
