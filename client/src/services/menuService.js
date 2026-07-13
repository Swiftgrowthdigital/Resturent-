import { api } from '../lib/api';

export async function getMenu() {
  const response = await api.get('/api/menu');
  return response.data;
}

export async function placeMenuOrder(order) {
  const response = await api.post('/api/order', order);
  return response.data;
}

export async function validateSeatNumber(seatNumber) {
  const response = await api.post('/api/seats/validate', { seatNumber });
  return response.data;
}
