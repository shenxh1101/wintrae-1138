import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { nearExpiryItems as initialItems } from '@/data/inventory';
import { formatCurrency } from '@/utils/format';
import { NearExpiryItem } from '@/types';

type FilterType = 'all' | 'critical' | 'urgent' | 'normal';

const NearExpiryPage: React.FC = () => {
  const [items, setItems] = useState<NearExpiryItem[]>(initialItems);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    const critical = items.filter((i) => i.status === 'critical').length;
    const urgent = items.filter((i) => i.status === 'urgent').length;
    const normal = items.filter((i) => i.status === 'normal').length;
    return { critical, urgent, normal };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const selectedItems = items.filter((i) => selectedMap[i.id]);
  const totalSaveAmount = selectedItems.reduce(
    (sum, i) => sum + (i.originalPrice - i.discountPrice) * i.stock,
    0
  );

  const toggleSelect = (id: string) => {
    setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDaysTagClass = (status: string) => {
    switch (status) {
      case 'critical':
        return styles.daysCritical;
      case 'urgent':
        return styles.daysUrgent;
      default:
        return styles.daysNormal;
    }
  };

  const handleSetDiscount = (id: string) => {
    Taro.showActionSheet({
      itemList: ['5折清仓', '7折促销', '8折优惠', '买一送一'],
      success: (res) => {
        const discountText = ['5折清仓', '7折促销', '8折优惠', '买一送一'][res.tapIndex];
        Taro.showToast({ title: `已设置：${discountText}`, icon: 'success' });
      }
    });
  };

  const handleMoveToZone = (id: string) => {
    Taro.showModal({
      title: '移至临期专区',
      content: '确认将该商品移至临期专区并更新库存位置？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已移至临期专区', icon: 'success' });
        }
      }
    });
  };

  const handleReturnSupplier = (id: string) => {
    const item = items.find((i) => i.id === id);
    Taro.showModal({
      title: '申请退货',
      content: `确认向供应商申请退货 ${item?.name}，共 ${item?.stock} 件？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '退货申请已提交', icon: 'success' });
          }, 800);
        }
      }
    });
  };

  const handleBatchProcess = () => {
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: ['批量设置折扣', '批量移至临期专区', '批量申请退货'],
      success: (res) => {
        const actions = ['批量设置折扣', '批量移至临期专区', '批量申请退货'];
        Taro.showModal({
          title: actions[res.tapIndex],
          content: `将对 ${selectedItems.length} 件商品执行${actions[res.tapIndex]}操作`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.showLoading({ title: '处理中...' });
              setTimeout(() => {
                Taro.hideLoading();
                Taro.showToast({ title: '处理完成', icon: 'success' });
                setSelectedMap({});
              }, 1000);
            }
          }
        });
      }
    });
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: items.length },
    { key: 'critical', label: '紧急(≤3天)', count: stats.critical },
    { key: 'urgent', label: '预警(4-7天)', count: stats.urgent },
    { key: 'normal', label: '常规(>7天)', count: stats.normal }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>紧急临期</Text>
          <Text className={styles.summaryValue} style={{ color: '#f53f3f' }}>
            {stats.critical}
          </Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>预警商品</Text>
          <Text className={styles.summaryValue} style={{ color: '#ff7d00' }}>
            {stats.urgent}
          </Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>常规临期</Text>
          <Text className={styles.summaryValue} style={{ color: '#165dff' }}>
            {stats.normal}
          </Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filters.map((f) => (
          <Button
            key={f.key}
            className={classnames(styles.filterTab, filter === f.key && styles.filterTabActive)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}({f.count})
          </Button>
        ))}
      </View>

      <View className={styles.list}>
        {filteredItems.map((item) => (
          <View key={item.id} className={styles.listItem}>
            <View className={styles.itemTop}>
              <View
                className={classnames(
                  styles.checkbox,
                  selectedMap[item.id] && styles.checked
                )}
                onClick={() => toggleSelect(item.id)}
              >
                {selectedMap[item.id] && '✓'}
              </View>
              <View className={styles.itemInfo}>
                <Text className={styles.itemName}>{item.name}</Text>
                <Text className={styles.itemCat}>{item.category}</Text>
              </View>
              <View className={classnames(styles.daysTag, getDaysTagClass(item.status))}>
                剩{item.daysLeft}天
              </View>
            </View>
            <View className={styles.itemMeta}>
              <Text>
                库存数量：<Text className={styles.metaValue}>{item.stock}件</Text>
              </Text>
              <Text>
                到期日期：<Text className={styles.metaValue}>{item.expiryDate}</Text>
              </Text>
            </View>
            <View className={styles.priceRow}>
              <Text className={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
              <Text className={styles.discountPrice}>{formatCurrency(item.discountPrice)}</Text>
              <Text className={styles.saveAmount}>
                省{formatCurrency(item.originalPrice - item.discountPrice)}
              </Text>
            </View>
            <View className={styles.actionRow}>
              <Button
                className={classnames(styles.actionBtn, styles.actionSecondary)}
                onClick={() => handleSetDiscount(item.id)}
              >
                设置折扣
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.actionPrimary)}
                onClick={() => handleMoveToZone(item.id)}
              >
                移临期区
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.actionDanger)}
                onClick={() => handleReturnSupplier(item.id)}
              >
                申请退货
              </Button>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 160 }} />
      <View className={styles.bottomBar}>
        <View className={styles.bottomInfo}>
          <Text className={styles.bottomLabel}>
            已选 {selectedItems.length} 件 / 预计挽回
          </Text>
          <Text className={styles.bottomValue}>{formatCurrency(totalSaveAmount)}</Text>
        </View>
        <Button className={styles.batchBtn} onClick={handleBatchProcess}>
          批量处理
        </Button>
      </View>
    </View>
  );
};

export default NearExpiryPage;
