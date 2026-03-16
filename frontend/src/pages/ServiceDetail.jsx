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

  const load = async () => {
    const [svcRes, itemsRes] = await Promise.all([
      axios.get(`${API_BASE}/api/services/${id}`),
      axios.get(`${API_BASE}/api/services/${id}/items/public`).catch(() => ({ data: [] })),
    ]);
    setService(svcRes.data);
    setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    setItemQuantities({});
  };
  useEffect(() => { load(); }, [id]);

  const setItemQty = (itemId, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    setItemQuantities((prev) => ({ ...prev, [itemId]: n }));
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
  const canPayWithCart = selectedItemsTotal > 0;
  const canPayWithServicePrice = service && service.price != null && !Number.isNaN(Number(service.price));
  const canBook = canPayWithCart || canPayWithServicePrice;

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

      await axios.post(`${API_BASE}/api/payments/verify`, {
        razorpay_order_id: payResponse.razorpay_order_id,
        razorpay_payment_id: payResponse.razorpay_payment_id,
        razorpay_signature: payResponse.razorpay_signature,
      }, { headers: authHeader() });

      const finalNotes = selectedItemsSummary
        ? (notes ? `${notes}\n\nRequested items: ${selectedItemsSummary}` : `Requested items: ${selectedItemsSummary}`)
        : notes;
      await axios.post(`${API_BASE}/api/bookings/`, {
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
    <main className="bg-background-light min-h-screen py-4 md:py-6">
      <div className="max-w-5xl mx-auto px-3 md:px-4">
        <header className="mb-4 md:mb-5 rounded-3xl bg-gradient-to-r from-background-dark via-slate-900 to-primary px-4 py-4 md:px-6 md:py-5 text-white shadow-sm">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-2 gap-md-3">
            <div>
              <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70 mb-1">
                Service details
              </p>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {service.name}
              </h1>
              <p className="text-xs md:text-sm text-white/80 mt-0.5 mb-0">
                {service.location ? `Available in ${service.location}` : 'Event service'}
              </p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2 text-[11px] md:text-xs">
              <span className="inline-flex align-items-center gap-1 rounded-pill bg-white/10 px-3 py-1 fw-semibold">
                <span className="material-symbols-outlined text-sm">payments</span>
                {service.price != null ? `₹${service.price}` : 'From items'}
              </span>
              <span className="inline-flex align-items-center gap-1 rounded-pill bg-white/10 px-3 py-1 fw-semibold">
                <span className="material-symbols-outlined text-sm">event</span>
                Instant confirmation
              </span>
            </div>
          </div>
        </header>

        <section className="row g-3">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-3">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  className="img-fluid"
                  alt={service.name}
                  style={{
                    maxHeight: '360px',
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: '260px' }}
                >
                  <i className="fas fa-image text-muted" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
              <div className="card-body">
                {gallery.length > 1 && (
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    {gallery.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-3 border"
                        style={{ width: '72px', height: '72px' }}
                      >
                        <img
                          src={img}
                          alt={`${service.name} ${idx + 2}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="mb-2 text-sm text-slate-600">
                  {service.description || 'No description provided for this service.'}
                </p>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <p className="mb-0 fw-semibold">
                    <span className="text-primary">{service.price != null ? `₹${service.price}` : 'From items'}</span>
                    {service.location && (
                      <span className="text-muted small ms-1"> · {service.location}</span>
                    )}
                  </p>
                  <span className="badge rounded-pill bg-primary/10 text-primary fw-semibold">
                    EventBazaar vendor
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body">
                <h5 className="mb-1">Book this service</h5>
                <p className="text-muted small mb-3">
                  Secure online payment. You&apos;ll get a confirmation instantly after booking.
                </p>
                {!isCustomer && (
                  <div className="alert alert-warning py-2 small mb-3">
                    Login as customer is required to add items to cart and book.
                  </div>
                )}
                {message && <div className="alert alert-info py-2 small">{message}</div>}

                <div className="mb-2">
                  <label className="form-label small text-uppercase text-muted mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm rounded-2"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small text-uppercase text-muted mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm rounded-2"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small text-uppercase text-muted mb-1">
                    Service Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Venue or full address"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small text-uppercase text-muted mb-1">
                    Duration (hours, optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm rounded-2"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-uppercase text-muted mb-1">
                    Notes
                  </label>
                  <textarea
                    className="form-control form-control-sm rounded-2"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {canPayWithCart && (
                  <p className="small mb-2 text-primary fw-semibold">
                    Package total: ₹{selectedItemsTotal.toFixed(0)}
                  </p>
                )}
                {!canBook && items.length > 0 && (
                  <p className="text-muted small mb-2">
                    Add items below with quantity to book this package.
                  </p>
                )}
                <button
                  className="btn btn-primary w-100"
                  onClick={book}
                  disabled={bookingLoading || !canBook || !isCustomer}
                >
                  {bookingLoading
                    ? 'Processing payment...'
                    : canPayWithCart
                      ? `Book package — ₹${selectedItemsTotal.toFixed(0)}`
                      : canPayWithServicePrice
                        ? `Book now — ₹${Number(service.price).toFixed(0)}`
                        : 'Add items to book'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 && (
          <section className="mt-4">
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="card-body">
                <h5 className="mb-1 d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  Add items as per your requirement
                </h5>
                {!isCustomer && (
                  <p className="small mb-2 text-warning">
                    Login as customer to add items to cart and book this package.
                  </p>
                )}
                <p className="text-muted small mb-3">
                  Select quantity for each item. Total payment will be based on selected items. Login required to book.
                </p>
                <div className="row g-3">
                  {items.map((item) => (
                    <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                      <div className="card border rounded-3 h-100 overflow-hidden">
                        <div className="position-relative" style={{ height: '140px', backgroundColor: 'var(--bs-light)' }}>
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.name}
                              className="w-100 h-100 object-fit-cover"
                              style={{ objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>image</span>
                            </div>
                          )}
                        </div>
                        <div className="card-body py-2 px-3">
                          <h6 className="card-title mb-1 text-truncate" title={item.name}>{item.name}</h6>
                          <p className="mb-1 small text-primary fw-semibold">
                            {item.amount != null ? `₹${item.amount} per item` : 'Price on request'}
                          </p>
                          {item.quantity && (
                            <p className="small text-muted mb-2">Total: {item.quantity}</p>
                          )}
                          <div className="d-flex align-items-center gap-2">
                            <label className="small text-muted mb-0">Qty:</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control form-control-sm rounded-2"
                              style={{ width: '80px' }}
                              value={itemQuantities[item.id] ?? 0}
                              onChange={(e) => setItemQty(item.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedItemsSummary && (
                  <div className="mt-3 p-2 rounded-2 bg-light small">
                    <strong>Selected:</strong> {selectedItemsSummary}
                    {selectedItemsTotal > 0 && (
                      <span className="ms-1 fw-semibold text-primary"> · Total: ₹{selectedItemsTotal.toFixed(0)}</span>
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



