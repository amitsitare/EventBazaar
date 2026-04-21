const WISHLIST_KEY = 'eventbazaar:wishlist:v1';

const parse = (value) => {
  try {
    const data = JSON.parse(value || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getWishlist = () => parse(localStorage.getItem(WISHLIST_KEY));

export const saveWishlist = (items) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.isArray(items) ? items : []));
};

export const isWishlisted = (serviceId) =>
  getWishlist().some((item) => Number(item.id) === Number(serviceId));

export const toggleWishlistItem = (service) => {
  const list = getWishlist();
  const id = Number(service?.id);
  if (!Number.isFinite(id)) return list;
  const exists = list.some((item) => Number(item.id) === id);
  const next = exists ? list.filter((item) => Number(item.id) !== id) : [...list, service];
  saveWishlist(next);
  return next;
};

export const removeWishlistItem = (serviceId) => {
  const next = getWishlist().filter((item) => Number(item.id) !== Number(serviceId));
  saveWishlist(next);
  return next;
};

export const clearWishlist = () => saveWishlist([]);
