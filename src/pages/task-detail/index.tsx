import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRetailStore } from '@/store';
import { employees } from '@/data/tasks';
import { getStatusText, getPriorityText } from '@/utils/format';
import { Task } from '@/types';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || 'T001';
  const getTaskById = useRetailStore((s) => s.getTaskById);
  const updateTask = useRetailStore((s) => s.updateTask);
  const [task, setTask] = useState<Task | undefined>(() => getTaskById(taskId));

  const assignee = employees.find((e) => e.name === task?.assignee) || employees[0];

  const refreshTask = () => setTask(getTaskById(taskId));

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'guide':
        return styles.typeGuide;
      case 'clean':
        return styles.typeClean;
      case 'display':
        return styles.typeDisplay;
      case 'replenish':
        return styles.typeReplenish;
      default:
        return styles.typeGuide;
    }
  };
  const getTypeIcon = (t: string) =>
    t === 'guide' ? '👋' : t === 'clean' ? '🧹' : t === 'display' ? '🛍️' : '📦';
  const getTypeName = (t: string) =>
    t === 'guide' ? '导购任务' : t === 'clean' ? '清洁任务' : t === 'display' ? '陈列任务' : '补货任务';

  const sourceMap: Record<string, string> = {
    manual: '手动分配',
    handover: '交接班',
    inspection: '巡店上报'
  };

  const getStatusClass = (s: string) =>
    s === 'pending'
      ? styles.statusPending
      : s === 'doing'
      ? styles.statusDoing
      : styles.statusCompleted;

  const getPriorityClass = (p: string) =>
    p === 'high'
      ? styles.priorityHigh
      : p === 'medium'
      ? styles.priorityMedium
      : styles.priorityLow;

  const getStatusDotClass = (s: string) =>
    s === 'on' ? styles.dotOn : s === 'busy' ? styles.dotBusy : styles.dotOff;
  const getStatusTextForEmp = (s: string) => (s === 'on' ? '在岗' : s === 'busy' ? '忙碌' : '离岗');

  const handleStart = () => {
    Taro.showModal({
      title: '开始任务',
      content: `确认开始执行任务「${task?.title}」？`,
      success: (res) => {
        if (res.confirm) {
          updateTask(taskId, { status: 'doing' });
          refreshTask();
          Taro.showToast({ title: '任务已开始', icon: 'success' });
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成任务',
      content: `确认任务「${task?.title}」已完成？`,
      editable: true,
      placeholderText: '填写完成备注（可选）',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            updateTask(taskId, { status: 'completed' });
            refreshTask();
            Taro.showToast({ title: '任务已完成', icon: 'success' });
          }, 600);
        }
      }
    });
  };

  const handleTransfer = () => {
    Taro.showActionSheet({
      itemList: employees.filter((e) => e.status !== 'off').map((e) => e.name),
      success: (res) => {
        const targetEmp = employees.filter((e) => e.status !== 'off')[res.tapIndex];
        Taro.showModal({
          title: '转派任务',
          content: `确认将任务转派给「${targetEmp.name}」？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              updateTask(taskId, { assignee: targetEmp.name });
              refreshTask();
              Taro.showToast({ title: '转派成功', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleAddNote = () => {
    Taro.showModal({
      title: '添加备注',
      editable: true,
      placeholderText: '输入任务执行备注...',
      success: (res) => {
        if (res.confirm && res.content) {
          updateTask(taskId, {
            description: task!.description + `\n【备注】${res.content}`
          });
          refreshTask();
          Taro.showToast({ title: '备注已添加', icon: 'success' });
        }
      }
    });
  };

  const handleUrgent = () => {
    if (task?.priority === 'high') {
      Taro.showToast({ title: '已是最高优先级', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '提升优先级',
      content: '确认将该任务提升为最高优先级？',
      success: (res) => {
        if (res.confirm) {
          updateTask(taskId, { priority: 'high' });
          refreshTask();
          Taro.showToast({ title: '已设为紧急', icon: 'success' });
        }
      }
    });
  };

  if (!task) {
    return (
      <View className={styles.page}>
        <Text style={{ padding: 32, color: '#86909c' }}>任务不存在或已删除</Text>
      </View>
    );
  }

  const timeline = [
    {
      time: task.createdAt,
      content: '任务创建',
      desc: `店长分配任务给 ${task.assignee}`,
      done: true
    },
    {
      time: task.status !== 'pending' ? task.createdAt : '',
      content: '任务开始执行',
      desc: task.status !== 'pending' ? `${task.assignee} 已开始执行` : '待开始',
      done: task.status !== 'pending'
    },
    {
      time: task.status === 'completed' ? task.deadline : '',
      content: '任务完成',
      desc: task.status === 'completed' ? '任务执行完成并提交' : '待完成',
      done: task.status === 'completed'
    }
  ];

  const renderBottomBar = () => {
    if (task.status === 'completed') {
      return (
        <View className={styles.bottomBar}>
          <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleAddNote}>
            添加备注
          </Button>
        </View>
      );
    }
    if (task.status === 'pending') {
      return (
        <View className={styles.bottomBar}>
          <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleTransfer}>
            转派
          </Button>
          <Button className={classnames(styles.actionBtn, styles.btnDanger)} onClick={handleUrgent}>
            紧急
          </Button>
          <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleStart}>
            开始执行
          </Button>
        </View>
      );
    }
    return (
      <View className={styles.bottomBar}>
        <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleAddNote}>
          添加备注
        </Button>
        <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleComplete}>
          提交完成
        </Button>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={classnames(styles.taskType, getTypeClass(task.type))}>
          {getTypeIcon(task.type)} {getTypeName(task.type)}
        </View>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <View style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Text className={classnames(styles.statusBadge, getStatusClass(task.status))}>
            {getStatusText(task.status)}
          </Text>
          <Text className={classnames(styles.priorityBadge, getPriorityClass(task.priority))}>
            {getPriorityText(task.priority)}
          </Text>
        </View>
        <View className={styles.taskMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>截止时间</Text>
            <Text className={styles.metaValue}>{task.deadline}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>创建时间</Text>
            <Text className={styles.metaValue}>{task.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>👤 任务负责人</Text>
        <View className={styles.assigneeCard}>
          <View className={styles.avatar}>{task.assignee.charAt(0)}</View>
          <View className={styles.assigneeInfo}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text className={styles.assigneeName}>{task.assignee}</Text>
              <View className={classnames(styles.statusDot, getStatusDotClass(assignee.status))} />
            </View>
            <Text className={styles.assigneeRole}>
              {assignee.role} · {getStatusTextForEmp(assignee.status)} · 今日完成
              {assignee.completedTasks}/{assignee.todayTasks}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>📝 任务描述</Text>
        <Text className={styles.descText}>{task.description}</Text>
      </View>

      {(task.source || task.linkedIssueId) && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>🔗 关联信息</Text>
          {task.source && (
            <View className={styles.linkItem}>
              <Text className={styles.linkLabel}>任务来源</Text>
              <Text className={styles.linkValue}>
                {task.source === 'handover' ? '🔄 ' : task.source === 'inspection' ? '🔍 ' : '✏️ '}
                {sourceMap[task.source]}
              </Text>
            </View>
          )}
          {task.linkedIssueId && (
            <View
              className={styles.linkItem}
              style={{ cursor: 'pointer' }}
              onClick={() =>
                Taro.navigateTo({ url: `/pages/inspection-detail/index?id=${task.linkedIssueId}` })
              }
            >
              <Text className={styles.linkLabel}>关联巡店问题</Text>
              <View style={{ flex: 1, textAlign: 'right' }}>
                <Text style={{ fontSize: 24, color: '#165dff' }}>
                  {task.linkedIssueTitle || '查看问题详情'} ›
                </Text>
              </View>
            </View>
          )}
          {task.type === 'replenish' && task.linkedIssueId && (
            <View
              className={styles.linkItem}
              style={{ cursor: 'pointer' }}
              onClick={() => Taro.switchTab({ url: '/pages/replenishment/index' })}
            >
              <Text className={styles.linkLabel}>关联补货项</Text>
              <View style={{ flex: 1, textAlign: 'right' }}>
                <Text style={{ fontSize: 24, color: '#ff7d00' }}>
                  查看补货建议 ›
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>⏱️ 任务进度</Text>
        <View className={styles.timeline}>
          {timeline.map((item, idx) => (
            <View key={idx} className={styles.timelineItem}>
              <View
                className={classnames(
                  styles.timelineDot,
                  item.done && styles.timelineDotDone
                )}
              />
              {item.time && <Text className={styles.timelineTime}>{item.time}</Text>}
              <Text className={styles.timelineContent}>{item.content}</Text>
              <Text className={styles.timelineDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 160 }} />
      {renderBottomBar()}
    </View>
  );
};

export default TaskDetailPage;
