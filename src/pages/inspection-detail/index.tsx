import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useRetailStore } from '@/store';
import { InspectionIssue, ReplenishmentItem } from '@/types';

const TYPE_META: Record<string, { icon: string; label: string }> = {
  stock: { icon: '📦', label: '缺货问题' },
  price: { icon: '🏷️', label: '价签问题' },
  display: { icon: '🛒', label: '陈列问题' },
  clean: { icon: '🧹', label: '卫生问题' },
  other: { icon: '📋', label: '其他问题' }
};

const STATUS_META = {
  pending: { label: '待处理', class: styles.statusPending },
  processing: { label: '处理中', class: styles.statusProcessing },
  resolved: { label: '已解决', class: styles.statusResolved }
};

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待下单', color: '#ff7d00' },
  ordered: { label: '已下单', color: '#165dff' },
  completed: { label: '已完成', color: '#00b42a' }
};

const InspectionDetailPage: React.FC = () => {
  const router = useRouter();
  const issueId = router.params.id as string;
  const {
    getInspectionIssueById,
    updateInspectionIssue,
    getTaskById,
    tasks,
    replenishmentItems,
    addReplenishmentFromIssue,
    syncIssueStatus
  } = useRetailStore();

  const [resolvedNote, setResolvedNote] = useState('');
  const [showResolveInput, setShowResolveInput] = useState(false);

  const issue = useMemo(
    () => getInspectionIssueById(issueId) as InspectionIssue | undefined,
    [issueId, getInspectionIssueById]
  );

  const linkedTasks = useMemo(() => {
    if (!issue) return [];
    const ids = issue.linkedTaskIds || (issue.linkedTaskId ? [issue.linkedTaskId] : []);
    return ids.map((id) => getTaskById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getTaskById>>[];
  }, [issue, getTaskById, tasks]);

  const linkedReplenishItems = useMemo(() => {
    if (!issue?.linkedReplenishmentItems?.length) return [];
    return replenishmentItems.filter((r) => issue.linkedReplenishmentItems?.includes(r.id));
  }, [issue, replenishmentItems]);

  if (!issue) {
    return (
      <View className={styles.page}>
        <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
          <Text style={{ fontSize: 60 }}>❓</Text>
          <Text style={{ display: 'block', marginTop: 20, color: '#86909c' }}>问题不存在或已删除</Text>
        </View>
      </View>
    );
  }

  const typeMeta = TYPE_META[issue.type] || TYPE_META.other;
  const statusMeta = STATUS_META[issue.status];
  const headerClass =
    issue.status === 'pending'
      ? styles.statusPending
      : issue.status === 'processing'
      ? styles.statusProcessing
      : styles.statusResolved;

  const handleStartProcess = () => {
    updateInspectionIssue(issue.id, { status: 'processing' });
    syncIssueStatus(issue.id);
    Taro.showToast({ title: '已开始处理', icon: 'success' });
  };

  const handleShowResolve = () => {
    setShowResolveInput(true);
  };

  const handleResolve = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const resolvedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    updateInspectionIssue(issue.id, {
      status: 'resolved',
      resolvedAt,
      resolvedNote: resolvedNote.trim() || undefined
    });
    syncIssueStatus(issue.id);
    setShowResolveInput(false);
    Taro.showToast({ title: '已标记解决', icon: 'success' });
  };

  const handleReopen = () => {
    updateInspectionIssue(issue.id, { status: 'pending' });
    syncIssueStatus(issue.id);
    Taro.showToast({ title: '已重新打开', icon: 'none' });
  };

  const handleViewTask = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
  };

  const handleCreateTask = () => {
    Taro.navigateTo({ url: `/pages/tasks/index` });
  };

  const handleViewReplenishment = () => {
    Taro.switchTab({ url: '/pages/replenishment/index' });
  };

  const handleAddReplenishment = () => {
    Taro.showModal({
      title: '添加补货项',
      editable: true,
      placeholderText: '请输入商品名称，如：可口可乐330ml',
      success: (res) => {
        if (res.confirm && res.content?.trim()) {
          addReplenishmentFromIssue(issue.id, issue.title, res.content.trim());
          Taro.showToast({ title: '已添加到补货建议', icon: 'success' });
        }
      }
    });
  };

  const handlePreviewPhotos = (idx: number) => {
    if (!issue.photos.length) return;
    Taro.previewImage({
      current: issue.photos[idx],
      urls: issue.photos
    });
  };

  const getOrderStatusDisplay = (item: ReplenishmentItem) => {
    const s = item.orderStatus || 'pending';
    return ORDER_STATUS_MAP[s] || ORDER_STATUS_MAP.pending;
  };

  const buildTimeline = () => {
    const items: { time: string; title: string; desc?: string; dot: 'pending' | 'done' | 'current' }[] = [];
    items.push({
      time: issue.createdAt,
      title: '问题上报',
      desc: `由 ${issue.reporter} 上报于 ${issue.location}`,
      dot: 'done'
    });

    if (issue.status !== 'pending') {
      items.push({
        time: issue.createdAt,
        title: '开始处理',
        desc: '已进入处理流程',
        dot: 'done'
      });
    } else {
      items.push({
        time: '等待处理',
        title: '待处理',
        desc: '请尽快安排人员跟进',
        dot: 'pending'
      });
    }

    if (issue.status === 'resolved') {
      items.push({
        time: issue.resolvedAt || '',
        title: '问题解决',
        desc: issue.resolvedNote || '处理完成',
        dot: 'done'
      });
    }

    if (issue.linkedReplenishment && linkedReplenishItems.length > 0) {
      const latest = linkedReplenishItems[0];
      const orderInfo = latest.orderNo ? ` · 单号 ${latest.orderNo}` : '';
      items.splice(1, 0, {
        time: latest.orderTime || issue.createdAt,
        title: '已加入补货建议',
        desc: `共 ${linkedReplenishItems.length} 项商品${orderInfo}`,
        dot: 'done'
      });
    }

    linkedTasks.forEach((t) => {
      items.splice(1, 0, {
        time: t.createdAt,
        title: '已生成员工任务',
        desc: `关联任务：${t.title}（${t.assignee}）`,
        dot: 'done'
      });
    });

    return items;
  };

  const timeline = buildTimeline();

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={classnames(styles.headerCard, headerClass)}>
          <Text className={styles.statusBadge}>{typeMeta.icon} {statusMeta.label}</Text>
          <Text className={styles.issueTitle}>{issue.title}</Text>
          <View className={styles.issueMeta}>
            <Text className={styles.metaItem}>📍 {issue.location}</Text>
            <Text className={styles.metaItem}>👤 {issue.reporter}</Text>
            <Text className={styles.metaItem}>🕐 {issue.createdAt}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 问题描述</Text>
          <Text className={styles.descText}>
            {issue.description || '（无详细描述）'}
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            📸 现场照片
            <Text style={{ fontSize: 20, color: '#86909c', fontWeight: 400, marginLeft: 8 }}>
              {issue.photos.length} 张
            </Text>
          </Text>
          {issue.photos.length === 0 ? (
            <View className={styles.emptyPhotos}>暂无照片记录</View>
          ) : (
            <View className={styles.photoGrid}>
              {issue.photos.map((p, i) => (
                <View key={i} className={styles.photoItem} onClick={() => handlePreviewPhotos(i)}>
                  <Image className={styles.photoImg} src={p} mode='aspectFill' />
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📌 跟进进度</Text>
          <View className={styles.timeline}>
            {timeline.map((t, i) => (
              <View key={i} className={styles.timelineItem}>
                <View
                  className={classnames(
                    styles.timelineDot,
                    t.dot === 'done' && styles.timelineDotDone,
                    t.dot === 'pending' && styles.timelineDotPending
                  )}
                />
                <Text className={styles.timelineTime}>{t.time}</Text>
                <Text className={styles.timelineTitle}>{t.title}</Text>
                {t.desc && <Text className={styles.timelineDesc}>{t.desc}</Text>}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🔗 关联项</Text>

          <Text
            style={{
              fontSize: 22,
              color: '#86909c',
              marginBottom: 16,
              display: 'block',
              marginTop: -8
            }}
          >
            补货建议
          </Text>
          {linkedReplenishItems.length === 0 ? (
            <View className={styles.emptyLink}>暂未关联补货项</View>
          ) : (
            linkedReplenishItems.map((item) => {
              const orderDisplay = getOrderStatusDisplay(item);
              return (
                <View
                  key={item.id}
                  className={classnames(styles.linkCard, styles.linkStock)}
                  onClick={handleViewReplenishment}
                >
                  <Text className={styles.linkIcon}>📦</Text>
                  <View className={styles.linkInfo}>
                    <Text className={styles.linkTitle}>{item.name}</Text>
                    <Text className={styles.linkSub}>
                      {item.category} · 建议补货 {item.suggestedQty} 件
                    </Text>
                    <View style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <Text style={{ fontSize: 20, color: orderDisplay.color }}>
                        {orderDisplay.label}
                      </Text>
                      {item.orderNo && (
                        <Text style={{ fontSize: 20, color: '#86909c' }}>
                          单号：{item.orderNo}
                        </Text>
                      )}
                      {item.orderTime && (
                        <Text style={{ fontSize: 20, color: '#86909c' }}>
                          {item.orderTime}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text className={styles.linkArrow}>›</Text>
                </View>
              );
            })
          )}
          {issue.type === 'stock' && (
            <Button
              onClick={handleAddReplenishment}
              style={{
                marginTop: 16,
                width: '100%',
                height: 64,
                background: 'rgba(255, 125, 0, 0.08)',
                color: '#ff7d00',
                border: '1rpx dashed rgba(255, 125, 0, 0.3)',
                borderRadius: 8,
                fontSize: 24,
                fontWeight: 500
              }}
            >
              ＋ 添加补货项
            </Button>
          )}

          <Text
            style={{
              fontSize: 22,
              color: '#86909c',
              margin: '24rpx 0 16rpx',
              display: 'block'
            }}
          >
            员工任务
          </Text>
          {linkedTasks.length === 0 ? (
            <View className={styles.emptyLink}>
              暂未关联处理任务
              <Text
                style={{ color: '#165dff', marginLeft: 8 }}
                onClick={handleCreateTask}
              >
                立即创建 ›
              </Text>
            </View>
          ) : (
            linkedTasks.map((task) => (
              <View
                key={task.id}
                className={classnames(styles.linkCard, styles.linkTask)}
                onClick={() => handleViewTask(task.id)}
              >
                <Text className={styles.linkIcon}>📋</Text>
                <View className={styles.linkInfo}>
                  <Text className={styles.linkTitle}>{task.title}</Text>
                  <Text className={styles.linkSub}>
                    负责人：{task.assignee} · {task.status === 'pending' ? '待处理' : task.status === 'doing' ? '进行中' : '已完成'}
                  </Text>
                </View>
                <Text className={styles.linkArrow}>›</Text>
              </View>
            ))
          )}
        </View>

        {issue.status === 'resolved' && issue.resolvedNote && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>✅ 处理结果</Text>
            <View className={styles.resolveNote}>{issue.resolvedNote}</View>
          </View>
        )}

        {showResolveInput && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>✍️ 填写处理结果</Text>
            <Textarea
              className={styles.resolveInput}
              placeholder='请描述处理方式和结果...'
              value={resolvedNote}
              onInput={(e) => setResolvedNote(e.detail.value)}
              maxlength={200}
            />
            <View style={{ display: 'flex', gap: 16 }}>
              <Button
                onClick={() => setShowResolveInput(false)}
                style={{
                  flex: 1,
                  height: 72,
                  background: '#f7f8fa',
                  color: '#86909c',
                  borderRadius: 8,
                  fontSize: 26,
                  fontWeight: 500
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleResolve}
                style={{
                  flex: 1,
                  height: 72,
                  background: 'linear-gradient(135deg, #52c41a, #00b42a)',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 26,
                  fontWeight: 600
                }}
              >
                确认解决
              </Button>
            </View>
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        {issue.status === 'pending' && (
          <>
            <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={() => Taro.navigateBack()}>
              返回
            </Button>
            <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleStartProcess}>
              开始处理
            </Button>
          </>
        )}
        {issue.status === 'processing' && !showResolveInput && (
          <>
            <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleReopen}>
              退回待处理
            </Button>
            <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleShowResolve}>
              标记解决
            </Button>
          </>
        )}
        {issue.status === 'resolved' && (
          <>
            <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={() => Taro.navigateBack()}>
              返回列表
            </Button>
            <Button className={classnames(styles.actionBtn, styles.btnWarning)} onClick={handleReopen}>
              重新打开
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default InspectionDetailPage;
