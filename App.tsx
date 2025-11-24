import React, { useState, useEffect } from 'react';
import { Truck, User, MessageSquare, RotateCcw, LogOut, Users } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { DriverApp } from './components/DriverApp';
import { FleetRoster } from './components/FleetRoster';
import { TeamManagement } from './components/TeamManagement';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { BotSimulator } from './components/BotSimulator';
import { DriversList } from './components/DriversList';
import { CustomerList } from './components/crm/CustomerList';
import { FinancialManager } from './components/finance/FinancialManager';
import { api } from './src/services/api';
import { Order, Vehicle } from './types';

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'landing' | 'manager' | 'driver' | 'customer' | 'fleet' | 'drivers-list' | 'team' | 'customers' | 'finance'>('landing');
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
        status: 'en_route',
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

  const handleCreateVehicle = async (vehicle: Omit<Vehicle, 'id' | 'status'>) => {
    try {
      const newVehicle = await api.createVehicle(vehicle);
      setVehicles(prev => [...prev, newVehicle]);
      setView('fleet'); // Return to fleet view
    } catch (error) {
      console.error('Failed to create vehicle:', error);
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to remove vehicle:', error);
    }
  };

  // Queue Management Handlers
  const handleAddToQueue = async (orderId: string) => {
    try {
      // Find max queue position
      const maxPosition = Math.max(
        0,
        ...orders
          .filter(o => o.status === 'waiting_for_vehicle')
          .map(o => o.queuePosition || 0)
      );

      const updatedOrder = await api.updateOrder(orderId, {
        status: 'waiting_for_vehicle',
        queuePosition: maxPosition + 1,
        queuedAt: new Date().toISOString()
      });

      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  };

  const handleMoveInQueue = async (orderId: string, direction: 'up' | 'down') => {
    try {
      const queueOrders = orders.filter(o => o.status === 'waiting_for_vehicle').sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
      const currentOrder = queueOrders.find(o => o.id === orderId);
      if (!currentOrder || !currentOrder.queuePosition) return;

      const currentPosition = currentOrder.queuePosition;
      const targetPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1;

      // Find the other order to swap with
      const otherOrder = queueOrders.find(o => o.queuePosition === targetPosition);
      if (!otherOrder) return;

      // Swap positions
      await api.updateOrder(currentOrder.id, { queuePosition: targetPosition });
      await api.updateOrder(otherOrder.id, { queuePosition: currentPosition });

      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === currentOrder.id) return { ...o, queuePosition: targetPosition };
        if (o.id === otherOrder.id) return { ...o, queuePosition: currentPosition };
        return o;
      }));
    } catch (error) {
      console.error('Failed to move in queue:', error);
    }
  };

  const handleRemoveFromQueue = async (orderId: string) => {
    try {
      const updatedOrder = await api.updateOrder(orderId, {
        status: 'pending',
        queuePosition: undefined,
        queuedAt: undefined
      });

      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (error) {
      console.error('Failed to remove from queue:', error);
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

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
              <div className="bg-orange-500 p-2 rounded-lg">
                <Truck size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">ConcreteFlow</span>
                <span className="text-xs text-slate-400 block">מערכת לניהול מפעל בטון</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full">
                <User size={16} />
                <span>{user.name} ({user.role})</span>
              </div>

              {(user.role === 'owner' || user.role === 'manager') && (
                <>
                  <button
                    onClick={() => setView('customers')}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    title="ניהול לקוחות"
                  >
                    <Users size={20} />
                  </button>
                  <button
                    onClick={() => setView('finance')}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    title="ניהול פיננסי"
                  >
                    <span className="font-bold text-lg">₪</span>
                  </button>
                  <button
                    onClick={() => setView('team')}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    title="ניהול צוות"
                  >
                    <Users size={20} />
                  </button>
                </>
              )}

              <button
                onClick={logout}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                title="התנתק"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            {/* Manager Dashboard - Only for owners and managers */}
            {(user.role === 'owner' || user.role === 'manager') && (
              <button
                onClick={() => setView('manager')}
                className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-500/20 text-right"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all" />
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="text-blue-600" size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">מנהל משמרת</h2>
                <p className="text-slate-500 text-sm">ניהול הזמנות, שיבוץ רכבים וצפייה בדוחות בזמן אמת</p>
              </button>
            )}

            {/* Driver App - For all users */}
            <button
              onClick={() => setView('driver')}
              className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-emerald-500/20 text-right"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-2 transition-all" />
              <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">נהג</h2>
              <p className="text-slate-500 text-sm">קבלת משימות, עדכון סטטוס וניווט ליעדים</p>
            </button>

            {/* Bot Simulator - Only for owners and managers */}
            {(user.role === 'owner' || user.role === 'manager') && (
              <button
                onClick={() => setView('customer')}
                className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-500/20 text-right"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 group-hover:w-2 transition-all" />
                <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-purple-600" size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">לקוח / בוט</h2>
                <p className="text-slate-500 text-sm">ביצוע הזמנות חדשות ובירור סטטוס מול הבוט החכם</p>
              </button>
            )}
          </div>
        )}

        {view === 'manager' && (
          <Dashboard
            orders={orders}
            vehicles={vehicles}
            onApproveOrder={handleApproveOrder}
            onRejectOrder={handleRejectOrder}
            onUpdateOrder={handleUpdateOrder}
            onAddToQueue={handleAddToQueue}
            onMoveInQueue={handleMoveInQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
            onNavigateToFleet={() => setView('fleet')}
            onNavigateToCalendar={() => console.log('Navigate to calendar')}
            onNavigateToDrivers={() => setView('drivers-list')}
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

        {view === 'fleet' && (
          <FleetRoster
            vehicles={vehicles}
            onUpdateStatus={handleUpdateVehicleStatus}
            onAddVehicle={handleCreateVehicle}
            onRemoveVehicle={handleRemoveVehicle}
            onBack={() => setView('manager')}
          />
        )}

        {view === 'drivers-list' && (
          <DriversList
            vehicles={vehicles}
            onBack={() => setView('manager')}
          />
        )}

        {view === 'team' && (
          <TeamManagement
            onBack={() => setView('landing')}
          />
        )}

        {view === 'customers' && (
          <CustomerList
            onBack={() => setView('landing')}
          />
        )}

        {view === 'finance' && (
          <FinancialManager
            onBack={() => setView('landing')}
          />
        )}
      </main>

      {/* Reset Button (Debug) */}
      <button
        onClick={handleResetData}
        className="fixed bottom-4 left-4 p-3 bg-red-100 text-red-600 rounded-full shadow-lg hover:bg-red-200 transition-colors z-50"
        title="אפס נתונים"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;