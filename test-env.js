const assert = require('assert');
try { require('dotenv').config(); } catch (e) { /* dotenv might not be installed */ }
console.log('Node version:', process.version);
console.log('Loaded dotenv:', !!process.env.DOTENV);
console.log('TEST_ENV before:', process.env.TEST_ENV);
if (process.env.TEST_ENV === 'expected_value') {
  console.log('PASS: TEST_ENV matches expected_value');
  process.exit(0);
} else {
  console.error('FAIL: TEST_ENV not set to expected_value');
  process.exit(1);
}
