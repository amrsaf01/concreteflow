import fs from 'fs/promises';
import { connectDB } from './database.js';

async function migrateData() {
    console.log('🚀 Starting data migration from db.json to MongoDB...');

    try {
        // Read db.json
        const data = JSON.parse(await fs.readFile('./server/db.json', 'utf-8'));

        // Connect to MongoDB
        const db = await connectDB();

        // Migrate each collection
        const collections = ['orders', 'vehicles', 'drivers', 'users', 'customers', 'products', 'priceLists'];

        for (const collectionName of collections) {
            if (data[collectionName] && data[collectionName].length > 0) {
                const collection = db.collection(collectionName);

                // Clear existing data
                await collection.deleteMany({});

                // Insert new data
                await collection.insertMany(data[collectionName]);

                console.log(`✅ Migrated ${data[collectionName].length} ${collectionName}`);
            }
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
