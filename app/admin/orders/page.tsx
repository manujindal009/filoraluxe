"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";
import { Order } from "@/types";
import { fetchAllOrders, updateOrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (error) {
      addToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered') => {
    setStatusLoading(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      addToast(`Order ${orderId} updated to ${newStatus}`, "success");
    } catch (error) {
      addToast("Failed to update status", "error");
    } finally {
      setStatusLoading(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Order Tracking</h1>
      </div>

      <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden flex flex-col w-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-secondary flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
          </div>
          <div className="text-sm text-foreground/50 whitespace-nowrap self-end sm:self-auto">
            Showing {filteredOrders.length} orders
          </div>
        </div>

        {/* Table wrapper for mobile responsiveness */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Charges</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.shippingAddress.name}</span>
                        <span className="text-xs text-foreground/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                          order.paymentMethod === 'upi' ? 'bg-blue-50 text-blue-600' : 
                          order.paymentMethod === 'cod' ? 'bg-amber-50 text-amber-600' : 
                          'bg-primary/10 text-foreground/40'
                        }`}>
                          {order.paymentMethod || 'Credit Card'}
                        </span>
                        {order.utrNumber && (
                          <span className="text-[10px] font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-foreground/70 border border-secondary">
                            UTR: {order.utrNumber}
                          </span>
                        )}
                        {order.upiScreenshotUrl && !order.utrNumber && (
                          <a 
                            href={order.upiScreenshotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-rose hover:underline flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />
                            View Proof
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[10px] text-foreground/60 leading-tight">
                        <span>GST: {formatPrice(order.gstAmount || 0)}</span>
                        <span>Del: {formatPrice(order.deliveryCharge || 0)}</span>
                        {order.gift_wrap_charge && order.gift_wrap_charge > 0 ? (
                          <span className="text-rose font-medium">GW: {formatPrice(order.gift_wrap_charge)}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {formatPrice(order.total - (order.discountAmount || 0) + (order.deliveryCharge || 0) + (order.gstAmount || 0) + (order.gift_wrap_charge || 0))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          disabled={statusLoading === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          className={`appearance-none border text-xs font-medium uppercase tracking-wider rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 transition-all ${
                            order.status === 'delivered' ? 'bg-sage/10 text-sage border-sage/30' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            'bg-primary/20 text-foreground/70 border-secondary'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        {statusLoading === order.id && <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
