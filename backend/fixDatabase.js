const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB!');
    
    // Get a reference to the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // List all indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    console.log(indexes);
    
    // Drop the problematic username index if it exists
    const usernameIndex = indexes.find(index => 
      index.name === 'username_1' || 
      (index.key && index.key.username)
    );
    
    if (usernameIndex) {
      console.log('Found username index, dropping it...');
      await collection.dropIndex(usernameIndex.name);
      console.log('Index dropped successfully!');
    } else {
      console.log('Username index not found. Checking other collections...');
      
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      // Check each collection for the problematic index
      for (const collInfo of collections) {
        const coll = db.collection(collInfo.name);
        const collIndexes = await coll.indexes();
        
        const problemIndex = collIndexes.find(index => 
          index.name === 'username_1' || 
          (index.key && index.key.username)
        );
        
        if (problemIndex) {
          console.log(`Found username index in collection ${collInfo.name}, dropping it...`);
          await coll.dropIndex(problemIndex.name);
          console.log(`Index dropped from ${collInfo.name} successfully!`);
        }
      }
    }
    
    // Clear the users collection to start fresh
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} users to start fresh.`);
    
    console.log('Database fixed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

fixDatabase();