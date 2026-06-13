import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  text?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  text = '暂无数据',
  buttonText,
  onButtonClick
}) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.text}>{text}</Text>
      {buttonText && (
        <Button className={styles.button} onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
