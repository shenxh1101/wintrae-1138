import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRetailStore } from '@/store';
import { formatDate } from '@/utils/format';

const PromotionDetailPage: React.FC = () => {
  const router = useRouter();
  const promoId = router.params.id || 'PRO001';
  const getPromotionById = useRetailStore((s) => s.getPromotionById);
  const updatePromotion = useRetailStore((s) => s.updatePromotion);
  const promo = getPromotionById(promoId) || useRetailStore.getState().promotions[0];

  const [localPhotos, setLocalPhotos] = useState<string[]>(
    promo.photoUploaded
      ? ['https://picsum.photos/id/1060/400/400', 'https://picsum.photos/id/1070/400/400']
      : []
  );

  const progress = useMemo(() => {
    if (!promo.displayRequired) return 100;
    let done = 0;
    if (promo.confirmed) done++;
    if (promo.photoUploaded) done++;
    return Math.round((done / 2) * 100);
  }, [promo]);

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
      content: `确认已按照《${promo.name}》陈列手册完成学习并准备执行？`,
      success: (res) => {
        if (res.confirm) {
          updatePromotion(promo.id, { confirmed: true });
          Taro.showToast({ title: '方案已确认', icon: 'success' });
        }
      }
    });
  };

  const handleUploadPhoto = () => {
    Taro.chooseImage({
      count: 3,
      success: (res) => {
        Taro.showLoading({ title: '上传中...' });
        setTimeout(() => {
          Taro.hideLoading();
          setLocalPhotos((prev) => [
            ...prev,
            'https://picsum.photos/id/1080/400/400',
            'https://picsum.photos/id/225/400/400'
          ]);
          updatePromotion(promo.id, { photoUploaded: true });
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
          setLocalPhotos((prev) => [...prev, 'https://picsum.photos/id/1074/400/400']);
          Taro.showToast({ title: '添加成功', icon: 'success' });
        }, 800);
      }
    });
  };

  const handleStartPromo = () => {
    Taro.showModal({
      title: '开始执行促销',
      content: `确认开始《${promo.name}》活动执行？状态将更新为"进行中"`,
      success: (res) => {
        if (res.confirm) {
          updatePromotion(promo.id, { status: 'ongoing' });
          Taro.showToast({ title: '已开始执行', icon: 'success' });
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成促销执行',
      content: `确认《${promo.name}》已全部执行完成？状态将更新为"已完成"`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            updatePromotion(promo.id, { status: 'completed' });
            Taro.showToast({ title: '执行完成', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 600);
          }, 800);
        }
      }
    });
  };

  const handleViewReport = () => {
    Taro.showModal({
      title: '促销执行报告',
      content:
        `【${promo.name}】\n` +
        `活动时间：${formatDate(promo.startDate)} - ${formatDate(promo.endDate)}\n` +
        `活动类型：${promo.type}\n` +
        `陈列确认：${promo.confirmed ? '✓ 已确认' : '✗ 未确认'}\n` +
        `照片上传：${promo.photoUploaded ? `✓ 已上传${localPhotos.length}张` : '✗ 未上传'}\n` +
        `执行进度：${progress}%\n` +
        `当前状态：${getStatusText(promo.status)}`,
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
      if (!promo.confirmed) {
        return (
          <View className={styles.bottomBar}>
            <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleConfirmPlan}>
              确认陈列方案
            </Button>
          </View>
        );
      }
      if (!promo.photoUploaded) {
        return (
          <View className={styles.bottomBar}>
            <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleUploadPhoto}>
              📷 拍照上传陈列
            </Button>
          </View>
        );
      }
      return (
        <View className={styles.bottomBar}>
          <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleStartPromo}>
            开始执行促销
          </Button>
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
          📅 {formatDate(promo.startDate)} 至 {formatDate(promo.endDate)}
        </Text>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>📊 活动信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>活动状态</Text>
          <Text className={styles.infoValue}>{getStatusText(promo.status)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>需陈列检查</Text>
          <Text className={styles.infoValue}>{promo.displayRequired ? '是（含照片）' : '否'}</Text>
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

      {promo.displayRequired && (
        <>
          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text className={styles.progressLabel}>执行进度</Text>
              <Text className={styles.progressPercent}>{progress}%</Text>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${progress}%` }} />
            </View>
          </View>

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
                <Text className={styles.displayText}>
                  货架照片已上传（{localPhotos.length}张）
                </Text>
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

          <View className={styles.photoSection}>
            <Text className={styles.sectionTitle}>🖼️ 陈列照片</Text>
            <View className={styles.photoGrid}>
              {localPhotos.map((src, idx) => (
                <View key={idx} className={styles.photoItem}>
                  <Image className={styles.photoImg} src={src} mode="aspectFill" />
                </View>
              ))}
              {localPhotos.length < 9 && (
                <View className={styles.photoAdd} onClick={handleAddPhoto}>
                  <Text className={styles.photoAddIcon}>＋</Text>
                  <Text>添加照片</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}

      <View style={{ height: 160 }} />
      {renderBottomBar()}
    </View>
  );
};

export default PromotionDetailPage;
