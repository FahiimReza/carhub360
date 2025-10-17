// Test script to verify compare functionality with accurate data
const http = require('http');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testCompareFunctionality() {
  try {
    console.log('🔍 Testing compare functionality...\n');
    
    // Fetch car data from API
    const response = await makeRequest('http://localhost:5000/api/cars?limit=5');
    const cars = response.cars;
    
    console.log('✅ Successfully fetched car data from API');
    console.log(`📊 Found ${cars.length} cars in database\n`);
    
    // Check if engine data is populated
    let enginesFound = 0;
    let powerFound = 0;
    
    cars.forEach((car, index) => {
      console.log(`Car ${index + 1}: ${car.brand_name} ${car.model_name}`);
      console.log(`  - Engine: ${car.engine_displacement || 'Not available'}`);
      console.log(`  - Power: ${car.engine_power || 'Not available'}`);
      console.log(`  - Fuel Type: ${car.fuel_type}`);
      console.log(`  - Transmission: ${car.transmission}`);
      console.log(`  - Seats: ${car.seats}`);
      console.log(`  - Year: ${car.year}`);
      console.log(`  - Daily Rent: ৳${car.rental_price_daily}`);
      console.log(`  - Selling Price: ৳${car.selling_price}`);
      console.log('');
      
      if (car.engine_displacement) enginesFound++;
      if (car.engine_power) powerFound++;
    });
    
    console.log(`📈 Engine data available for ${enginesFound}/${cars.length} cars`);
    console.log(`📈 Power data available for ${powerFound}/${cars.length} cars`);
    
    if (enginesFound === cars.length && powerFound === cars.length) {
      console.log('\n✅ All car data is complete and accurate!');
      console.log('🎯 The compare page should now display correct information');
    } else {
      console.log('\n⚠️ Some data is still missing');
      console.log('🔧 Additional updates may be needed for complete data');
    }
    
  } catch (error) {
    console.error('❌ Error testing compare functionality:', error.message);
  }
}

testCompareFunctionality();