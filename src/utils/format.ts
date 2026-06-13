export const formatCurrency = (value: number): string => {
  return '¥' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatNumber = (value: number): string => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万';
  }
  return value.toString();
};

export const formatPercent = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(1) + '%';
};

export const formatDate = (date: string): string => {
  return date.replace(/-/g, '/');
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    doing: '进行中',
    completed: '已完成',
    ongoing: '进行中'
  };
  return map[status] || status;
};

export const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return map[priority] || priority;
};
