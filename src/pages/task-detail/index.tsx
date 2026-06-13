import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { tasks, employees } from '@/data/tasks';
import { Task, Employee } from '@/types';
import { getStatusText, getPriorityText } from '@/utils/format';

const TaskDetailPage: React.FC = () => {
  const [task, setTask] = useState<Task>(tasks[0]);
  const assignee = employees.find((e) => e.name === task.assignee) || employees[0];

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'guide':
        return styles.typeGuide;
      case 'clean':
        return styles.typeClean;
      case 'display':
        return styles.typeDisplay;
      default:
        return styles.typeGuide;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return '👋';
      case 'clean':
        return '🧹';
      case 'display':
        return '🛍️';
      default:
        return '📋';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'guide':
        return '导购任务';
      case 'clean':
        return '清洁任务';
      case 'display':
        return '陈列任务';
      default:
        return '普通任务';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'doing':
        return styles.statusDoing;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return styles.priorityHigh;
      case 'medium':
        return styles.priorityMedium;
      case 'low':
        return styles.priorityLow;
      default:
        return styles.priorityMedium;
    }
  };

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'on':
        return styles.dotOn;
      case 'busy':
        return styles.dotBusy;
      default:
        return styles.dotOff;
    }
  };

  const getStatusTextForEmp = (status: string) => {
    switch (status) {
      case 'on':
        return '在岗';
      case 'busy':
        return '忙碌';
      default:
        return '离岗';
    }
  };

  const handleStart = () => {
    Taro.showModal({
      title: '开始任务',
      content: `确认开始执行任务「${task.title}」？`,
      success: (res) => {
        if (res.confirm) {
          setTask((prev) => ({ ...prev, status: 'doing' as const }));
          Taro.showToast({ title: '任务已开始', icon: 'success' });
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成任务',
      content: `确认任务「${task.title}」已完成？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            setTask((prev) => ({ ...prev, status: 'completed' as const }));
            Taro.showToast({ title: '任务已完成', icon: 'success' });
          }, 800);
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
              setTask((prev) => ({ ...prev, assignee: targetEmp.name }));
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
          Taro.showToast({ title: '备注已添加', icon: 'success' });
        }
      }
    });
  };

  const handleUrgent = () => {
    if (task.priority === 'high') {
      Taro.showToast({ title: '已是最高优先级', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '提升优先级',
      content: '确认将该任务提升为最高优先级？',
      success: (res) => {
        if (res.confirm) {
          setTask((prev) => ({ ...prev, priority: 'high' as const }));
          Taro.showToast({ title: '已设为紧急', icon: 'success' });
        }
      }
    });
  };

  const timeline = [
    {
      time: task.createdAt,
      content: '任务创建',
      desc: `店长分配任务给 ${task.assignee}`,
      done: true
    },
    {
      time: task.status !== 'pending' ? '2026-06-14 09:30' : '',
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
            查看详情
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
              <View
                className={classnames(styles.statusDot, getStatusDotClass(assignee.status))}
              />
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
