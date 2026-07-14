function getRestaurantName() {
  return String(process.env.RESTAURANT_NAME || '').trim();
}

function getRestaurantCurrency() {
  return String(process.env.RESTAURANT_CURRENCY || '').trim();
}

function applyRestaurantName(restaurant) {
  if (!restaurant) return restaurant;

  const source = typeof restaurant.toObject === 'function' ? restaurant.toObject() : restaurant;
  return { ...source, name: getRestaurantName(), currency: getRestaurantCurrency() };
}

module.exports = { getRestaurantName, getRestaurantCurrency, applyRestaurantName };
