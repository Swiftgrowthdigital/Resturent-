export function getRestaurantName(name) {
  return String(name || '').trim();
}

export const fallbackRestaurantName = getRestaurantName();
