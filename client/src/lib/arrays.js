export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeMenuPayload(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  return {
    categories: toArray(source.categories),
    foods: toArray(source.foods),
    settings: source.restaurant ?? source.settings ?? null,
    availableSeats: toArray(source.availableSeats)
  };
}

export function normalizeOrdersPayload(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  return {
    orders: toArray(source.orders)
  };
}
