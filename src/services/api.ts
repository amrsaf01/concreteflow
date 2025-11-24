import { Order, Vehicle, User, Customer, Product, PriceList } from '../../types';

const API_URL = 'http://localhost:3001/api';

export const api = {
    // Orders
    getOrders: async (): Promise<Order[]> => {
        const res = await fetch(`${API_URL}/orders`);
        return res.json();
    },

    createOrder: async (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        });
        return res.json();
    },

    updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return res.json();
    },

    // Vehicles
    getVehicles: async (): Promise<Vehicle[]> => {
        const res = await fetch(`${API_URL}/vehicles`);
        return res.json();
    },

    updateVehicle: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
        const res = await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return res.json();
    },

    createVehicle: async (vehicle: Omit<Vehicle, 'id' | 'status'>): Promise<Vehicle> => {
        const res = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicle),
        });
        return res.json();
    },

    deleteVehicle: async (id: string): Promise<void> => {
        await fetch(`${API_URL}/vehicles/${id}`, { method: 'DELETE' });
    },

    // Auth
    login: async (username: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    // User Management
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_URL}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    createUser: async (user: Partial<User>): Promise<User> => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    deleteUser: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete user');
    },

    // --- CRM ---

    // Customers
    getCustomers: async (): Promise<Customer[]> => {
        const res = await fetch(`${API_URL}/customers`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
    },

    createCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
        const res = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer),
        });
        if (!res.ok) throw new Error('Failed to create customer');
        return res.json();
    },

    updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
        const res = await fetch(`${API_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update customer');
        return res.json();
    },

    deleteCustomer: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete customer');
    },

    // Products
    getProducts: async (): Promise<Product[]> => {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    createProduct: async (product: Partial<Product>): Promise<Product> => {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
    },

    updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
    },

    deleteProduct: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete product');
    },

    // Price Lists
    getPriceLists: async (): Promise<PriceList[]> => {
        const res = await fetch(`${API_URL}/price-lists`);
        if (!res.ok) throw new Error('Failed to fetch price lists');
        return res.json();
    },

    createPriceList: async (priceList: Partial<PriceList>): Promise<PriceList> => {
        const res = await fetch(`${API_URL}/price-lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(priceList),
        });
        if (!res.ok) throw new Error('Failed to create price list');
        return res.json();
    },

    updatePriceList: async (id: string, updates: Partial<PriceList>): Promise<PriceList> => {
        const res = await fetch(`${API_URL}/price-lists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update price list');
        return res.json();
    },

    deletePriceList: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/price-lists/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete price list');
    },

    // Reset
    resetData: async () => {
        const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
        return res.json();
    }
};
