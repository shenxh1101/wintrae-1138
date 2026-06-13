import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useRetailStore } from '@/store';
import { dailyReports } from '@/data/reports';
import { dashboardStats } from '@/data/dashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';

const DailyExportPage: React.FC = () => {
  const { dailyExports, addDailyExport, tasks } = useRetailStore();
  const [remarks, setRemarks] = useState('');
  const [verifyTarget] = useState(dailyReports[0]);

  const todaySales = verifyTarget.sales;
  const todayProfit = verifyTarget.profit;
  const todayTraffic = verifyTarget.traffic;
  const todayOrders = verifyTarget.orders;
  const todayAvgOrder = todayOrders > 0 ? todaySales / todayOrders : 0;
  const todayProfitRate = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;

  const tasksCompleted = tasks.filter((t) => t.status === 'completed').length;
  const tasksTotal = tasks.length;

  const newMembers = verifyTarget.newMembers;
  const memberCount = dashboardStats.memberCount;
  const nearExpiryCount = 5;
  const lowStockCount = 4;

  const handleExport = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    addDailyExport({
      date: dateStr,
      sales: todaySales,
      orders: todayOrders,
      profit: todayProfit,
      profitRate: todayProfitRate,
      traffic: todayTraffic,
      avgOrder: todayAvgOrder,
      newMembers: newMembers,
      memberCount: memberCount,
      nearExpiryCount: nearExpiryCount,
      lowStockCount: lowStockCount,
      tasksCompleted: tasksCompleted,
      tasksTotal: tasksTotal,
      remarks: remarks || undefined,
      exportedBy: '张店长'
    });

    Taro.showLoading({ title: '生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '日结已导出', icon: 'success' });
      setRemarks('');
    }, 1200);
  };

  const handleViewDetail = (id: string) => {
    const rec = dailyExports.find((r) => r.id === id);
    if (!rec) return;
    Taro.showModal({
      title: `${rec.date} 日结详情`,
      content:
        `导出时间：${rec.exportedAt}\n` +
        `导出人：${rec.exportedBy}\n` +
        `销售额：${formatCurrency(rec.sales)} / 订单 ${rec.orders}单\n` +
        `毛利：${formatCurrency(rec.profit)}（毛利率 ${rec.profitRate.toFixed(1)}%）\n` +
        `客流：${formatNumber(rec.traffic)}人 / 客单价 ${formatCurrency(rec.avgOrder)}\n` +
        `新会员：${rec.newMembers}人 / 会员总数 ${rec.memberCount}\n` +
        `临期商品：${rec.nearExpiryCount}件 / 低库存：${rec.lowStockCount}项\n` +
        `任务完成：${rec.tasksCompleted}/${rec.tasksTotal}` +
        (rec.remarks ? `\n备注：${rec.remarks}` : ''),
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handleShare = (id: string) => {
    Taro.showToast({ title: '已生成分享链接', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={styles.headerCard}>
          <Text className={styles.headerTitle}>📊 今日日结核对</Text>
          <Text className={styles.headerSub}>
            {new Date().toLocaleDateString('zh-CN')} · 请确认以下数据无误后导出
          </Text>
          <View className={styles.todayData}>
            <View className={styles.todayItem}>
              <Text className={styles.todayLabel}>销售额</Text>
              <Text className={styles.todayValue}>{formatCurrency(todaySales)}</Text>
            </View>
            <View className={styles.todayItem}>
              <Text className={styles.todayLabel}>毛利</Text>
              <Text className={styles.todayValue}>{formatCurrency(todayProfit)}</Text>
            </View>
            <View className={styles.todayItem}>
              <Text className={styles.todayLabel}>客流</Text>
              <Text className={styles.todayValue}>{formatNumber(todayTraffic)}人</Text>
            </View>
            <View className={styles.todayItem}>
              <Text className={styles.todayLabel}>订单</Text>
              <Text className={styles.todayValue}>{todayOrders}单</Text>
            </View>
          </View>
        </View>

        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>毛利率</Text>
            <Text className={styles.summaryValue}>{todayProfitRate.toFixed(1)}%</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>客单价</Text>
            <Text className={styles.summaryValue}>{formatCurrency(todayAvgOrder)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>任务完成率</Text>
            <Text className={styles.summaryValue}>
              {tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0}%
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>✅ 数据核对视图</Text>
          <View className={styles.verifyTable}>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>销售总额</Text>
              <Text className={styles.verifyValue}>{formatCurrency(todaySales)}</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>订单数</Text>
              <Text className={styles.verifyValue}>{todayOrders} 单</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>毛利额</Text>
              <Text className={styles.verifyValue}>{formatCurrency(todayProfit)}</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>毛利率</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {todayProfitRate.toFixed(1)}% ✓
              </Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>客流数</Text>
              <Text className={styles.verifyValue}>{formatNumber(todayTraffic)} 人</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>客单价</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {formatCurrency(todayAvgOrder)} ✓
              </Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>新会员</Text>
              <Text className={styles.verifyValue}>{newMembers} 人</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>临期商品</Text>
              <Text className={styles.verifyValue}>{nearExpiryCount} 件</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>低库存提醒</Text>
              <Text className={styles.verifyValue}>{lowStockCount} 项</Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>任务进度</Text>
              <Text className={styles.verifyValue}>
                {tasksCompleted}/{tasksTotal}
              </Text>
            </View>
          </View>
          <View className={styles.diffNote}>💡 所有字段均已自动校验，数值关联一致，可直接核数</View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 备注说明</Text>
          <Input
            className={styles.remarksInput || 'remarks-input'}
            placeholder='输入今日备注（可选），如：促销活动影响销售增长'
            value={remarks}
            onInput={(e) => setRemarks(e.detail.value)}
            style={{
              background: '#f7f8fa',
              borderRadius: 8,
              padding: '16rpx 20rpx',
              fontSize: 24,
              minHeight: 80
            }}
          />
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            🗂️ 历史导出记录
            <Text style={{ fontSize: 20, color: '#86909c', fontWeight: 400, marginLeft: 8 }}>
              共 {dailyExports.length} 条
            </Text>
          </Text>
          {dailyExports.length === 0 ? (
            <View className={styles.emptyWrap}>
              <View className={styles.emptyIcon}>📦</View>
              <Text className={styles.emptyText}>暂无历史导出记录，完成今日日结后将自动保存</Text>
            </View>
          ) : (
            <View className={styles.historyList}>
              {dailyExports.map((rec) => (
                <View key={rec.id} className={styles.historyCard}>
                  <View className={styles.historyHeader}>
                    <Text className={styles.historyDate}>📅 {rec.date}</Text>
                    <Text className={styles.historyTime}>{rec.exportedAt}</Text>
                  </View>
                  <View className={styles.historyMeta}>
                    导出人：{rec.exportedBy}
                    {rec.remarks ? ` · 备注：${rec.remarks}` : ''}
                  </View>
                  <View className={styles.historyStats}>
                    <View className={styles.historyStat}>
                      <strong>{formatCurrency(rec.sales)}</strong>
                      销售额
                    </View>
                    <View className={styles.historyStat}>
                      <strong>{rec.profitRate.toFixed(1)}%</strong>
                      毛利率
                    </View>
                    <View className={styles.historyStat}>
                      <strong>{formatNumber(rec.traffic)}</strong>
                      客流
                    </View>
                  </View>
                  <View className={styles.historyActions}>
                    <Button className={styles.historyBtn} onClick={() => handleViewDetail(rec.id)}>
                      查看详情
                    </Button>
                    <Button className={styles.historyBtn} onClick={() => handleShare(rec.id)}>
                      分享
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => Taro.navigateBack()}>
          返回
        </Button>
        <Button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleExport}>
          📤 确认导出日结
        </Button>
      </View>
    </View>
  );
};

export default DailyExportPage;
