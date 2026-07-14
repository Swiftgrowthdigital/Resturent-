export function createClientOrderId() {
  return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatCurrency(value, currency) {
  if (!currency) return Number(value || 0).toFixed(0);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}
