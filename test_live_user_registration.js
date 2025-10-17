require('dotenv').config();

// Test script to create a real user registration and verify email notification
async function testLiveUserRegistration() {
    console.log('🧪 Testing Live User Registration with Email Notification...\n');
    
    const BASE_URL = 'http://localhost:5000';
    
    try {
        // Create a test user
        console.log('📝 Creating test user for registration...');
        const timestamp = Date.now();
        
        const userResponse = await fetch(`${BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test Email User',
                email: `testemail${timestamp}@example.com`,
                password: 'testpassword123',
                phone: '+8809876543210',
                address: '456 Email Test Street',
                city: 'Dhaka'
            })
        });
        
        if (!userResponse.ok) {
            throw new Error(`Failed to create test user: ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        console.log('✅ Test user registered successfully');
        console.log('User ID:', userData.user.id);
        console.log('User Email:', userData.user.email);
        console.log('User Name:', userData.user.name);
        
        console.log('\n📧 Email notification should have been sent to:', process.env.ADMIN_EMAIL);
        console.log('📋 Please check your admin email for the user registration notification');
        console.log('📊 The email should include:');
        console.log('   - User details (name, email, phone)');
        console.log('   - Registration date and time');
        console.log('   - User ID and account type');
        console.log('   - Quick action buttons for admin');
        
        console.log('\n🏁 User registration test completed successfully!');
        console.log('💡 If you received the email notification, the user registration email system is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testLiveUserRegistration()
    .then(() => {
        console.log('\n✨ Test execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test execution failed:', error);
        process.exit(1);
    });