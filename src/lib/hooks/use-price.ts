import { useSettings } from '@/data/settings';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function formatPrice({
  amount,
  currencyCode,
  locale,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  });

  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale })
    : null;

  return { price, basePrice, discount };
}

export default function usePrice(
  data?: {
    amount: number | string;
    baseAmount?: number | string;
    currencyCode?: string;
  } | null
) {
  const { settings } = useSettings();
  const { locale: currentLocale } = useRouter();
  const {
    amount,
    baseAmount,
    currencyCode = settings?.currency ?? 'USD',
  } = data ?? {};
  const value = useMemo(() => {
    const numericAmount = Number(amount);
    const numericBaseAmount = Number(baseAmount);
    if (isNaN(numericAmount) || !currencyCode) return '';
    const locale = currentLocale ?? 'en';
    return baseAmount !== undefined && !isNaN(numericBaseAmount)
      ? formatVariantPrice({ amount: numericAmount, baseAmount: numericBaseAmount, currencyCode, locale })
      : formatPrice({ amount: numericAmount, currencyCode, locale });
  }, [amount, baseAmount, currencyCode, currentLocale]);
  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
