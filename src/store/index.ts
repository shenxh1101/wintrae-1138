import { create } from 'zustand';
import {
  Promotion,
  Task,
  HandoverRecord,
  InspectionIssue,
  InspectionIssueStatus,
  DailyExportRecord,
  ReplenishmentItem
} from '@/types';
import { promotions as initialPromotions } from '@/data/promotion';
import { tasks as initialTasks, handoverRecords as initialHandover } from '@/data/tasks';
import { replenishmentItems as initialReplenishment } from '@/data/inventory';

const STORAGE_KEY = 'retail_store_v1';

const generateId = (prefix: string) =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const nowStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const todayStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const initialInspectionIssues: InspectionIssue[] = [
  {
    id: 'ISS001',
    type: 'stock',
    title: 'A区饮料冷柜缺货',
    description: '可口可乐330ml罐仅剩24罐，低于安全库存线',
    location: 'A区-03-冷柜02',
    photos: [],
    status: 'pending',
    createdAt: '2026-06-14 09:30',
    reporter: '陈店长'
  },
  {
    id: 'ISS002',
    type: 'price',
    title: 'B区零食价签缺失',
    description: '薯片货架第2层有3个商品缺少价签',
    location: 'B区-05-货架03',
    photos: [],
    status: 'processing',
    createdAt: '2026-06-14 10:15',
    reporter: '陈店长',
    linkedTaskId: 'T123456'
  },
  {
    id: 'ISS003',
    type: 'display',
    title: '端架陈列不规范',
    description: '促销堆头摆放不整齐，需要按照总部标准重新陈列',
    location: '入口端架-01',
    photos: [],
    status: 'resolved',
    createdAt: '2026-06-13 16:40',
    reporter: '李副店',
    resolvedAt: '2026-06-13 18:20',
    resolvedNote: '已按标准重新陈列完毕'
  }
];

const initialDailyExports: DailyExportRecord[] = [
  {
    id: 'EXP001',
    date: '2026-06-13',
    exportedAt: '2026-06-13 22:30',
    exportedBy: '陈店长',
    sales: 25460.5,
    orders: 298,
    profit: 6182.3,
    profitRate: 24.3,
    traffic: 792,
    avgOrder: 85.4,
    newMembers: 18,
    memberCount: 12654,
    nearExpiryCount: 8,
    lowStockCount: 5,
    tasksCompleted: 12,
    tasksTotal: 14,
    inspectionNew: 5,
    inspectionResolved: 4,
    remarks: '周六销售高峰，饮料类增长显著'
  }
];

interface RetailState {
  promotions: Promotion[];
  tasks: Task[];
  handoverRecords: HandoverRecord[];
  inspectionIssues: InspectionIssue[];
  dailyExports: DailyExportRecord[];
  replenishmentItems: ReplenishmentItem[];

  getPromotionById: (id: string) => Promotion | undefined;
  updatePromotion: (id: string, patch: Partial<Promotion>) => void;

  getTaskById: (id: string) => Task | undefined;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;

  addHandoverRecord: (record: Omit<HandoverRecord, 'id'>) => string;

  addInspectionIssue: (issue: Omit<InspectionIssue, 'id' | 'createdAt' | 'status'>) => string;
  updateInspectionIssue: (id: string, patch: Partial<InspectionIssue>) => void;
  getPendingInspectionCount: () => number;
  getInspectionIssueById: (id: string) => InspectionIssue | undefined;

  addDailyExport: (record: Omit<DailyExportRecord, 'id' | 'exportedAt'>) => string;
  getDailyExportByDate: (date: string) => DailyExportRecord | undefined;

  getReplenishmentItems: () => ReplenishmentItem[];
  addReplenishmentFromIssue: (issueId: string, issueTitle: string, productName: string) => string;
  updateReplenishmentItem: (id: string, patch: Partial<ReplenishmentItem>) => void;
  toggleReplenishmentSelect: (id: string) => void;
  toggleAllReplenishment: (selected: boolean) => void;
  changeReplenishmentQty: (id: string, qty: number) => void;
  submitReplenishmentOrder: (ids: string[]) => string;
  syncIssueStatus: (issueId: string) => void;

  hydrateFromStorage: () => void;
  persistToStorage: () => void;
}

const buildInitialState = () => {
  const stored = loadFromStorage<Partial<RetailState> | null>(STORAGE_KEY, null);
  return {
    promotions: stored?.promotions || [...initialPromotions],
    tasks: stored?.tasks || [...initialTasks],
    handoverRecords: stored?.handoverRecords || [...initialHandover],
    inspectionIssues: stored?.inspectionIssues || [...initialInspectionIssues],
    dailyExports: stored?.dailyExports || [...initialDailyExports],
    replenishmentItems: stored?.replenishmentItems || [...initialReplenishment]
  };
};

