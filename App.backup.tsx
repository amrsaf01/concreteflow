import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { DriverApp } from './components/DriverApp';
import { BotSimulator } from './components/BotSimulator';
import { Order, Vehicle } from './types';
import { api } from './src/services/api';
import { Truck, User, MessageSquare, RotateCcw } from 'lucide-react';

function App() {
    const [view, setView] = useState<'landing' | 'manager' | 'driver' | 'customer'>('landing');
    const [orders, setOrders] = useState<Order[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersData, vehiclesData] = await Promise.all([
                    api.getOrders(),
                    api.getVehicles()
                ]);
                setOrders(ordersData);
                setVehicles(vehiclesData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Action Handlers (Now using API) ---

    const handleCreateOrder = async (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => {
        try {
            const newOrder = await api.createOrder(order);
            setOrders(prev => [...prev, newOrder]);
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    const handleApproveOrder = async (orderId: string, vehicleId: string) => {
        try {
            // 1. Update Order
            const updatedOrder = await api.updateOrder(orderId, {
                status: 'approved',
                assignedVehicleId: vehicleId
            });

            // 2. Update Vehicle
            const updatedVehicle = await api.updateVehicle(vehicleId, {
                status: 'en_route',
                currentOrderId: orderId
            });

            // 3. Update Local State
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
        } catch (error) {
            console.error('Failed to approve order:', error);
        }
    };

    const handleRejectOrder = async (orderId: string) => {
        try {
            const updatedOrder = await api.updateOrder(orderId, { status: 'rejected' });
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        } catch (error) {
            console.error('Failed to reject order:', error);
        }
    };

    const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
        try {
            // If assigning a vehicle, we might need to update vehicle status too, 
            // but for drag-and-drop simple update we'll focus on the order first.
            // In a real app, this would be a transaction on the backend.
            const updatedOrder = await api.updateOrder(orderId, updates);

            // If vehicle changed, we should ideally update the old and new vehicle statuses.
            // For now, we'll assume the backend or a separate call handles complex logic,
            // but here we just update the order state.
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

            // If assignedVehicleId changed, refresh vehicles to be safe or handle optimistically
            if (updates.assignedVehicleId) {
                const vehiclesData = await api.getVehicles();
                setVehicles(vehiclesData);
            }
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const handleUpdateVehicleStatus = async (vehicleId: string, status: Vehicle['status']) => {
        try {
            const updatedVehicle = await api.updateVehicle(vehicleId, { status });
            setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
        } catch (error) {
            console.error('Failed to update vehicle:', error);
        }
    };

    const handleResetData = async () => {
        if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו תמחק את כל השינויים.')) {
            try {
                const data = await api.resetData();
                setOrders(data.orders);
                setVehicles(data.vehicles);
                alert('הנתונים אופסו בהצלחה!');
            } catch (error) {
                console.error('Failed to reset data:', error);
                alert('שגיאה באיפוס הנתונים');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-slate-800">טוען נתונים...</h2>
                    <p className="text-slate-500">מתחבר לשרת</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
            {view === 'landing' && (
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Concrete<span className="text-blue-600">Flow</span>
                        </h1>
                        <p className="text-xl text-slate-600">מערכת לניהול מפעל בטון - הדור הבא</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                        {/* Manager Card */}
                        <button
                            onClick={() => setView('manager')}
                            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-right overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Truck className="text-blue-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">מנהל משמרת</h2>
                            <p className="text-slate-500 leading-relaxed">
                                מרכז שליטה מלא: צפייה בהזמנות, שיבוץ רכבים, מעקב בזמן אמת וניהול הצי.
                            </p>
                        </button>

                        {/* Driver Card */}
                        <button
                            onClick={() => setView('driver')}
                            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-right overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User className="text-emerald-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">אפליקציית נהג</h2>
                            <p className="text-slate-500 leading-relaxed">
                                קבלת משימות, עדכון סטטוסים, ניווט ליעד וצפייה בפרטי הזמנה.
                            </p>
                        </button>

                        {/* Customer Card */}
                        <button
                            onClick={() => setView('customer')}
                            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-right overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare className="text-purple-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">בוט הזמנות</h2>
                            <p className="text-slate-500 leading-relaxed">
                                סימולטור הזמנה בוואטסאפ: יצירת הזמנה חדשה בצורה קלה ומהירה.
                            </p>
                        </button>
                    </div>

                    <div className="mt-12 flex gap-4">
                        <button
                            onClick={handleResetData}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                            <RotateCcw size={16} />
                            אפס נתונים (שרת)
                        </button>
                    </div>
                </div>
            )}

            {view === 'manager' && (
                <Dashboard
                    orders={orders}
                    vehicles={vehicles}
                    onApproveOrder={handleApproveOrder}
                    onRejectOrder={handleRejectOrder}
                    onUpdateOrder={handleUpdateOrder}
                    onNavigateToFleet={() => console.log('Navigate to fleet')}
                    onNavigateToCalendar={() => console.log('Navigate to calendar')}
                    onNavigateToDrivers={() => console.log('Navigate to drivers')}
                />
            )}

            {view === 'driver' && (
                <DriverApp
                    vehicles={vehicles}
                    orders={orders}
                    onUpdateVehicleStatus={handleUpdateVehicleStatus}
                    onUpdateOrder={handleUpdateOrder}
                    onBack={() => setView('landing')}
                />
            )}

            {view === 'customer' && (
                <BotSimulator
                    onOrderCreated={handleCreateOrder}
                    onBack={() => setView('landing')}
                />
            )}
        </div>
    );
}

export default App;
