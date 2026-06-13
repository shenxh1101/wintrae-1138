import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useRetailStore } from '@/store';
import { formatDate } from '@/utils/format';

type TabType = 'all' | 'pending' | 'ongoing' | 'completed';

const PromotionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const promotions = useRetailStore((s) => s.promotions);
  const updatePromotion = useRetailStore((s) => s.updatePromotion);

  useDidShow(() => {
    // 页面显示时自动触发重渲染（store 订阅会自动处理）
  });

  usePullDownRefresh(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const pendingCount = promotions.filter((p) => p.status === 'pending').length;
  const ongoingCount = promotions.filter((p) => p.status === 'ongoing').length;
  const completedCount = promotions.filter((p) => p.status === 'completed').length;

  const filteredPromotions = useMemo(
    () => (activeTab === 'all' ? promotions : promotions.filter((p) => p.status === activeTab)),
    [promotions, activeTab]
  );

  const getProgress = (p: (typeof promotions)[0]) => {
    if (!p.displayRequired) return 100;
    let progress = 0;
    if (p.confirmed) progress++;
    if (p.photoUploaded) progress++;
    return Math.round((progress / 2) * 100);
  };

  const getStatusClass = (status: string) => {
    if (status === 'pending') return styles.statusPending;
    if (status === 'ongoing') return styles.statusOngoing;
    return styles.statusCompleted;
  };

  const getStatusText = (status: string) => {
    if (status === 'pending') return '待执行';
    if (status === 'ongoing') return '进行中';
    return '已完成';
  };

  const handleAction = (action: string, promo: (typeof promotions)[0]) => {
    if (action === 'confirm') {
      Taro.showModal({
        title: '确认促销方案',
        content: `请确认已了解"${promo.name}"的全部要求，确认后将开始执行。`,
        success: (res) => {
          if (res.confirm) {
            updatePromotion(promo.id, { confirmed: true });
            Taro.showToast({ title: '已确认', icon: 'success' });
          }
        }
      });
    } else if (action === 'photo') {
      Taro.showActionSheet({
        itemList: ['拍照上传', '从相册选择', '查看详情'],
        success: (res) => {
          if (res.tapIndex < 2) {
            Taro.chooseImage({
              count: 3,
              success: () => {
                Taro.showLoading({ title: '上传中...' });
                setTimeout(() => {
                  Taro.hideLoading();
                  updatePromotion(promo.id, { photoUploaded: true });
                  Taro.showToast({ title: '上传成功', icon: 'success' });
                }, 1000);
              }
            });
          } else {
            Taro.navigateTo({ url: `/pages/promotion-detail/index?id=${promo.id}` });
          }
        }
      });
    } else if (action === 'detail') {
      Taro.navigateTo({ url: `/pages/promotion-detail/index?id=${promo.id}` });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerStats}>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#ff7d00' }}>
            {pendingCount}
          </Text>
          <Text className={styles.statLabel}>待执行</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#00b42a' }}>
            {ongoingCount}
          </Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum} style={{ color: '#165dff' }}>
            {completedCount}
          </Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          待执行{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'ongoing' && styles.tabActive)}
          onClick={() => setActiveTab('ongoing')}
        >
          进行中
        </Text>
        <Text
          className={classnames(styles.tab, activeTab === 'completed' && styles.tabActive)}
          onClick={() => setActiveTab('completed')}
        >
          已完成
        </Text>
      </View>

      {filteredPromotions.length > 0 ? (
        <View className={styles.promoList}>
          {filteredPromotions.map((promo) => {
            const progress = getProgress(promo);
            return (
              <View
                key={promo.id}
                className={styles.promoCard}
                onClick={() => handleAction('detail', promo)}
              >
                <View className={styles.promoHeader}>
                  <View className={styles.promoInfo}>
                    <Text className={styles.promoTitle}>{promo.name}</Text>
                    <Text className={styles.promoType}>{promo.type}</Text>
                    <Text className={styles.promoDate}>
                      {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                    </Text>
                  </View>
                  <Text className={classnames(styles.promoStatus, getStatusClass(promo.status))}>
                    {getStatusText(promo.status)}
                  </Text>
                </View>

                <View className={styles.promoProgress}>
                  <View className={styles.progressRow}>
                    <Text className={styles.progressLabel}>执行进度</Text>
                    <Text className={styles.progressValue}>{progress}%</Text>
                  </View>
                  <View className={styles.progressBar}>
                    <View className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </View>
                </View>

                <View className={styles.promoContent}>
                  <View className={styles.promoItems}>
                    {promo.products.slice(0, 3).map((item, idx) => (
                      <Text key={idx} className={styles.promoItemTag}>
                        {item}
                      </Text>
                    ))}
                    {promo.products.length > 3 && (
                      <Text className={styles.promoItemTag}>+{promo.products.length - 3}项</Text>
                    )}
                  </View>

                  {promo.displayRequired && (
                    <View className={styles.promoChecks}>
                      <View className={styles.checkItem}>
                        <View
                          className={classnames(
                            styles.checkIcon,
                            promo.confirmed ? styles.checkDone : styles.checkTodo
                          )}
                        >
                          {promo.confirmed ? '✓' : '○'}
                        </View>
                        <Text>方案已确认</Text>
                      </View>
                      <View className={styles.checkItem}>
                        <View
                          className={classnames(
                            styles.checkIcon,
                            promo.photoUploaded ? styles.checkDone : styles.checkTodo
                          )}
                        >
                          {promo.photoUploaded ? '✓' : '○'}
                        </View>
                        <Text>陈列已拍照</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View className={styles.promoActions} onClick={(e) => e.stopPropagation()}>
                  {promo.status === 'pending' && !promo.confirmed && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={() => handleAction('confirm', promo)}
                      >
                        确认方案
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnGray)}
                        onClick={() => handleAction('detail', promo)}
                      >
                        查看详情
                      </Button>
                    </>
                  )}
                  {promo.status === 'pending' && promo.confirmed && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={() => handleAction('photo', promo)}
                      >
                        📷 拍照上传
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnGray)}
                        onClick={() => handleAction('detail', promo)}
                      >
                        查看详情
                      </Button>
                    </>
                  )}
                  {promo.status === 'ongoing' && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnOutline)}
                        onClick={() => handleAction('photo', promo)}
                      >
                        {promo.photoUploaded ? '📷 补充照片' : '📷 拍照回传'}
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.btnGray)}
                        onClick={() => handleAction('detail', promo)}
                      >
                        查看详情
                      </Button>
                    </>
                  )}
                  {promo.status === 'completed' && (
                    <Button
                      className={classnames(styles.actionBtn, styles.btnGray)}
                      onClick={() => handleAction('detail', promo)}
                    >
                      查看报告
                    </Button>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState icon="🎉" text="暂无促销活动" buttonText="刷新看看" />
      )}
    </View>
  );
};

export default PromotionPage;
