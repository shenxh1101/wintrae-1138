import { Product, InventoryCheckItem, NearExpiryItem, ReplenishmentItem } from '@/types';

export const products: Product[] = [
  {
    id: 'P001',
    name: '农夫山泉矿泉水 550ml',
    barcode: '6901285991219',
    category: '饮料',
    price: 2.00,
    cost: 1.20,
    stock: 486,
    safeStock: 100,
    unit: '瓶',
    image: 'https://picsum.photos/id/292/300/300'
  },
  {
    id: 'P002',
    name: '康师傅红烧牛肉面',
    barcode: '6920202888883',
    category: '方便食品',
    price: 5.50,
    cost: 3.80,
    stock: 128,
    safeStock: 50,
    unit: '桶',
    image: 'https://picsum.photos/id/312/300/300'
  },
  {
    id: 'P003',
    name: '伊利纯牛奶 250ml',
    barcode: '6907992500251',
    category: '乳品',
    price: 3.50,
    cost: 2.60,
    stock: 86,
    safeStock: 60,
    unit: '盒',
    image: 'https://picsum.photos/id/326/300/300'
  },
  {
    id: 'P004',
    name: '乐事薯片原味 75g',
    barcode: '6924743915886',
    category: '零食',
    price: 8.90,
    cost: 5.80,
    stock: 42,
    safeStock: 40,
    unit: '袋',
    image: 'https://picsum.photos/id/401/300/300'
  },
  {
    id: 'P005',
    name: '可口可乐 330ml',
    barcode: '6901939621113',
    category: '饮料',
    price: 3.00,
    cost: 1.90,
    stock: 24,
    safeStock: 80,
    unit: '罐',
    image: 'https://picsum.photos/id/431/300/300'
  },
  {
    id: 'P006',
    name: '奥利奥原味饼干 116g',
    barcode: '6901668002471',
    category: '零食',
    price: 12.80,
    cost: 8.20,
    stock: 68,
    safeStock: 30,
    unit: '盒',
    image: 'https://picsum.photos/id/570/300/300'
  },
  {
    id: 'P007',
    name: '金龙鱼调和油 5L',
    barcode: '6948195805247',
    category: '粮油',
    price: 79.90,
    cost: 62.00,
    stock: 18,
    safeStock: 15,
    unit: '桶',
    image: 'https://picsum.photos/id/580/300/300'
  },
  {
    id: 'P008',
    name: '海天酱油 500ml',
    barcode: '6902265111115',
    category: '调味品',
    price: 16.80,
    cost: 11.50,
    stock: 36,
    safeStock: 25,
    unit: '瓶',
    image: 'https://picsum.photos/id/625/300/300'
  }
];

export const inventoryCheckList: InventoryCheckItem[] = [
  {
    productId: 'P001',
    productName: '农夫山泉矿泉水 550ml',
    category: '饮料',
    systemStock: 486,
    actualStock: 0,
    difference: 0,
    unitPrice: 2.00,
    checked: false
  },
  {
    productId: 'P002',
    productName: '康师傅红烧牛肉面',
    category: '方便食品',
    systemStock: 128,
    actualStock: 0,
    difference: 0,
    unitPrice: 5.50,
    checked: false
  },
  {
    productId: 'P003',
    productName: '伊利纯牛奶 250ml',
    category: '乳品',
    systemStock: 86,
    actualStock: 0,
    difference: 0,
    unitPrice: 3.50,
    checked: false
  },
  {
    productId: 'P004',
    productName: '乐事薯片原味 75g',
    category: '零食',
    systemStock: 42,
    actualStock: 0,
    difference: 0,
    unitPrice: 8.90,
    checked: false
  },
  {
    productId: 'P005',
    productName: '可口可乐 330ml',
    category: '饮料',
    systemStock: 24,
    actualStock: 0,
    difference: 0,
    unitPrice: 3.00,
    checked: false
  },
  {
    productId: 'P006',
    productName: '奥利奥原味饼干 116g',
    category: '零食',
    systemStock: 68,
    actualStock: 0,
    difference: 0,
    unitPrice: 12.80,
    checked: false
  },
  {
    productId: 'P007',
    productName: '金龙鱼调和油 5L',
    category: '粮油',
    systemStock: 18,
    actualStock: 0,
    difference: 0,
    unitPrice: 79.90,
    checked: false
  },
  {
    productId: 'P008',
    productName: '海天酱油 500ml',
    category: '调味品',
    systemStock: 36,
    actualStock: 0,
    difference: 0,
    unitPrice: 16.80,
    checked: false
  }
];

