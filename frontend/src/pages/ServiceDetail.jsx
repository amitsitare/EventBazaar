import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE, authHeader, getAuth } from '../auth.js';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [itemQuantities, setItemQuantities] = useState({});
  const [eventDate, setEventDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  const load = async () => {
    const [svcRes, itemsRes, reviewsRes] = await Promise.all([
      axios.get(`${API_BASE}/api/services/${id}`),
      axios.get(`${API_BASE}/api/services/${id}/items/public`).catch(() => ({ data: [] })),
      axios.get(`${API_BASE}/api/services/${id}/reviews`).catch(() => ({ data: [] })),
    ]);
    setService(svcRes.data);
    setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
    setItemQuantities({});
  };
  useEffect(() => { load(); }, [id]);

  const setItemQty = (itemId, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    setItemQuantities((prev) => ({ ...prev, [itemId]: n }));
  };
  const incrementItemQty = (itemId) => {
    setItemQuantities((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const selectedItemsSummary = items
    .filter((it) => (itemQuantities[it.id] || 0) > 0)
    .map((it) => `${it.name} x ${itemQuantities[it.id]}`)
    .join(', ');
  const selectedItemsTotal = items.reduce(
    (sum, it) => sum + (it.amount ?? 0) * (itemQuantities[it.id] || 0),
    0
  );

  const openRazorpayAndPay = ({ key, amount, currency, name, description, order_id, prefill, notes }) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }
      const options = {
        key,
        amount,
        currency,
        name,
        description,
        order_id,
        prefill,
        notes,
        handler: function (response) {
          resolve(response);
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const ensureRazorpayScript = async () => {
    if (window.Razorpay) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  const isCustomer = getAuth().token && getAuth().role === 'customer';
  const isLoggedIn = !!getAuth().token;
  const canPayWithCart = selectedItemsTotal > 0;
  const canPayWithServicePrice = service && service.price != null && !Number.isNaN(Number(service.price));
  const canBook = canPayWithCart || canPayWithServicePrice;
  const formatInr = (value) => `₹${Number(value || 0).toFixed(0)}`;

  const book = async () => {
    if (bookingLoading) return;
    setMessage('');

    const auth = getAuth();
    if (!auth.token || auth.role !== 'customer') {
      setMessage('Please login as customer to add to cart and book.');
      return;
    }

    if (!eventDate) {
      setMessage('Please select an event date before booking.');
      return;
    }

    if (!address || !String(address).trim()) {
      setMessage('Please enter the service address (venue or full address).');
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      setMessage('Please enter a valid quantity (at least 1).');
      return;
    }

    // Payment amount: cart total if items selected, else fixed service price
    let amountRupees = 0;
    if (canPayWithCart) {
      amountRupees = selectedItemsTotal;
    } else if (canPayWithServicePrice) {
      amountRupees = Number(service.price);
    } else {
      setMessage('Please add items to cart (select quantities) to book this package, or this service has no fixed price.');
      return;
    }

    if (amountRupees <= 0) {
      setMessage('Please add items to cart with quantity to proceed to payment.');
      return;
    }

    setBookingLoading(true);
    try {
      await ensureRazorpayScript();

      const configResp = await axios.get(`${API_BASE}/api/payments/config`);
      const { key_id } = configResp.data;
      const amountPaise = Math.round(amountRupees * 100);
      const orderResp = await axios.post(`${API_BASE}/api/payments/create-order`, {
        amount: amountPaise,
        currency: 'INR',
        receipt: `svc_${id}_${Date.now()}`,
      }, { headers: authHeader() });

      const order = orderResp.data;

      const payResponse = await openRazorpayAndPay({
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'EventBazaar',
        description: canPayWithCart ? `${service.name} – ${selectedItemsSummary}` : service.name,
        order_id: order.id,
        prefill: {},
        notes: { serviceId: id },
      });

      const finalNotes = selectedItemsSummary
        ? (notes ? `${notes}\n\nRequested items: ${selectedItemsSummary}` : `Requested items: ${selectedItemsSummary}`)
        : notes;

      await axios.post(`${API_BASE}/api/payments/verify`, {
        razorpay_order_id: payResponse.razorpay_order_id,
        razorpay_payment_id: payResponse.razorpay_payment_id,
        razorpay_signature: payResponse.razorpay_signature,
        service_id: Number(id),
        event_date: eventDate,
        quantity,
        notes: finalNotes,
        address: String(address).trim(),
        duration_hours: durationHours ? Number(durationHours) : undefined,
      }, { headers: authHeader() });

      setMessage('Payment successful and booking placed!');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!service) {
    return (
      <main className="bg-background-light min-h-screen py-4 md:py-6">
        <div className="max-w-5xl mx-auto px-3 md:px-4">
          <div className="py-10 text-center text-sm text-slate-500">
            Loading service details...
          </div>
        </div>
      </main>
    );
  }

  const gallery = Array.isArray(service.photo_urls) && service.photo_urls.length > 0
    ? service.photo_urls
    : service.photo_url
      ? [service.photo_url]
      : [];
  const primaryImage = gallery[0] || null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#eef2ff,_#f8fafc_40%,_#ffffff_75%)] py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <div className="h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg transition duration-300 hover:shadow-2xl lg:min-h-[520px]">
              {primaryImage ? (
                <div className="relative overflow-hidden">
                  <img
                    src={primaryImage}
                    className="h-[250px] w-full object-cover object-center transition duration-500 hover:scale-[1.03] md:h-[290px]"
                    alt={service.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/80 md:text-[11px]">
                      Service details
                    </p>
                    <h1 className="text-2xl font-black tracking-tight drop-shadow md:text-3xl">
                      {service.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/20 px-3 py-1 font-semibold backdrop-blur">
                        {service.location ? `Available in ${service.location}` : 'Event service'}
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-1 font-semibold backdrop-blur">
                        {service.price != null ? formatInr(service.price) : 'From items'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[260px] items-center justify-center bg-slate-100 md:h-[320px]">
                  <span className="material-symbols-outlined text-6xl text-slate-400">image</span>
                </div>
              )}
              <div className="space-y-3 p-4 md:p-5">
                {gallery.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {gallery.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        className="h-[74px] w-[74px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <img
                          src={img}
                          alt={`${service.name} ${idx + 2}`}
                          className="h-full w-full object-cover transition duration-500 hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm leading-relaxed text-slate-600">
                  {service.description || 'No description provided for this service.'}
                </p>
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-amber-800">
                      ★ {Number(service.avg_rating || 0).toFixed(1)} average rating
                    </p>
                    <p className="text-xs font-medium text-amber-700">
                      {Number(service.review_count || 0)} review{Number(service.review_count || 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  {reviews.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {reviews.slice(0, 3).map((r) => (
                        <div key={r.id} className="rounded-lg border border-amber-100 bg-white px-2.5 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700">{r.customer_name}</p>
                            <p className="text-xs font-semibold text-amber-700">{'★'.repeat(Number(r.rating || 0))}</p>
                          </div>
                          {r.comment && <p className="mt-1 text-xs text-slate-600">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-800">
                    <span className="text-blue-700">{service.price != null ? formatInr(service.price) : 'From items'}</span>
                    {service.location && (
                      <span className="ml-1 text-sm text-slate-500"> · {service.location}</span>
                    )}
                  </p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    EventBazaar vendor
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl ring-1 ring-slate-100 transition duration-300 hover:shadow-2xl md:p-5 lg:min-h-[520px]">
              <h2 className="mb-1 text-xl font-bold text-slate-900">Book this service</h2>
              <p className="mb-3 text-sm text-slate-500">
                  Secure online payment. You&apos;ll get a confirmation instantly after booking.
              </p>
                {!isLoggedIn && (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Login as customer is required to add items to cart and book.
                  </div>
                )}
                {message && (
                  <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 animate-pulse">
                    {message}
                  </div>
                )}

                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Event Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Service Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Venue or full address"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Duration (hours, optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {canPayWithCart && (
                  <p className="mb-2 text-sm font-semibold text-blue-700">
                    Package total: {formatInr(selectedItemsTotal)}
                  </p>
                )}
                {!canBook && items.length > 0 && (
                  <p className="mb-2 text-sm text-slate-500">
                    Add items below with quantity to book this package.
                  </p>
                )}
                <button
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={book}
                  disabled={bookingLoading || !canBook || !isCustomer}
                >
                  {bookingLoading
                    ? 'Processing payment...'
                    : canPayWithCart
                      ? `Book package — ₹${selectedItemsTotal.toFixed(0)}`
                      : canPayWithServicePrice
                        ? `Book now — ${formatInr(service.price)}`
                        : 'Add items to book'}
                </button>
            </div>
          </div>
        </section>

        {items.length > 0 && (
          <section className="mt-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg">
              <div className="p-5 md:p-6">
                <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="material-symbols-outlined text-blue-600">inventory_2</span>
                  Add items as per your requirement
                </h3>
                {!isLoggedIn && (
                  <p className="mb-2 text-sm text-amber-700">
                    Login as customer to add items to cart and book this package.
                  </p>
                )}
                <p className="mb-4 text-sm text-slate-500">
                  Select quantity for each item. Total payment will be based on selected items. Login required to book.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <div key={item.id}>
                      <div className="group h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="relative h-[150px] bg-slate-100">
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-5xl">image</span>
                            </div>
                          )}
                          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                            {item.amount != null ? formatInr(item.amount) : 'Price on request'}
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          <h4 className="truncate text-[15px] font-semibold text-slate-900" title={item.name}>{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                              {item.amount != null ? `${formatInr(item.amount)} per item` : 'Price on request'}
                            </p>
                            {item.quantity && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                Available: {item.quantity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                            <label className="px-1 text-xs font-medium text-slate-500">Qty</label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setItemQty(item.id, (itemQuantities[item.id] ?? 0) - 1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                value={itemQuantities[item.id] ?? 0}
                                onChange={(e) => setItemQty(item.id, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => incrementItemQty(item.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedItemsSummary && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-slate-700">
                    <strong>Selected:</strong> {selectedItemsSummary}
                    {selectedItemsTotal > 0 && (
                      <span className="ml-1 font-semibold text-blue-700"> · Total: {formatInr(selectedItemsTotal)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}



