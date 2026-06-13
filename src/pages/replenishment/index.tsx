import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { replenishmentItems as initialItems } from '@/data/inventory';
import { formatCurrency } from '@/utils/format';
import { ReplenishmentItem } from '@/types';

const ReplenishmentPage: React.FC = () => {
  const [items, setItems] = useState<ReplenishmentItem[]>(initialItems);
  const [searchText, setSearchText] = useState('');
  const [qtyMap, setQtyMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialItems.forEach((i) => (map[i.id] = i.suggestedQty));
    return map;
  });

  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (i) =>
          searchText === '' ||
          i.name.includes(searchText) ||
          i.category.includes(searchText) ||
          i.supplier.includes(searchText)
      ),
    [items, searchText]
  );

  const selectedItems = items.filter((i) => i.selected);
  const totalQty = selectedItems.reduce((sum, i) => sum + qtyMap[i.id], 0);
  const totalAmount = selectedItems.reduce((sum, i) => sum + qtyMap[i.id] * i.unitPrice, 0);

  const toggleSelect = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  };

  const toggleSelectAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const changeQty = (id: string, delta: number) => {
    setQtyMap((prev) => {
      const newVal = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newVal };
    });
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择补货商品', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认补货单',
      content: `将向供应商提交补货订单：\n商品数：${selectedItems.length}种\n总数量：${totalQty}件\n总金额：${formatCurrency(totalAmount)}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showModal({
              title: '下单成功',
              content: `补货订单已提交，预计1-2个工作日送达门店。\n订单金额：${formatCurrency(totalAmount)}`,
              showCancel: false,
              success: () => Taro.navigateBack()
            });
          }, 1200);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>缺货商品</Text>
          <Text className={styles.summaryValue} style={{ color: '#ff7d00' }}>
            {items.filter((i) => i.currentStock < 30).length}
          </Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>建议补货</Text>
          <Text className={styles.summaryValue} style={{ color: '#165dff' }}>
            {items.length}
          </Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>已选金额</Text>
          <Text className={styles.summaryValue} style={{ color: '#f53f3f' }}>
            {formatCurrency(totalAmount).slice(0, 6)}
          </Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        <Button
          className={classnames(styles.selectAll, allSelected && styles.selectAllActive)}
          onClick={toggleSelectAll}
        >
          {allSelected ? '✓ 全选' : '全选'}
        </Button>
        <View className={styles.searchBar}>
          <Text>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索商品/供应商"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.list}>
        {filteredItems.map((item) => (
          <View key={item.id} className={styles.listItem}>
            <View className={styles.itemTop}>
              <View
                className={classnames(styles.checkbox, item.selected && styles.checked)}
                onClick={() => toggleSelect(item.id)}
              >
                {item.selected && '✓'}
              </View>
              <View className={styles.itemInfo}>
                <Text className={styles.itemName}>{item.name}</Text>
                <Text className={styles.itemCat}>{item.category}</Text>
                <View className={styles.stockRow}>
                  <Text>
                    当前库存：
                    <Text
                      className={
                        item.currentStock <= 30 ? styles.stockLow : styles.stockValue
                      }
                    >
                      {item.currentStock}
                    </Text>
                  </Text>
                  <Text>
                    供应商：<Text className={styles.stockValue}>{item.supplier}</Text>
                  </Text>
                </View>
              </View>
            </View>
            <View className={styles.itemBottom}>
              <View className={styles.qtyControl}>
                <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, -10)}>
                  -
                </Button>
                <Text className={styles.qtyNum}>{qtyMap[item.id] || 0}</Text>
                <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, 10)}>
                  +
                </Button>
                <Text className={styles.qtySuggest}>建议{item.suggestedQty}</Text>
              </View>
              <View className={styles.priceInfo}>
                <Text className={styles.unitPrice}>{formatCurrency(item.unitPrice)}/件</Text>
                <Text className={styles.subTotal}>
                  {formatCurrency(qtyMap[item.id] * item.unitPrice)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 160 }} />
      <View className={styles.bottomBar}>
        <View className={styles.totalInfo}>
          <Text className={styles.totalLabel}>
            已选 {selectedItems.length} / {totalQty}件
          </Text>
          <Text className={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
        </View>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          提交补货单
        </Button>
      </View>
    </View>
  );
};

export default ReplenishmentPage;
