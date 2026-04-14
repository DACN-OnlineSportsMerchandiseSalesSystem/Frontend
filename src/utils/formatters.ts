/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number, currency: string = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
};
