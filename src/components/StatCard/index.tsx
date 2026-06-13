import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';

interface StatCardProps {
  label: string;
  value: number;
  icon?: string;
  growth?: number;
  subInfo?: string;
  color?: string;
  type?: 'currency' | 'number' | 'percent';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  growth,
  subInfo,
  color = '#165dff',
  type = 'currency'
}) => {
  const formatValue = () => {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'percent':
        return value.toFixed(1) + '%';
      default:
        return formatCurrency(value);
    }
  };

  const displayGrowth = growth !== undefined;

  return (
    <View className={styles.statCard}>
      <View className={styles.gradientDecor} style={{ background: color }} />
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        {icon && (
          <View className={styles.iconWrap} style={{ background: color + '15' }}>
            <Text>{icon}</Text>
          </View>
        )}
      </View>
      <Text className={styles.value} style={{ color: color }}>
        {formatValue()}
      </Text>
      <View className={styles.footer}>
        {displayGrowth && (
          <Text
            className={classnames(styles.growth, growth! >= 0 ? styles.growthUp : styles.growthDown)}
          >
            {formatPercent(growth!)}
          </Text>
        )}
        {subInfo && <Text className={styles.subInfo}>{subInfo}</Text>}
      </View>
    </View>
  );
};

export default StatCard;
