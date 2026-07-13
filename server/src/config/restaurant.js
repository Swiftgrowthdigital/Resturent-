function getRestaurantName() {
  return String(process.env.RESTAURANT_NAME || '').trim();
}

function applyRestaurantName(restaurant) {
  if (!restaurant) return restaurant;

  const source = typeof restaurant.toObject === 'function' ? restaurant.toObject() : restaurant;
  return { ...source, name: getRestaurantName() };
}

module.exports = { getRestaurantName, applyRestaurantName };
