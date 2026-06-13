import React, { useState } from 'react';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProductItem from '@/components/ProductItem';
import EmptyState from '@/components/EmptyState';
import { products, nearExpiryItems, replenishmentItems } from '@/data/inventory';
import { formatCurrency } from '@/utils/format';

type TabType = 'all' | 'low' | 'expiry';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  usePullDownRefresh(() => {
    console.log('[Inventory] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const handleScan = () => {
    console.log('[Inventory] 扫码查库存');
    Taro.showActionSheet({
      itemList: ['扫码查询库存', '扫码开始盘点', '扫码快速补货'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '请对准商品条码', icon: 'none' });
          setTimeout(() => {
            Taro.showModal({
              title: '查询结果',
              content: '农夫山泉矿泉水 550ml\n库存：486瓶\n位置：A区-03-12货架\n安全库存：100瓶',
              showCancel: false
            });
          }, 1500);
        } else if (res.tapIndex === 1) {
          Taro.navigateTo({ url: '/pages/inventory-check/index' });
        } else {
          Taro.navigateTo({ url: '/pages/replenishment/index' });
        }
      }
    });
  };

  const navigateTo = (url: string) => {
    Taro.navigateTo({
      url,
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    });
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.safeStock);

  const filteredProducts = products.filter(
    (p) =>
      searchText === '' ||
      p.name.includes(searchText) ||
      p.barcode.includes(searchText) ||
      p.category.includes(searchText)
  );

  const getStockStatus = (stock: number, safeStock: number) => {
    const ratio = stock / safeStock;
    if (ratio <= 0.3) return { text: '库存紧张', className: styles.statusOut };
    if (ratio <= 1) return { text: '库存偏低', className: styles.statusLow };
    return { text: '库存充足', className: styles.statusNormal };
  };

  const getExpiryClass = (status: string) => {
    if (status === 'critical') return styles.expiryCritical;
    if (status === 'urgent') return styles.expiryUrgent;
    return styles.expiryNormal;
  };

  const getDaysClass = (status: string) => {
    if (status === 'critical') return styles.daysCritical;
    if (status === 'urgent') return styles.daysUrgent;
    return styles.daysNormal;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View style={{ display: 'flex', gap: '16rpx' }}>
          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索商品名称/条码/分类"
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
            />
          </View>
          <Button className={styles.scanBtn} onClick={handleScan}>
            📱 扫码
          </Button>
        </View>
      </View>

      <View className={styles.actionRow}>
        <View
          className={styles.actionCard}
          onClick={() => navigateTo('/pages/inventory-check/index')}
        >
          <View className={styles.actionBadge}>待盘点 8项</View>
          <View className={styles.actionIcon} style={{ background: 'rgba(22, 93, 255, 0.1)' }}>
            📋
          </View>
          <Text className={styles.actionTitle}>商品盘点</Text>
          <Text className={styles.actionDesc}>扫码录入盘盈盘亏</Text>
        </View>
        <View
          className={styles.actionCard}
          onClick={() => navigateTo('/pages/replenishment/index')}
        >
          <View className={classnames(styles.actionBadge, styles.badgeWarn)}>缺货 5项</View>
          <View className={styles.actionIcon} style={{ background: 'rgba(0, 180, 42, 0.1)' }}>
            📦
          </View>
          <Text className={styles.actionTitle}>补货建议</Text>
          <Text className={styles.actionDesc}>一键生成缺货清单</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          全部商品 ({products.length})
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'low' && styles.tabActive)}
          onClick={() => setActiveTab('low')}
        >
          库存预警 ({lowStockProducts.length})
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'expiry' && styles.tabActive)}
          onClick={() => setActiveTab('expiry')}
        >
          临期商品 ({nearExpiryItems.length})
        </Text>
      </View>

      {activeTab === 'all' && (
        <View>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📦 商品库存</Text>
            <Text className={styles.viewAll} onClick={() => {}}>
              查看全部 ›
            </Text>
          </View>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => <ProductItem key={product.id} product={product} />)
          ) : (
            <EmptyState icon="🔍" text="未找到匹配的商品" />
          )}
        </View>
      )}

      {activeTab === 'low' && (
        <View>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>⚠️ 库存预警</Text>
            <Text
              className={styles.viewAll}
              onClick={() => navigateTo('/pages/replenishment/index')}
            >
              立即补货 ›
            </Text>
          </View>
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map((p) => {
              const status = getStockStatus(p.stock, p.safeStock);
              return (
                <View key={p.id} className={styles.stockCard}>
                  <Image
                    className={styles.stockImage}
                    src={p.image}
                    mode="aspectFill"
                    onError={(e) => console.error('[Inventory] 图片加载失败:', e)}
                  />
                  <View className={styles.stockInfo}>
                    <View>
                      <Text className={styles.stockName}>{p.name}</Text>
                      <View className={styles.stockMeta}>
                        <View className={styles.stockMetaItem}>
                          当前:{' '}
                          <Text className={styles.stockMetaValue}>
                            {p.stock} {p.unit}
                          </Text>
                        </View>
                        <View className={styles.stockMetaItem}>
                          安全线:{' '}
                          <Text className={styles.stockMetaValue}>
                            {p.safeStock} {p.unit}
                          </Text>
                        </View>
                      </View>
                      <View className={styles.stockMeta}>
                        <View className={styles.stockMetaItem}>
                          分类: <Text className={styles.stockMetaValue}>{p.category}</Text>
                        </View>
                      </View>
                    </View>
                    <View className={styles.stockFooter}>
                      <Text className={styles.stockPrice}>{formatCurrency(p.price)}</Text>
                      <Text className={classnames(styles.stockStatus, status.className)}>
                        {status.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyState icon="✅" text="暂无库存预警商品" />
          )}
        </View>
      )}

      {activeTab === 'expiry' && (
        <View>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>⏰ 临期商品</Text>
            <Text
              className={styles.viewAll}
              onClick={() => navigateTo('/pages/near-expiry/index')}
            >
              批量处理 ›
            </Text>
          </View>
          <View className={styles.expiryList}>
            {nearExpiryItems.map((item) => (
              <View key={item.id} className={classnames(styles.expiryItem, getExpiryClass(item.status))}>
                <View className={styles.expiryHeader}>
                  <Text className={styles.expiryName}>{item.name}</Text>
                  <Text className={classnames(styles.daysTag, getDaysClass(item.status))}>
                    剩{item.daysLeft}天
                  </Text>
                </View>
                <View className={styles.expiryMeta}>
                  <View className={styles.expiryMetaItem}>
                    库存:{' '}
                    <Text className={styles.expiryMetaValue}>{item.stock}件</Text>
                  </View>
                  <View className={styles.expiryMetaItem}>
                    到期:{' '}
                    <Text className={styles.expiryMetaValue}>{item.expiryDate}</Text>
                  </View>
                  <View className={styles.expiryMetaItem}>
                    分类:{' '}
                    <Text className={styles.expiryMetaValue}>{item.category}</Text>
                  </View>
                </View>
                <View className={styles.priceRow}>
                  <Text className={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
                  <Text className={styles.discountPrice}>{formatCurrency(item.discountPrice)}</Text>
                  <Text className={styles.savings}>
                    省{formatCurrency(item.originalPrice - item.discountPrice)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default InventoryPage;
