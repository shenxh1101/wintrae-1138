import React, { useState } from 'react';
import { View, Text, Button, Input, Textarea, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useRetailStore } from '@/store';
import { InspectionIssueType } from '@/types';
import { employees } from '@/data/tasks';

const TYPE_OPTIONS: { value: InspectionIssueType; icon: string; name: string; desc: string }[] = [
  { value: 'stock', icon: '📦', name: '缺货问题', desc: '货架商品缺货、库存不足' },
  { value: 'price', icon: '🏷️', name: '价签错误', desc: '价签缺失、价格不符、错贴' },
  { value: 'display', icon: '🛒', name: '陈列异常', desc: '陈列混乱、不符合标准' },
  { value: 'clean', icon: '🧹', name: '卫生问题', desc: '清洁不到位、环境脏乱' },
  { value: 'other', icon: '📋', name: '其他问题', desc: '设备故障、安全隐患等' }
];

const InspectionReportPage: React.FC = () => {
  const { addInspectionIssue, addTask, inspectionIssues } = useRetailStore();
  const [issueType, setIssueType] = useState<InspectionIssueType>('stock');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [linkReplenishment, setLinkReplenishment] = useState(false);
  const [linkTask, setLinkTask] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const [assignee, setAssignee] = useState('');

  const handleChoosePhoto = () => {
    if (photos.length >= 6) {
      Taro.showToast({ title: '最多6张照片', icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: 6 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        setPhotos([...photos, ...res.tempFilePaths]);
      },
      fail: () => {
        const mockUrls = [
          'https://via.placeholder.com/300x300/e5f3ff/165dff?text=Shelf+1',
          'https://via.placeholder.com/300x300/e5f3ff/165dff?text=Shelf+2',
          'https://via.placeholder.com/300x300/e5f3ff/165dff?text=Price+Tag'
        ];
        const newOnes = mockUrls.slice(0, Math.min(2, 6 - photos.length));
        setPhotos([...photos, ...newOnes]);
        Taro.showToast({ title: '已添加照片', icon: 'success' });
      }
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSelectAssignee = () => {
    Taro.showActionSheet({
      itemList: employees.map((e) => `${e.name}（${e.role}）`),
      success: (res) => {
        setAssignee(employees[res.tapIndex].name);
      }
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请填写问题标题', icon: 'none' });
      return;
    }
    if (!location.trim()) {
      Taro.showToast({ title: '请填写问题位置', icon: 'none' });
      return;
    }

    const issueId = addInspectionIssue({
      type: issueType,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      photos: photos,
      reporter: '张店长',
      linkedReplenishment: issueType === 'stock' && linkReplenishment,
      linkedTaskId: undefined
    });

    if (linkTask) {
      const deadline = new Date(Date.now() + 4 * 60 * 60 * 1000);
      const typeMap = { stock: 'replenish', price: 'guide', display: 'display', clean: 'clean', other: 'guide' } as const;
      const createdTaskId = addTask({
        title: `处理巡店问题：${title.trim()}`,
        description: `${description || '无详细描述'}\n\n位置：${location}\n问题来源：巡店上报`,
        assignee: assignee || employees[0].name,
        type: typeMap[issueType],
        priority: issueType === 'stock' || issueType === 'price' ? 'high' : 'medium',
        deadline: deadline.toISOString()
      });
      useRetailStore.getState().updateInspectionIssue(issueId, { linkedTaskId: createdTaskId });
    }

    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '已上报待处理', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 800);
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📌 问题类型</Text>
          <View className={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => (
              <View
                key={opt.value}
                className={classnames(styles.typeCard, issueType === opt.value && styles.typeActive)}
                onClick={() => {
                  setIssueType(opt.value);
                  if (opt.value === 'stock') setLinkReplenishment(true);
                }}
              >
                <Text className={styles.typeIcon}>{opt.icon}</Text>
                <View className={styles.typeMeta}>
                  <Text className={styles.typeName}>{opt.name}</Text>
                  <Text className={styles.typeDesc}>{opt.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 问题详情</Text>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>问题标题</Text>
            <Input
              className={styles.formInput}
              placeholder='如：饮料货架最下层可乐缺货'
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={50}
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>所在位置</Text>
            <Input
              className={styles.formInput}
              placeholder='如：A区3号货架第2层'
              value={location}
              onInput={(e) => setLocation(e.detail.value)}
              maxlength={30}
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>详细描述</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder='请详细描述问题情况，方便跟进处理...'
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={200}
            />
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            📸 现场照片
            <Text style={{ fontSize: 20, color: '#86909c', fontWeight: 400, marginLeft: 8 }}>
              {photos.length}/6
            </Text>
          </Text>
          <View className={styles.photoGrid}>
            {photos.map((p, i) => (
              <View key={i} className={styles.photoItem}>
                <Image
                  className={styles.photoImg}
                  src={p}
                  mode='aspectFill'
                  onClick={() =>
                    Taro.previewImage({
                      current: p,
                      urls: photos
                    })
                  }
                />
                <View className={styles.photoRemove} onClick={() => handleRemovePhoto(i)}>
                  ×
                </View>
              </View>
            ))}
            {photos.length < 6 && (
              <View className={styles.photoAdd} onClick={handleChoosePhoto}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>拍照</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.linkSection}>
            <Text className={styles.linkTitle}>🔗 关联跟进</Text>
            <Text className={styles.linkDesc}>
              上报后可自动关联补货建议或生成员工任务，问题闭环跟踪不遗漏
            </Text>
            <View className={styles.linkRow}>
              <View
                className={classnames(styles.linkCheck, linkReplenishment && styles.linkCheckOn)}
                onClick={() => setLinkReplenishment(!linkReplenishment)}
              >
                {linkReplenishment && '✓'}
              </View>
              <Text className={styles.linkText} onClick={() => setLinkReplenishment(!linkReplenishment)}>
                关联到补货建议（缺货类自动勾选）
              </Text>
            </View>
            <View className={styles.linkRow}>
              <View
                className={classnames(styles.linkCheck, linkTask && styles.linkCheckOn)}
                onClick={() => {
                  setLinkTask(!linkTask);
                  if (!linkTask && !assignee) setShowAssignee(true);
                }}
              >
                {linkTask && '✓'}
              </View>
              <Text
                className={styles.linkText}
                onClick={() => {
                  setLinkTask(!linkTask);
                  if (!linkTask && !assignee) setShowAssignee(true);
                }}
              >
                生成员工任务进行跟进处理
              </Text>
            </View>
            {linkTask && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTop: '1rpx solid rgba(255,125,0,0.15)' }}>
                <View className={styles.assigneeRow} onClick={handleSelectAssignee}>
                  <View>
                    <Text className={styles.assigneeName}>
                      {assignee ? '👤 ' + assignee : '👤 选择负责人'}
                    </Text>
                    <Text className={styles.assigneeRole}>点击选择处理员工</Text>
                  </View>
                  <Text style={{ fontSize: 28, color: '#86909c' }}>›</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleSubmit}>
          ✅ 提交上报
        </Button>
      </View>
    </View>
  );
};

export default InspectionReportPage;
