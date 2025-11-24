import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://amrsaf01_db_user:I6KDdFr24be0BccE@concreteflow.jw02uki.mongodb.net/?appName=concreteflow';

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});

async function verify() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await client.connect();
        console.log('✅ Connected!');

        const db = client.db('concreteflow');
        const users = await db.collection('users').find({}).toArray();

        console.log('Found users:', users.length);
        users.forEach(u => {
            console.log(`- User: ${u.username}, Password: ${u.password}, Role: ${u.role}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

verify();
