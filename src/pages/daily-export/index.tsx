import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRetailStore } from '@/store';
import { dailyReports } from '@/data/reports';
import { dashboardStats } from '@/data/dashboard';
import { formatCurrency, formatNumber } from '@/utils/format';
import { DailyExportRecord } from '@/types';

const todayStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const DailyExportPage: React.FC = () => {
  const { dailyExports, addDailyExport, tasks, inspectionIssues, replenishmentItems } = useRetailStore();
  const [remarks, setRemarks] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    inspection: false,
    replenishment: false,
    tasks: false
  });

  const todaySalesData = dailyReports[0];
  const todaySales = todaySalesData.sales;
  const todayProfit = todaySalesData.profit;
  const todayTraffic = todaySalesData.traffic;
  const todayOrders = todaySalesData.orders;
  const todayAvgOrder = todayOrders > 0 ? todaySales / todayOrders : 0;
  const todayProfitRate = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;

  const tasksCompleted = tasks.filter((t) => t.status === 'completed').length;
  const tasksTotal = tasks.length;

  const newMembers = todaySalesData.newMembers;
  const memberCount = dashboardStats.memberCount;
  const nearExpiryCount = 5;
  const lowStockCount = 4;

  const today = todayStr();
  const todayInspectionNew = inspectionIssues.filter((i) => i.createdAt.startsWith(today)).length;
  const todayInspectionResolved = inspectionIssues.filter(
    (i) => i.status === 'resolved' && i.resolvedAt?.startsWith(today)
  ).length;

  const selectedExport = useMemo(
    () => dailyExports.find((e) => e.date === selectedDate),
    [dailyExports, selectedDate]
  );

  const selectedReport = useMemo(
    () => dailyReports.find((r) => r.date === selectedDate),
    [selectedDate]
  );

  const prevDayReport = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const prevStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return dailyReports.find((r) => r.date === prevStr);
  }, [selectedDate, dailyReports]);

  const prevDayExport = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const prevStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return dailyExports.find((e) => e.date === prevStr);
  }, [selectedDate, dailyExports]);

  const diffLine = (cur: number, prev?: number) => {
    if (prev === undefined || prev === 0) return '';
    const diff = cur - prev;
    const pct = ((diff / prev) * 100).toFixed(1);
    if (diff > 0) return `↑${pct}%`;
    if (diff < 0) return `↓${pct}%`;
    return '持平';
  };

  const diffColor = (cur: number, prev?: number) => {
    if (prev === undefined || prev === 0) return '#86909c';
    const diff = cur - prev;
    if (diff > 0) return '#00b42a';
    if (diff < 0) return '#f53f3f';
    return '#86909c';
  };

  const dayInspectionNew = inspectionIssues.filter((i) => i.createdAt.startsWith(selectedDate)).length;
  const dayInspectionResolved = inspectionIssues.filter(
    (i) => i.status === 'resolved' && i.resolvedAt?.startsWith(selectedDate)
  ).length;
  const dayInspectionPending = inspectionIssues.filter(
    (i) => i.createdAt.startsWith(selectedDate) && i.status !== 'resolved'
  ).length;

  const dayReplenishmentOrdered = replenishmentItems.filter(
    (i) => i.orderTime?.startsWith(selectedDate) && i.orderStatus === 'ordered'
  ).length;
  const dayReplenishmentReceived = replenishmentItems.filter(
    (i) => i.receivedTime?.startsWith(selectedDate)
  ).length;
  const dayReplenishmentCompleted = replenishmentItems.filter(
    (i) => i.completedTime?.startsWith(selectedDate)
  ).length;

  const dayTasksCreated = tasks.filter((t) => t.createdAt.startsWith(selectedDate)).length;
  const dayTasksCompleted = tasks.filter(
    (t) => t.status === 'completed' && t.updatedAt?.startsWith(selectedDate)
  ).length;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewIssueDetail = (issueId: string) => {
    Taro.navigateTo({ url: `/pages/inspection-detail/index?id=${issueId}` });
  };

  const handleViewTaskDetail = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
  };

  const handleExport = () => {
    addDailyExport({
      date: today,
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

  const handleViewDetail = (rec: DailyExportRecord) => {
    Taro.showModal({
      title: `${rec.date} 日结详情`,
      content:
        `📊 经营数据\n` +
        `销售额：${formatCurrency(rec.sales)} / 订单 ${rec.orders}单\n` +
        `毛利：${formatCurrency(rec.profit)}（毛利率 ${rec.profitRate.toFixed(1)}%）\n` +
        `客流：${formatNumber(rec.traffic)}人 / 客单价 ${formatCurrency(rec.avgOrder)}\n` +
        `新会员：${rec.newMembers}人 / 会员总数 ${formatNumber(rec.memberCount)}\n\n` +
        `📦 库存\n` +
        `临期商品：${rec.nearExpiryCount}件 / 低库存：${rec.lowStockCount}项\n\n` +
        `🔍 巡店\n` +
        `新增问题：${rec.inspectionNew ?? 0}条 / 已解决：${rec.inspectionResolved ?? 0}条\n\n` +
        `📋 任务\n` +
        `完成进度：${rec.tasksCompleted}/${rec.tasksTotal}\n\n` +
        `导出人：${rec.exportedBy} · ${rec.exportedAt}` +
        (rec.remarks ? `\n\n📝 备注\n${rec.remarks}` : ''),
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handleShare = (id: string) => {
    Taro.showToast({ title: '已生成分享链接', icon: 'success' });
  };

  const handleDateChange = (e) => {
    const val = e.detail.value;
    setSelectedDate(val);
  };

  const curSales = selectedReport?.sales || selectedExport?.sales || 0;
  const curProfit = selectedReport?.profit || selectedExport?.profit || 0;
  const curTraffic = selectedReport?.traffic || selectedExport?.traffic || 0;
  const curOrders = selectedReport?.orders || selectedExport?.orders || 0;
  const curProfitRate = curSales > 0 ? (curProfit / curSales) * 100 : 0;
  const curAvgOrder = curOrders > 0 ? curSales / curOrders : 0;
  const prevSales = prevDayReport?.sales || prevDayExport?.sales;
  const prevProfit = prevDayReport?.profit || prevDayExport?.profit;
  const prevTraffic = prevDayReport?.traffic || prevDayExport?.traffic;
  const prevOrders = prevDayReport?.orders || prevDayExport?.orders;

  const isToday = selectedDate === today;

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={styles.headerCard}>
          <Text className={styles.headerTitle}>📊 日结管理中心</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Text className={styles.headerSub}>选择日期：</Text>
            <Picker mode='date' value={selectedDate} onChange={handleDateChange}>
              <View style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '8rpx 20rpx',
                color: '#fff',
                fontSize: 28
              }}>
                📅 {selectedDate}
              </View>
            </Picker>
            {isToday && (
              <Text style={{ fontSize: 22, background: 'rgba(255,255,255,0.3)', padding: '2rpx 12rpx', borderRadius: 20 }}>
                今天
              </Text>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            📈 经营数据
            <Text style={{ fontSize: 20, color: '#86909c', fontWeight: 400, marginLeft: 8 }}>
              与前一日对比
            </Text>
          </Text>
          <View className={styles.verifyTable}>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>销售总额</Text>
              <Text className={styles.verifyValue}>{formatCurrency(curSales)}</Text>
              {prevSales !== undefined && (
                <Text style={{ fontSize: 20, color: diffColor(curSales, prevSales), marginLeft: 8 }}>
                  {diffLine(curSales, prevSales)}
                </Text>
              )}
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>毛利额</Text>
              <Text className={styles.verifyValue}>{formatCurrency(curProfit)}</Text>
              {prevProfit !== undefined && (
                <Text style={{ fontSize: 20, color: diffColor(curProfit, prevProfit), marginLeft: 8 }}>
                  {diffLine(curProfit, prevProfit)}
                </Text>
              )}
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>毛利率</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {curProfitRate.toFixed(1)}% ✓
              </Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>客流数</Text>
              <Text className={styles.verifyValue}>{formatNumber(curTraffic)} 人</Text>
              {prevTraffic !== undefined && (
                <Text style={{ fontSize: 20, color: diffColor(curTraffic, prevTraffic), marginLeft: 8 }}>
                  {diffLine(curTraffic, prevTraffic)}
                </Text>
              )}
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>订单数</Text>
              <Text className={styles.verifyValue}>{curOrders} 单</Text>
              {prevOrders !== undefined && (
                <Text style={{ fontSize: 20, color: diffColor(curOrders, prevOrders), marginLeft: 8 }}>
                  {diffLine(curOrders, prevOrders)}
                </Text>
              )}
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>客单价</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {formatCurrency(curAvgOrder)} ✓
              </Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>巡店新增问题</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {isToday ? todayInspectionNew : (selectedExport?.inspectionNew ?? 0)} 条 ✓
              </Text>
            </View>
            <View className={styles.verifyRow}>
              <Text className={styles.verifyLabel}>巡店已解决</Text>
              <Text className={`${styles.verifyValue} ${styles.verifyMatch}`}>
                {isToday ? todayInspectionResolved : (selectedExport?.inspectionResolved ?? 0)} 条 ✓
              </Text>
            </View>
          </View>
          <View className={styles.diffNote}>💡 所有字段与报表日结明细保持同口径，可直接核数</View>
        </View>

        {selectedExport && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📄 导出记录</Text>
            <View className={styles.historyCard}>
              <View className={styles.historyHeader}>
                <Text className={styles.historyDate}>📅 {selectedExport.date}</Text>
                <Text className={styles.historyTime}>{selectedExport.exportedAt}</Text>
              </View>
              <View className={styles.historyMeta}>
                导出人：{selectedExport.exportedBy}
              </View>
              {selectedExport.remarks && (
                <View style={{ marginTop: 8, padding: '8rpx 12rpx', background: '#f7f8fa', borderRadius: 8 }}>
                  <Text style={{ fontSize: 22, color: '#86909c' }}>📝 备注：{selectedExport.remarks}</Text>
                </View>
              )}
              <View className={styles.historyStats}>
                <View className={styles.historyStat}>
                  <strong>{formatCurrency(selectedExport.sales)}</strong>
                  销售额
                </View>
                <View className={styles.historyStat}>
                  <strong>{selectedExport.profitRate.toFixed(1)}%</strong>
                  毛利率
                </View>
                <View className={styles.historyStat}>
                  <strong>{formatNumber(selectedExport.traffic)}</strong>
                  客流
                </View>
                <View className={styles.historyStat}>
                  <strong>{selectedExport.inspectionNew ?? 0}</strong>
                  巡店新增
                </View>
              </View>
              <View className={styles.historyActions}>
                <Button className={styles.historyBtn} onClick={() => handleViewDetail(selectedExport)}>
                  完整详情
                </Button>
                <Button className={styles.historyBtn} onClick={() => handleShare(selectedExport.id)}>
                  分享
                </Button>
              </View>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            📋 {selectedDate} 运营复盘
            <Text style={{ fontSize: 20, color: '#86909c', fontWeight: 400, marginLeft: 8 }}>
              点击板块展开明细
            </Text>
          </Text>

          <View className={styles.summaryCard} onClick={() => toggleSection('inspection')}>
            <View className={styles.summaryHeader}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 32 }}>🔍</Text>
                <Text className={styles.summaryCardTitle}>巡店问题</Text>
              </View>
              <Text style={{ fontSize: 24, color: '#86909c' }}>
                {expandedSections.inspection ? '收起 ▲' : '展开 ▼'}
              </Text>
            </View>
            <View className={styles.summaryStats}>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#165dff' }}>{dayInspectionNew}</Text>
                <Text className={styles.summaryStatLabel}>新增</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#00b42a' }}>{dayInspectionResolved}</Text>
                <Text className={styles.summaryStatLabel}>已解决</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#ff7d00' }}>{dayInspectionPending}</Text>
                <Text className={styles.summaryStatLabel}>待处理</Text>
              </View>
            </View>
            {expandedSections.inspection && (
              <View className={styles.summaryDetail}>
                {inspectionIssues.filter((i) => i.createdAt.startsWith(selectedDate)).length === 0 ? (
                  <Text style={{ fontSize: 22, color: '#86909c', textAlign: 'center', padding: '20rpx 0' }}>
                    当日无巡店问题
                  </Text>
                ) : (
                  inspectionIssues
                    .filter((i) => i.createdAt.startsWith(selectedDate))
                    .map((issue) => (
                      <View
                        key={issue.id}
                        className={styles.detailItem}
                        onClick={() => handleViewIssueDetail(issue.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text className={styles.detailTitle}>{issue.title}</Text>
                          <Text className={styles.detailSub}>
                            {issue.createdAt} · {issue.location}
                          </Text>
                        </View>
                        <Text
                          className={classnames(
                            styles.detailBadge,
                            issue.status === 'resolved' ? styles.badgeSuccess :
                            issue.status === 'processing' ? styles.badgePrimary : styles.badgeWarning
                          )}
                        >
                          {issue.status === 'resolved' ? '已解决' : issue.status === 'processing' ? '处理中' : '待处理'}
                        </Text>
                        <Text style={{ fontSize: 24, color: '#86909c' }}>›</Text>
                      </View>
                    ))
                )}
              </View>
            )}
          </View>

          <View className={styles.summaryCard} onClick={() => toggleSection('replenishment')}>
            <View className={styles.summaryHeader}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 32 }}>📦</Text>
                <Text className={styles.summaryCardTitle}>补货处理</Text>
              </View>
              <Text style={{ fontSize: 24, color: '#86909c' }}>
                {expandedSections.replenishment ? '收起 ▲' : '展开 ▼'}
              </Text>
            </View>
            <View className={styles.summaryStats}>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#165dff' }}>{dayReplenishmentOrdered}</Text>
                <Text className={styles.summaryStatLabel}>已下单</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#0fc6c2' }}>{dayReplenishmentReceived}</Text>
                <Text className={styles.summaryStatLabel}>已收货</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#00b42a' }}>{dayReplenishmentCompleted}</Text>
                <Text className={styles.summaryStatLabel}>已完成</Text>
              </View>
            </View>
            {expandedSections.replenishment && (
              <View className={styles.summaryDetail}>
                {replenishmentItems.filter((r) =>
                  r.orderTime?.startsWith(selectedDate) ||
                  r.receivedTime?.startsWith(selectedDate) ||
                  r.completedTime?.startsWith(selectedDate)
                ).length === 0 ? (
                  <Text style={{ fontSize: 22, color: '#86909c', textAlign: 'center', padding: '20rpx 0' }}>
                    当日无补货处理记录
                  </Text>
                ) : (
                  replenishmentItems
                    .filter((r) =>
                      r.orderTime?.startsWith(selectedDate) ||
                      r.receivedTime?.startsWith(selectedDate) ||
                      r.completedTime?.startsWith(selectedDate)
                    )
                    .map((item) => (
                      <View key={item.id} className={styles.detailItem}>
                        <View style={{ flex: 1 }}>
                          <Text className={styles.detailTitle}>{item.name}</Text>
                          <Text className={styles.detailSub}>
                            {item.supplier} · {item.suggestedQty}件
                          </Text>
                        </View>
                        <Text
                          className={classnames(
                            styles.detailBadge,
                            item.orderStatus === 'completed' ? styles.badgeSuccess :
                            item.orderStatus === 'received' ? styles.badgeInfo :
                            item.orderStatus === 'ordered' ? styles.badgePrimary : styles.badgeWarning
                          )}
                        >
                          {item.orderStatus === 'completed' ? '已完成' :
                           item.orderStatus === 'received' ? '已收货' :
                           item.orderStatus === 'ordered' ? '已下单' : '待下单'}
                        </Text>
                      </View>
                    ))
                )}
              </View>
            )}
          </View>

          <View className={styles.summaryCard} onClick={() => toggleSection('tasks')}>
            <View className={styles.summaryHeader}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 32 }}>📋</Text>
                <Text className={styles.summaryCardTitle}>员工任务</Text>
              </View>
              <Text style={{ fontSize: 24, color: '#86909c' }}>
                {expandedSections.tasks ? '收起 ▲' : '展开 ▼'}
              </Text>
            </View>
            <View className={styles.summaryStats}>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#165dff' }}>{dayTasksCreated}</Text>
                <Text className={styles.summaryStatLabel}>新创建</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue} style={{ color: '#00b42a' }}>{dayTasksCompleted}</Text>
                <Text className={styles.summaryStatLabel}>已完成</Text>
              </View>
            </View>
            {expandedSections.tasks && (
              <View className={styles.summaryDetail}>
                {tasks.filter((t) => t.createdAt.startsWith(selectedDate)).length === 0 ? (
                  <Text style={{ fontSize: 22, color: '#86909c', textAlign: 'center', padding: '20rpx 0' }}>
                    当日无任务记录
                  </Text>
                ) : (
                  tasks
                    .filter((t) => t.createdAt.startsWith(selectedDate))
                    .map((task) => (
                      <View
                        key={task.id}
                        className={styles.detailItem}
                        onClick={() => handleViewTaskDetail(task.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text className={styles.detailTitle}>{task.title}</Text>
                          <Text className={styles.detailSub}>
                            {task.assignee} · 截止 {task.deadline}
                          </Text>
                        </View>
                        <Text
                          className={classnames(
                            styles.detailBadge,
                            task.status === 'completed' ? styles.badgeSuccess :
                            task.status === 'doing' ? styles.badgePrimary : styles.badgeWarning
                          )}
                        >
                          {task.status === 'completed' ? '已完成' : task.status === 'doing' ? '进行中' : '待处理'}
                        </Text>
                        <Text style={{ fontSize: 24, color: '#86909c' }}>›</Text>
                      </View>
                    ))
                )}
              </View>
            )}
          </View>
        </View>

        {isToday && (
          <>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>📝 今日备注</Text>
              <Input
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
          </>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            🗂️ 全部历史记录
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
                <View
                  key={rec.id}
                  className={classnames(styles.historyCard, rec.date === selectedDate && styles.historyCardActive)}
                  onClick={() => setSelectedDate(rec.date)}
                >
                  <View className={styles.historyHeader}>
                    <Text className={styles.historyDate}>📅 {rec.date}</Text>
                    <Text className={styles.historyTime}>{rec.exportedAt}</Text>
                  </View>
                  {rec.remarks && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 20, color: '#86909c' }}>📝 {rec.remarks}</Text>
                    </View>
                  )}
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
                    <View className={styles.historyStat}>
                      <strong>{rec.inspectionNew ?? 0}</strong>
                      巡店新增
                    </View>
                  </View>
                  <View className={styles.historyActions}>
                    <Button className={styles.historyBtn} onClick={(e) => { e.stopPropagation?.(); handleViewDetail(rec); }}>
                      完整详情
                    </Button>
                    <Button className={styles.historyBtn} onClick={(e) => { e.stopPropagation?.(); handleShare(rec.id); }}>
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
        {isToday && (
          <Button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleExport}>
            📤 确认导出日结
          </Button>
        )}
      </View>
    </View>
  );
};

export default DailyExportPage;
