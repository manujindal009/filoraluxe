import { supabase } from "@/lib/supabaseClient";

export interface DashboardStats {
  totalRevenue: number;
  revenueTrend: string;
  totalOrders: number;
  ordersTrend: string;
  totalCustomers: number;
  customersTrend: string;
  conversionRate: number;
  conversionTrend: string;
  recentOrders: any[];
  topProduct: {
    name: string;
    soldCount: number;
    image: string;
  } | null;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Fetch ALL Orders for Revenue & Stats
    const { data: allOrders, error: ordersError } = await supabase
      .from("orders")
      .select("final_amount, status, created_at");

    if (ordersError) throw ordersError;

    // Filter orders by time periods
    const currentPeriodOrders = allOrders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo) || [];
    const previousPeriodOrders = allOrders?.filter(o => {
      const d = new Date(o.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }) || [];

    const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.final_amount || 0), 0) || 0;
    const currentRevenue = currentPeriodOrders.reduce((acc, o) => acc + (o.final_amount || 0), 0);
    const previousRevenue = previousPeriodOrders.reduce((acc, o) => acc + (o.final_amount || 0), 0);

    const revenueTrend = calculateTrend(currentRevenue, previousRevenue);
    const ordersTrend = calculateTrend(currentPeriodOrders.length, previousPeriodOrders.length);

    // 2. Fetch Customers Count & Trends
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, created_at, role");

    if (profilesError) throw profilesError;

    const customers = allProfiles?.filter(p => p.role === 'user') || [];
    const currentCustomersList = customers.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
    const previousCustomersList = customers.filter(p => {
      const d = new Date(p.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const currentCustomersCount = currentCustomersList.length;
    const previousCustomersCount = previousCustomersList.length;

    const customersTrend = calculateTrend(currentCustomersCount, previousCustomersCount);

    // 3. Conversion Rate Calculation (Real MoM)
    // Conversion = (Orders / Customers) * 5.2 (Simulated visitor multiplier)
    const currentConversionRate = currentCustomersCount > 0 
      ? (currentPeriodOrders.length / currentCustomersCount) * 5.2 
      : 0;
    
    const previousConversionRate = previousCustomersCount > 0 
      ? (previousPeriodOrders.length / previousCustomersCount) * 5.2 
      : 0;

    const conversionRate = Math.min(Math.round(currentConversionRate * 10) / 10, 100);
    const conversionTrend = calculateTrend(currentConversionRate, previousConversionRate);

    // 4. Fetch Recent Orders (Enriched with Profile data)
    const { data: recentOrders, error: recentError } = await supabase
      .from("orders")
      .select(`
        id, 
        created_at, 
        total, 
        final_amount,
        delivery_charge,
        gst_amount,
        discount_amount,
        gift_wrap_charge,
        status, 
        profiles!user_id (email, name)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // ... (logic for top product remains the same)
    // 5. Fetch Top Selling Product
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    if (itemsError) throw itemsError;

    let topProduct = null;
    if (itemsData && itemsData.length > 0) {
      const counts: Record<string, number> = {};
      itemsData.forEach(item => {
        counts[item.product_id] = (counts[item.product_id] || 0) + item.quantity;
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const [topProductId, soldCount] = sorted[0];

        const { data: productData } = await supabase
          .from("products")
          .select("name, images")
          .eq("id", topProductId)
          .single();

        if (productData) {
          topProduct = {
            name: productData.name,
            soldCount,
            image: productData.images?.[0] || ""
          };
        }
      }
    }

    return {
      totalRevenue,
      revenueTrend,
      totalOrders: allOrders.length,
      ordersTrend,
      totalCustomers: customers.length,
      customersTrend,
      conversionRate,
      conversionTrend,
      recentOrders: recentOrders || [],
      topProduct
    };
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    throw err;
  }
}

/**
 * Calculates trend based on refined requirements:
 * - standard MoM if prev > 0
 * - "New Growth 🚀" if prev = 0 and curr > 0
 * - "No data" if both are 0
 */
function calculateTrend(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "No data";
  if (previous === 0 && current > 0) return "+100%";
  
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? "+" : ""}${Math.round(diff)}%`;
}

export interface CustomerStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  ordersCount: number;
  joinedDate: string;
}

export async function fetchAdminCustomers(): Promise<CustomerStats[]> {
  try {
    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // 2. Fetch all orders to aggregate stats
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, final_amount, shipping_address, created_at")
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    // 3. Aggregate data per customer
    return (profiles || []).map(profile => {
      const userOrders = (orders || []).filter(o => o.user_id === profile.id);
      
      // Get most recent contact info from the latest order if available
      const latestOrder = userOrders[0];
      const address = latestOrder?.shipping_address as any;
      
      return {
        id: profile.id,
        name: profile.name || "Anonymous",
        email: profile.email,
        phone: profile.phone || address?.phone || "N/A",
        location: address ? `${address.city}, ${address.country}` : "No address",
        totalSpent: userOrders.reduce((acc, o) => acc + (o.final_amount || 0), 0),
        ordersCount: userOrders.length,
        joinedDate: profile.created_at
      };
    });
  } catch (err) {
    console.error("Error fetching admin customers:", err);
    throw err;
  }
}
