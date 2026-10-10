import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Image as ImageIcon, FileText, Download, Eye, Plus } from "lucide-react";
import { Order } from "@/types";
import { Invoice } from "@/types/invoice";
import { fetchAllOrders, updateOrderStatus } from "@/lib/api/orders";
import { fetchInvoices } from "@/lib/api/invoices";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { InvoiceModal } from "@/components/admin/billing/InvoiceModal";
import { downloadInvoicePdf } from "@/lib/utils/pdf";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Invoice | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, invoicesData] = await Promise.all([
        fetchAllOrders().catch(() => []),
        fetchInvoices().catch(() => [])
      ]);
      setOrders(ordersData);
      setInvoices(invoicesData);
    } catch (error) {
      addToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
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
          <div className="text-sm text-foreground/50 whitespace-nowrap self-end sm:self-auto flex items-center gap-2">
            Showing {filteredOrders.length} orders
            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded opacity-50">v2.1</span>
          </div>
        </div>

        {/* Table wrapper for mobile responsiveness */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Charges</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status Tracking</th>
                <th className="px-6 py-4">Billing Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-foreground/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-foreground/50">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const linkedInvoice = invoices.find(
                    (inv) => inv.orderId === order.id || inv.orderNumber === order.id || inv.orderNumber === order.id.replace("ORD-", "FL-")
                  );

                  return (
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
                        <div className="flex flex-col gap-2">
                          {order.items && order.items.length > 0 ? (
                            <>
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded bg-secondary/50 overflow-hidden flex-shrink-0 border border-secondary">
                                    {item.product?.images?.[0] ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img 
                                        src={item.product.images[0]} 
                                        alt={item.product?.name || 'Product'} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 m-auto text-foreground/20" />
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-medium truncate max-w-[120px]" title={item.product?.name}>
                                      {item.product?.name || 'Unknown Product'}
                                    </span>
                                    <span className="text-[10px] text-foreground/40 leading-none">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                  <span className="text-[10px] text-rose font-medium pl-10">
                                    + {order.items.length - 2} more items
                                  </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-foreground/30 italic">No items found</span>
                          )}
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
                        {formatPrice(
                          Number(order.total || 0) - 
                          Number(order.discountAmount || 0) + 
                          Number(order.deliveryCharge || 0) + 
                          Number(order.gstAmount || 0) + 
                          Number(order.gift_wrap_charge || 0)
                        )}
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
                              order.status === 'cancelled' ? 'bg-rose/10 text-rose border-rose/30' :
                              'bg-primary/20 text-foreground/70 border-secondary'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {statusLoading === order.id && <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {linkedInvoice ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="font-mono text-xs font-bold text-rose flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              {linkedInvoice.invoiceNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewInvoiceModal(linkedInvoice)}
                                className="text-[11px] px-2 py-0.5 bg-rose/10 text-rose hover:bg-rose/20 rounded font-medium flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button
                                onClick={() => downloadInvoicePdf("invoice-template-printable", `${linkedInvoice.invoiceNumber}.pdf`)}
                                className="text-[11px] px-2 py-0.5 border border-secondary text-foreground/70 hover:bg-secondary/40 rounded font-medium flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" /> PDF
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={`/admin/billing/create?orderId=${order.id}`}
                            className="text-xs px-3 py-1.5 bg-rose text-white hover:bg-rose/90 rounded-lg font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Create Invoice
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        invoice={viewInvoiceModal}
        isOpen={Boolean(viewInvoiceModal)}
        onClose={() => setViewInvoiceModal(null)}
      />
    </div>
  );
}
