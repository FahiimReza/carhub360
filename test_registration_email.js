require('dotenv').config();
const { sendRegistrationNotification } = require('./utils/emailService');

// Test user registration email notification
async function testRegistrationEmail() {
    console.log('🧪 Testing User Registration Email Notification...\n');
    
    // Sample user data for testing
    const testUserData = {
        id: 999,
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+8801234567890',
        role: 'user'
    };
    
    try {
        console.log('📤 Sending registration notification email...');
        console.log('User data:', testUserData);
        
        const result = await sendRegistrationNotification(testUserData);
        
        if (result.success) {
            console.log('✅ Registration notification email sent successfully!');
            console.log('Message ID:', result.messageId);
        } else {
            console.log('❌ Failed to send registration notification email');
            console.log('Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testRegistrationEmail()
    .then(() => {
        console.log('\n🏁 Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });