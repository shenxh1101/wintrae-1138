import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useRetailStore } from '@/store';
import { employees } from '@/data/tasks';
import { Task } from '@/types';

type TabType = 'all' | 'pending' | 'doing' | 'completed';
const typeMap: Record<string, string> = { guide: '🧑‍💼', clean: '🧹', display: '🖼️' };

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tasks = useRetailStore((s) => s.tasks);
  const addTask = useRetailStore((s) => s.addTask);
  const updateTask = useRetailStore((s) => s.updateTask);

  usePullDownRefresh(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const doingCount = tasks.filter((t) => t.status === 'doing').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const filteredTasks = useMemo(
    () => (activeTab === 'all' ? tasks : tasks.filter((t) => t.status === activeTab)),
    [tasks, activeTab]
  );

  const handleAssign = () => {
    Taro.showActionSheet({
      itemList: employees.map((e) => `${e.name} - ${e.role}`),
      success: (res) => {
        const emp = employees[res.tapIndex];
        Taro.showModal({
          title: `分配任务给 ${emp.name}`,
          editable: true,
          placeholderText: '请输入任务标题',
          success: (res2) => {
            if (res2.confirm && res2.content?.trim()) {
              const title = res2.content.trim();
              Taro.showActionSheet({
                itemList: ['导购任务', '清洁任务', '陈列任务'],
                success: (res3) => {
                  const types: Task['type'][] = ['guide', 'clean', 'display'];
                  const priorities: Task['priority'][] = ['high', 'medium', 'low'];
                  Taro.showActionSheet({
                    itemList: ['高优先级', '中优先级', '低优先级'],
                    success: (res4) => {
                      const d = new Date();
                      d.setHours(d.getHours() + 4);
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      const deadline = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      addTask({
                        title,
                        type: types[res3.tapIndex],
                        assignee: emp.name,
                        deadline,
                        priority: priorities[res4.tapIndex],
                        description: `由店长分配给 ${emp.name}，请尽快完成。`
                      });
                      Taro.showToast({ title: '任务已分配', icon: 'success' });
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  };

  const handleHandover = () => {
    Taro.navigateTo({ url: '/pages/handover/index' });
  };

  const getStatusClass = (s: string) =>
    s === 'pending'
      ? styles.statusPending
      : s === 'doing'
      ? styles.statusDoing
      : styles.statusCompleted;
  const getStatusText = (s: string) =>
    s === 'pending' ? '待处理' : s === 'doing' ? '进行中' : '已完成';
  const getPriorityClass = (p: string) =>
    p === 'high'
      ? styles.priorityHigh
      : p === 'medium'
      ? styles.priorityMedium
      : styles.priorityLow;
  const getPriorityText = (p: string) =>
    p === 'high' ? '高优' : p === 'medium' ? '中优' : '低优';
  const getStatusDotClass = (s: string) =>
    s === 'on' ? styles.statusOn : s === 'busy' ? styles.statusBusy : styles.statusOff;
  const getStatusTextShort = (s: string) => (s === 'on' ? '在岗' : s === 'busy' ? '忙碌' : '休息');

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
            在岗{employees.filter((e) => e.status !== 'off').length}/{employees.length}人
          </Text>
        </View>
        <View className={styles.empList}>
          {employees.map((emp) => (
            <View
              key={emp.id}
              className={styles.empItem}
              onClick={() =>
                Taro.showToast({
                  title: `${emp.name} - ${getStatusTextShort(emp.status)}，今日完成${emp.completedTasks}/${emp.todayTasks}`,
                  icon: 'none'
                })
              }
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
                  <Text
                    className={
                      getStatusDotClass(emp.status) === styles.statusOn ? styles.statValue : ''
                    }
                  >
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
          已完成 ({completedCount})
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
              onClick={() =>
                Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}` })
              }
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
                <View className={styles.metaItem}>👤 {task.assignee}</View>
                <View className={styles.metaItem}>⏰ {task.deadline}</View>
                <View className={classnames(styles.metaItem, getPriorityClass(task.priority))}>
                  ⚡ {getPriorityText(task.priority)}
                </View>
              </View>
              <Text className={styles.taskDesc} numberOfLines={2}>
                {task.description}
              </Text>
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
