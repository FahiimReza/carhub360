require('dotenv').config();
const { sendServiceBookingNotification } = require('./utils/emailService');

// Test service booking email notification
async function testServiceBookingEmail() {
    console.log('🧪 Testing Service Booking Email Notification...\n');
    
    // Sample booking data for testing
    const testBookingData = {
        booking_reference: 'SV1694835299123',
        scheduled_date: '2023-10-20T14:30:00',
        total_amount: 3500,
        service_location: '123 Main Street, Dhaka, Bangladesh',
        customer_notes: 'Customer requested oil change and brake inspection. Car model: Toyota Corolla 2020'
    };
    
    // Sample service data for testing
    const testServiceData = {
        service_name: 'Full Service Package',
        category: 'General Maintenance'
    };
    
    // Sample user data for testing
    const testUserData = {
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '+8801234567890'
    };
    
    try {
        console.log('📤 Sending service booking notification email...');
        console.log('Booking data:', testBookingData);
        console.log('Service data:', testServiceData);
        console.log('User data:', testUserData);
        
        const result = await sendServiceBookingNotification(testBookingData, testServiceData, testUserData);
        
        if (result.success) {
            console.log('✅ Service booking notification email sent successfully!');
            console.log('Message ID:', result.messageId);
        } else {
            console.log('❌ Failed to send service booking notification email');
            console.log('Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testServiceBookingEmail()
    .then(() => {
        console.log('\n🏁 Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });