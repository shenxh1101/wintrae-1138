import { CategoryProfit, MemberRepurchase, DailyReport } from '@/types';

export const categoryProfits: CategoryProfit[] = [
  {
    category: '饮料',
    sales: 8560.50,
    cost: 5280.00,
    profit: 3280.50,
    profitRate: 38.3,
    growth: 15.2
  },
  {
    category: '零食',
    sales: 6420.80,
    cost: 4180.00,
    profit: 2240.80,
    profitRate: 34.9,
    growth: 8.6
  },
  {
    category: '方便食品',
    sales: 4280.60,
    cost: 2980.00,
    profit: 1300.60,
    profitRate: 30.4,
    growth: 12.3
  },
  {
    category: '乳品',
    sales: 3860.40,
    cost: 2860.00,
    profit: 1000.40,
    profitRate: 25.9,
    growth: 5.8
  },
  {
    category: '粮油',
    sales: 2580.20,
    cost: 2080.00,
    profit: 500.20,
    profitRate: 19.4,
    growth: 3.2
  },
  {
    category: '调味品',
    sales: 1840.30,
    cost: 1280.00,
    profit: 560.30,
    profitRate: 30.4,
    growth: 6.5
  }
];

export const memberRepurchases: MemberRepurchase[] = [
  {
    level: '钻石会员',
    count: 168,
    repurchaseRate: 72.5,
    avgSpend: 268.5
  },
  {
    level: '金牌会员',
    count: 856,
    repurchaseRate: 58.3,
    avgSpend: 168.0
  },
  {
    level: '银牌会员',
    count: 2560,
    repurchaseRate: 38.6,
    avgSpend: 98.5
  },
  {
    level: '普通会员',
    count: 9096,
    repurchaseRate: 28.2,
    avgSpend: 56.8
  }
];

export const dailyReports: DailyReport[] = [
  {
    date: '2026-06-14',
    sales: 28650.80,
    orders: 324,
    profit: 7162.70,
    traffic: 856,
    newMembers: 26
  },
  {
    date: '2026-06-13',
    sales: 25460.50,
    orders: 298,
    profit: 6182.30,
    traffic: 792,
    newMembers: 18
  },
  {
    date: '2026-06-12',
    sales: 26890.20,
    orders: 308,
    profit: 6520.80,
    traffic: 820,
    newMembers: 22
  },
  {
    date: '2026-06-11',
    sales: 24560.60,
    orders: 286,
    profit: 5962.40,
    traffic: 758,
    newMembers: 15
  },
  {
    date: '2026-06-10',
    sales: 23890.40,
    orders: 278,
    profit: 5862.20,
    traffic: 736,
    newMembers: 20
  },
  {
    date: '2026-06-09',
    sales: 22680.30,
    orders: 265,
    profit: 5482.60,
    traffic: 702,
    newMembers: 12
  },
  {
    date: '2026-06-08',
    sales: 25120.70,
    orders: 292,
    profit: 6128.50,
    traffic: 780,
    newMembers: 19
  }
];
