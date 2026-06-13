import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Notice } from '@/types';

const NoticeCard: React.FC<{ notice: Notice }> = ({ notice }) => {
  const getTagInfo = () => {
    switch (notice.type) {
      case 'promotion':
        return { text: '促销', className: styles.tagPromotion };
      case 'inventory':
        return { text: '库存', className: styles.tagInventory };
      default:
        return { text: '系统', className: styles.tagSystem };
    }
  };

  const tagInfo = getTagInfo();
  const typeClass =
    notice.type === 'promotion'
      ? styles.typePromotion
      : notice.type === 'inventory'
      ? styles.typeInventory
      : styles.typeSystem;

  return (
    <View className={classnames(styles.noticeCard, typeClass, !notice.read && styles.unread)}>
      {!notice.read && <View className={styles.unreadDot} />}
      <View className={styles.header}>
        <View className={styles.titleWrap}>
          <Text className={classnames(styles.tag, tagInfo.className)}>{tagInfo.text}</Text>
          <Text className={styles.title}>{notice.title}</Text>
        </View>
        <Text className={styles.time}>{notice.time}</Text>
      </View>
      <Text className={styles.content}>{notice.content}</Text>
    </View>
  );
};

export default NoticeCard;
