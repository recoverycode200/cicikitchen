import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ShoppingBag, Package, Calendar, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Order, OrderStatus } from '../../types';

type Period = 'daily' | 'weekly' | 'monthly';

interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
}

interface ChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
];

const getDateRange = (period: Period): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  if (period === 'daily') {
    start.setDate(end.getDate() - 6); // 7 hari terakhir
  } else if (period === 'weekly') {
    start.setDate(end.getDate() - 27); // 4 minggu terakhir
  } else {
    start.setMonth(end.getMonth() - 11); // 12 bulan terakhir
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const groupOrdersByPeriod = (orders: Order[], period: Period): ChartPoint[] => {
  const { start } = getDateRange(period);
  const map = new Map<string, { revenue: number; orders: number }>();

  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      map.set(key, { revenue: 0, orders: 0 });
    }
  } else if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = `Mgg ${4 - i}`;
      map.set(key, { revenue: 0, orders: 0 });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      map.set(key, { revenue: 0, orders: 0 });
    }
  }

  orders.forEach((order: any) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate < start) return;

    let key = '';
    if (period === 'daily') {
      key = orderDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    } else if (period === 'weekly') {
      const diff = Math.floor((Date.now() - orderDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekNum = 4 - diff;
      if (weekNum >= 1 && weekNum <= 4) key = `Mgg ${weekNum}`;
    } else {
      key = orderDate.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    }

    if (key && map.has(key)) {
      const cur = map.get(key)!;
      cur.revenue += order.totalPrice || 0;
      cur.orders += 1;
    }
  });

  return Array.from(map.entries()).map(([label, data]) => ({
    label,
    ...data,
  }));
};

const formatRupiah = (val: number) => `Rp${val.toLocaleString('id-ID')}`;

const AdminReports: React.FC = () => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchOrders = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await axios.get(`${apiUrl}/api/orders?limit=1000`);
        const data: Order[] = res.data?.data || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Gagal mengambil data laporan:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const { start } = getDateRange(period);

  const filteredOrders = orders.filter((o: any) => new Date(o.createdAt) >= start);

  const summary: ReportSummary = {
    totalRevenue: filteredOrders.reduce((s: number, o: any) => s + (o.totalPrice || 0), 0),
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter((o: any) => o.status === OrderStatus.DELIVERED).length,
    cancelledOrders: filteredOrders.filter((o: any) => o.status === OrderStatus.CANCELLED).length,
    avgOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((s: number, o: any) => s + (o.totalPrice || 0), 0) / filteredOrders.length : 0,
  };

  const chartData = groupOrdersByPeriod(orders, period);
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);

  const handleExport = () => {
    const rows = [
      ['Periode', 'Total Pendapatan', 'Jumlah Pesanan', 'Pesanan Selesai', 'Pesanan Dibatalkan', 'Rata-rata Nilai'],
      [PERIOD_OPTIONS.find((p) => p.value === period)?.label || period, summary.totalRevenue, summary.totalOrders, summary.completedOrders, summary.cancelledOrders, summary.avgOrderValue.toFixed(0)],
      [],
      ['Label', 'Pendapatan', 'Pesanan'],
      ...chartData.map((d) => [d.label, d.revenue, d.orders]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${period}-cici-kitchen.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Laporan Penjualan</h1>
          <p className="text-sm text-neutral-500 mt-1">Data diperbarui secara real-time dari sistem pesanan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchOrders(true)} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit mb-8">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${period === opt.value ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Calendar className="h-4 w-4" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500 font-medium">Total Pendapatan</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatRupiah(summary.totalRevenue)}</p>
          <p className="text-xs text-neutral-400 mt-1">{PERIOD_OPTIONS.find((p) => p.value === period)?.label} ini</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500 font-medium">Total Pesanan</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{summary.totalOrders}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {summary.completedOrders} selesai · {summary.cancelledOrders} dibatalkan
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500 font-medium">Rata-rata Nilai Pesanan</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatRupiah(Math.round(summary.avgOrderValue))}</p>
          <p className="text-xs text-neutral-400 mt-1">Per transaksi</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500 font-medium">Tingkat Penyelesaian</p>
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{summary.totalOrders > 0 ? `${Math.round((summary.completedOrders / summary.totalOrders) * 100)}%` : '0%'}</p>
          <p className="text-xs text-neutral-400 mt-1">Dari total pesanan</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <h3 className="font-semibold text-neutral-800 mb-6">Grafik Pendapatan</h3>
          <div className="flex items-end gap-2 h-40">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-neutral-500">{d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}k` : ''}</span>
                <div
                  className="w-full bg-primary-400 rounded-t-sm transition-all duration-500 hover:bg-primary-500 cursor-default"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 120, d.revenue > 0 ? 4 : 0)}px` }}
                  title={`${d.label}: ${formatRupiah(d.revenue)}`}
                />
                <span className="text-xs text-neutral-400 text-center leading-tight">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <h3 className="font-semibold text-neutral-800 mb-6">Grafik Jumlah Pesanan</h3>
          <div className="flex items-end gap-2 h-40">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-neutral-500">{d.orders > 0 ? d.orders : ''}</span>
                <div
                  className="w-full bg-blue-400 rounded-t-sm transition-all duration-500 hover:bg-blue-500 cursor-default"
                  style={{ height: `${Math.max((d.orders / maxOrders) * 120, d.orders > 0 ? 4 : 0)}px` }}
                  title={`${d.label}: ${d.orders} pesanan`}
                />
                <span className="text-xs text-neutral-400 text-center leading-tight">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800">
            Rincian Pesanan — <span className="text-primary-500">{PERIOD_OPTIONS.find((p) => p.value === period)?.label}</span>
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Tidak ada pesanan pada periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  {['ID Pesanan', 'Pelanggan', 'Status', 'Total', 'Tanggal'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.slice(0, 20).map((order: any) => (
                  <tr key={order._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-neutral-600">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 text-neutral-700">{order.user?.name || '-'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 font-medium text-neutral-900">{formatRupiah(order.totalPrice || 0)}</td>
                    <td className="px-5 py-3 text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length > 20 && <p className="text-center text-xs text-neutral-400 py-3">Menampilkan 20 dari {filteredOrders.length} pesanan. Export CSV untuk data lengkap.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Diproses', className: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Dikirim', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Diterima', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, className: 'bg-neutral-100 text-neutral-800' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>;
};

export default AdminReports;
