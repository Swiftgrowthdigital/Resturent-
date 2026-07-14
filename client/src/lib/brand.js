const configuredRestaurantName = String(import.meta.env.VITE_RESTAURANT_NAME || '').trim();

if (import.meta.env.DEV) {
  console.log('Restaurant Name:', import.meta.env.VITE_RESTAURANT_NAME);
}

export function getRestaurantName(name) {
  return String(name || '').trim() || configuredRestaurantName || 'Restaurant';
}

export const fallbackRestaurantName = getRestaurantName();
