import { DashboardStats, TrafficTrend, SalesTrend, Notice, QuickAction } from '@/types';

export const dashboardStats: DashboardStats = {
  todaySales: 28650.80,
  todaySalesGrowth: 12.5,
  todayTraffic: 856,
  todayTrafficGrowth: 8.3,
  todayOrders: 324,
  todayAvgOrder: 88.4,
  todayProfit: 7162.70,
  todayProfitGrowth: 15.2,
  memberCount: 12680,
  memberRepurchaseRate: 42.6
};

export const trafficTrend: TrafficTrend[] = [
  { hour: '08', value: 32 },
  { hour: '09', value: 58 },
  { hour: '10', value: 86 },
  { hour: '11', value: 112 },
  { hour: '12', value: 96 },
  { hour: '13', value: 78 },
  { hour: '14', value: 88 },
  { hour: '15', value: 94 },
  { hour: '16', value: 108 },
  { hour: '17', value: 132 },
  { hour: '18', value: 146 },
  { hour: '19', value: 124 },
  { hour: '20', value: 98 },
  { hour: '21', value: 72 }
];

export const salesTrend: SalesTrend[] = [
  { hour: '08', value: 860 },
  { hour: '09', value: 1580 },
  { hour: '10', value: 2340 },
  { hour: '11', value: 3120 },
  { hour: '12', value: 2680 },
  { hour: '13', value: 2180 },
  { hour: '14', value: 2480 },
  { hour: '15', value: 2620 },
  { hour: '16', value: 2980 },
  { hour: '17', value: 3680 },
  { hour: '18', value: 4120 },
  { hour: '19', value: 3480 },
  { hour: '20', value: 2760 },
  { hour: '21', value: 1960 }
];

export const notices: Notice[] = [
  {
    id: '1',
    title: '618年中大促陈列要求',
    content: '请各门店于6月15日前完成618促销主题陈列，包含端架3组、堆头2个，拍照回传总部。',
    time: '10分钟前',
    type: 'promotion',
    read: false
  },
  {
    id: '2',
    title: '临期商品处理通知',
    content: '本月临期商品共计23个SKU，请及时设置打折清仓，避免过期损耗。',
    time: '1小时前',
    type: 'inventory',
    read: false
  },
  {
    id: '3',
    title: '总部系统维护通知',
    content: '6月15日凌晨2:00-4:00进行系统升级，期间收银台切换离线模式。',
    time: '3小时前',
    type: 'system',
    read: true
  },
  {
    id: '4',
    title: '夏季新品补货提醒',
    content: '夏季饮料、冰品热销，建议提前3天下单补货，确保库存充足。',
    time: '昨天',
    type: 'inventory',
    read: true
  }
];

export const quickActions: QuickAction[] = [
  {
    id: '1',
    name: '扫码盘点',
    icon: '📱',
    path: '/pages/inventory-check/index',
    color: '#165dff',
    bgColor: 'rgba(22, 93, 255, 0.1)'
  },
  {
    id: '2',
    name: '补货下单',
    icon: '📦',
    path: '/pages/replenishment/index',
    color: '#00b42a',
    bgColor: 'rgba(0, 180, 42, 0.1)'
  },
  {
    id: '3',
    name: '促销确认',
    icon: '🎯',
    path: '/pages/promotion/index',
    color: '#ff7d00',
    bgColor: 'rgba(255, 125, 0, 0.1)'
  },
  {
    id: '4',
    name: '临期处理',
    icon: '⏰',
    path: '/pages/near-expiry/index',
    color: '#f53f3f',
    bgColor: 'rgba(245, 63, 63, 0.1)'
  },
  {
    id: '5',
    name: '任务分配',
    icon: '📋',
    path: '/pages/tasks/index',
    color: '#722ed1',
    bgColor: 'rgba(114, 46, 209, 0.1)'
  },
  {
    id: '6',
    name: '交接班',
    icon: '🔄',
    path: '/pages/handover/index',
    color: '#13c2c2',
    bgColor: 'rgba(19, 194, 194, 0.1)'
  },
  {
    id: '7',
    name: '拍照陈列',
    icon: '📷',
    path: '/pages/promotion/index',
    color: '#eb2f96',
    bgColor: 'rgba(235, 47, 150, 0.1)'
  },
  {
    id: '8',
    name: '日结导出',
    icon: '📊',
    path: '/pages/daily-export/index',
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.1)'
  },
  {
    id: '9',
    name: '巡店上报',
    icon: '🔍',
    path: '/pages/inspection-report/index',
    color: '#f53f3f',
    bgColor: 'rgba(245, 63, 63, 0.1)'
  },
  {
    id: '10',
    name: '问题记录',
    icon: '📝',
    path: '/pages/inspection-list/index',
    color: '#165dff',
    bgColor: 'rgba(22, 93, 255, 0.1)'
  }
];
