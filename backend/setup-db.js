const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 MongoDB Atlas Setup Helper\n');

rl.question('Enter your MongoDB Atlas connection string: ', async (uri) => {
  if (!uri.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string! It should start with mongodb+srv://');
    rl.close();
    return;
  }

  rl.question('Enter your database name (default: academic_intelligence): ', (dbName) => {
    const databaseName = dbName || 'academic_intelligence';
    const fullUri = uri.includes(databaseName) ? uri : uri + databaseName;
    
    testConnection(fullUri);
    rl.close();
  });
});

async function testConnection(uri) {
  console.log('\n📡 Testing connection...');
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connection successful!\n');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database Information:');
    console.log(`   Name: ${db.databaseName}`);
    console.log(`   Collections: ${collections.length}`);
    
    // Update .env file
    const fs = require('fs');
    const envContent = `PORT=5000\nMONGODB_URI=${uri}\nJWT_SECRET=${generateSecret()}\nJWT_EXPIRE=7d\nNODE_ENV=development\n`;
    
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file updated with your MongoDB URI!\n');
    
    console.log('🎉 Setup complete! Run your app with: npm run dev');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your username and password');
    console.log('2. Go to Network Access → Add IP 0.0.0.0/0');
    console.log('3. Wait 2 minutes for changes to apply');
    process.exit(1);
  }
}

function generateSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}