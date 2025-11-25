import React, { useState, useEffect, useRef } from 'react';
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
  Package,
  Activity,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Edit2
} from 'lucide-react';
import { LiveOperations } from './LiveOperations';
import { DispatchCalendar } from './DispatchCalendar';
import { AssignmentModal } from './AssignmentModal';
import { EditOrderModal } from './EditOrderModal';
import { Reports } from './Reports';
import { WaitingQueueWidget } from './WaitingQueueWidget';
import { analyzeOrder, getOrderProgress } from '../src/utils/smartDispatch';

interface DashboardProps {
  orders: Order[];
  vehicles: Vehicle[];
  onApproveOrder: (orderId: string, vehicleIds: string[]) => void;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'calendar' | 'reports'>('overview');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<Order | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [showApproveMenu, setShowApproveMenu] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastOrderCount, setLastOrderCount] = useState(orders.length);
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);

  // Calculate Stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeVehicles = vehicles.filter(v => v.status !== 'off_duty' && v.status !== 'maintenance');
  const totalVolume = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.quantity, 0);

  // Smart Alerts
  const activeOrders = orders.filter(o => ['en_route', 'at_site', 'pouring'].includes(o.status));
  const alerts = activeOrders.map(order => {
    const analysis = analyzeOrder(order);
    if (analysis.alertLevel !== 'none') {
      return { order, analysis };
    }
    return null;
  }).filter(Boolean);

  // Ticker Events
  const tickerEvents = [
    ...alerts.map(a => ({ type: 'alert', text: `⚠️ ${a?.order.companyName}: ${a?.analysis.alertMessage}` })),
    ...pendingOrders.map(o => ({ type: 'info', text: `🔔 הזמנה חדשה: ${o.companyName} (${o.quantity} מ"ק)` })),
    { type: 'status', text: `🚛 ${activeVehicles.length} רכבים פעילים כרגע` }
  ];

  // Clock & Ticker Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTickerIndex(prev => (prev + 1) % (tickerEvents.length || 1));
    }, 1000); // Update clock every second, ticker logic handled inside
    return () => clearInterval(timer);
  }, [tickerEvents.length]);

  // Reset ticker index if out of bounds
  useEffect(() => {
    if (tickerIndex >= tickerEvents.length) {
      setTickerIndex(0);
    }
  }, [tickerEvents.length, tickerIndex]);

  // New Order Alert Effect
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      setShowNewOrderAlert(true);
      // Play sound (optional, browser policy might block)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));

      setTimeout(() => setShowNewOrderAlert(false), 5000);
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  const handleOpenAssignment = (order: Order) => {
    setSelectedOrderForAssignment(order);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  const handleConfirmAssignment = (vehicleIds: string[]) => {
    if (selectedOrderForAssignment) {
      onApproveOrder(selectedOrderForAssignment.id, vehicleIds);
      setIsAssignmentModalOpen(false);
      setSelectedOrderForAssignment(null);
    }
  };

  const handleSaveEdit = (orderId: string, updates: Partial<Order>) => {
    onUpdateOrder(orderId, updates);
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
  };

  // Timeline View Components
  const TimelineView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 6); // 06:00 to 18:00
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Activity className="text-blue-600" />
            ציר זמן תפעולי (Timeline)
          </h2>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> בדרך</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> יוצק</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded"></span> משאבה</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-4">
            {/* Time Header */}
            <div className="flex border-b border-slate-100 pb-2 mb-4">
              <div className="w-32 shrink-0"></div>
              <div className="flex-1 relative h-6">
                {hours.map(hour => (
                  <div key={hour} className="absolute text-xs text-slate-400 transform -translate-x-1/2" style={{ left: `${((hour - 6) / 12) * 100}%` }}>
                    {hour}:00
                  </div>
                ))}
                {/* Current Time Indicator */}
                {currentHour >= 6 && currentHour <= 18 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${((currentHour - 6) / 12) * 100}%`, height: '100vh' }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Rows */}
            <div className="space-y-4">
              {activeVehicles.map(vehicle => {
                const vehicleOrders = orders.filter(o =>
                  (o.assignedVehicleIds?.includes(vehicle.id) || o.id === vehicle.currentOrderId) &&
                  ['en_route', 'at_site', 'pouring', 'completed'].includes(o.status)
                );

                return (
                  <div key={vehicle.id} className="flex items-center group hover:bg-slate-50 rounded-lg p-2 transition-colors">
                    <div className="w-32 shrink-0">
                      <div className="font-bold text-slate-800">{vehicle.vehicleNumber}</div>
                      <div className="text-xs text-slate-500">{vehicle.driverName}</div>
                    </div>
                    <div className="flex-1 relative h-10 bg-slate-100 rounded-lg overflow-hidden">
                      {vehicleOrders.map(order => {
                        // Mock start time for visualization if not real
                        const startHour = order.startTime ? new Date(order.startTime).getHours() : 8;
                        const duration = 2; // Mock duration in hours
                        const left = ((startHour - 6) / 12) * 100;
                        const width = (duration / 12) * 100;

                        return (
                          <div
                            key={order.id}
                            className={`absolute top-1 bottom-1 rounded px-2 text-xs text-white flex items-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity
                              ${order.status === 'pouring' ? 'bg-emerald-500' : 'bg-blue-500'}
                            `}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${order.companyName} - ${order.status}`}
                            onClick={() => handleOpenEdit(order)}
                          >
                            <span className="truncate">{order.companyName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* New Order Alert Overlay */}
      {showNewOrderAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 font-bold text-lg">
            <Bell className="animate-bounce" />
            התקבלה הזמנה חדשה!
          </div>
        </div>
      )}

      {/* Pulse Bar (Top) */}
      <div className="bg-slate-900 text-white text-sm py-2 px-4 flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-bold text-blue-400 flex items-center gap-1">
            <Activity size={14} /> מרכז שליטה
          </span>
          <div className="h-4 w-px bg-slate-700"></div>
        </div>

        {/* Live Ticker */}
        <div className="flex-1 mx-8 relative h-5 overflow-hidden">
          {tickerEvents.length > 0 && (
            <div key={tickerIndex} className="animate-in slide-in-from-bottom duration-500 absolute inset-0 flex items-center justify-center">
              {tickerEvents[tickerIndex]?.text || ''}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0 text-slate-400 text-xs">
          <span>{currentTime.toLocaleDateString('he-IL')}</span>
        </div>
      </div>

      {/* Main Header with War Room Clock */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> {/* Increased height for clock */}
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="text-blue-600" />
                ConcreteFlow
              </h1>

              {/* War Room Clock */}
              <div className="hidden lg:flex items-center gap-2 bg-black text-green-500 font-mono text-3xl px-4 py-2 rounded-lg shadow-inner border border-slate-700 tracking-widest">
                {currentTime.toLocaleTimeString('he-IL', { hour12: false })}
              </div>

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
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'timeline'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  ציר זמן
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
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                <Bell size={24} />
                {(pendingOrders.length > 0 || alerts.length > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                מנ
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Smart Alerts Banner */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${alert?.analysis.alertLevel === 'critical'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                <div className="flex items-center gap-3">
                  <AlertCircle />
                  <span className="font-bold">{alert?.order.companyName}:</span>
                  <span>{alert?.analysis.alertMessage}</span>
                </div>
                <button className="text-sm font-bold underline hover:opacity-80">טפל בבעיה</button>
              </div>
            ))}
          </div>
        )}

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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="ערוך הזמנה"
                          >
                            <Edit2 size={16} />
                          </button>
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
                              onClick={() => handleOpenEdit(order)}
                              className="px-3 py-2 border border-slate-200 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors text-slate-400"
                              title="ערוך"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => onRejectOrder(order.id)}
                              className="px-3 py-2 border border-slate-200 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-slate-400"
                            >
                              <AlertCircle size={14} />
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
        ) : activeTab === 'timeline' ? (
          <TimelineView />
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

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        order={selectedOrderForEdit}
      />
    </div >
  );
}
