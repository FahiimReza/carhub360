require('dotenv').config();
const { testEmailConfiguration, sendBookingNotification, sendMessageNotification } = require('./utils/emailService');

// Test email configuration
async function testEmailConfig() {
    console.log('Testing email configuration...');
    const result = await testEmailConfiguration();
    console.log('Email configuration test result:', result);
}

// Test booking notification email
async function testBookingEmail() {
    console.log('Testing booking notification email...');
    
    const mockBookingData = {
        booking_reference: 'BK123456789',
        booking_type: 'rental',
        total_amount: 5000,
        rental_start_date: '2023-12-01',
        rental_end_date: '2023-12-05',
        total_days: 4,
        special_requests: 'Please provide GPS navigation system'
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
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+8801712345678'
    };
    
    const result = await sendBookingNotification(mockBookingData, mockCarData, mockUserData);
    console.log('Booking email test result:', result);
}

// Test message notification email
async function testMessageEmail() {
    console.log('Testing message notification email...');
    
    const mockMessageData = {
        subject: 'Inquiry about car rental',
        message: 'I would like to inquire about renting a Toyota Camry for next week. Please provide availability and pricing information.',
        conversationId: '12345'
    };
    
    const mockUserData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+8801712345679'
    };
    
    const result = await sendMessageNotification(mockMessageData, mockUserData);
    console.log('Message email test result:', result);
}

// Run tests
async function runTests() {
    console.log('=== Email Service Tests ===\n');
    
    // Test 1: Email configuration
    await testEmailConfig();
    console.log('\n');
    
    // Test 2: Booking notification
    await testBookingEmail();
    console.log('\n');
    
    // Test 3: Message notification
    await testMessageEmail();
    console.log('\n=== Tests Complete ===');
}

// Check if this file is being run directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testEmailConfig,
    testBookingEmail,
    testMessageEmail,
    runTests
};