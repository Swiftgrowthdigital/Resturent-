export function createClientOrderId() {
  return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatCurrency(value, symbol = 'INR ') {
  return `${symbol}${Number(value || 0).toFixed(0)}`;
}
