import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  ShoppingBag,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  Search,
  Sparkles,
  CheckCircle2,
  Utensils,
  Eye,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { OrderStatusBadge, OrderTypeBadge, PaymentMethodBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import type { Order } from '../types';
import { formatCurrency, BUSINESS_CONFIG } from '../constants/theme';


export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchToken, setSearchToken] = useState<string>('');

  // Sample orders reflecting authentic Oonjal Chai menu and Sri Lankan context
  const initialOrders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'ORD-20261014-0104',
      tokenNumber: 104,
      type: 'dine-in',
      tableNumber: 'T-04',
      status: 'preparing',
      items: [
        { id: '1', name: 'Special Masala Chai', category: 'Chai', quantity: 2, unitPrice: 150, totalPrice: 300 },
        { id: '2', name: 'Crispy Chicken Burger', category: 'Burgers', quantity: 1, unitPrice: 750, totalPrice: 750 },
      ],
      subtotal: 1050,
      discount: 0,
      total: 1050,
      paymentMethod: 'cash',
      paymentStatus: 'verified',
      createdAt: '16:45',
      customerName: 'Ashraf',
    },
    {
      id: 'ord-102',
      orderNumber: 'ORD-20261014-0105',
      tokenNumber: 105,
      type: 'takeaway',
      status: 'ready',
      items: [
        { id: '3', name: 'Blue Curacao Mojito', category: 'Mojitos', quantity: 1, unitPrice: 450, totalPrice: 450 },
        { id: '4', name: 'Chicken Submarine (Full)', category: 'Submarines', quantity: 1, unitPrice: 950, totalPrice: 950 },
      ],
      subtotal: 1400,
      discount: 100,
      total: 1300,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      createdAt: '16:52',
      customerName: 'Kavindu',
    },
    {
      id: 'ord-103',
      orderNumber: 'ORD-20261014-0106',
      tokenNumber: 106,
      type: 'dine-in',
      tableNumber: 'T-02',
      status: 'completed',
      items: [
        { id: '5', name: 'Cardamom Ginger Chai', category: 'Chai', quantity: 3, unitPrice: 160, totalPrice: 480 },
        { id: '6', name: 'Fudgy Brownie with Ice Cream', category: 'Desserts', quantity: 2, unitPrice: 400, totalPrice: 800 },
      ],
      subtotal: 1280,
      discount: 0,
      total: 1280,
      paymentMethod: 'cash',
      paymentStatus: 'verified',
      createdAt: '17:05',
      customerName: 'Ramanan',
    },
    {
      id: 'ord-104',
      orderNumber: 'ORD-20261014-0107',
      tokenNumber: 107,
      type: 'takeaway',
      status: 'pending',
      items: [
        { id: '7', name: 'Burger & Mojito Combo', category: 'Combos', quantity: 2, unitPrice: 1100, totalPrice: 2200 },
      ],
      subtotal: 2200,
      discount: 0,
      total: 2200,
      paymentMethod: 'cash',
      paymentStatus: 'verified',
      createdAt: '17:15',
      customerName: 'Farzan',
    },
  ];

  const filteredOrders = initialOrders.filter((order) => {
    if (!searchToken.trim()) return true;
    return (
      order.tokenNumber.toString().includes(searchToken.trim()) ||
      order.orderNumber.toLowerCase().includes(searchToken.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchToken.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Business Session Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Active Shift • 4:00 PM – 1:00 AM
              </span>
              <span className="text-xs text-zinc-400 font-mono">Asia/Colombo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Oonjal Chai Cafe Operations
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Real-time POS counter, order status dispatch, and token workflow for Sri Lankan chai and fast-food orders.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<Search className="w-4 h-4" />}
              onClick={() => navigate('/orders')}
            >
              Token Lookup
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/pos')}
            >
              Open POS Register
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(48750)}
          change="+18.4% vs Yesterday"
          isPositive={true}
          subtext="Target: Rs. 65,000"
          icon={TrendingUp}
          accent="gold"
        />
        <StatCard
          title="Total Orders"
          value="148"
          change="On track"
          isPositive={true}
          subtext={`Target ~${BUSINESS_CONFIG.expectedDailyOrders} orders/day`}
          icon={ShoppingBag}
          accent="emerald"
        />
        <StatCard
          title="Active Tokens"
          value="6"
          change="3 Preparing • 3 Ready"
          isPositive={true}
          subtext="Avg prep time: 6 mins"
          icon={Clock}
          badge="Kitchen Live"
          accent="blue"
        />
        <StatCard
          title="Dine-in / Takeaway"
          value="62% / 38%"
          change="89 Dine-in • 59 Takeaway"
          isPositive={true}
          subtext="12 Active Tables"
          icon={Utensils}
          accent="purple"
        />
      </div>

      {/* Quick Launch Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group shadow-sm"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:scale-105 transition-transform">
            <Coffee className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300">Quick Chai & Coffee</p>
          <p className="text-[11px] text-zinc-400">Masala, Ginger & Cardamom</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group shadow-sm"
        >
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 w-fit mb-2 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-100 group-hover:text-orange-300">Burgers & Submarines</p>
          <p className="text-[11px] text-zinc-400">Crispy chicken & wraps</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/combos')}
          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group shadow-sm"
        >
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-100 group-hover:text-rose-300">Combo Offers</p>
          <p className="text-[11px] text-zinc-400">Burger + Mojito specials</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/bank-transfers')}
          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group shadow-sm"
        >
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-2 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-100 group-hover:text-sky-300">Bank Transfer Verify</p>
          <p className="text-[11px] text-zinc-400">1 Pending confirmation</p>
        </button>
      </div>

      {/* Live Orders & Token Tracker Section */}
      <Card>
        <CardHeader
          title="Recent Orders & Live Tokens"
          subtitle="Real-time order statuses and customer tokens for current shift"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  placeholder="Filter token / order..."
                  className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/orders')}
              >
                View All
              </Button>
            </div>
          }
        />

        {/* Table Container */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 text-[11px] uppercase tracking-wider text-zinc-400 border-y border-zinc-800">
              <tr>
                <th className="py-3 px-3 font-semibold">Token</th>
                <th className="py-3 px-3 font-semibold">Order #</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Items</th>
                <th className="py-3 px-3 font-semibold">Total</th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No orders matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{order.tokenNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-zinc-200">{order.orderNumber}</span>
                      {order.customerName && (
                        <p className="text-[11px] text-zinc-400">{order.customerName}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <OrderTypeBadge type={order.type} table={order.tableNumber} />
                    </td>
                    <td className="py-3 px-3">
                      <p className="truncate max-w-[200px] text-zinc-200">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-zinc-400">{order.createdAt}</p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-semibold text-amber-400">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PaymentMethodBadge method={order.paymentMethod} status={order.paymentStatus} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Token #${selectedOrder.tokenNumber} - ${selectedOrder.orderNumber}`}
          subtitle={`Placed at ${selectedOrder.createdAt} • ${selectedOrder.type.toUpperCase()} ${
            selectedOrder.tableNumber ? `(${selectedOrder.tableNumber})` : ''
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400">Status</p>
                <div className="mt-1">
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">Payment</p>
                <div className="mt-1">
                  <PaymentMethodBadge
                    method={selectedOrder.paymentMethod}
                    status={selectedOrder.paymentStatus}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Order Items
              </h4>
              <div className="divide-y divide-zinc-800 border-y border-zinc-800">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-zinc-200">
                        {item.quantity}x {item.name}
                      </p>
                      <p className="text-zinc-500">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                    <span className="font-semibold text-zinc-100">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-sm font-bold border-t border-zinc-800">
              <span className="text-zinc-300">Total Payable</span>
              <span className="text-amber-400 text-base">{formatCurrency(selectedOrder.total)}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setSelectedOrder(null);
                  navigate('/pos');
                }}
              >
                Go to POS Register
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
