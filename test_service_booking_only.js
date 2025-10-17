require('dotenv').config();

// Test script to create a service booking using existing user and verify only one email is sent
async function testServiceBookingOnly() {
    console.log('🧪 Testing Service Booking Only (No New User Registration)...\n');
    
    const BASE_URL = 'http://localhost:5000';
    
    try {
        // Use existing user ID instead of creating a new one
        const existingUserId = 32; // Using the user we created earlier
        
        // Step 1: Get available services
        console.log('📋 Step 1: Fetching available services...');
        const servicesResponse = await fetch(`${BASE_URL}/api/services`);
        
        if (!servicesResponse.ok) {
            throw new Error(`Failed to fetch services: ${servicesResponse.statusText}`);
        }
        
        const servicesData = await servicesResponse.json();
        const services = servicesData.services || [];
        
        if (services.length === 0) {
            throw new Error('No services available for testing');
        }
        
        const testService = services[0];
        console.log('✅ Found available service');
        console.log('Service Name:', testService.service_name);
        console.log('Service Category:', testService.category);
        console.log('Service Price:', testService.base_price);
        
        // Step 2: Create a service booking using existing user
        console.log('\n🔧 Step 2: Creating service booking with existing user...');
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 2); // Schedule for 2 days from now
        
        const bookingResponse = await fetch(`${BASE_URL}/api/services/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: existingUserId,
                service_id: testService.id,
                car_id: null,
                scheduled_date: scheduledDate.toISOString(),
                total_price: testService.base_price,
                service_location: '789 Existing User Street, Dhaka, Bangladesh',
                customer_notes: 'This is a test service booking using existing user to verify only ONE email is sent.'
            })
        });
        
        if (!bookingResponse.ok) {
            throw new Error(`Failed to create service booking: ${bookingResponse.statusText}`);
        }
        
        const bookingData = await bookingResponse.json();
        console.log('✅ Service booking created successfully');
        console.log('Booking ID:', bookingData.bookingId);
        console.log('Booking Reference:', bookingData.booking_reference);
        console.log('Using Existing User ID:', existingUserId);
        
        console.log('\n📧 Only ONE email notification should have been sent to:', process.env.ADMIN_EMAIL);
        console.log('📋 Please check your admin email - you should see only the SERVICE BOOKING notification');
        console.log('📊 The email should include:');
        console.log('   - Service details (name, category, price)');
        console.log('   - Customer information');
        console.log('   - Scheduled date and time');
        console.log('   - Service location');
        console.log('   - Quick action buttons for admin');
        
        console.log('\n🏁 Test completed successfully!');
        console.log('💡 If you received only ONE email notification (for service booking), the system is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testServiceBookingOnly()
    .then(() => {
        console.log('\n✨ Test execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test execution failed:', error);
        process.exit(1);
    });