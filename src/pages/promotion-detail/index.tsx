import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { promotions } from '@/data/promotion';
import { Promotion } from '@/types';

const PromotionDetailPage: React.FC = () => {
  const [promo, setPromo] = useState<Promotion>(promotions[0]);

  const progress = useMemo(() => {
    let done = 0;
    let total = 0;
    if (promo.displayRequired) {
      total += 2;
      if (promo.confirmed) done++;
      if (promo.photoUploaded) done++;
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [promo]);

  const photos = [
    'https://picsum.photos/id/1060/400/400',
    'https://picsum.photos/id/1070/400/400'
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待执行';
      case 'ongoing':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  const handleConfirmPlan = () => {
    Taro.showModal({
      title: '确认陈列方案',
      content: '确认已按照总部陈列手册完成方案学习？',
      success: (res) => {
        if (res.confirm) {
          setPromo((prev) => ({ ...prev, confirmed: true }));
          Taro.showToast({ title: '已确认方案', icon: 'success' });
        }
      }
    });
  };

  const handleUploadPhoto = () => {
    Taro.chooseImage({
      count: 3,
      success: () => {
        Taro.showLoading({ title: '上传中...' });
        setTimeout(() => {
          Taro.hideLoading();
          setPromo((prev) => ({ ...prev, photoUploaded: true }));
          Taro.showToast({ title: '照片上传成功', icon: 'success' });
        }, 1200);
      }
    });
  };

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 1,
      success: () => {
        Taro.showLoading({ title: '上传中...' });
        setTimeout(() => {
          Taro.hideLoading();
          Taro.showToast({ title: '添加成功', icon: 'success' });
        }, 800);
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成促销执行',
      content: '确认该促销活动已全部执行完成？',
      success: (res) => {
        if (res.confirm) {
          setPromo((prev) => ({ ...prev, status: 'completed' as const }));
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '执行完成', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 800);
          }, 1000);
        }
      }
    });
  };

  const handleViewReport = () => {
    Taro.showModal({
      title: '促销执行报告',
      content: `促销名称：${promo.name}\n陈列确认：${promo.confirmed ? '✓' : '✗'}\n照片上传：${promo.photoUploaded ? '✓' : '✗'}\n执行进度：${progress}%\n当前状态：${getStatusText(promo.status)}`,
      showCancel: false
    });
  };

  const renderBottomBar = () => {
    if (promo.status === 'completed') {
      return (
        <View className={styles.bottomBar}>
          <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleViewReport}>
            查看执行报告
          </Button>
        </View>
      );
    }

    if (promo.status === 'pending') {
      return (
        <View className={styles.bottomBar}>
          {!promo.confirmed ? (
            <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleConfirmPlan}>
              确认陈列方案
            </Button>
          ) : !promo.photoUploaded ? (
            <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleUploadPhoto}>
              📷 拍照上传陈列
            </Button>
          ) : (
            <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleComplete}>
              开始执行促销
            </Button>
          )}
        </View>
      );
    }

    return (
      <View className={styles.bottomBar}>
        <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleAddPhoto}>
          补充照片
        </Button>
        <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleComplete}>
          标记完成
        </Button>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.promoTitle}>{promo.name}</Text>
        <View>
          <Text className={styles.promoType}>{promo.type}</Text>
        </View>
        <Text className={styles.promoDate}>
          📅 活动时间：{promo.startDate} 至 {promo.endDate}
        </Text>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>📊 活动信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>活动状态</Text>
          <Text className={styles.infoValue}>{getStatusText(promo.status)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>活动类型</Text>
          <Text className={styles.infoValue}>{promo.type}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>需陈列检查</Text>
          <Text className={styles.infoValue}>{promo.displayRequired ? '是' : '否'}</Text>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>🎯 促销内容</Text>
        <View className={styles.productList}>
          {promo.products.map((p, idx) => (
            <Text key={idx} className={styles.productTag}>
              {p}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>执行进度</Text>
          <Text className={styles.progressPercent}>{progress}%</Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }} />
        </View>
      </View>

      {promo.displayRequired && (
        <View className={styles.displaySection}>
          <Text className={styles.sectionTitle}>✅ 陈列检查</Text>
          <View className={styles.displayItem}>
            <View className={styles.displayInfo}>
              <Text className={styles.displayIcon}>📋</Text>
              <Text className={styles.displayText}>陈列方案已确认</Text>
            </View>
            <Text
              className={classnames(
                styles.statusTag,
                promo.confirmed ? styles.statusDone : styles.statusPending
              )}
            >
              {promo.confirmed ? '已完成' : '待确认'}
            </Text>
          </View>
          <View className={styles.displayItem}>
            <View className={styles.displayInfo}>
              <Text className={styles.displayIcon}>📷</Text>
              <Text className={styles.displayText}>货架照片已上传</Text>
            </View>
            <Text
              className={classnames(
                styles.statusTag,
                promo.photoUploaded ? styles.statusDone : styles.statusPending
              )}
            >
              {promo.photoUploaded ? '已完成' : '待上传'}
            </Text>
          </View>
        </View>
      )}

      {promo.displayRequired && (
        <View className={styles.photoSection}>
          <Text className={styles.sectionTitle}>🖼️ 陈列照片</Text>
          <View className={styles.photoGrid}>
            {promo.photoUploaded &&
              photos.map((src, idx) => (
                <View key={idx} className={styles.photoItem}>
                  <Image className={styles.photoImg} src={src} mode="aspectFill" />
                </View>
              ))}
            {(!promo.photoUploaded || photos.length < 6) && (
              <View className={styles.photoAdd} onClick={handleAddPhoto}>
                <Text className={styles.photoAddIcon}>＋</Text>
                <Text>添加照片</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={{ height: 160 }} />
      {renderBottomBar()}
    </View>
  );
};

export default PromotionDetailPage;
