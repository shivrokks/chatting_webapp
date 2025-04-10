const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = '';
let chatId = '';
let firstUserId = '';
let secondUserId = '';

// Add timestamp to make email unique on each run
const timestamp = Date.now();
const email1 = `testuser_${timestamp}@example.com`;
const email2 = `seconduser_${timestamp}@example.com`;

// Utility function to log results
const logResult = (title, data, error = null) => {
  console.log('\n' + '='.repeat(50));
  console.log(`TEST: ${title}`);
  console.log('-'.repeat(50));

  if (error) {
    console.log('❌ ERROR:', error.response ? error.response.data : error.message);
  } else {
    console.log('✅ SUCCESS');
    console.log(data);
  }
  console.log('='.repeat(50) + '\n');
};

// Run all tests sequentially
const runTests = async () => {
  try {
    console.log('🚀 Starting API tests...\n');
    console.log(`Using test emails: ${email1} and ${email2}`);

    // 1. Register first user
    await testRegister('Test User', email1, 'password123');

    // 2. Register second user for chat testing
    await testRegister('Second User', email2, 'password123', true);

    // 3. Login as first user
    await testLogin(email1, 'password123');

    // 4. Search users
    await testSearchUsers('Second');

    // 5. Get online users
    await testGetOnlineUsers();

    // 6. Send friend request
    await testSendFriendRequest();

    // 7. Accept friend request (login as second user)
    await testLogin(email2, 'password123', true);
    await testAcceptFriendRequest();

    // Login back as first user
    await testLogin(email1, 'password123');

    // 8. Create a chat
    await testAccessChat();

    // 9. Fetch all chats
    await testFetchChats();

    // 10. Send a message
    await testSendMessage();

    // 11. Get messages
    await testGetMessages();

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
};

// Test Registration
const testRegister = async (name, email, password, saveSecondUser = false) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password
    });

    if (saveSecondUser) {
      secondUserId = response.data._id;
    } else {
      firstUserId = response.data._id;
      authToken = response.data.token;
    }

    logResult(`Register user: ${email}`, response.data);
    return response.data;
  } catch (error) {
    logResult(`Register user: ${email}`, null, error);
    throw error;
  }
};

// Test Login
const testLogin = async (email, password, isSecondUser = false) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    authToken = response.data.token;

    if (!isSecondUser) {
      firstUserId = response.data._id;
    }

    logResult(`Login user: ${email}`, response.data);
    return response.data;
  } catch (error) {
    logResult(`Login user: ${email}`, null, error);
    throw error;
  }
};

// Test Search Users
const testSearchUsers = async (searchQuery) => {
  try {
    const response = await axios.get(`${API_URL}/users/search?search=${searchQuery}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Search Users', response.data);
    return response.data;
  } catch (error) {
    logResult('Search Users', null, error);
    throw error;
  }
};

// Test Get Online Users
const testGetOnlineUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/online`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Get Online Users', response.data);
    return response.data;
  } catch (error) {
    logResult('Get Online Users', null, error);
    throw error;
  }
};

// Test Send Friend Request
const testSendFriendRequest = async () => {
  try {
    const response = await axios.post(`${API_URL}/users/request/${secondUserId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Send Friend Request', response.data);
    return response.data;
  } catch (error) {
    logResult('Send Friend Request', null, error);
    throw error;
  }
};

// Test Accept Friend Request
const testAcceptFriendRequest = async () => {
  try {
    const response = await axios.post(`${API_URL}/users/accept/${firstUserId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Accept Friend Request', response.data);
    return response.data;
  } catch (error) {
    logResult('Accept Friend Request', null, error);
    throw error;
  }
};

// Test Access Chat (Create or Retrieve)
const testAccessChat = async () => {
  try {
    const response = await axios.post(`${API_URL}/chats`, {
      userId: secondUserId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    chatId = response.data._id;

    logResult('Access Chat', response.data);
    return response.data;
  } catch (error) {
    logResult('Access Chat', null, error);
    throw error;
  }
};

// Test Fetch All Chats
const testFetchChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Fetch All Chats', response.data);
    return response.data;
  } catch (error) {
    logResult('Fetch All Chats', null, error);
    throw error;
  }
};

// Test Send Message
const testSendMessage = async () => {
  try {
    const response = await axios.post(`${API_URL}/messages`, {
      content: "Hello, this is a test message!",
      chatId: chatId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Send Message', response.data);
    return response.data;
  } catch (error) {
    logResult('Send Message', null, error);
    throw error;
  }
};

// Test Get Messages
const testGetMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    logResult('Get Messages', response.data);
    return response.data;
  } catch (error) {
    logResult('Get Messages', null, error);
    throw error;
  }
};

// Run all tests
runTests();
