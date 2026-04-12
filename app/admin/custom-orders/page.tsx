"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MessageSquare, 
  ExternalLink,
  Filter,
  MoreVertical,
  Image as ImageIcon,
  Phone
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { 
  fetchAllCustomOrders, 
  updateCustomOrderStatus, 
  deleteCustomOrderRequest,
  CustomOrderRequest 
} from "@/lib/api/custom-orders";

export default function AdminCustomOrdersPage() {
  const [requests, setRequests] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { addToast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCustomOrders();
      setRequests(data);
    } catch (error) {
      addToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: CustomOrderRequest['status']) => {
    try {
      await updateCustomOrderStatus(id, newStatus);
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      addToast(`Status updated to ${newStatus}`, "success");
    } catch (error) {
      addToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteCustomOrderRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      addToast("Request deleted", "success");
    } catch (error) {
      addToast("Failed to delete request", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quoted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Custom Requests</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage unique design inquiries from your customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-secondary shadow-sm overflow-hidden flex flex-col w-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-secondary flex flex-col lg:flex-row items-center gap-4 justify-between bg-secondary/10">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by name, email or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-secondary rounded-xl text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose transition-all bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-4 h-4 text-foreground/40 hidden sm:block" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-secondary rounded-xl text-sm focus:outline-none focus:border-rose transition-all bg-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="h-6 w-px bg-secondary mx-2 hidden sm:block" />
            <div className="text-xs font-medium text-foreground/50 whitespace-nowrap">
              {filtered.length} Requests Found
            </div>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
            <thead className="bg-secondary/20 uppercase text-[10px] font-bold tracking-widest text-foreground/60">
              <tr>
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Budget & Timeline</th>
                <th className="px-6 py-5">Reference</th>
                <th className="px-6 py-5">Vision/Description</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-foreground/30" />
                      </div>
                      <p className="text-foreground/50 font-medium italic">No custom requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((request) => (
                  <tr key={request.id} className="hover:bg-secondary/5 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-base tracking-tight">{request.name}</span>
                        <div className="flex flex-col text-[10px] text-foreground/50 font-medium">
                          <span>{request.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {request.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground/80">Est. Budget: {request.budget.startsWith('₹') ? request.budget : `₹${request.budget}`}</span>
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full inline-flex w-fit font-bold uppercase tracking-tight text-foreground/50">
                          {request.timeline}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {request.image_url ? (
                        <a 
                          href={request.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-12 h-12 rounded-lg border border-secondary overflow-hidden hover:ring-2 hover:ring-rose transition-all group"
                        >
                          <img src={request.image_url} alt="Reference" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </a>
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-secondary flex items-center justify-center text-foreground/20">
                          <div title="Preview">
  <ImageIcon className="w-5 h-5" />
</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="max-w-[300px] group-hover:max-w-[400px] transition-all">
                        <p className="text-xs text-foreground/70 leading-relaxed truncate">
                          {request.description}
                        </p>
                        <button 
                          className="text-[10px] text-rose font-bold uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => alert(request.description)}
                        >
                          Read Full Vision
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <select 
                        value={request.status}
                        onChange={(e) => handleStatusUpdate(request.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-all uppercase tracking-wider ${getStatusColor(request.status)} cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-6 text-foreground/50 text-xs font-medium">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(request.id)}
                        className="p-2 text-foreground/30 hover:text-rose hover:bg-rose/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
