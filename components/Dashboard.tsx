import React, { useState } from 'react';
import { Order, Vehicle } from '../types';
import {
  LayoutDashboard,
  Truck,
  Users,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Package
} from 'lucide-react';
import { LiveOperations } from './LiveOperations';
import { DispatchCalendar } from './DispatchCalendar';
import { AssignmentModal } from './AssignmentModal';
import { Reports } from './Reports';
import { WaitingQueueWidget } from './WaitingQueueWidget';

interface DashboardProps {
  orders: Order[];
  vehicles: Vehicle[];
  onApproveOrder: (orderId: string, vehicleId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddToQueue: (orderId: string) => void;
  onMoveInQueue: (orderId: string, direction: 'up' | 'down') => void;
  onRemoveFromQueue: (orderId: string) => void;
  onNavigateToFleet: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToDrivers: () => void;
}

export function Dashboard({
  orders,
  vehicles,
  onApproveOrder,
  onRejectOrder,
  onUpdateOrder,
  onAddToQueue,
  onMoveInQueue,
  onRemoveFromQueue,
  onNavigateToFleet,
  onNavigateToCalendar,
  onNavigateToDrivers
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'reports'>('overview');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<Order | null>(null);
  const [showApproveMenu, setShowApproveMenu] = useState<string | null>(null); // orderId with open menu

  // Calculate Stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeVehicles = vehicles.filter(v => v.status !== 'off_duty' && v.status !== 'maintenance');
  const totalVolume = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.quantity, 0);

  // Upcoming Orders for Widget
  const now = new Date();
  const next4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const upcomingOrders = orders.filter(o => {
    const orderDate = new Date(o.deliveryTime);
    return orderDate > now && orderDate < next4Hours && o.status !== 'rejected' && o.status !== 'completed';
  }).sort((a, b) => new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime());

  const handleSendReminder = (orderId: string) => {
    alert(`נשלחה תזכורת בוקר ללקוח (SMS + WhatsApp) עבור הזמנה ${orderId}`);
  };

  const handleOpenAssignment = (order: Order) => {
    setSelectedOrderForAssignment(order);
    setIsAssignmentModalOpen(true);
  };

  const handleConfirmAssignment = (vehicleId: string) => {
    if (selectedOrderForAssignment) {
      onApproveOrder(selectedOrderForAssignment.id, vehicleId);
      setIsAssignmentModalOpen(false);
      setSelectedOrderForAssignment(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="text-blue-600" />
                מרכז שליטה
              </h1>
              <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  מבט על
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  לוח שיבוצים
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'reports'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  דוחות
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Schedule Widget */}
              {upcomingOrders.length > 0 && (
                <div className="hidden lg:flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  <Clock size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    הבא: {upcomingOrders[0].companyName} ({upcomingOrders[0].quantity} מ"ק) ב-{(upcomingOrders[0].deliveryTime || '').split('T')[1] || '??:??'}
                  </span>
                </div>
              )}

              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                <Bell size={20} />
                {pendingOrders.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                מנ
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">היום</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{orders.length}</div>
                <div className="text-sm text-slate-500">סה"כ הזמנות</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="text-orange-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    {pendingOrders.length} ממתינות
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{pendingOrders.length}</div>
                <div className="text-sm text-slate-500">הזמנות לטיפול</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Truck className="text-emerald-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {activeVehicles.length} פעילים
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{activeVehicles.length}/{vehicles.length}</div>
                <div className="text-sm text-slate-500">צי רכב זמין</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{totalVolume}</div>
                <div className="text-sm text-slate-500">מ"ק סופק היום</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area (Map & Lists) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Live Map */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-slate-400" />
                      מפת תפעול בזמן אמת
                    </h2>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        בדרך
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        יוצק
                      </span>
                    </div>
                  </div>
                  <div className="h-[400px] bg-slate-50 relative">
                    <LiveOperations orders={orders} vehicles={vehicles} />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg">פעילות אחרונה</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                            order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                            {order.status === 'completed' ? <CheckCircle size={18} /> :
                              order.status === 'pending' ? <Clock size={18} /> :
                                <Truck size={18} />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{order.companyName}</div>
                            <div className="text-sm text-slate-500">
                              {order.quantity} מ"ק • {order.grade} • {order.address}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900">
                            {(order.deliveryTime || '').split('T')[1] || '??:??'}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status === 'pending' ? 'ממתין לאישור' :
                              order.status === 'approved' ? 'מאושר' :
                                order.status === 'en_route' ? 'בדרך' :
                                  order.status === 'at_site' ? 'באתר' :
                                    order.status === 'pouring' ? 'יוצק' :
                                      'הושלם'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar (Incoming Orders & Quick Actions) */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onNavigateToFleet}
                    className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all text-center group"
                  >
                    <Truck className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">ניהול צי</span>
                  </button>
                  <button
                    onClick={onNavigateToDrivers}
                    className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all text-center group"
                  >
                    <Users className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">נהגים</span>
                  </button>
                </div>

                {/* Incoming Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
                    <h2 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                      <AlertCircle size={18} className="text-orange-600" />
                      הזמנות נכנסות
                    </h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {pendingOrders.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {pendingOrders.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <CheckCircle className="mx-auto mb-2 opacity-20" size={48} />
                        <p>אין הזמנות חדשות</p>
                      </div>
                    ) : (
                      pendingOrders.map(order => (
                        <div key={order.id} className="p-4 hover:bg-orange-50/30 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900">{order.companyName}</h3>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin size={12} /> {order.address}
                              </p>
                            </div>
                            <div className="text-left">
                              <span className="block font-mono font-bold text-slate-700">
                                {(order.deliveryTime || '').split('T')[1] || '??:??'}
                              </span>
                              <span className="text-xs text-slate-400">היום</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mb-4">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                              {order.quantity} מ"ק
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                              {order.grade}
                            </span>
                            {order.pumpRequired && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                                משאבה
                              </span>
                            )}
                          </div>


                          <div className="flex gap-2">
                            {/* Approve Dropdown */}
                            <div className="flex-1 relative">
                              <button
                                onClick={() => setShowApproveMenu(showApproveMenu === order.id ? null : order.id)}
                                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded shadow border border-gray-700 hover:bg-black transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={14} />
                                אשר
                              </button>

                              {/* Dropdown Menu */}
                              {showApproveMenu === order.id && (
                                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      handleOpenAssignment(order);
                                      setShowApproveMenu(null);
                                    }}
                                    className="w-full text-right px-3 py-2 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-2"
                                  >
                                    <CheckCircle size={14} />
                                    שבץ מיד
                                  </button>
                                  <button
                                    onClick={() => {
                                      onAddToQueue(order.id);
                                      setShowApproveMenu(null);
                                    }}
                                    className="w-full text-right px-3 py-2 text-sm hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors flex items-center gap-2 border-t border-slate-100"
                                  >
                                    <Clock size={14} />
                                    הוסף לתור
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => onRejectOrder(order.id)}
                              className="px-3 py-2 border border-slate-200 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-slate-400"
                            >
                              <AlertCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleSendReminder(order.id)}
                              className="px-3 py-2 border border-slate-200 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors text-slate-400"
                              title="שלח תזכורת"
                            >
                              <Bell size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Waiting Queue Widget */}
                <WaitingQueueWidget
                  orders={orders.filter(o => o.status === 'waiting_for_vehicle')}
                  vehicles={vehicles}
                  onMoveUp={(orderId) => onMoveInQueue(orderId, 'up')}
                  onMoveDown={(orderId) => onMoveInQueue(orderId, 'down')}
                  onAssignNow={(orderId) => {
                    const order = orders.find(o => o.id === orderId);
                    if (order) handleOpenAssignment(order);
                  }}
                  onRemoveFromQueue={onRemoveFromQueue}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'calendar' ? (
          <DispatchCalendar
            orders={orders}
            vehicles={vehicles}
            onUpdateOrder={onUpdateOrder}
            onBack={() => setActiveTab('overview')}
          />
        ) : (
          <Reports orders={orders} vehicles={vehicles} />
        )}
      </main>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        order={selectedOrderForAssignment}
        vehicles={vehicles}
      />
    </div >
  );
}
