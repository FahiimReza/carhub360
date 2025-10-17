const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyAdminPassword() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'carhub360'
    });

    const [rows] = await db.execute('SELECT password FROM users WHERE email = ?', ['admin@carhub360.com']);
    
    if (rows.length === 0) {
      console.log('Admin user not found');
      return;
    }

    const storedHash = rows[0].password;
    console.log('Stored hash:', storedHash);

    const password = 'admin123';
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log('Password match for "admin123":', isMatch);

    // If not match, update it
    if (!isMatch) {
      const newHash = await bcrypt.hash(password, 10);
      await db.execute('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@carhub360.com']);
      console.log('Updated to new hash:', newHash);
      
      const newMatch = await bcrypt.compare(password, newHash);
      console.log('New match result:', newMatch);
    }

    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAdminPassword();