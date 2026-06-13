import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { formatCurrency } from '@/utils/format';
import { useRetailStore } from '@/store';
import { ReplenishmentItem, ReplenishmentOrderStatus } from '@/types';

const ORDER_STATUS_MAP: Record<ReplenishmentOrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待下单', color: '#ff7d00', bg: 'rgba(255, 125, 0, 0.1)' },
  ordered: { label: '已下单', color: '#165dff', bg: 'rgba(22, 93, 255, 0.1)' },
  completed: { label: '已完成', color: '#00b42a', bg: 'rgba(0, 180, 42, 0.1)' }
};

const ReplenishmentPage: React.FC = () => {
  const replenishmentItems = useRetailStore((s) => s.replenishmentItems);
  const toggleReplenishmentSelect = useRetailStore((s) => s.toggleReplenishmentSelect);
  const toggleAllReplenishment = useRetailStore((s) => s.toggleAllReplenishment);
  const changeReplenishmentQty = useRetailStore((s) => s.changeReplenishmentQty);
  const submitReplenishmentOrder = useRetailStore((s) => s.submitReplenishmentOrder);
  const inspectionIssues = useRetailStore((s) => s.inspectionIssues);

  const [searchText, setSearchText] = useState('');
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  useDidShow(() => {
    const map: Record<string, number> = {};
    replenishmentItems.forEach((i) => (map[i.id] = i.suggestedQty));
    setQtyMap(map);
  });

  const allSelected =
    replenishmentItems.length > 0 && replenishmentItems.every((i) => i.selected);

  const filteredItems = useMemo(
    () =>
      replenishmentItems.filter(
        (i) =>
          searchText === '' ||
          i.name.includes(searchText) ||
          i.category.includes(searchText) ||
          i.supplier.includes(searchText)
      ),
    [replenishmentItems, searchText]
  );

  const fromInspectionItems = useMemo(
    () => filteredItems.filter((i) => !!i.sourceIssueId),
    [filteredItems]
  );

  const normalItems = useMemo(
    () => filteredItems.filter((i) => !i.sourceIssueId),
    [filteredItems]
  );

  const selectedItems = replenishmentItems.filter((i) => i.selected);
  const totalQty = selectedItems.reduce(
    (sum, i) => sum + (qtyMap[i.id] !== undefined ? qtyMap[i.id] : i.suggestedQty),
    0
  );
  const totalAmount = selectedItems.reduce(
    (sum, i) => sum + (qtyMap[i.id] !== undefined ? qtyMap[i.id] : i.suggestedQty) * i.unitPrice,
    0
  );

  const toggleSelect = (id: string) => {
    toggleReplenishmentSelect(id);
  };

  const toggleSelectAll = () => {
    toggleAllReplenishment(!allSelected);
  };

  const changeQty = (id: string, delta: number) => {
    const current = qtyMap[id] ?? 0;
    const newVal = Math.max(0, current + delta);
    setQtyMap((prev) => ({ ...prev, [id]: newVal }));
    changeReplenishmentQty(id, newVal);
  };

  const handleViewIssue = (issueId?: string) => {
    if (!issueId) return;
    Taro.navigateTo({ url: `/pages/inspection-detail/index?id=${issueId}` });
  };

  const getIssueStatusText = (status?: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'resolved':
        return '已解决';
      default:
        return '未知';
    }
  };

  const getIssueStatusClass = (status?: string) => {
    switch (status) {
      case 'pending':
        return styles.sourceIssuePending;
      case 'processing':
        return styles.sourceIssueProcessing;
      case 'resolved':
        return styles.sourceIssueResolved;
      default:
        return '';
    }
  };

  const getLiveIssueStatus = (item: ReplenishmentItem): string | undefined => {
    if (!item.sourceIssueId) return item.sourceIssueStatus;
    const live = inspectionIssues.find((i) => i.id === item.sourceIssueId);
    return live ? live.status : item.sourceIssueStatus;
  };

  const renderOrderBadge = (item: ReplenishmentItem) => {
    const s: ReplenishmentOrderStatus = item.orderStatus || 'pending';
    const meta = ORDER_STATUS_MAP[s];
    return (
      <Text
        style={{
          fontSize: 20,
          color: meta.color,
          background: meta.bg,
          padding: '2rpx 12rpx',
          borderRadius: 20,
          marginLeft: 8
        }}
      >
        {meta.label}
      </Text>
    );
  };

  const handleSubmit = () => {
    const pendingItems = selectedItems.filter((i) => !i.orderStatus || i.orderStatus === 'pending');
    if (pendingItems.length === 0) {
      Taro.showToast({ title: '选中的商品已全部下单', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认补货单',
      content: `将向供应商提交补货订单：\n商品数：${pendingItems.length}种\n总数量：${totalQty}件\n总金额：${formatCurrency(totalAmount)}`,
      success: (res) => {
        if (res.confirm) {
          const orderNo = submitReplenishmentOrder(pendingItems.map((i) => i.id));
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showModal({
              title: '下单成功',
              content: `补货订单已提交，预计1-2个工作日送达门店。\n订单编号：${orderNo}\n订单金额：${formatCurrency(totalAmount)}`,
              showCancel: false,
              success: () => {}
            });
          }, 1200);
        }
      }
    });
  };

  const renderInspectionItem = (item: ReplenishmentItem) => {
    const liveStatus = getLiveIssueStatus(item);
    return (
      <View key={item.id} className={classnames(styles.listItem, styles.itemFromInspection)}>
        <View className={styles.itemTop}>
          <View
            className={classnames(styles.checkbox, item.selected && styles.checked)}
            onClick={() => toggleSelect(item.id)}
          >
            {item.selected && '✓'}
          </View>
          <View className={styles.itemInfo}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text className={styles.itemName}>{item.name}</Text>
              {renderOrderBadge(item)}
            </View>
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
            {item.orderNo && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 20, color: '#86909c' }}>
                  单号：{item.orderNo}
                  {item.orderTime ? ` · ${item.orderTime}` : ''}
                </Text>
              </View>
            )}
            {item.sourceIssueTitle && (
              <View
                className={styles.sourceIssueRow}
                onClick={() => handleViewIssue(item.sourceIssueId)}
              >
                <Text className={classnames(styles.sourceIssueTag, getIssueStatusClass(liveStatus))}>
                  {getIssueStatusText(liveStatus)}
                </Text>
                <Text className={styles.sourceIssueText}>
                  来源：{item.sourceIssueTitle} ›
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className={styles.itemBottom}>
          <View className={styles.qtyControl}>
            <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, -10)}>
              -
            </Button>
            <Text className={styles.qtyNum}>{qtyMap[item.id] ?? item.suggestedQty}</Text>
            <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, 10)}>
              +
            </Button>
            <Text className={styles.qtySuggest}>建议{item.suggestedQty}</Text>
          </View>
          <View className={styles.priceInfo}>
            <Text className={styles.unitPrice}>{formatCurrency(item.unitPrice)}/件</Text>
            <Text className={styles.subTotal}>
              {formatCurrency((qtyMap[item.id] ?? item.suggestedQty) * item.unitPrice)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderNormalItem = (item: ReplenishmentItem) => {
    return (
      <View key={item.id} className={styles.listItem}>
        <View className={styles.itemTop}>
          <View
            className={classnames(styles.checkbox, item.selected && styles.checked)}
            onClick={() => toggleSelect(item.id)}
          >
            {item.selected && '✓'}
          </View>
          <View className={styles.itemInfo}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text className={styles.itemName}>{item.name}</Text>
              {renderOrderBadge(item)}
            </View>
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
            {item.orderNo && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 20, color: '#86909c' }}>
                  单号：{item.orderNo}
                  {item.orderTime ? ` · ${item.orderTime}` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className={styles.itemBottom}>
          <View className={styles.qtyControl}>
            <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, -10)}>
              -
            </Button>
            <Text className={styles.qtyNum}>{qtyMap[item.id] ?? item.suggestedQty}</Text>
            <Button className={styles.qtyBtn} onClick={() => changeQty(item.id, 10)}>
              +
            </Button>
            <Text className={styles.qtySuggest}>建议{item.suggestedQty}</Text>
          </View>
          <View className={styles.priceInfo}>
            <Text className={styles.unitPrice}>{formatCurrency(item.unitPrice)}/件</Text>
            <Text className={styles.subTotal}>
              {formatCurrency((qtyMap[item.id] ?? item.suggestedQty) * item.unitPrice)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.summary}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>缺货商品</Text>
          <Text className={styles.summaryValue} style={{ color: '#ff7d00' }}>
            {replenishmentItems.filter((i) => i.currentStock < 30).length}
          </Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>巡店上报</Text>
          <Text className={styles.summaryValue} style={{ color: '#f53f3f' }}>
            {fromInspectionItems.length}
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
        {fromInspectionItems.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View className={styles.groupHeader}>
              <Text className={styles.groupTitle}>
                🔍 来自巡店上报
                <Text
                  style={{
                    fontSize: 20,
                    color: '#f53f3f',
                    marginLeft: 8,
                    fontWeight: 400,
                    background: 'rgba(245, 63, 63, 0.1)',
                    padding: '2rpx 12rpx',
                    borderRadius: 20
                  }}
                >
                  {fromInspectionItems.length}项
                </Text>
              </Text>
            </View>
            {fromInspectionItems.map(renderInspectionItem)}
          </View>
        )}

        {normalItems.length > 0 && (
          <View>
            <View className={styles.groupHeader}>
              <Text className={styles.groupTitle}>
                📦 常规补货
                <Text
                  style={{
                    fontSize: 20,
                    color: '#86909c',
                    marginLeft: 8,
                    fontWeight: 400
                  }}
                >
                  {normalItems.length}项
                </Text>
              </Text>
            </View>
            {normalItems.map(renderNormalItem)}
          </View>
        )}
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
