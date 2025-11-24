import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Helper to read DB
async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return default structure
        return {
            orders: [],
            vehicles: [],
            users: [],
            customers: [],
            products: [],
            priceLists: []
        };
    }
}

// Helper to write DB
async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// ============ USERS ============
app.get('/api/users', async (req, res) => {
    const db = await readDB();
    // Don't send passwords
    const safeUsers = (db.users || []).map(({ password, ...user }) => user);
    res.json(safeUsers);
});

app.post('/api/users', async (req, res) => {
    const db = await readDB();
    const newUser = { ...req.body, id: `U-${Date.now()}` };
    db.users = [...(db.users || []), newUser];
    await writeDB(db);
    const { password, ...safeUser } = newUser;
    res.json(safeUser);
});

app.put('/api/users/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.users || []).findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...req.body };
        await writeDB(db);
        const { password, ...safeUser } = db.users[index];
        res.json(safeUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const db = await readDB();
    db.users = (db.users || []).filter(u => u.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await readDB();
    const user = (db.users || []).find(u => u.username === username && u.password === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        await writeDB(db);

        const { password: _, ...safeUser } = user;
        res.json(safeUser); // Return user object directly to match frontend expectation
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// ============ ORDERS ============
app.get('/api/orders', async (req, res) => {
    const db = await readDB();
    res.json(db.orders || []);
});

app.post('/api/orders', async (req, res) => {
    const db = await readDB();
    const orderNumber = (db.orders || []).length + 1000; // Start from 1000
    const newOrder = {
        ...req.body,
        id: `ORD-${Date.now()}`,
        orderNumber: orderNumber.toString(),
        status: req.body.status || 'pending', // Default to pending if not specified
        createdAt: new Date().toISOString()
    };
    db.orders = [...(db.orders || []), newOrder];
    await writeDB(db);
    res.json(newOrder);
});

app.put('/api/orders/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.orders || []).findIndex(o => o.id === req.params.id);
    if (index !== -1) {
        db.orders[index] = { ...db.orders[index], ...req.body };
        await writeDB(db);
        res.json(db.orders[index]);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const db = await readDB();
    db.orders = (db.orders || []).filter(o => o.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

// ============ VEHICLES ============
app.get('/api/vehicles', async (req, res) => {
    const db = await readDB();
    res.json(db.vehicles || []);
});

app.post('/api/vehicles', async (req, res) => {
    const db = await readDB();
    const newVehicle = { ...req.body, id: `V-${Date.now()}` };
    db.vehicles = [...(db.vehicles || []), newVehicle];
    await writeDB(db);
    res.json(newVehicle);
});

app.put('/api/vehicles/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.vehicles || []).findIndex(v => v.id === req.params.id);
    if (index !== -1) {
        db.vehicles[index] = { ...db.vehicles[index], ...req.body };
        await writeDB(db);
        res.json(db.vehicles[index]);
    } else {
        res.status(404).json({ error: 'Vehicle not found' });
    }
});

app.delete('/api/vehicles/:id', async (req, res) => {
    const db = await readDB();
    db.vehicles = (db.vehicles || []).filter(v => v.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

// ============ CUSTOMERS ============
app.get('/api/customers', async (req, res) => {
    const db = await readDB();
    res.json(db.customers || []);
});

app.post('/api/customers', async (req, res) => {
    const db = await readDB();
    const newCustomer = { ...req.body, id: `C-${Date.now()}` };
    db.customers = [...(db.customers || []), newCustomer];
    await writeDB(db);
    res.json(newCustomer);
});

app.put('/api/customers/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.customers || []).findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        db.customers[index] = { ...db.customers[index], ...req.body };
        await writeDB(db);
        res.json(db.customers[index]);
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const db = await readDB();
    db.customers = (db.customers || []).filter(c => c.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

// ============ PRODUCTS ============
app.get('/api/products', async (req, res) => {
    const db = await readDB();
    res.json(db.products || []);
});

app.post('/api/products', async (req, res) => {
    const db = await readDB();
    const newProduct = { ...req.body, id: `P-${Date.now()}` };
    db.products = [...(db.products || []), newProduct];
    await writeDB(db);
    res.json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.products || []).findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        db.products[index] = { ...db.products[index], ...req.body };
        await writeDB(db);
        res.json(db.products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const db = await readDB();
    db.products = (db.products || []).filter(p => p.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

// ============ PRICE LISTS ============
app.get('/api/price-lists', async (req, res) => {
    const db = await readDB();
    res.json(db.priceLists || []);
});

app.post('/api/price-lists', async (req, res) => {
    const db = await readDB();
    const newPriceList = { ...req.body, id: `PL-${Date.now()}` };
    db.priceLists = [...(db.priceLists || []), newPriceList];
    await writeDB(db);
    res.json(newPriceList);
});

app.put('/api/price-lists/:id', async (req, res) => {
    const db = await readDB();
    const index = (db.priceLists || []).findIndex(pl => pl.id === req.params.id);
    if (index !== -1) {
        db.priceLists[index] = { ...db.priceLists[index], ...req.body };
        await writeDB(db);
        res.json(db.priceLists[index]);
    } else {
        res.status(404).json({ error: 'Price list not found' });
    }
});

app.delete('/api/price-lists/:id', async (req, res) => {
    const db = await readDB();
    db.priceLists = (db.priceLists || []).filter(pl => pl.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
