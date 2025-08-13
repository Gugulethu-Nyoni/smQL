import { smQL } from './smQL.js';

// Create an instance with logging enabled (default)
const api = new smQL('http://localhost:3003', {}, { log: true });

async function updateUserShippingAddress(userId, addressPayload) {
  console.log(`Updating shipping address for user ID: ${userId}`);

  const response = await api.put(`/user/users/${userId}/shipping`, addressPayload);

  // Check the response for success (2xx status)
  if (response._ok) {
    if (response.error) {
      console.log(`✅ API request successful, but API reported an error: ${response.error}`);
    } else {
      console.log('✅ Shipping address updated successfully!');
      console.log('Updated address:', response);
    }
  } else {
    console.error(`❌ API request failed with status ${response._status}`);
    console.error('API Response:', response);
  }
}

// Example update payload
const newAddress = {
  street: '123 Main Street',
  city: 'Cape Town',
  postalCode: '8001',
  country: 'South Africa'
};

// Test the update function
updateUserShippingAddress(1, newAddress);
