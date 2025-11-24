import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

async function readDb() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        return {
            orders: [],
            vehicles: [],
            users: [],
            customers: [],
            products: [],
            priceLists: [],
            ...parsed
        };
    } catch (error) {
        console.error('Error reading DB:', error);
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

async function writeDb(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.get('/api/data', async (req, res) => {
    const data = await readDb();
    res.json(data);
});

// Get Orders
app.get('/api/orders', async (req, res) => {
    const data = await readDb();
    res.json(data.orders);
});

// Create Order
app.post('/api/orders', async (req, res) => {
    const data = await readDb();
    const orderCount = data.orders.length;
    const newOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber: `${1000 + orderCount + 1}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...req.body
    };
    data.orders.push(newOrder);
    await writeDb(data);
    res.status(201).json(newOrder);
});

// Update Order
app.put('/api/orders/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    const index = data.orders.findIndex(o => o.id === id);
    if (index !== -1) {
        data.orders[index] = { ...data.orders[index], ...updates };
        await writeDb(data);
        res.json(data.orders[index]);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Get Vehicles
app.get('/api/vehicles', async (req, res) => {
    const data = await readDb();
    res.json(data.vehicles);
});

// Update Vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    const index = data.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
        data.vehicles[index] = { ...data.vehicles[index], ...updates };
        await writeDb(data);
        res.json(data.vehicles[index]);
    } else {
        res.status(404).json({ error: 'Vehicle not found' });
    }
});

// Create Vehicle
app.post('/api/vehicles', async (req, res) => {
    const data = await readDb();
    const newVehicle = {
        id: `V-${Date.now()}`, // Simple ID generation
        status: 'available',
        ...req.body
    };
    data.vehicles.push(newVehicle);
    await writeDb(data);
    res.status(201).json(newVehicle);
});

// Delete Vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;

    const initialLength = data.vehicles.length;
    data.vehicles = data.vehicles.filter(v => v.id !== id);

    if (data.vehicles.length < initialLength) {
        await writeDb(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Vehicle not found' });
    }
});

// Reset Data (for testing)
app.post('/api/reset', async (req, res) => {
    const initialData = {
        orders: [
            {
                id: "ORD-001",
                companyName: "בנייה נכונה בע״מ",
                orderNumber: "1001",
                quantity: 12,
                grade: "B30",
                address: "רחוב הירקון 45, תל אביב",
                deliveryTime: new Date().toISOString().split('T')[0] + "T08:00:00",
                status: "en_route",
                pumpRequired: true,
                assignedVehicleId: "V-001"
            },
            {
                id: "ORD-002",
                companyName: "אשטרום בע״מ",
                orderNumber: "1002",
                quantity: 8,
                grade: "B40",
                address: "שדרות רוטשילד 10, תל אביב",
                deliveryTime: new Date().toISOString().split('T')[0] + "T10:30:00",
                status: "pending",
                pumpRequired: false
            }
        ],
        vehicles: [
            {
                id: "V-001",
                vehicleNumber: "99-123-45",
                driverName: "יוסי כהן",
                status: "en_route",
                type: "mixer",
                capacity: 12,
                currentOrderId: "ORD-001"
            },
            {
                id: "V-002",
                vehicleNumber: "88-555-22",
                driverName: "דני לוי",
                status: "available",
                type: "mixer",
                capacity: 10
            },
            {
                id: "V-003",
                vehicleNumber: "77-999-11",
                driverName: "אבי ביטון",
                status: "at_site",
                type: "pump",
                capacity: 0,
                currentOrderId: "ORD-003"
            },
            {
                id: "V-004",
                vehicleNumber: "66-111-33",
                driverName: "משה דיין",
                status: "maintenance",
                type: "mixer",
                capacity: 12
            }
        ],
        users: [
            {
                id: "U-001",
                username: "admin",
                name: "Admin User",
                role: "owner",
                password: "admin123",
                lastLogin: ""
            }
        ]
    };
    await writeDb(initialData);
    res.json(initialData);
});

// Login
// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const data = await readDb();

    const user = data.users?.find(u => u.username === username && u.password === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        await writeDb(data);

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// --- User Management ---

// Get Users
app.get('/api/users', async (req, res) => {
    const data = await readDb();
    // Return users without passwords
    const safeUsers = data.users?.map(({ password, ...u }) => u) || [];
    res.json(safeUsers);
});

// Create User
app.post('/api/users', async (req, res) => {
    const data = await readDb();
    const newUser = {
        id: `U-${Date.now()}`,
        lastLogin: null,
        ...req.body
    };

    if (!data.users) data.users = [];

    // Check if username exists
    if (data.users.find(u => u.username === newUser.username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    data.users.push(newUser);
    await writeDb(data);

    const { password, ...safeUser } = newUser;
    res.status(201).json(safeUser);
});

// Update User
app.put('/api/users/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    if (!data.users) return res.status(404).json({ error: 'User not found' });

    const index = data.users.findIndex(u => u.id === id);
    if (index !== -1) {
        // If updating password, keep it, otherwise preserve existing
        const updatedUser = { ...data.users[index], ...updates };

        // Don't allow removing password if not supplied
        if (!updates.password) {
            updatedUser.password = data.users[index].password;
        }

        data.users[index] = updatedUser;
        await writeDb(data);

        const { password, ...safeUser } = updatedUser;
        res.json(safeUser);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;

    if (!data.users) return res.status(404).json({ error: 'User not found' });

    const initialLength = data.users.length;
    data.users = data.users.filter(u => u.id !== id);

    if (data.users.length < initialLength) {
        await writeDb(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- CRM: Customers ---

app.get('/api/customers', async (req, res) => {
    const data = await readDb();
    res.json(data.customers || []);
});

app.post('/api/customers', async (req, res) => {
    const data = await readDb();
    const newCustomer = {
        id: `C-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...req.body
    };
    if (!data.customers) data.customers = [];
    data.customers.push(newCustomer);
    await writeDb(data);
    res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    if (!data.customers) return res.status(404).json({ error: 'Customer not found' });

    const index = data.customers.findIndex(c => c.id === id);
    if (index !== -1) {
        data.customers[index] = { ...data.customers[index], ...updates };
        await writeDb(data);
        res.json(data.customers[index]);
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;

    if (!data.customers) return res.status(404).json({ error: 'Customer not found' });

    const initialLength = data.customers.length;
    data.customers = data.customers.filter(c => c.id !== id);

    if (data.customers.length < initialLength) {
        await writeDb(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

// --- CRM: Products ---

app.get('/api/products', async (req, res) => {
    const data = await readDb();
    res.json(data.products || []);
});

app.post('/api/products', async (req, res) => {
    const data = await readDb();
    const newProduct = {
        id: `P-${Date.now()}`,
        ...req.body
    };
    if (!data.products) data.products = [];
    data.products.push(newProduct);
    await writeDb(data);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    if (!data.products) return res.status(404).json({ error: 'Product not found' });

    const index = data.products.findIndex(p => p.id === id);
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...updates };
        await writeDb(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;

    if (!data.products) return res.status(404).json({ error: 'Product not found' });

    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);

    if (data.products.length < initialLength) {
        await writeDb(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// --- CRM: Price Lists ---

app.get('/api/price-lists', async (req, res) => {
    const data = await readDb();
    res.json(data.priceLists || []);
});

app.post('/api/price-lists', async (req, res) => {
    const data = await readDb();
    const newList = {
        id: `PL-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...req.body
    };
    if (!data.priceLists) data.priceLists = [];
    data.priceLists.push(newList);
    await writeDb(data);
    res.status(201).json(newList);
});

app.put('/api/price-lists/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;
    const updates = req.body;

    if (!data.priceLists) return res.status(404).json({ error: 'Price list not found' });

    const index = data.priceLists.findIndex(pl => pl.id === id);
    if (index !== -1) {
        data.priceLists[index] = { ...data.priceLists[index], ...updates };
        await writeDb(data);
        res.json(data.priceLists[index]);
    } else {
        res.status(404).json({ error: 'Price list not found' });
    }
});

app.delete('/api/price-lists/:id', async (req, res) => {
    const data = await readDb();
    const { id } = req.params;

    if (!data.priceLists) return res.status(404).json({ error: 'Price list not found' });

    const initialLength = data.priceLists.length;
    data.priceLists = data.priceLists.filter(pl => pl.id !== id);

    if (data.priceLists.length < initialLength) {
        await writeDb(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Price list not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
