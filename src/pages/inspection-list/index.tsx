import React, { useMemo, useState } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useRetailStore } from '@/store';
import { InspectionIssue, InspectionIssueType } from '@/types';

const TYPE_META: Record<InspectionIssueType, { icon: string; label: string }> = {
  stock: { icon: '📦', label: '缺货' },
  price: { icon: '🏷️', label: '价签' },
  display: { icon: '🛒', label: '陈列' },
  clean: { icon: '🧹', label: '卫生' },
  other: { icon: '📋', label: '其他' }
};

const STATUS_META = {
  pending: { label: '待处理', class: styles.statusPending },
  processing: { label: '处理中', class: styles.statusProcessing },
  resolved: { label: '已解决', class: styles.statusResolved }
};

type FilterType = 'all' | 'pending' | 'processing' | 'resolved';

const InspectionListPage: React.FC = () => {
  const { inspectionIssues, updateInspectionIssue, tasks } = useRetailStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const pendingCount = inspectionIssues.filter((i) => i.status === 'pending').length;
  const processingCount = inspectionIssues.filter((i) => i.status === 'processing').length;
  const resolvedCount = inspectionIssues.filter((i) => i.status === 'resolved').length;

  const filtered = useMemo(() => {
    if (filter === 'all') return [...inspectionIssues].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return inspectionIssues
      .filter((i) => i.status === filter)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }, [inspectionIssues, filter]);

  const handleStatusChange = (issue: InspectionIssue, toStatus: 'processing' | 'resolved') => {
    updateInspectionIssue(issue.id, { status: toStatus });
    Taro.showToast({
      title: toStatus === 'processing' ? '已开始处理' : '已标记解决',
      icon: 'success'
    });
  };

  const handleViewTask = (issue: InspectionIssue) => {
    if (!issue.linkedTaskId) return;
    const task = tasks.find((t) => t.id === issue.linkedTaskId);
    if (!task) {
      Taro.showToast({ title: '关联任务已删除', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}` });
  };

  const handleViewDetail = (issue: InspectionIssue) => {
    const typeMeta = TYPE_META[issue.type];
    const statusMeta = STATUS_META[issue.status];
    Taro.showModal({
      title: `${typeMeta.icon} ${issue.title}`,
      content:
        `状态：${statusMeta.label}\n` +
        `位置：${issue.location}\n` +
        `上报：${issue.reporter} · ${issue.createdAt}\n` +
        `描述：${issue.description || '（无）'}\n` +
        (issue.linkedReplenishment ? `\n✅ 已关联补货建议` : '') +
        (issue.linkedTaskId ? `\n✅ 已关联员工任务` : ''),
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handlePreviewPhotos = (photos: string[]) => {
    if (!photos.length) return;
    Taro.previewImage({ urls: photos });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.headerTitle}>🔍 巡店问题记录</Text>
          <Text className={styles.headerSub}>待处理 {pendingCount} · 处理中 {processingCount} · 已解决 {resolvedCount}</Text>
        </View>
        <Button className={styles.reportBtn} onClick={() => Taro.navigateTo({ url: '/pages/inspection-report/index' })}>
          ＋ 新上报
        </Button>
      </View>

      <View className={styles.statusTabs}>
        <View
          className={classnames(styles.statusTab, filter === 'all' && styles.statusTabActive)}
          onClick={() => setFilter('all')}
        >
          全部<Text className={styles.countBadge}>{inspectionIssues.length}</Text>
        </View>
        <View
          className={classnames(styles.statusTab, filter === 'pending' && styles.statusTabActive)}
          onClick={() => setFilter('pending')}
        >
          待处理<Text className={styles.countBadge}>{pendingCount}</Text>
        </View>
        <View
          className={classnames(styles.statusTab, filter === 'processing' && styles.statusTabActive)}
          onClick={() => setFilter('processing')}
        >
          处理中<Text className={styles.countBadge}>{processingCount}</Text>
        </View>
        <View
          className={classnames(styles.statusTab, filter === 'resolved' && styles.statusTabActive)}
          onClick={() => setFilter('resolved')}
        >
          已解决<Text className={styles.countBadge}>{resolvedCount}</Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
        {filtered.length === 0 ? (
          <View className={styles.emptyWrap}>
            <View className={styles.emptyIcon}>✅</View>
            <Text className={styles.emptyText}>
              {filter === 'all' ? '暂无巡店问题记录' : `暂无${STATUS_META[filter].label}的问题`}
            </Text>
            <Button
              className={styles.emptyBtn}
              onClick={() => Taro.navigateTo({ url: '/pages/inspection-report/index' })}
            >
              立即上报问题
            </Button>
          </View>
        ) : (
          <View className={styles.issueList}>
            {filtered.map((issue) => {
              const typeMeta = TYPE_META[issue.type];
              const statusMeta = STATUS_META[issue.status];
              const cardClass =
                issue.status === 'pending'
                  ? styles.issuePending
                  : issue.status === 'processing'
                  ? styles.issueProcessing
                  : styles.issueResolved;

              return (
                <View key={issue.id} className={classnames(styles.issueCard, cardClass)}>
                  <View className={styles.issueHeader} onClick={() => Taro.navigateTo({ url: `/pages/inspection-detail/index?id=${issue.id}` })}>
                    <Text className={styles.issueTitle}>
                      {typeMeta.icon} {issue.title}
                    </Text>
                    <Text className={classnames(styles.statusTag, statusMeta.class)}>{statusMeta.label}</Text>
                  </View>
                  <View className={styles.issueMeta}>
                    <Text className={styles.issueMetaItem}>📍 {issue.location}</Text>
                    <Text className={styles.issueMetaItem}>👤 {issue.reporter}</Text>
                    <Text className={styles.issueMetaItem}>🕐 {issue.createdAt}</Text>
                  </View>
                  {issue.description && <Text className={styles.issueDesc}>{issue.description}</Text>}
                  {issue.photos.length > 0 && (
                    <View className={styles.photoStrip}>
                      {issue.photos.slice(0, 4).map((p, i) => (
                        <Image
                          key={i}
                          className={styles.photoThumb}
                          src={p}
                          mode='aspectFill'
                          onClick={() => handlePreviewPhotos(issue.photos)}
                        />
                      ))}
                      {issue.photos.length > 4 && (
                        <View
                          className={styles.photoThumb}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#e5e6eb',
                            color: '#86909c',
                            fontSize: 24
                          }}
                          onClick={() => handlePreviewPhotos(issue.photos)}
                        >
                          +{issue.photos.length - 4}
                        </View>
                      )}
                    </View>
                  )}
                  {(issue.linkedReplenishment || issue.linkedTaskId) && (
                    <View className={styles.linkBadges}>
                      {issue.linkedReplenishment && (
                        <Text className={classnames(styles.linkBadge, styles.badgeStock)}>📦 关联补货</Text>
                      )}
                      {issue.linkedTaskId && (
                        <Text
                          className={classnames(styles.linkBadge, styles.badgeTask)}
                          onClick={() => handleViewTask(issue)}
                        >
                          📋 关联任务 ›
                        </Text>
                      )}
                    </View>
                  )}
                  <View className={styles.issueActions}>
                    <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={() => handleViewDetail(issue)}>
                      详情
                    </Button>
                    {issue.status === 'pending' && (
                      <Button
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={() => handleStatusChange(issue, 'processing')}
                      >
                        开始处理
                      </Button>
                    )}
                    {issue.status === 'processing' && (
                      <Button
                        className={classnames(styles.actionBtn, styles.btnSuccess)}
                        onClick={() => handleStatusChange(issue, 'resolved')}
                      >
                        标记解决
                      </Button>
                    )}
                    {issue.status === 'resolved' && (
                      <Button
                        className={classnames(styles.actionBtn, styles.btnSecondary)}
                        onClick={() => handleStatusChange(issue, 'pending')}
                      >
                        重开
                      </Button>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default InspectionListPage;
