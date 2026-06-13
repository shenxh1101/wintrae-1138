import React, { useState } from 'react';
import { View, Text, Button, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRetailStore } from '@/store';
import { employees } from '@/data/tasks';
import { formatCurrency } from '@/utils/format';

type ShiftType = 'morning' | 'afternoon' | 'night';

const HandoverPage: React.FC = () => {
  const [shift, setShift] = useState<ShiftType>('morning');
  const [handedBy, setHandedBy] = useState('陈店长');
  const [receivedBy, setReceivedBy] = useState(employees[0].name);
  const [cashAmount, setCashAmount] = useState('8560.50');
  const [cardAmount, setCardAmount] = useState('12480.30');
  const [items, setItems] = useState<string[]>([
    '备用金5000元',
    '收银台钥匙1把',
    '对讲机2台'
  ]);
  const [remarks, setRemarks] = useState(
    '饮料销售火爆，注意补货，库存不足的状态：可乐仅剩24罐'
  );
  const records = useRetailStore((s) => s.handoverRecords);
  const addHandoverRecord = useRetailStore((s) => s.addHandoverRecord);
  const addTask = useRetailStore((s) => s.addTask);

  const shifts: { key: ShiftType; name: string; time: string }[] = [
    { key: 'morning', name: '早班', time: '07:00-15:00' },
    { key: 'afternoon', name: '中班', time: '15:00-22:00' },
    { key: 'night', name: '晚班', time: '22:00-07:00' }
  ];

  const totalAmount =
    (parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0);

  const selectHandedBy = () => {
    Taro.showActionSheet({
      itemList: employees.map((e) => e.name),
      success: (res) => setHandedBy(employees[res.tapIndex].name)
    });
  };

  const selectReceivedBy = () => {
    Taro.showActionSheet({
      itemList: employees.filter((e) => e.status !== 'off').map((e) => e.name),
      success: (res) =>
        setReceivedBy(employees.filter((e) => e.status !== 'off')[res.tapIndex].name)
    });
  };

  const handleCashInput = (val: string) => {
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') setCashAmount(val);
  };
  const handleCardInput = (val: string) => {
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') setCardAmount(val);
  };

  const handleAddItem = () => {
    Taro.showModal({
      title: '添加交接物品',
      editable: true,
      placeholderText: '输入物品名称和数量...',
      success: (res) => {
        if (res.confirm && res.content?.trim()) {
          setItems((prev) => [...prev, res.content!.trim()]);
          Taro.showToast({ title: '已添加', icon: 'success' });
        }
      }
    });
  };

  const handleRemoveItem = (idx: number) => {
    Taro.showModal({
      title: '移除物品',
      content: `确认移除「${items[idx]}」？`,
      success: (res) => {
        if (res.confirm) setItems((prev) => prev.filter((_, i) => i !== idx));
      }
    });
  };

  const handleConvertRemarksToTasks = () => {
    if (!remarks.trim()) {
      Taro.showToast({ title: '备注为空', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: employees.filter((e) => e.status !== 'off').map((e) => e.name),
      success: (res) => {
        const emp = employees.filter((e) => e.status !== 'off')[res.tapIndex];
        Taro.showModal({
          title: '转成任务',
          content: `将备注转成任务派给「${emp.name}」？\n任务内容：${remarks}`,
          success: (r2) => {
            if (r2.confirm) {
              const d = new Date();
              d.setHours(d.getHours() + 4);
              const pad = (n: number) => n.toString().padStart(2, '0');
              addTask({
                title: '交接班待办事项跟进',
                type: 'guide',
                assignee: emp.name,
                deadline: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
                priority: 'high',
                description: `【交接班】${remarks}\n交班人：${handedBy}`,
                source: 'handover'
              });
              Taro.showToast({ title: '已生成任务', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleConvertItemsToTasks = () => {
    Taro.showActionSheet({
      itemList: employees.filter((e) => e.status !== 'off').map((e) => e.name),
      success: (res) => {
        const emp = employees.filter((e) => e.status !== 'off')[res.tapIndex];
        const d = new Date();
        d.setHours(d.getHours() + 4);
        const pad = (n: number) => n.toString().padStart(2, '0');
        items.forEach((item, idx) => {
          setTimeout(() => {
            addTask({
              title: `交接物品跟进：${item}`,
              type: 'display',
              assignee: emp.name,
              deadline: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
              priority: 'medium',
              description: `交接班物品确认：${item}\n交班人：${handedBy}`,
              source: 'handover'
            });
          }, idx * 200);
        });
        Taro.showToast({ title: `已生成${items.length}个任务`, icon: 'success' });
      }
    });
  };

  const handlePreview = () => {
    const cashVal = parseFloat(cashAmount) || 0;
    const cardVal = parseFloat(cardAmount) || 0;
    Taro.showModal({
      title: '交接班预览',
      content:
        `班次：${shifts.find((s) => s.key === shift)?.name}\n` +
        `交班人：${handedBy}\n` +
        `接班人：${receivedBy}\n` +
        `现金金额：${formatCurrency(cashVal)}\n` +
        `移动支付：${formatCurrency(cardVal)}\n` +
        `总金额：${formatCurrency(cashVal + cardVal)}\n` +
        `交接物品：${items.length}项\n` +
        `备注：${remarks || '无'}`,
      showCancel: false
    });
  };

  const handleSubmit = () => {
    if (!receivedBy) {
      Taro.showToast({ title: '请选择接班人', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认交接班',
      content: `确认提交交接班记录？\n总金额：${formatCurrency(totalAmount)}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            const d = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            addHandoverRecord({
              date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
              shift: shifts.find((s) => s.key === shift)?.name || '',
              handedBy,
              receivedBy,
              cashAmount: parseFloat(cashAmount) || 0,
              cardAmount: parseFloat(cardAmount) || 0,
              items: [...items],
              remarks,
              status: 'confirmed'
            });
            Taro.showModal({
              title: '交接班成功',
              content:
                `已完成${shifts.find((s) => s.key === shift)?.name}交接班\n` +
                `${handedBy} → ${receivedBy}\n` +
                `交接总金额：${formatCurrency(totalAmount)}`,
              showCancel: false,
              success: () => Taro.navigateBack()
            });
          }, 800);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>🔄 交接班管理</Text>
        <Text className={styles.headerSubtitle}>请核对交接信息，确保账实相符</Text>
        <View className={styles.shiftSelect}>
          {shifts.map((s) => (
            <View
              key={s.key}
              className={classnames(
                styles.shiftTab,
                shift === s.key && styles.shiftTabActive
              )}
              onClick={() => setShift(s.key)}
            >
              <Text className={styles.shiftName}>{s.name}</Text>
              <Text className={styles.shiftTime}>{s.time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>👥 交接人员</Text>
        <View className={styles.personRow} onClick={selectHandedBy}>
          <Text className={styles.personLabel}>交班人</Text>
          <View className={styles.personSelect}>
            <Text className={styles.personName}>{handedBy}</Text>
            <Text className={styles.arrowIcon}>›</Text>
          </View>
        </View>
        <View className={styles.personRow} onClick={selectReceivedBy}>
          <Text className={styles.personLabel}>接班人</Text>
          <View className={styles.personSelect}>
            <Text className={styles.personName}>{receivedBy}</Text>
            <Text className={styles.arrowIcon}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>💰 款项交接</Text>
        <View className={styles.moneyGrid}>
          <View className={styles.moneyItem}>
            <Text className={styles.moneyLabel}>现金金额 (元)</Text>
            <Textarea
              className={styles.remarksInput}
              style={{
                minHeight: 60,
                padding: 8,
                fontSize: 20,
                fontWeight: 700,
                color: '#165dff'
              }}
              value={cashAmount}
              type="digit"
              onInput={(e) => handleCashInput(e.detail.value)}
            />
          </View>
          <View className={styles.moneyItem}>
            <Text className={styles.moneyLabel}>移动支付 (元)</Text>
            <Textarea
              className={styles.remarksInput}
              style={{
                minHeight: 60,
                padding: 8,
                fontSize: 20,
                fontWeight: 700,
                color: '#165dff'
              }}
              value={cardAmount}
              type="digit"
              onInput={(e) => handleCardInput(e.detail.value)}
            />
          </View>
        </View>
        <View
          style={{
            marginTop: 16,
            padding: 16,
            background: 'rgba(245, 63, 63, 0.06)',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 14, color: '#86909c' }}>总交接金额</Text>
          <Text style={{ fontSize: 28, fontWeight: 700, color: '#f53f3f' }}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className={styles.sectionTitle}>📦 交接物品 ({items.length}项)</Text>
          {items.length > 0 && (
            <Text
              style={{ fontSize: 12, color: '#165dff' }}
              onClick={handleConvertItemsToTasks}
            >
              一键转任务 ›
            </Text>
          )}
        </View>
        <View className={styles.itemsList}>
          {items.map((item, idx) => (
            <View key={idx} className={styles.itemRow} onClick={() => handleRemoveItem(idx)}>
              <Text className={styles.itemName}>
                {idx + 1}. {item}
              </Text>
              <Text className={styles.itemStatus}>✓ 已核对</Text>
            </View>
          ))}
        </View>
        <Button className={styles.addItemBtn} onClick={handleAddItem}>
          ＋ 添加交接物品
        </Button>
      </View>

      <View className={styles.section}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className={styles.sectionTitle}>📝 交班备注</Text>
          {remarks.trim() && (
            <Text
              style={{ fontSize: 12, color: '#f53f3f', fontWeight: 500 }}
              onClick={handleConvertRemarksToTasks}
            >
              ⚡ 一键转任务 ›
            </Text>
          )}
        </View>
        <Textarea
          className={styles.remarksInput}
          placeholder="请输入交接班注意事项、待办事项等..."
          value={remarks}
          onInput={(e) => setRemarks(e.detail.value)}
        />
      </View>

      {records.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📋 历史记录</Text>
          <View className={styles.historyList}>
            {records.map((r) => (
              <View key={r.id} className={styles.historyCard}>
                <View className={styles.historyHeader}>
                  <Text className={styles.historyShift}>
                    {r.shift} · {r.handedBy} → {r.receivedBy}
                  </Text>
                  <Text className={styles.historyDate}>{r.date}</Text>
                </View>
                <View className={styles.historyInfo}>
                  <Text>
                    现金：{formatCurrency(r.cashAmount)} · 移动支付：
                    {formatCurrency(r.cardAmount)}
                  </Text>
                  {r.remarks && <Text>{'\n'}备注：{r.remarks}</Text>}
                </View>
                <Text
                  className={classnames(
                    styles.historyStatus,
                    r.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                  )}
                >
                  {r.status === 'confirmed' ? '✓ 已确认' : '待确认'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 160 }} />
      <View className={styles.bottomBar}>
        <Button className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handlePreview}>
          预览
        </Button>
        <Button className={classnames(styles.actionBtn, styles.btnSuccess)} onClick={handleSubmit}>
          确认交接
        </Button>
      </View>
    </View>
  );
};

export default HandoverPage;
