const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'carhub360'
    });

    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@carhub360.com']);
    console.log('Admin password updated successfully to hash:', hashedPassword);
    await db.end();
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

updateAdminPassword();