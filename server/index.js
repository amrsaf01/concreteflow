import express from 'express';
import cors from 'cors';
import { connectDB, getDB } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize MongoDB connection
await connectDB();

app.use(cors());
app.use(express.json());

// Helper function to get collection
const getCollection = (name) => getDB().collection(name);

// ============ USERS ============
app.get('/api/users', async (req, res) => {
    try {
        const users = await getCollection('users').find({}).project({ password: 0 }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = {
            id: `U-${Date.now()}`,
            ...req.body,
            lastLogin: null
        };
        await getCollection('users').insertOne(newUser);
        const { password, ...userWithoutPassword } = newUser;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
        res.json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('products').updateOne({ id }, { $set: req.body });
        const product = await getCollection('products').findOne({ id });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('products').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ PRICE LISTS ============
app.get('/api/price-lists', async (req, res) => {
    try {
        const priceLists = await getCollection('priceLists').find({}).toArray();
        res.json(priceLists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/price-lists', async (req, res) => {
    try {
        const newPriceList = {
            id: `PL-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        await getCollection('priceLists').insertOne(newPriceList);
        res.json(newPriceList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/price-lists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('priceLists').updateOne({ id }, { $set: req.body });
        const priceList = await getCollection('priceLists').findOne({ id });
        res.json(priceList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/price-lists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('priceLists').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
