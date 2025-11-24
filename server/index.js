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
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('users').updateOne({ id }, { $set: req.body });
        const user = await getCollection('users').findOne({ id }, { projection: { password: 0 } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('users').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ LOGIN ============
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await getCollection('users').findOne({ username, password });

        if (user) {
            await getCollection('users').updateOne(
                { id: user.id },
                { $set: { lastLogin: new Date().toISOString() } }
            );
            const { password: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ORDERS ============
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await getCollection('orders').find({}).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        await getCollection('orders').insertOne(newOrder);
        res.json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('orders').updateOne({ id }, { $set: req.body });
        const order = await getCollection('orders').findOne({ id });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('orders').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ VEHICLES ============
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await getCollection('vehicles').find({}).toArray();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vehicles', async (req, res) => {
    try {
        const newVehicle = {
            id: `V-${Date.now()}`,
            ...req.body
        };
        await getCollection('vehicles').insertOne(newVehicle);
        res.json(newVehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('vehicles').updateOne({ id }, { $set: req.body });
        const vehicle = await getCollection('vehicles').findOne({ id });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('vehicles').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ CUSTOMERS ============
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await getCollection('customers').find({}).toArray();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = {
            id: `C-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        await getCollection('customers').insertOne(newCustomer);
        res.json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('customers').updateOne({ id }, { $set: req.body });
        const customer = await getCollection('customers').findOne({ id });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await getCollection('customers').deleteOne({ id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ PRODUCTS ============
app.get('/api/products', async (req, res) => {
    try {
        const products = await getCollection('products').find({}).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = {
            id: `P-${Date.now()}`,
            ...req.body
        };
        await getCollection('products').insertOne(newProduct);
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
