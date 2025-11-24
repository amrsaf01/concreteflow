
import { Order, Vehicle } from './types';

// Mock Database of registered clients (CRM)
// Maps Phone Number -> Client Profile
export const KNOWN_CLIENTS: Record<string, { 
  company: string; 
  siteName: string; 
  supervisorName: string; 
  supervisorPhone: string; 
}> = {
  '052-9876543': { 
    company: 'סולל בונה', 
    siteName: 'מוחמד חליל (מנהל עבודה)', 
    supervisorName: 'יוסי מזרחי (מפקח)',
    supervisorPhone: '050-9999999'
  },
  '054-5555555': { 
    company: 'דניה סיבוס', 
    siteName: 'אבי כהן (אתר ראשי)',
    supervisorName: 'דני רופ (מהנדס חברה)',
    supervisorPhone: '050-8888888'
  },
  '050-1112222': { 
    company: 'אשטרום בע״מ', 
    siteName: 'רוני לוי',
    supervisorName: 'משרד ראשי',
    supervisorPhone: '03-1234567'
  },
};

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', vehicleNumber: 'מיקסר-01', type: 'mixer', driverName: 'דוד כהן', status: 'available', capacity: 10 },
  { id: 'v2', vehicleNumber: 'מיקסר-02', type: 'mixer', driverName: 'איברהים חליל', status: 'en_route', currentOrderId: 'o2', capacity: 10 },
  { id: 'v3', vehicleNumber: 'מיקסר-03', type: 'mixer', driverName: 'יוסי לוי', status: 'returning', capacity: 12 },
  { id: 'v4', vehicleNumber: 'מיקסר-04', type: 'mixer', driverName: 'אחמד אגבריה', status: 'maintenance', capacity: 10 },
  { id: 'v5', vehicleNumber: 'משאבה-א', type: 'pump', driverName: 'רון גולן', status: 'at_site', currentOrderId: 'o3', capacity: 0 },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-1001',
    companyName: 'בנייה נכונה בע״מ',
    siteContactName: 'ישראל ישראלי',
    siteContactPhone: '050-1234567',
    supervisorName: 'משה המפקח',
    supervisorPhone: '052-2223333',
    quantity: 8,
    grade: 'B30',
    address: 'הרצל 45, תל אביב',
    deliveryTime: '2023-10-24T08:00:00',
    pumpRequired: false,
    status: 'pending',
    createdAt: '2023-10-23T14:30:00',
  },
  {
    id: 'o2',
    orderNumber: 'ORD-1002',
    companyName: 'סולל בונה',
    siteContactName: 'מוחמד חליל',
    siteContactPhone: '052-9876543',
    supervisorName: 'יוסי מזרחי',
    supervisorPhone: '050-9999999',
    quantity: 24,
    grade: 'B40',
    address: 'רחוב הנמל, חיפה',
    deliveryTime: '2023-10-24T09:30:00',
    pumpRequired: true,
    status: 'en_route',
    assignedVehicleId: 'v2',
    createdAt: '2023-10-23T15:00:00',
  },
  {
    id: 'o3',
    orderNumber: 'ORD-1003',
    companyName: 'דניה סיבוס',
    siteContactName: 'אבי כהן',
    siteContactPhone: '054-5555555',
    supervisorName: 'דני רופ',
    supervisorPhone: '050-8888888',
    quantity: 12,
    grade: 'B25',
    address: 'רוטשילד 10, תל אביב',
    deliveryTime: '2023-10-24T11:00:00',
    pumpRequired: true,
    status: 'at_site',
    assignedVehicleId: 'v5',
    createdAt: '2023-10-23T16:00:00',
  },
  {
    id: 'o4',
    orderNumber: 'ORD-1004',
    companyName: 'אשטרום בע״מ',
    siteContactName: 'רוני לוי',
    siteContactPhone: '050-1112222',
    supervisorName: 'משרד ראשי',
    supervisorPhone: '03-1234567',
    quantity: 6,
    grade: 'B30',
    address: 'דרך בגין 100, תל אביב',
    deliveryTime: '2023-10-24T13:00:00',
    pumpRequired: false,
    status: 'pending',
    createdAt: '2023-10-24T07:00:00',
  },
];
