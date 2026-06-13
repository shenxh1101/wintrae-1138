export interface DashboardStats {
  todaySales: number;
  todaySalesGrowth: number;
  todayTraffic: number;
  todayTrafficGrowth: number;
  todayOrders: number;
  todayAvgOrder: number;
  todayProfit: number;
  todayProfitGrowth: number;
  memberCount: number;
  memberRepurchaseRate: number;
}

export interface TrafficTrend {
  hour: string;
  value: number;
}

export interface SalesTrend {
  hour: string;
  value: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'system' | 'promotion' | 'inventory';
  read: boolean;
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  path: string;
  color: string;
  bgColor: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  safeStock: number;
  unit: string;
  image: string;
}

export interface InventoryCheckItem {
  productId: string;
  productName: string;
  category: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  unitPrice: number;
  checked: boolean;
}

export interface NearExpiryItem {
  id: string;
  name: string;
  stock: number;
  expiryDate: string;
  daysLeft: number;
  originalPrice: number;
  discountPrice: number;
  status: 'normal' | 'urgent' | 'critical';
  category: string;
}

export interface ReplenishmentItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  suggestedQty: number;
  unitPrice: number;
  supplier: string;
  selected: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'ongoing' | 'completed';
  displayRequired: boolean;
  photoUploaded: boolean;
  confirmed: boolean;
  products: string[];
}

export interface Task {
  id: string;
  title: string;
  type: 'guide' | 'clean' | 'display';
  assignee: string;
  deadline: string;
  status: 'pending' | 'doing' | 'completed';
  priority: 'high' | 'medium' | 'low';
  description: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'on' | 'off' | 'busy';
  todayTasks: number;
  completedTasks: number;
}

export interface HandoverRecord {
  id: string;
  date: string;
  shift: string;
  handedBy: string;
  receivedBy: string;
  cashAmount: number;
  cardAmount: number;
  items: string[];
  remarks: string;
  status: 'pending' | 'confirmed';
}

export interface CategoryProfit {
  category: string;
  sales: number;
  cost: number;
  profit: number;
  profitRate: number;
  growth: number;
}

export interface MemberRepurchase {
  level: string;
  count: number;
  repurchaseRate: number;
  avgSpend: number;
}

export interface DailyReport {
  date: string;
  sales: number;
  orders: number;
  profit: number;
  traffic: number;
  newMembers: number;
}

export type InspectionIssueType = 'stock' | 'price' | 'display' | 'clean' | 'other';
export type InspectionIssueStatus = 'pending' | 'processing' | 'resolved';

export interface InspectionIssue {
  id: string;
  type: InspectionIssueType;
  title: string;
  description: string;
  location: string;
  photos: string[];
  status: InspectionIssueStatus;
  createdAt: string;
  reporter: string;
  linkedTaskId?: string;
  linkedReplenishment?: boolean;
}

export interface DailyExportRecord {
  id: string;
  date: string;
  exportedAt: string;
  exportedBy: string;
  sales: number;
  orders: number;
  profit: number;
  profitRate: number;
  traffic: number;
  avgOrder: number;
  newMembers: number;
  memberCount: number;
  nearExpiryCount: number;
  lowStockCount: number;
  tasksCompleted: number;
  tasksTotal: number;
  remarks?: string;
}
