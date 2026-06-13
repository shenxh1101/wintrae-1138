import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import QuickEntry from '@/components/QuickEntry';
import NoticeCard from '@/components/NoticeCard';
import { dashboardStats, trafficTrend, salesTrend, notices, quickActions } from '@/data/dashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';

const DashboardPage: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'sales' | 'traffic'>('sales');
  const [isRefreshing, setIsRefreshing] = useState(false);

  usePullDownRefresh(() => {
    console.log('[Dashboard] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1200);
  });

  const chartData = activeChart === 'sales' ? salesTrend : trafficTrend;
  const maxValue = Math.max(...chartData.map((d) => d.value));

  const getBarHeight = useCallback(
    (value: number) => {
      const percent = (value / maxValue) * 100;
      return `${Math.max(percent, 3)}%`;
    },
    [maxValue]
  );

  const unreadCount = notices.filter((n) => !n.read).length;

  return (
    <View className={styles.page}>
      <View className={styles.pageBg} />
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.headerInfo}>
          <View className={styles.storeInfo}>
            <View>
              <Text className={styles.storeName}>智慧零售-国贸店</Text>
              <Text className={styles.storeAddress}>朝阳区建国路88号B1层</Text>
            </View>
            <View className={styles.managerInfo}>
              <View>
                <Text className={styles.managerName}>陈店长</Text>
                <Text className={styles.dateText}>6月14日 周日</Text>
              </View>
              <View className={styles.avatar}>👨‍💼</View>
            </View>
          </View>
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            label="今日销售额"
            value={dashboardStats.todaySales}
            icon="💰"
            growth={dashboardStats.todaySalesGrowth}
            subInfo={`${dashboardStats.todayOrders}单`}
            color="#165dff"
            type="currency"
          />
          <StatCard
            label="今日客流"
            value={dashboardStats.todayTraffic}
            icon="👥"
            growth={dashboardStats.todayTrafficGrowth}
            subInfo={`客单¥${dashboardStats.todayAvgOrder.toFixed(1)}`}
            color="#722ed1"
            type="number"
          />
          <StatCard
            label="今日毛利"
            value={dashboardStats.todayProfit}
            icon="📈"
            growth={dashboardStats.todayProfitGrowth}
            subInfo="毛利率25.0%"
            color="#00b42a"
            type="currency"
          />
          <StatCard
            label="会员复购率"
            value={dashboardStats.memberRepurchaseRate}
            icon="💎"
            subInfo={`会员${formatNumber(dashboardStats.memberCount)}人`}
            color="#eb2f96"
            type="percent"
          />
        </View>

        <View className={styles.section}>
          <QuickEntry actions={quickActions} />
        </View>

        <View className={styles.chartCard}>
          <View className={styles.chartHeader}>
            <Text className={styles.chartTitle}>
              {activeChart === 'sales' ? '今日销售趋势' : '今日客流趋势'}
            </Text>
            <View className={styles.chartTabs}>
              <Text
                className={classnames(styles.chartTab, activeChart === 'sales' && styles.chartTabActive)}
                onClick={() => setActiveChart('sales')}
              >
                销售
              </Text>
              <Text
                className={classnames(styles.chartTab, activeChart === 'traffic' && styles.chartTabActive)}
                onClick={() => setActiveChart('traffic')}
              >
                客流
              </Text>
            </View>
          </View>
          <View className={styles.bars}>
            {chartData.map((item, idx) => (
              <View key={idx} className={styles.bar}>
                <View
                  className={classnames(styles.barFill, activeChart === 'traffic' && styles.barFillPurple)}
                  style={{ height: getBarHeight(item.value) }}
                />
                <Text className={styles.barLabel}>{item.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.noticeHeader}>
            <Text className={styles.title}>📢 总部通知</Text>
            {unreadCount > 0 && (
              <Text className={styles.unreadCount}>{unreadCount} 条未读</Text>
            )}
          </View>
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardPage;
