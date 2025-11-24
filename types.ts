

export type OrderStatus = 'pending' | 'approved' | 'waiting_for_vehicle' | 'assigned' | 'en_route' | 'at_site' | 'pouring' | 'completed' | 'rejected';
export type VehicleType = 'mixer' | 'pump';
export type VehicleStatus = 'available' | 'en_route' | 'at_site' | 'pouring' | 'returning' | 'maintenance' | 'off_duty';
export type ConcreteGrade = 'B20' | 'B25' | 'B30' | 'B35' | 'B40' | 'B50';

export interface Order {
  id: string;
  orderNumber: string;
  companyName: string; // The paying entity

  // Site Contact (The person receiving the concrete)
  siteContactName: string;
  siteContactPhone: string;

  // Supervisor/Office (The person approving/overseeing)
  supervisorName?: string;
  supervisorPhone?: string;

  quantity: number; // cubic meters
  grade: ConcreteGrade;
  address: string;
  deliveryTime: string; // ISO string
  pumpRequired: boolean;
  status: OrderStatus;
  assignedVehicleIds?: string[];
  notes?: string;
  createdAt: string;

  // Queue management
  queuePosition?: number;  // Position in waiting queue (1, 2, 3...)
  queuedAt?: string;       // ISO string - when added to queue

  // Notification flags
  remindersSent?: boolean;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: VehicleType;
  driverName: string;
  status: VehicleStatus;
  currentOrderId?: string;
  capacity: number; // cubic meters
}

export interface Stats {
  totalOrders: number;
  pendingOrders: number;
  activeFleet: number;
  completedToday: number;
  volumeDelivered: number;
}

export type UserRole = 'owner' | 'manager' | 'dispatcher' | 'driver' | 'customer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string; // Only used for initial creation/updates, not stored in frontend state
  lastLogin?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'concrete' | 'pump' | 'additive';
  unit: 'm3' | 'hour' | 'kg' | 'fixed';
  basePrice: number;
}

export interface PriceList {
  id: string;
  name: string;
  customerId?: string; // If null, it's a base/default list
  items: {
    productId: string;
    price: number;
  }[];
  createdAt: string;
}
