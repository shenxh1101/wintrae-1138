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
import { useRetailStore } from '@/store';

const DashboardPage: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'sales' | 'traffic'>('sales');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { inspectionIssues, tasks, promotions } = useRetailStore();

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
  const pendingInspectionCount = inspectionIssues.filter((i) => i.status === 'pending').length;
  const pendingInspections = inspectionIssues.filter((i) => i.status === 'pending').slice(0, 3);
  const pendingTaskCount = tasks.filter((t) => t.status === 'pending').length;
  const ongoingPromotions = promotions.filter((p) => p.status === 'ongoing').length;

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

        {(pendingInspectionCount > 0 || pendingTaskCount > 0 || ongoingPromotions > 0) && (
          <View className={styles.alertCard}>
            <View className={styles.alertHeader}>
              <Text className={styles.alertTitle}>⚠️ 今日待处理</Text>
              <Text
                className={styles.alertMore}
                onClick={() => Taro.navigateTo({ url: '/pages/inspection-list/index' })}
              >
                查看全部 ›
              </Text>
            </View>
            {pendingInspectionCount > 0 && (
              <View
                className={classnames(styles.alertItem, styles.alertOrange)}
                onClick={() => Taro.navigateTo({ url: '/pages/inspection-list/index' })}
              >
                <Text className={styles.alertIcon}>🔍</Text>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertLabel}>巡店问题待处理</Text>
                  <Text className={styles.alertDesc}>
                    {pendingInspectionCount} 条问题需要跟进
                    {pendingInspections.length > 0 &&
                      `：${pendingInspections.map((p) => p.title).slice(0, 2).join('、')}`}
                  </Text>
                </View>
                <Text className={styles.alertBadge}>{pendingInspectionCount}</Text>
              </View>
            )}
            {pendingTaskCount > 0 && (
              <View
                className={classnames(styles.alertItem, styles.alertPurple)}
                onClick={() => Taro.switchTab({ url: '/pages/tasks/index' })}
              >
                <Text className={styles.alertIcon}>📋</Text>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertLabel}>员工任务待分配/执行</Text>
                  <Text className={styles.alertDesc}>{pendingTaskCount} 条任务等待处理</Text>
                </View>
                <Text className={styles.alertBadge}>{pendingTaskCount}</Text>
              </View>
            )}
            {ongoingPromotions > 0 && (
              <View
                className={classnames(styles.alertItem, styles.alertBlue)}
                onClick={() => Taro.switchTab({ url: '/pages/promotion/index' })}
              >
                <Text className={styles.alertIcon}>🎯</Text>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertLabel}>促销活动执行中</Text>
                  <Text className={styles.alertDesc}>{ongoingPromotions} 场活动正在推进</Text>
                </View>
                <Text className={styles.alertBadge}>{ongoingPromotions}</Text>
              </View>
            )}
            <View
              className={styles.reportEntry}
              onClick={() => Taro.navigateTo({ url: '/pages/inspection-report/index' })}
            >
              <Text style={{ fontSize: 28 }}>📸</Text>
              <Text style={{ fontSize: 24, color: '#ff7d00', fontWeight: 600, marginLeft: 8 }}>
                巡店发现新问题？立即上报 ›
              </Text>
            </View>
          </View>
        )}

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
