import { Promotion } from '@/types';

export const promotions: Promotion[] = [
  {
    id: 'PRO001',
    name: '618年中大促',
    type: '满减促销',
    startDate: '2026-06-15',
    endDate: '2026-06-20',
    status: 'pending',
    displayRequired: true,
    photoUploaded: false,
    confirmed: false,
    products: ['指定200款商品满199减50', '饮料类商品8折', '会员双倍积分']
  },
  {
    id: 'PRO002',
    name: '夏季冷饮节',
    type: '折扣促销',
    startDate: '2026-06-10',
    endDate: '2026-06-30',
    status: 'ongoing',
    displayRequired: true,
    photoUploaded: true,
    confirmed: true,
    products: ['指定冷饮第二件半价', '堆头陈列3组', '端架陈列2组']
  },
  {
    id: 'PRO003',
    name: '会员专享日',
    type: '会员活动',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    status: 'pending',
    displayRequired: false,
    photoUploaded: false,
    confirmed: false,
    products: ['会员全场95折', '新会员注册送券', '积分兑换礼品']
  },
  {
    id: 'PRO004',
    name: '端午礼盒促销',
    type: '主题促销',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    status: 'completed',
    displayRequired: true,
    photoUploaded: true,
    confirmed: true,
    products: ['粽子礼盒9折', '礼盒组合优惠']
  }
];