export const nearExpiryItems: NearExpiryItem[] = [
  {
    id: 'E001',
    name: '蒙牛酸奶 100g*8',
    stock: 24,
    expiryDate: '2026-06-16',
    daysLeft: 2,
    originalPrice: 28.80,
    discountPrice: 14.90,
    status: 'critical',
    category: '乳品'
  },
  {
    id: 'E002',
    name: '桃李切片面包 400g',
    stock: 12,
    expiryDate: '2026-06-17',
    daysLeft: 3,
    originalPrice: 15.80,
    discountPrice: 9.90,
    status: 'critical',
    category: '烘焙'
  },
  {
    id: 'E003',
    name: '双汇火腿肠 240g',
    stock: 36,
    expiryDate: '2026-06-20',
    daysLeft: 6,
    originalPrice: 18.80,
    discountPrice: 12.80,
    status: 'urgent',
    category: '肉制品'
  },
  {
    id: 'E004',
    name: '康师傅冰红茶 500ml',
    stock: 48,
    expiryDate: '2026-06-25',
    daysLeft: 11,
    originalPrice: 3.50,
    discountPrice: 2.50,
    status: 'normal',
    category: '饮料'
  },
  {
    id: 'E005',
    name: '好丽友派 6枚装',
    stock: 18,
    expiryDate: '2026-06-28',
    daysLeft: 14,
    originalPrice: 22.80,
    discountPrice: 16.80,
    status: 'normal',
    category: '零食'
  },
  {
    id: 'E006',
    name: '旺旺雪饼 540g',
    stock: 15,
    expiryDate: '2026-07-02',
    daysLeft: 18,
    originalPrice: 28.80,
    discountPrice: 22.80,
    status: 'normal',
    category: '零食'
  }
];

export const replenishmentItems: ReplenishmentItem[] = [
  {
    id: 'R001',
    name: '农夫山泉矿泉水 550ml',
    category: '饮料',
    currentStock: 486,
    suggestedQty: 200,
    unitPrice: 1.20,
    supplier: '农夫山泉经销商',
    selected: true
  },
  {
    id: 'R002',
    name: '可口可乐 330ml',
    category: '饮料',
    currentStock: 24,
    suggestedQty: 120,
    unitPrice: 1.90,
    supplier: '太古可口可乐',
    selected: true
  },
  {
    id: 'R003',
    name: '伊利纯牛奶 250ml',
    category: '乳品',
    currentStock: 86,
    suggestedQty: 100,
    unitPrice: 2.60,
    supplier: '伊利乳业',
    selected: true
  },
  {
    id: 'R004',
    name: '康师傅红烧牛肉面',
    category: '方便食品',
    currentStock: 128,
    suggestedQty: 80,
    unitPrice: 3.80,
    supplier: '康师傅控股',
    selected: false
  },
  {
    id: 'R005',
    name: '乐事薯片原味 75g',
    category: '零食',
    currentStock: 42,
    suggestedQty: 60,
    unitPrice: 5.80,
    supplier: '百事食品',
    selected: true
  },
  {
    id: 'R006',
    name: '奥利奥原味饼干 116g',
    category: '零食',
    currentStock: 68,
    suggestedQty: 40,
    unitPrice: 8.20,
    supplier: '亿滋中国',
    selected: false
  },
  {
    id: 'R007',
    name: '金龙鱼调和油 5L',
    category: '粮油',
    currentStock: 18,
    suggestedQty: 20,
    unitPrice: 62.00,
    supplier: '益海嘉里',
    selected: true
  },
  {
    id: 'R008',
    name: '海天酱油 500ml',
    category: '调味品',
    currentStock: 36,
    suggestedQty: 30,
    unitPrice: 11.50,
    supplier: '海天味业',
    selected: false
  }
];
