import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { categoryProfits, memberRepurchases, dailyReports } from '@/data/reports';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import { useRetailStore } from '@/store';

type TabType = 'category' | 'member' | 'daily';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('category');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dailyExports = useRetailStore((s) => s.dailyExports);

  usePullDownRefresh(() => {
    console.log('[Reports] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const totalSales = dailyReports.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = dailyReports.reduce((sum, d) => sum + d.orders, 0);
  const totalProfit = dailyReports.reduce((sum, d) => sum + d.profit, 0);
  const totalTraffic = dailyReports.reduce((sum, d) => sum + d.traffic, 0);
  const totalNewMembers = dailyReports.reduce((sum, d) => sum + d.newMembers, 0);

  const maxSales = Math.max(...categoryProfits.map((c) => c.sales));
  const maxRepurchase = Math.max(...memberRepurchases.map((m) => m.repurchaseRate));

  const handleExport = () => {
    Taro.navigateTo({ url: '/pages/daily-export/index' });
  };

  const handleDailySummary = () => {
    console.log('[Reports] 查看今日日报');
    const today = dailyReports[0];
    Taro.showModal({
      title: '今日日结摘要',
      content: `日期：${today.date}\n销售额：${formatCurrency(today.sales)}\n订单数：${today.orders}单\n毛利额：${formatCurrency(today.profit)}\n客流数：${today.traffic}人\n新会员：${today.newMembers}人\n客单价：${formatCurrency(today.sales / today.orders)}`,
      showCancel: false,
      confirmText: '好的'
    });
  };

  const getLevelClass = (level: string) => {
    if (level.includes('钻石')) return styles.levelDiamond;
    if (level.includes('金')) return styles.levelGold;
    if (level.includes('银')) return styles.levelSilver;
    return styles.levelNormal;
  };

  const getLevelIcon = (level: string) => {
    if (level.includes('钻石')) return '💎';
    if (level.includes('金')) return '🥇';
    if (level.includes('银')) return '🥈';
    return '👤';
  };

  return (
    <View className={styles.page}>
      <View className={styles.actionRow}>
        <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleDailySummary}>
          📊 今日日结
        </Button>
        <Button className={styles.actionBtn} onClick={handleExport}>
          📤 日结导出中心
          {dailyExports.length > 0 && (
            <Text
              style={{
                marginLeft: 8,
                fontSize: 20,
                background: '#ff7d00',
                color: '#fff',
                borderRadius: 20,
                padding: '2rpx 12rpx'
              }}
            >
              {dailyExports.length}
            </Text>
          )}
        </Button>
      </View>

      <View className={styles.overviewCard}>
        <View className={styles.overviewTitle}>
          <Text>📈 近7日经营概览</Text>
          <Text className={styles.periodTag}>本周</Text>
        </View>
        <View className={styles.overviewGrid}>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>💰 总销售额</Text>
            <Text className={styles.overviewValue} style={{ color: '#165dff' }}>
              {formatCurrency(totalSales)}
            </Text>
            <Text className={classnames(styles.overviewGrowth, styles.growthUp)}>
              同比 {formatPercent(8.6)}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>📋 总订单</Text>
            <Text className={styles.overviewValue} style={{ color: '#722ed1' }}>
              {formatNumber(totalOrders)}
            </Text>
            <Text className={classnames(styles.overviewGrowth, styles.growthUp)}>
              同比 {formatPercent(6.2)}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>📈 总毛利</Text>
            <Text className={styles.overviewValue} style={{ color: '#00b42a' }}>
              {formatCurrency(totalProfit)}
            </Text>
            <Text className={classnames(styles.overviewGrowth, styles.growthUp)}>
              同比 {formatPercent(10.8)}
            </Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewLabel}>👥 客流</Text>
            <Text className={styles.overviewValue} style={{ color: '#eb2f96' }}>
              {formatNumber(totalTraffic)}
            </Text>
            <Text className={classnames(styles.overviewGrowth, styles.growthUp)}>
              同比 {formatPercent(5.4)}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'category' && styles.tabActive)}
          onClick={() => setActiveTab('category')}
        >
          品类毛利
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'member' && styles.tabActive)}
          onClick={() => setActiveTab('member')}
        >
          会员复购
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'daily' && styles.tabActive)}
          onClick={() => setActiveTab('daily')}
        >
          日结明细
        </Text>
      </View>

      {activeTab === 'category' && (
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>🏷️ 品类毛利分析</Text>
            <Text style={{ fontSize: 24, color: '#86909c' }}>共{categoryProfits.length}类</Text>
          </View>
          <View className={styles.bars}>
            {categoryProfits.map((cat, idx) => (
              <View key={idx} className={styles.barItem}>
                <Text className={styles.barLabel}>{cat.category}</Text>
                <View className={styles.barWrap}>
                  <View
                    className={styles.barFill}
                    style={{
                      width: `${(cat.sales / maxSales) * 100}%`,
                      background: `linear-gradient(90deg, 
                        hsl(${210 - idx * 15}, 80%, 60%), 
                        hsl(${210 - idx * 15}, 80%, 50%))`
                    }}
                  />
                </View>
                <View className={styles.barValue}>
                  <Text style={{ display: 'block', fontSize: 22 }}>
                    {formatCurrency(cat.sales)}
                  </Text>
                  <Text style={{ display: 'block', fontSize: 20, color: '#00b42a' }}>
                    毛利{cat.profitRate}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'member' && (
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>💎 会员复购分析</Text>
            <Text style={{ fontSize: 24, color: '#86909c' }}>
              新会员+{totalNewMembers}
            </Text>
          </View>
          <View className={styles.memberList}>
            {memberRepurchases.map((m, idx) => (
              <View key={idx} className={styles.memberItem}>
                <View className={classnames(styles.memberLevel, getLevelClass(m.level))}>
                  {getLevelIcon(m.level)}
                </View>
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>{m.level}</Text>
                  <View className={styles.memberStats}>
                    <Text>
                      人数: <Text className={styles.statValue}>{formatNumber(m.count)}</Text>
                    </Text>
                    <Text>
                      客单: <Text className={styles.statValue}>{formatCurrency(m.avgSpend)}</Text>
                    </Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <View className={styles.repurchaseBar}>
                      <View
                        className={styles.repurchaseFill}
                        style={{ width: `${(m.repurchaseRate / maxRepurchase) * 100}%` }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#eb2f96'
                      }}
                    >
                      复购率{m.repurchaseRate}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'daily' && (
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>📅 日结明细</Text>
            <Text style={{ fontSize: 24, color: '#86909c' }}>近7天</Text>
          </View>
          <View className={styles.dailyTable}>
            <View className={styles.tableHeader}>
              <Text className={styles.tableCell}>日期</Text>
              <Text className={styles.tableCell}>销售额</Text>
              <Text className={styles.tableCell}>订单</Text>
              <Text className={styles.tableCell}>毛利</Text>
              <Text className={styles.tableCell}>客流</Text>
            </View>
            {dailyReports.map((d, idx) => (
              <View key={idx} className={styles.tableRow}>
                <Text className={styles.rowCell}>{d.date.slice(5)}</Text>
                <Text className={styles.rowCell}>{formatCurrency(d.sales)}</Text>
                <Text className={styles.rowCell}>{d.orders}</Text>
                <Text className={classnames(styles.rowCell, styles.profitRate)}>
                  {((d.profit / d.sales) * 100).toFixed(1)}%
                </Text>
                <Text className={styles.rowCell}>{d.traffic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default ReportsPage;
