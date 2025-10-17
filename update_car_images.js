const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'carhub360'
};

// Map car model names to their directory names
const modelToDirectoryMap = {
  'Corolla Altis': 'toyota_corolla_altis',
  'Allion / Premio': 'toyota_allion_premio',
  'City': 'honda_city',
  'Civic': 'honda_civic',
  'Creta': 'hyundai_creta',
  'Sonet': 'kia_sonet',
  'Xpander': 'mitsubishi_xpander',
  'Sylphy': 'nissan_sylphy',
  'Fortuner': 'toyota_fortuner',
  'D-Max': 'isuzu_dmax',
  'X70': 'proton_x70',
  'Hector': 'mg_hector',
  'Trailblazer': 'chevrolet_trailblazer',
  'Model S Plaid': 'tesla_model_s_plaid',
  'Model 3 Performance': 'tesla_model_3_performance',
  'Model X': 'tesla_model_x',
  'Model Y': 'tesla_model_y',
  '911 Carrera': 'porsche_911_carrera',
  'Taycan': 'porsche_taycan',
  'Cayenne Turbo': 'porsche_cayenne_turbo',
  'Macan': 'porsche_macan',
  'Huracán': 'lamborghini_huracan',
  'Urus': 'lamborghini_urus',
  'F8 Tributo': 'ferrari_f8_tributo',
  'Roma': 'ferrari_roma',
  '720S': 'mclaren_720s',
  'Artura': 'mclaren_artura',
  'DB11': 'aston_martin_db11',
  'Vantage': 'aston_martin_vantage',
  'Phantom': 'rolls-royce_phantom',
  'Cullinan': 'rolls-royce_cullinan',
  'Continental GT': 'bentley_continental_gt',
  'Bentayga': 'bentley_bentayga',
  'M3': 'bmw_m3',
  'M5': 'bmw_m5',
  'X5 M': 'bmw_x5_m',
  'i7': 'bmw_i7',
  'C-Class': 'mercedes-benz_c-class',
  'E-Class': 'mercedes-benz_e-class',
  'AMG GT': 'mercedes-benz_amg_gt',
  'S-Class': 'mercedes-benz_s-class',
  'Maybach S-Class': 'mercedes-benz_maybach_s-class',
  'A4': 'audi_a4',
  'A6': 'audi_a6',
  'RS7': 'audi_rs7',
  'Q8': 'audi_q8',
  'e-tron GT': 'audi_e-tron_gt',
  'F-Type': 'jaguar_f-type',
  'I-PACE': 'jaguar_i-pace',
  'Defender': 'land_rover_defender',
  'Range Rover Vogue': 'land_rover_range_rover_vogue',
  'Discovery': 'land_rover_discovery',
  'Ioniq 5': 'hyundai_ioniq_5',
  'Ioniq 6': 'hyundai_ioniq_6',
  'EV6': 'kia_ev6',
  'Telluride': 'kia_telluride',
  'Leaf': 'nissan_leaf',
  'GT-R': 'nissan_gt-r',
  'Supra': 'toyota_supra',
  'RAV4': 'toyota_rav4',
  'Land Cruiser 300': 'toyota_land_cruiser_300'
};

async function updateCarImages() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Fetching cars from database...');
    const [cars] = await connection.execute(`
      SELECT c.id, cm.model_name 
      FROM cars c 
      JOIN car_models cm ON c.model_id = cm.id
    `);
    
    console.log(`Found ${cars.length} cars in database`);
    
    for (const car of cars) {
      const directoryName = modelToDirectoryMap[car.model_name];
      
      if (!directoryName) {
        console.log(`No directory mapping found for model: ${car.model_name}`);
        continue;
      }
      
      const directoryPath = path.join(__dirname, 'assets', 'car-images', directoryName);
      
      // Check if directory exists
      if (!fs.existsSync(directoryPath)) {
        console.log(`Directory not found for ${car.model_name}: ${directoryPath}`);
        continue;
      }
      
      // Get image files in directory
      const files = fs.readdirSync(directoryPath).filter(file => 
        file.endsWith('.jpg') || 
        file.endsWith('.jpeg') || 
        file.endsWith('.png') || 
        file.endsWith('.webp')
      );
      
      if (files.length === 0) {
        console.log(`No image files found in directory for ${car.model_name}`);
        continue;
      }
      
      // Update car_images table with actual image paths
      console.log(`Updating images for ${car.model_name} (ID: ${car.id})`);
      
      // Delete existing placeholder images for this car
      await connection.execute(
        'DELETE FROM car_images WHERE car_id = ? AND image_url = ?',
        [car.id, '/assets/car-images/placeholder.jpg']
      );
      
      // Add new image paths
      for (let i = 0; i < files.length; i++) {
        const imagePath = `/assets/car-images/${directoryName}/${files[i]}`;
        const isPrimary = i === 0;
        
        await connection.execute(
          'INSERT INTO car_images (car_id, image_url, is_primary, image_type, alt_text, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [car.id, imagePath, isPrimary, 'exterior', `${car.model_name} image ${i + 1}`, i]
        );
      }
      
      console.log(`Updated ${files.length} images for ${car.model_name}`);
    }
    
    console.log('Image update completed successfully!');
    
  } catch (error) {
    console.error('Error updating car images:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the update function
updateCarImages();