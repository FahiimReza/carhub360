require('dotenv').config();

// Test script to create a real service booking and verify email notification
async function testLiveServiceBooking() {
    console.log('🧪 Testing Live Service Booking with Email Notification...\n');
    
    const BASE_URL = 'http://localhost:5000';
    
    try {
        // Step 1: Create a test user first
        console.log('📝 Step 1: Creating test user...');
        const userResponse = await fetch(`${BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test Service Customer',
                email: `testservice${Date.now()}@example.com`,
                password: 'testpassword123',
                phone: '+8801234567890',
                address: '123 Test Street',
                city: 'Dhaka'
            })
        });
        
        if (!userResponse.ok) {
            throw new Error(`Failed to create test user: ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        console.log('✅ Test user created successfully');
        console.log('User ID:', userData.user.id);
        console.log('User Email:', userData.user.email);
        
        // Step 2: Get available services
        console.log('\n📋 Step 2: Fetching available services...');
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
        
        // Step 3: Create a service booking
        console.log('\n🔧 Step 3: Creating service booking...');
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 2); // Schedule for 2 days from now
        
        const bookingResponse = await fetch(`${BASE_URL}/api/services/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userData.user.id,
                service_id: testService.id,
                car_id: null,
                scheduled_date: scheduledDate.toISOString(),
                total_price: testService.base_price,
                service_location: '123 Test Street, Dhaka, Bangladesh',
                customer_notes: 'This is a test service booking for email notification verification. Customer needs oil change and general maintenance.'
            })
        });
        
        if (!bookingResponse.ok) {
            throw new Error(`Failed to create service booking: ${bookingResponse.statusText}`);
        }
        
        const bookingData = await bookingResponse.json();
        console.log('✅ Service booking created successfully');
        console.log('Booking ID:', bookingData.bookingId);
        console.log('Booking Reference:', bookingData.booking_reference);
        
        console.log('\n📧 Email notification should have been sent to:', process.env.ADMIN_EMAIL);
        console.log('📋 Please check your admin email for the service booking notification');
        console.log('📊 The email should include:');
        console.log('   - Service details (name, category, price)');
        console.log('   - Customer information');
        console.log('   - Scheduled date and time');
        console.log('   - Service location');
        console.log('   - Quick action buttons for admin');
        
        console.log('\n🏁 Test completed successfully!');
        console.log('💡 If you received the email notification, the service booking email system is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testLiveServiceBooking()
    .then(() => {
        console.log('\n✨ Test execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test execution failed:', error);
        process.exit(1);
    });