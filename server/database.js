import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://amrsaf01_db_user:I6KDdFr24be0BccE@concreteflow.jw02uki.mongodb.net/?appName=concreteflow';

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});

let db;

export async function connectDB() {
    try {
        await client.connect();
        db = client.db('concreteflow');
        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

export async function closeDB() {
    await client.close();
}
