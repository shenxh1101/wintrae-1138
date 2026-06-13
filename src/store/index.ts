import { create } from 'zustand';
import {
  Promotion,
  Task,
  HandoverRecord,
  InspectionIssue,
  DailyExportRecord
} from '@/types';
import { promotions as initialPromotions } from '@/data/promotion';
import { tasks as initialTasks, handoverRecords as initialHandover } from '@/data/tasks';

interface RetailState {
  promotions: Promotion[];
  tasks: Task[];
  handoverRecords: HandoverRecord[];
  inspectionIssues: InspectionIssue[];
  dailyExports: DailyExportRecord[];

  getPromotionById: (id: string) => Promotion | undefined;
  updatePromotion: (id: string, patch: Partial<Promotion>) => void;

  getTaskById: (id: string) => Task | undefined;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;

  addHandoverRecord: (record: Omit<HandoverRecord, 'id'>) => string;

  addInspectionIssue: (issue: Omit<InspectionIssue, 'id' | 'createdAt' | 'status'>) => string;
  updateInspectionIssue: (id: string, patch: Partial<InspectionIssue>) => void;
  getPendingInspectionCount: () => number;

  addDailyExport: (record: Omit<DailyExportRecord, 'id' | 'exportedAt'>) => string;
}

const generateId = (prefix: string) =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const nowStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    remarks: '周六销售高峰，饮料类增长显著'
  }
];

export const useRetailStore = create<RetailState>((set, get) => ({
  promotions: [...initialPromotions],
  tasks: [...initialTasks],
  handoverRecords: [...initialHandover],
  inspectionIssues: [...initialInspectionIssues],
  dailyExports: [...initialDailyExports],

  getPromotionById: (id) => get().promotions.find((p) => p.id === id),

  updatePromotion: (id, patch) =>
    set((state) => ({
      promotions: state.promotions.map((p) => (p.id === id ? { ...p, ...patch } : p))
    })),

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  addTask: (task) => {
    const id = generateId('T');
    set((state) => ({
      tasks: [
        {
          ...task,
          id,
          createdAt: nowStr(),
          status: 'pending'
        },
        ...state.tasks
      ]
    }));
    return id;
  },

  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
    })),

  addHandoverRecord: (record) => {
    const id = generateId('H');
    set((state) => ({
      handoverRecords: [{ ...record, id }, ...state.handoverRecords]
    }));
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
          status: 'pending'
        },
        ...state.inspectionIssues
      ]
    }));
    return id;
  },

  updateInspectionIssue: (id, patch) =>
    set((state) => ({
      inspectionIssues: state.inspectionIssues.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      )
    })),

  getPendingInspectionCount: () =>
    get().inspectionIssues.filter((i) => i.status !== 'resolved').length,

  addDailyExport: (record) => {
    const id = generateId('EXP');
    set((state) => ({
      dailyExports: [
        { ...record, id, exportedAt: nowStr() },
        ...state.dailyExports
      ]
    }));
    return id;
  }
}));