export const useRetailStore = create<RetailState>((set, get) => ({
  ...buildInitialState(),

  getPromotionById: (id) => get().promotions.find((p) => p.id === id),

  updatePromotion: (id, patch) => {
    set((state) => ({
      promotions: state.promotions.map((p) => (p.id === id ? { ...p, ...patch } : p))
    }));
    get().persistToStorage();
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  addTask: (task) => {
    const id = generateId('T');
    set((state) => ({
      tasks: [
        {
          ...task,
          id,
          createdAt: nowStr(),
          status: 'pending' as const,
          source: task.source || 'manual'
        },
        ...state.tasks
      ]
    }));
    get().persistToStorage();
    return id;
  },

  updateTask: (id, patch) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
    }));
    get().persistToStorage();
  },

  addHandoverRecord: (record) => {
    const id = generateId('H');
    set((state) => ({
      handoverRecords: [{ ...record, id }, ...state.handoverRecords]
    }));
    get().persistToStorage();
    return id;
  },

  addInspectionIssue: (issue) => {
    const id = generateId('ISS');
    set((state) => ({
      inspectionIssues: [
        {
          ...issue,
          id,
          createdAt: nowStr(),
          status: 'pending' as const
        },
        ...state.inspectionIssues
      ]
    }));
    get().persistToStorage();
    return id;
  },

  updateInspectionIssue: (id, patch) => {
    set((state) => ({
      inspectionIssues: state.inspectionIssues.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      ),
      replenishmentItems: state.replenishmentItems.map((r) =>
        r.sourceIssueId === id && patch.status
          ? { ...r, sourceIssueStatus: patch.status as InspectionIssueStatus }
          : r
      )
    }));
    get().persistToStorage();
  },

  getPendingInspectionCount: () =>
    get().inspectionIssues.filter((i) => i.status !== 'resolved').length,

  getInspectionIssueById: (id) => get().inspectionIssues.find((i) => i.id === id),

  addDailyExport: (record) => {
    const id = generateId('EXP');
    const today = todayStr();
    const todayIssues = get().inspectionIssues.filter((i) => i.createdAt.startsWith(today));
    const todayResolved = get().inspectionIssues.filter(
      (i) => i.status === 'resolved' && i.resolvedAt?.startsWith(today)
    );

    set((state) => ({
      dailyExports: [
        {
          ...record,
          id,
          exportedAt: nowStr(),
          inspectionNew: todayIssues.length,
          inspectionResolved: todayResolved.length
        },
        ...state.dailyExports
      ]
    }));
    get().persistToStorage();
    return id;
  },

  getDailyExportByDate: (date) => get().dailyExports.find((e) => e.date === date),

  getReplenishmentItems: () => get().replenishmentItems,

  addReplenishmentFromIssue: (issueId, issueTitle, productName) => {
    const id = generateId('R');
    const newItem: ReplenishmentItem = {
      id,
      name: productName,
      category: '临时补货',
      currentStock: 0,
      suggestedQty: 20,
      unitPrice: 0,
      supplier: '待确认',
      selected: true,
      sourceIssueId: issueId,
      sourceIssueTitle: issueTitle,
      sourceIssueStatus: 'pending'
    };
    set((state) => ({
      replenishmentItems: [newItem, ...state.replenishmentItems],
      inspectionIssues: state.inspectionIssues.map((i) =>
        i.id === issueId
          ? {
              ...i,
              linkedReplenishment: true,
              linkedReplenishmentItems: [...(i.linkedReplenishmentItems || []), id]
            }
          : i
      )
    }));
    get().persistToStorage();
    return id;
  },

  updateReplenishmentItem: (id, patch) => {
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      )
    }));
    get().persistToStorage();
  },

  toggleReplenishmentSelect: (id) => {
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((i) =>
        i.id === id ? { ...i, selected: !i.selected } : i
      )
    }));
    get().persistToStorage();
  },

  toggleAllReplenishment: (selected) => {
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((i) => ({ ...i, selected }))
    }));
    get().persistToStorage();
  },

  changeReplenishmentQty: (id, qty) => {
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((i) =>
        i.id === id ? { ...i, suggestedQty: Math.max(0, qty) } : i
      )
    }));
    get().persistToStorage();
  },

  submitReplenishmentOrder: (ids) => {
    const orderNo = `PO${Date.now()}`;
    const orderTime = nowStr();
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((i) =>
        ids.includes(i.id)
          ? { ...i, orderStatus: 'ordered' as const, orderNo, orderTime }
          : i
      )
    }));
    get().persistToStorage();
    return orderNo;
  },

  syncIssueStatus: (issueId) => {
    const issue = get().inspectionIssues.find((i) => i.id === issueId);
    if (!issue) return;
    const newStatus = issue.status;
    set((state) => ({
      replenishmentItems: state.replenishmentItems.map((r) =>
        r.sourceIssueId === issueId ? { ...r, sourceIssueStatus: newStatus } : r
      )
    }));
    get().persistToStorage();
  },

  hydrateFromStorage: () => {
    const stored = loadFromStorage<Partial<RetailState> | null>(STORAGE_KEY, null);
    if (stored) {
      set({
        promotions: stored.promotions || [...initialPromotions],
        tasks: stored.tasks || [...initialTasks],
        handoverRecords: stored.handoverRecords || [...initialHandover],
        inspectionIssues: stored.inspectionIssues || [...initialInspectionIssues],
        dailyExports: stored.dailyExports || [...initialDailyExports],
        replenishmentItems: stored.replenishmentItems || [...initialReplenishment]
      });
    }
  },

  persistToStorage: () => {
    try {
      if (typeof localStorage === 'undefined') return;
      const state = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          promotions: state.promotions,
          tasks: state.tasks,
          handoverRecords: state.handoverRecords,
          inspectionIssues: state.inspectionIssues,
          dailyExports: state.dailyExports,
          replenishmentItems: state.replenishmentItems
        })
      );
    } catch (e) {
      console.warn('Failed to persist store:', e);
    }
  }
}));
