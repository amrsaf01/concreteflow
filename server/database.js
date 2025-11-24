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
