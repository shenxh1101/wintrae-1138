import { Task, Employee, HandoverRecord } from '@/types';

export const tasks: Task[] = [
  {
    id: 'T001',
    title: '618促销端架陈列',
    type: 'display',
    assignee: '张小红',
    deadline: '2026-06-14 18:00',
    status: 'doing',
    priority: 'high',
    description: '完成3组端架和2个堆头的618主题陈列，按照总部陈列手册执行',
    createdAt: '2026-06-14 09:00'
  },
  {
    id: 'T002',
    title: '临期商品下架整理',
    type: 'clean',
    assignee: '李明',
    deadline: '2026-06-14 17:00',
    status: 'pending',
    priority: 'high',
    description: '将临期3天内商品集中到临期专区，设置折扣标签',
    createdAt: '2026-06-14 08:30'
  },
  {
    id: 'T003',
    title: '新员工收银台服务',
    type: 'guide',
    assignee: '王芳',
    deadline: '2026-06-14 21:00',
    status: 'doing',
    priority: 'medium',
    description: '高峰期协助收银，引导顾客使用自助收银，推广会员注册',
    createdAt: '2026-06-14 10:00'
  },
  {
    id: 'T004',
    title: '饮料区补货',
    type: 'guide',
    assignee: '赵强',
    deadline: '2026-06-14 15:00',
    status: 'completed',
    priority: 'medium',
    description: '饮料冷柜饮料补货，确保货架丰满',
    createdAt: '2026-06-14 08:00'
  },
  {
    id: 'T005',
    title: '门店卫生大扫除',
    type: 'clean',
    assignee: '刘洋',
    deadline: '2026-06-14 20:00',
    status: 'pending',
    priority: 'low',
    description: '地面清洁、货架除尘、卫生间消毒',
    createdAt: '2026-06-14 09:30'
  }
];

export const employees: Employee[] = [
  {
    id: 'E001',
    name: '张小红',
    role: '资深导购',
    status: 'busy',
    todayTasks: 4,
    completedTasks: 2
  },
  {
    id: 'E002',
    name: '李明',
    role: '理货员',
    status: 'on',
    todayTasks: 3,
    completedTasks: 1
  },
  {
    id: 'E003',
    name: '王芳',
    role: '收银员',
    status: 'on',
    todayTasks: 2,
    completedTasks: 1
  },
  {
    id: 'E004',
    name: '赵强',
    role: '理货员',
    status: 'on',
    todayTasks: 3,
    completedTasks: 3
  },
  {
    id: 'E005',
    name: '刘洋',
    role: '保洁员',
    status: 'off',
    todayTasks: 2,
    completedTasks: 0
  }
];

export const handoverRecords: HandoverRecord[] = [
  {
    id: 'H001',
    date: '2026-06-14',
    shift: '早班',
    handedBy: '陈店长',
    receivedBy: '张小红',
    cashAmount: 8560.50,
    cardAmount: 12480.30,
    items: ['备用金5000元', '收银台钥匙1把', '对讲机2台'],
    remarks: '饮料销售火爆，注意补货，库存不足的状态：可乐仅剩24罐',
    status: 'confirmed'
  }
];
