import dayjs from 'dayjs';

export const formatCurrency = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '¥0.00';
  return `¥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatNumber = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm:ss');
};

export const relativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'minute');
  
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff} 分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)} 小时前`;
  if (diff < 43200) return `${Math.floor(diff / 1440)} 天前`;
  return formatDate(date);
};

export const truncateText = (text: string, maxLength = 20): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const maskIdCard = (id: string): string => {
  if (!id || id.length < 8) return id;
  return `${id.slice(0, 4)}********${id.slice(-4)}`;
};

export const generateApplicationNo = (): string => {
  const now = dayjs();
  const timestamp = now.format('YYYYMMDDHHmmss');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RF${timestamp}${random}`;
};
