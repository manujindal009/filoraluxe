"use client";

import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { fetchAdminCustomers, CustomerStats } from "@/lib/api/analytics";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchAdminCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Customers</h1>
      </div>

      <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden flex flex-col w-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-secondary flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
          </div>
          <div className="text-sm text-foreground/50 whitespace-nowrap self-end sm:self-auto">
            Showing {filteredCustomers.length} customers
          </div>
        </div>

        {/* Table wrapper for mobile responsiveness */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center font-serif text-lg text-foreground font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-xs text-foreground/50">{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Mail className="w-3 h-3 text-foreground/50" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Phone className="w-3 h-3 text-foreground/50" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <MapPin className="w-3 h-3 text-foreground/50" />
                        <span>{customer.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/70">
                      {new Date(customer.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {customer.ordersCount}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {formatPrice(customer.totalSpent)}
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
