require('dotenv').config();
const { sendBookingNotification, sendMessageNotification } = require('./utils/emailService');

// Test multiple admin emails
async function testMultipleAdmins() {
    console.log('=== Testing Multiple Admin Emails ===\n');
    
    // Show which admin emails will receive notifications
    const adminEmails = process.env.ADMIN_EMAIL || 'admin@carhub360.com';
    const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
    
    console.log('Admin emails that will receive notifications:');
    emailList.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
    });
    console.log('\n');
    
    // Test booking notification
    console.log('Testing booking notification to multiple admins...');
    const mockBookingData = {
        booking_reference: 'BK' + Date.now(),
        booking_type: 'rental',
        total_amount: 5000,
        rental_start_date: '2023-12-01',
        rental_end_date: '2023-12-05',
        total_days: 4,
        special_requests: 'Multiple admin test - please confirm receipt'
    };
    
    const mockCarData = {
        brand_name: 'Toyota',
        model_name: 'Camry',
        variant_name: 'LE',
        year: 2023,
        fuel_type: 'petrol',
        transmission: 'automatic'
    };
    
    const mockUserData = {
        name: 'Multiple Admin Test',
        email: 'test@example.com',
        phone: '+8801712345678'
    };
    
    const bookingResult = await sendBookingNotification(mockBookingData, mockCarData, mockUserData);
    console.log('Booking notification result:', bookingResult);
    console.log('\n');
    
    // Test message notification
    console.log('Testing message notification to multiple admins...');
    const mockMessageData = {
        subject: 'Multiple Admin Test Message',
        message: 'This is a test to verify all admin emails receive notifications simultaneously. Please confirm you received this email.',
        conversationId: 'MULTI-' + Date.now()
    };
    
    const messageResult = await sendMessageNotification(mockMessageData, mockUserData);
    console.log('Message notification result:', messageResult);
    console.log('\n');
    
    console.log('=== Test Complete ===');
    console.log('Please check ALL admin email inboxes for the test notifications.');
}

// Run the test
testMultipleAdmins().catch(console.error);