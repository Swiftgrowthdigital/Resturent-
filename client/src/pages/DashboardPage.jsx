import { Check, PackageSearch, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LoadingScreen } from '../components/LoadingScreen';
import { StatusPill } from '../components/StatusPill';
import { api } from '../lib/api';
import { toArray } from '../lib/arrays';
import { getSocket } from '../lib/socket';

const tabs = ['Dashboard', 'Orders', 'Categories', 'Menu', 'Seats'];
const emptyFood = { name: '', category: '', price: '', available: true };

function DashboardPageContent() {
  const [tab, setTab] = useState('Dashboard');
  const [orders, setOrders] = useState([]); const [foods, setFoods] = useState([]); const [categories, setCategories] = useState([]); const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [modal, setModal] = useState(null); const [form, setForm] = useState({});
  const notified = useRef(new Set());
  const notificationSound = useRef(null);
  const today = useCallback((order) => new Date(order.createdAt).toDateString() === new Date().toDateString(), []);
  const load = useCallback(async () => {
    try {
      const [orderRes, foodRes, categoryRes, seatRes] = await Promise.all([api.get('/api/orders'), api.get('/api/foods'), api.get('/api/categories'), api.get('/api/seats')]);
      setOrders(toArray(orderRes.data.orders).filter(today)); setFoods(toArray(foodRes.data.foods)); setCategories(toArray(categoryRes.data.categories)); setSeats(toArray(seatRes.data.seats));
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to load dashboard'); } finally { setLoading(false); }
  }, [today]);
  useEffect(() => {
    load(); const socket = getSocket(); socket.connect();
    const newOrder = (order) => {
      if (notified.current.has(order._id)) return;
      notified.current.add(order._id);
      if (!notificationSound.current) notificationSound.current = new Audio('/sounds/new-order.mp3');
      const sound = notificationSound.current;
      // Reset the same lightweight audio element on every event. This keeps a burst
      // of orders responsive while making the most recent alert start immediately.
      sound.pause();
      try { sound.currentTime = 0; } catch { /* The media is not ready yet. */ }
      void sound.play().catch(() => {});
      if ('Notification' in window && Notification.permission === 'granted') new Notification('New Order Received', { body: `Seat ${order.seatNumber}` });
      if (today(order)) setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]);
    };
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
    socket.on('new-order', newOrder); socket.on('order:updated', load); socket.on('menu:updated', load);
    return () => { socket.off('new-order', newOrder); socket.off('order:updated', load); socket.off('menu:updated', load); notificationSound.current?.pause(); };
  }, [load]);
  const stats = useMemo(() => ({ total: orders.length, pending: orders.filter((o) => o.status === 'Pending').length, confirmed: orders.filter((o) => o.status === 'Confirmed').length, cancelled: orders.filter((o) => o.status === 'Cancelled').length, revenue: orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.grandTotal ?? o.totalAmount ?? 0), 0) }), [orders]);
  async function orderAction(id, action) { try { await api.patch(`/api/orders/${id}/${action}`); toast.success(action === 'confirm' ? 'Order confirmed' : 'Order cancelled'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Order update failed'); } }
  function open(type, entity) { setForm(entity ? { ...entity, category: entity.category?._id || entity.category, available: entity.available !== false && !entity.outOfStock, active: entity.active !== false } : type === 'food' ? { ...emptyFood, category: categories[0]?._id || '' } : type === 'category' ? { name: '', icon: '', status: true } : { seatNumber: '', active: true }); setModal({ type, entity }); }
  async function save(e) { e.preventDefault(); setSaving(true); const { type, entity } = modal; try { let image; if (form.image) { const upload = new FormData(); upload.append('image', form.image); upload.append('type', type === 'food' ? 'food' : 'category'); image = (await api.post('/api/upload', upload)).data.url; } if (type === 'food') { const data = { name: form.name, category: form.category, price: Number(form.price), available: form.available, outOfStock: !form.available, ...(image ? { image } : {}) }; entity ? await api.put(`/api/foods/${entity._id}`, data) : await api.post('/api/foods', data); } if (type === 'category') { const data = { name: form.name, icon: form.icon || '', status: form.status, ...(image ? { image } : {}) }; entity ? await api.put(`/api/categories/${entity._id}`, data) : await api.post('/api/categories', data); } if (type === 'seat') { const data = { seatNumber: form.seatNumber, active: form.active }; entity ? await api.put(`/api/seats/${entity._id}`, data) : await api.post('/api/seats', data); } toast.success(`${type === 'food' ? 'Menu item' : type === 'seat' ? 'Seat' : 'Category'} saved`); setModal(null); load(); } catch (err) { toast.error(err.response?.data?.message || 'Could not save changes'); } finally { setSaving(false); } }
  async function remove(type, entity) { if (!window.confirm(`Delete ${entity.name || entity.seatNumber}?`)) return; try { await api.delete(`/api/${type === 'food' ? 'foods' : type === 'seat' ? 'seats' : 'categories'}/${entity._id}`); toast.success('Deleted'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Could not delete'); } }
  if (loading) return <LoadingScreen label="Loading dashboard..." variant="dashboard" />;
  return <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6"><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-300">Restaurant admin</p><h1 className="mt-1 text-3xl font-black text-white">Today's Orders</h1></div><span className="premium-chip">Live updates on</span></header><nav className="no-scrollbar mb-5 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${tab === item ? 'bg-orange-500 text-white' : 'bg-white/[.05] text-slate-300 hover:bg-white/[.1]'}`}>{item}</button>)}</nav>
    {tab === 'Dashboard' ? <Dashboard stats={stats} /> : null}
    {tab === 'Orders' ? <Orders orders={orders} onAction={orderAction} /> : null}
    {tab === 'Categories' ? <Management title="Categories" action="Create Category" onAdd={() => open('category')} rows={categories} empty="No categories yet." render={(c) => <Row name={`${c.icon || ''} ${c.name}`} state={c.status !== false ? 'Active' : 'Disabled'} onEdit={() => open('category', c)} onDelete={() => remove('category', c)} />} /> : null}
    {tab === 'Menu' ? <Management title="Manage Menu" action="Add Item" onAdd={() => open('food')} rows={foods} empty="No menu items yet." render={(f) => <Row name={f.name} detail={`${f.category?.name || 'Uncategorized'} · ₹${Number(f.price).toLocaleString('en-IN')}`} state={f.available !== false && !f.outOfStock ? 'Enabled' : 'Disabled'} onEdit={() => open('food', f)} onDelete={() => remove('food', f)} />} /> : null}
    {tab === 'Seats' ? <Management title="Seat Management" action="Add Seat" count={`${seats.length} total seats`} onAdd={() => open('seat')} rows={seats} empty="No seats configured." render={(s) => <Row name={s.seatNumber} state={s.active !== false ? 'Enabled' : 'Disabled'} onEdit={() => open('seat', s)} onDelete={() => remove('seat', s)} />} /> : null}
    {modal ? <Modal modal={modal} form={form} categories={categories} saving={saving} onChange={(patch) => setForm((v) => ({ ...v, ...patch }))} onClose={() => setModal(null)} onSubmit={save} /> : null}
  </main>;
}
export function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/auth/session').then(() => setAuthenticated(true)).catch(() => setAuthenticated(false));
  }, []);

  async function signIn(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/auth/login', { password });
      setPassword('');
      setAuthenticated(true);
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to sign in'); }
    finally { setSubmitting(false); }
  }

  if (authenticated === null) return <LoadingScreen label="Checking dashboard access..." variant="dashboard" />;
  if (authenticated) return <DashboardPageContent />;
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-4"><form onSubmit={signIn} className="premium-card w-full p-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-300">Restaurant admin</p><h1 className="mt-2 text-3xl font-black text-white">Dashboard sign in</h1><p className="mt-2 text-sm text-slate-400">Use the dashboard password configured on the server.</p><label className="mt-6 block text-sm font-semibold text-slate-200">Password<input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-400" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><Button className="mt-5 w-full" type="submit" loading={submitting}>Sign in</Button></form></main>;
}
function Dashboard({ stats }) { const cards = [['Total Orders Today', stats.total], ['Pending Orders', stats.pending], ['Confirmed Orders', stats.confirmed], ['Cancelled Orders', stats.cancelled], ["Today's Revenue", `₹${stats.revenue.toLocaleString('en-IN')}`]]; return <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value]) => <article key={label} className="premium-card p-4"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></article>)}</section>; }
function Orders({ orders, onAction }) { return <section className="space-y-3">{orders.length ? orders.map((o) => <article key={o._id} className="premium-card p-4"><div className="flex flex-wrap justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-black text-white">{o.orderNumber}</h2><StatusPill status={o.status} /></div><p className="mt-1 text-sm text-slate-400">Seat {o.seatNumber} · {new Date(o.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div><p className="font-black text-white">₹{o.grandTotal ?? o.totalAmount}</p></div><div className="mt-3 rounded-xl bg-white/[.04] p-3 text-sm text-slate-200">{toArray(o.items).map((i) => <p key={i.name}>{i.quantity} × {i.name}</p>)}</div>{o.status === 'Pending' ? <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => onAction(o._id, 'confirm')} leftIcon={Check}>Confirm Order</Button><Button size="sm" variant="secondary" onClick={() => onAction(o._id, 'cancel')} leftIcon={X}>Cancel Order</Button></div> : null}</article>) : <EmptyState title="No orders today" description="Today's customer orders appear here." icon={PackageSearch} />}</section>; }
function Management({ title, action, count, onAdd, rows, empty, render }) { return <section className="premium-card overflow-hidden"><div className="flex items-center justify-between gap-3 p-5"><div><h2 className="text-2xl font-black text-white">{title}</h2>{count ? <p className="mt-1 text-sm text-slate-400">{count}</p> : null}</div><Button onClick={onAdd} leftIcon={Plus}>{action}</Button></div><div className="divide-y divide-white/10 border-t border-white/10">{rows.length ? rows.map(render) : <p className="p-6 text-center text-sm text-slate-400">{empty}</p>}</div></section>; }
function Row({ name, detail, state, onEdit, onDelete }) { return <div className="flex items-center justify-between gap-3 p-4"><div><p className="font-bold text-white">{name}</p>{detail ? <p className="text-sm text-slate-400">{detail}</p> : null}<p className={`text-xs ${state === 'Enabled' || state === 'Active' ? 'text-emerald-300' : 'text-rose-300'}`}>{state}</p></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit"><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-rose-300" onClick={onDelete} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button></div></div>; }
function Modal({ modal, form, categories, saving, onChange, onClose, onSubmit }) { const type = modal.type; const title = `${modal.entity ? 'Edit' : 'Add'} ${type === 'food' ? 'Menu Item' : type === 'seat' ? 'Seat' : 'Category'}`; return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center"><form onSubmit={onSubmit} className="premium-card w-full max-w-md p-5"><div className="flex justify-between"><h2 className="text-xl font-black text-white">{title}</h2><button type="button" onClick={onClose}><X className="text-white" /></button></div><div className="mt-5 grid gap-4">{type === 'seat' ? <Input label="Seat Number" value={form.seatNumber || ''} onChange={(e) => onChange({ seatNumber: e.target.value })} required /> : <Input label={type === 'food' ? 'Item Name' : 'Category Name'} value={form.name || ''} onChange={(e) => onChange({ name: e.target.value })} required />}{type === 'category' ? <Input label="Icon (optional)" value={form.icon || ''} onChange={(e) => onChange({ icon: e.target.value })} /> : null}{type === 'food' ? <><label className="text-sm text-slate-200">Category<select className="mt-2 w-full rounded-xl bg-slate-900 p-3" value={form.category || ''} onChange={(e) => onChange({ category: e.target.value })}>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label><Input label="Price (INR)" type="number" min="0" value={form.price || ''} onChange={(e) => onChange({ price: e.target.value })} required /></> : null}{type !== 'seat' ? <label className="text-sm text-slate-200">Image (optional)<input className="mt-2 block w-full text-sm text-slate-300" type="file" accept="image/*" onChange={(e) => onChange({ image: e.target.files?.[0] || null })} /></label> : null}<label className="flex justify-between rounded-xl bg-white/[.05] p-3 text-sm text-white"><span>Enabled</span><input type="checkbox" checked={type === 'category' ? form.status !== false : type === 'seat' ? form.active !== false : form.available !== false} onChange={(e) => onChange(type === 'category' ? { status: e.target.checked } : type === 'seat' ? { active: e.target.checked } : { available: e.target.checked })} /></label></div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div></form></div>; }
