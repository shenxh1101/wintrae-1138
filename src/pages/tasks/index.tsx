import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TaskItem from '@/components/TaskItem';
import EmptyState from '@/components/EmptyState';
import { tasks, employees } from '@/data/tasks';

type TabType = 'all' | 'pending' | 'doing' | 'completed';

const typeMap: Record<string, string> = {
  guide: '🧑‍💼',
  clean: '🧹',
  display: '🖼️'
};

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  usePullDownRefresh(() => {
    console.log('[Tasks] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const doingCount = tasks.filter((t) => t.status === 'doing').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  const handleAssign = () => {
    console.log('[Tasks] 分配新任务');
    Taro.showActionSheet({
      itemList: employees.map((e) => `${e.name} - ${e.role}`),
      success: (res) => {
        const emp = employees[res.tapIndex];
        Taro.showModal({
          title: '分配任务给 ' + emp.name,
          editable: true,
          placeholderText: '请输入任务内容',
          success: (res2) => {
            if (res2.confirm && res2.content) {
              Taro.showToast({ title: '任务已分配', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleHandover = () => {
    console.log('[Tasks] 交接班');
    Taro.navigateTo({
      url: '/pages/handover/index',
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    });
  };

  const getStatusClass = (status: string) => {
    if (status === 'pending') return styles.statusPending;
    if (status === 'doing') return styles.statusDoing;
    return styles.statusCompleted;
  };

  const getStatusText = (status: string) => {
    if (status === 'pending') return '待处理';
    if (status === 'doing') return '进行中';
    return '已完成';
  };

  const getPriorityClass = (p: string) => {
    if (p === 'high') return styles.priorityHigh;
    if (p === 'medium') return styles.priorityMedium;
    return styles.priorityLow;
  };

  const getPriorityText = (p: string) => {
    if (p === 'high') return '高优';
    if (p === 'medium') return '中优';
    return '低优';
  };

  const getStatusDotClass = (s: string) => {
    if (s === 'on') return styles.statusOn;
    if (s === 'busy') return styles.statusBusy;
    return styles.statusOff;
  };

  const getStatusTextShort = (s: string) => {
    if (s === 'on') return '在岗';
    if (s === 'busy') return '忙碌';
    return '休息';
  };

  return (
    <View className={styles.page}>
      <View className={styles.actionRow}>
        <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleAssign}>
          ➕ 分配任务
        </Button>
        <Button className={styles.actionBtn} onClick={handleHandover}>
          🔄 交接班
        </Button>
      </View>

      <View className={styles.employeesCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>👥 员工状态</Text>
          <Text className={styles.summary}>
            在岗{employees.filter((e) => e.status !== 'off').length}/
            {employees.length}人
          </Text>
        </View>
        <View className={styles.empList}>
          {employees.map((emp) => (
            <View
              key={emp.id}
              className={styles.empItem}
              onClick={() => {
                console.log('[Tasks] 点击员工:', emp.name);
                Taro.showToast({
                  title: `${emp.name} - ${getStatusTextShort(emp.status)}`,
                  icon: 'none'
                });
              }}
            >
              <View className={styles.avatar}>
                {emp.name.charAt(0)}
                <View className={classnames(styles.statusDot, getStatusDotClass(emp.status))} />
              </View>
              <View className={styles.empInfo}>
                <View className={styles.empName}>
                  {emp.name}
                  <Text className={styles.roleTag}>{emp.role}</Text>
                </View>
                <View className={styles.empStats}>
                  <Text>
                    今日任务: <Text className={styles.statValue}>{emp.todayTasks}</Text>
                  </Text>
                  <Text>
                    已完成: <Text className={styles.statValue}>{emp.completedTasks}</Text>
                  </Text>
                  <Text className={getStatusDotClass(emp.status) === styles.statusOn ? styles.statValue : ''}>
                    {getStatusTextShort(emp.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          全部 ({tasks.length})
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          待处理{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'doing' && styles.tabActive)}
          onClick={() => setActiveTab('doing')}
        >
          进行中{doingCount > 0 ? ` (${doingCount})` : ''}
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'completed' && styles.tabActive)}
          onClick={() => setActiveTab('completed')}
        >
          已完成
        </Text>
      </View>

      <View className={styles.taskSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📋 任务列表</Text>
          <Button className={styles.addBtn} onClick={handleAssign}>
            + 新建
          </Button>
        </View>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <View
              key={task.id}
              className={styles.taskCard}
              onClick={() => {
                console.log('[Tasks] 点击任务:', task.title);
                Taro.navigateTo({
                  url: `/pages/task-detail/index?id=${task.id}`,
                  fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
                });
              }}
            >
              <View className={styles.taskHeader}>
                <Text className={styles.taskTitle}>
                  {typeMap[task.type]} {task.title}
                </Text>
                <Text className={classnames(styles.taskStatus, getStatusClass(task.status))}>
                  {getStatusText(task.status)}
                </Text>
              </View>
              <View className={styles.taskMeta}>
                <View className={styles.metaItem}>
                  👤 {task.assignee}
                </View>
                <View className={styles.metaItem}>
                  ⏰ {task.deadline}
                </View>
                <View className={classnames(styles.metaItem, getPriorityClass(task.priority))}>
                  ⚡ {getPriorityText(task.priority)}
                </View>
              </View>
              <Text className={styles.taskDesc}>{task.description}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="✅" text="当前分类暂无任务" />
        )}
      </View>
    </View>
  );
};

export default TasksPage;
