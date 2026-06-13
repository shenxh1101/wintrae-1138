import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { inventoryCheckList as initialList } from '@/data/inventory';
import { formatCurrency } from '@/utils/format';
import { InventoryCheckItem } from '@/types';

const InventoryCheckPage: React.FC = () => {
  const [list, setList] = useState<InventoryCheckItem[]>(initialList);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const checkedCount = list.filter((i) => i.checked).length;
  const totalCount = list.length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  const totalDiffAmount = list.reduce((sum, item) => sum + item.difference * item.unitPrice, 0);
  const totalDiffQty = list.reduce((sum, item) => sum + item.difference, 0);

  const handleScan = () => {
    console.log('[InventoryCheck] 扫码盘点');
    Taro.showToast({ title: '请对准商品条码', icon: 'none' });
    setTimeout(() => {
      const uncheckedIndex = list.findIndex((i) => !i.checked);
      if (uncheckedIndex >= 0) {
        Taro.showToast({
          title: `已扫描：${list[uncheckedIndex].productName}`,
          icon: 'none'
        });
      }
    }, 1500);
  };

  const handleInput = (productId: string, value: string) => {
    setInputValues({ ...inputValues, [productId]: value });
  };

  const handleSubmit = (productId: string) => {
    const value = parseInt(inputValues[productId] || '0', 10);
    if (isNaN(value) || value < 0) {
      Taro.showToast({ title: '请输入有效数量', icon: 'none' });
      return;
    }
    setList((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const difference = value - item.systemStock;
          return {
            ...item,
            actualStock: value,
            difference,
            checked: true
          };
        }
        return item;
      })
    );
    setInputValues({ ...inputValues, [productId]: '' });
    Taro.showToast({ title: '已记录', icon: 'success' });
  };

  const handleFinish = () => {
    if (checkedCount < totalCount) {
      Taro.showModal({
        title: '未完成盘点',
        content: `还有${totalCount - checkedCount}项未盘点，是否确认提交？`,
        success: (res) => {
          if (res.confirm) {
            submitReport();
          }
        }
      });
    } else {
      submitReport();
    }
  };

  const submitReport = () => {
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '盘点报告',
        content: `完成盘点${checkedCount}/${totalCount}项\n盘盈盘亏总量：${totalDiffQty >= 0 ? '+' : ''}${totalDiffQty}件\n盘盈盘亏金额：${totalDiffAmount >= 0 ? '+' : ''}${formatCurrency(totalDiffAmount)}`,
        showCancel: false,
        success: () => {
          Taro.navigateBack();
        }
      });
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.progress}>
          <Text className={styles.progressText}>盘点进度</Text>
          <Text className={styles.progressNum}>
            {checkedCount}/{totalCount}
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </View>
        <View className={styles.summary}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>系统库存</Text>
            <Text className={styles.summaryValue} style={{ color: '#165dff' }}>
              {list.reduce((s, i) => s + i.systemStock, 0)}
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>实盘数量</Text>
            <Text className={styles.summaryValue} style={{ color: '#00b42a' }}>
              {list.reduce((s, i) => s + i.actualStock, 0)}
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>差异量</Text>
            <Text
              className={styles.summaryValue}
              style={{ color: totalDiffQty >= 0 ? '#00b42a' : '#f53f3f' }}
            >
              {totalDiffQty >= 0 ? '+' : ''}
              {totalDiffQty}
            </Text>
          </View>
        </View>
      </View>

      <Button className={styles.scanBtn} onClick={handleScan}>
        📱 扫码开始盘点
      </Button>

      <View style={{ fontSize: 32, fontWeight: 600, marginBottom: 16, paddingLeft: 4 }}>
        📋 待盘点清单
      </View>

      <View className={styles.list}>
        {list.map((item) => (
          <View key={item.productId} className={styles.listItem}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemName}>{item.productName}</Text>
              <Text
                className={classnames(styles.itemStatus, item.checked ? styles.checked : styles.unchecked)}
              >
                {item.checked ? '已盘' : '未盘'}
              </Text>
            </View>
            <View className={styles.itemRow}>
              <Text>分类：{item.category}</Text>
              <Text>
                单价：<Text className={styles.itemValue}>{formatCurrency(item.unitPrice)}</Text>
              </Text>
            </View>
            <View className={styles.itemRow}>
              <Text>
                系统库存：<Text className={styles.itemValue}>{item.systemStock}</Text>
              </Text>
              <Text>
                实盘数量：
                <Text className={styles.itemValue}>
                  {item.checked ? item.actualStock : '-'}
                </Text>
              </Text>
            </View>
            {item.checked && (
              <View className={styles.itemRow}>
                <Text>
                  差异数量：
                  <Text
                    className={item.difference >= 0 ? styles.diffPlus : styles.diffMinus}
                  >
                    {item.difference >= 0 ? '+' : ''}
                    {item.difference}
                  </Text>
                </Text>
                <Text>
                  差异金额：
                  <Text
                    className={
                      item.difference * item.unitPrice >= 0 ? styles.diffPlus : styles.diffMinus
                    }
                  >
                    {item.difference * item.unitPrice >= 0 ? '+' : ''}
                    {formatCurrency(item.difference * item.unitPrice)}
                  </Text>
                </Text>
              </View>
            )}
            {!item.checked && (
              <View className={styles.inputRow}>
                <Input
                  className={styles.input}
                  type="number"
                  placeholder="输入实盘数量"
                  value={inputValues[item.productId] || ''}
                  onInput={(e) => handleInput(item.productId, e.detail.value)}
                />
                <Button
                  className={styles.submitBtn}
                  onClick={() => handleSubmit(item.productId)}
                >
                  确认
                </Button>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 160 }} />
      <View className={styles.bottomBar}>
        <Button className={styles.finishBtn} onClick={handleFinish}>
          完成盘点并提交
        </Button>
      </View>
    </View>
  );
};

export default InventoryCheckPage;
