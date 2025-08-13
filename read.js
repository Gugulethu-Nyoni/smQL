import { smQL } from './smQL.js';

// Create an instance with logging enabled (default)
const api = new smQL('http://localhost:3003', {}, { log: true });

async function fetchUserShippingAddress(userId) {
  console.log(`Testing API for user ID: ${userId}`);

  const response = await api.get(`/user/users/${userId}/shipping`);

  // Check the response for success (2xx status)
  if (response._ok) {
    // Check if the successful response contains an error message
    if (response.error) {
      console.log(`✅ API request successful, but no address found: ${response.error}`);
    } else {
      console.log('✅ API request successful and address found!');
      console.log('Shipping address:', response);
    }
  } else {
    // This handles non-2xx status codes like 404, 400, etc.
    console.error(`❌ API request failed with status ${response._status}`);
    console.error('API Response:', response);
  }
}

// Scenario 1: Test with a user who does NOT have a shipping address.
// This will return a 404 with a message.
fetchUserShippingAddress(1);