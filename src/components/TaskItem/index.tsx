import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Task } from '@/types';
import { getPriorityText, getStatusText } from '@/utils/format';

const typeMap: Record<string, string> = {
  guide: '导购',
  clean: '清洁',
  display: '陈列'
};

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const priorityClass =
    task.priority === 'high'
      ? styles.priorityHigh
      : task.priority === 'medium'
      ? styles.priorityMedium
      : styles.priorityLow;

  const statusClass =
    task.status === 'completed'
      ? styles.statusCompleted
      : task.status === 'doing'
      ? styles.statusDoing
      : styles.statusPending;

  return (
    <View
      className={styles.taskItem}
      onClick={() => {
        console.log('[TaskItem] 点击任务:', task.title);
        Taro.navigateTo({
          url: `/pages/task-detail/index?id=${task.id}`,
          fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        });
      }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>{task.title}</Text>
        <Text className={classnames(styles.statusTag, statusClass)}>
          {getStatusText(task.status)}
        </Text>
      </View>
      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>类型:</Text>
          <Text>{typeMap[task.type] || task.type}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>负责人:</Text>
          <Text>{task.assignee}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={classnames(styles.priorityTag, priorityClass)}>
            {getPriorityText(task.priority)}
          </Text>
        </View>
      </View>
      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>截止:</Text>
          <Text>{task.deadline}</Text>
        </View>
      </View>
      <Text className={styles.desc}>{task.description}</Text>
    </View>
  );
};

export default TaskItem;
