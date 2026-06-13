import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/format';

const ProductItem: React.FC<{ product: Product; onClick?: () => void }> = ({ product, onClick }) => {
  const getStockStatus = () => {
    const ratio = product.stock / product.safeStock;
    if (ratio <= 0.3) {
      return { text: '库存紧张', className: styles.stockOut };
    } else if (ratio <= 1) {
      return { text: '库存偏低', className: styles.stockLow };
    }
    return { text: '库存充足', className: styles.stockNormal };
  };

  const stockStatus = getStockStatus();

  return (
    <View className={styles.productItem} onClick={onClick}>
      <Image
        className={styles.image}
        src={product.image}
        mode="aspectFill"
        onError={(e) => console.error('[ProductItem] 图片加载失败:', e)}
      />
      <View className={styles.info}>
        <View>
          <View className={styles.header}>
            <Text className={styles.name}>{product.name}</Text>
            <Text className={styles.category}>{product.category}</Text>
          </View>
          <View className={styles.meta}>
            <View className={styles.metaItem}>
              条码: <Text className={styles.metaValue}>{product.barcode}</Text>
            </View>
          </View>
          <View className={styles.meta}>
            <View className={styles.metaItem}>
              库存:{' '}
              <Text className={styles.metaValue}>
                {product.stock} {product.unit}
              </Text>
            </View>
            <View className={styles.metaItem}>
              安全库存:{' '}
              <Text className={styles.metaValue}>
                {product.safeStock} {product.unit}
              </Text>
            </View>
          </View>
        </View>
        <View className={styles.footer}>
          <Text className={styles.price}>{formatCurrency(product.price)}</Text>
          <Text className={classnames(styles.stockStatus, stockStatus.className)}>
            {stockStatus.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProductItem;
