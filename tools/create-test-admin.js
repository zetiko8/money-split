#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createTestAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'testadmin';
  
  // Hash the password using bcrypt (same as in authentication.ts)
  const hash = bcrypt.hashSync(password, 10);
  
  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'main',
    port: parseInt(process.env.MYSQL_PORT || '13308'),
  });

  try {
    console.log('👤 Creating test admin...');
    console.log(`   Username: ${username}`);
    
    // Check if owner already exists
    const [existingOwners] = await connection.execute(
      'SELECT id FROM Owner WHERE username = ?',
      [username]
    );
    
    let ownerId;
    
    if (existingOwners.length > 0) {
      ownerId = existingOwners[0].id;
      console.log(`   ⚠️  Owner already exists (ID: ${ownerId})`);
      
      // Update the password hash
      await connection.execute(
        'UPDATE Owner SET hash = ? WHERE id = ?',
        [hash, ownerId]
      );
      console.log('   ✅ Updated password hash');
    } else {
      // Insert new owner
      const [result] = await connection.execute(
        `INSERT INTO Owner (username, hash, avatarId, \`key\`)
         VALUES (?, ?, ?, ?)`,
        [username, hash, 1, `admin-${Date.now()}`]
      );
      ownerId = result.insertId;
      console.log(`   ✅ Created new owner (ID: ${ownerId})`);
    }
    
    // Check if ADMIN role already exists
    const [existingRoles] = await connection.execute(
      'SELECT * FROM OwnerRole WHERE ownerId = ? AND role = ?',
      [ownerId, 'ADMIN']
    );
    
    if (existingRoles.length === 0) {
      // Insert ADMIN role
      await connection.execute(
        'INSERT INTO OwnerRole (ownerId, role) VALUES (?, ?)',
        [ownerId, 'ADMIN']
      );
      console.log('   ✅ Added ADMIN role');
    } else {
      console.log('   ⚠️  ADMIN role already exists');
    }
    
    console.log('✅ Test admin ready!');
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the script
createTestAdmin().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
