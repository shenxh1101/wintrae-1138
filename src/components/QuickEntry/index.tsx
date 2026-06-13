import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { QuickAction } from '@/types';

interface QuickEntryProps {
  title?: string;
  actions: QuickAction[];
}

const QuickEntry: React.FC<QuickEntryProps> = ({ title = '快捷功能', actions }) => {
  const tabBarPages = [
    '/pages/dashboard/index',
    '/pages/inventory/index',
    '/pages/promotion/index',
    '/pages/tasks/index',
    '/pages/reports/index'
  ];

  const handleAction = (action: QuickAction) => {
    console.log('[QuickEntry] 点击快捷功能:', action.name, action.path);
    const isTabBar = tabBarPages.includes(action.path);
    if (isTabBar) {
      Taro.switchTab({
        url: action.path,
        fail: () => {
          console.error('[QuickEntry] Tab跳转失败:', action.path);
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      });
    } else {
      Taro.navigateTo({
        url: action.path,
        fail: () => {
          console.error('[QuickEntry] 跳转失败:', action.path);
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      });
    }
  };

  return (
    <View className={styles.quickEntry}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.grid}>
        {actions.map(action => (
          <View
            key={action.id}
            className={styles.item}
            onClick={() => handleAction(action)}
          >
            <View
              className={styles.iconWrap}
              style={{ background: action.bgColor }}
            >
              <Text>{action.icon}</Text>
            </View>
            <Text className={styles.name}>{action.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default QuickEntry;
