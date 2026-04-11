import { supabase } from "@/lib/supabaseClient";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  recentOrders: any[];
  topProduct: {
    name: string;
    soldCount: number;
    image: string;
  } | null;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  try {
    // 1. Fetch Revenue & Orders Count
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("final_amount, status");

    if (ordersError) throw ordersError;

    const totalRevenue = ordersData?.reduce((acc, order) => acc + (order.final_amount || 0), 0) || 0;
    const totalOrders = ordersData?.length || 0;

    // 2. Fetch Customers Count
    const { count: customersCount, error: customersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (customersError) throw customersError;

    // 3. Fetch Recent Orders
    const { data: recentOrders, error: recentError } = await supabase
      .from("orders")
      .select("id, created_at, total, status, profiles(email)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // 4. Fetch Top Selling Product (simplified logic: just take the one with most units in order_items)
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

      const topProductId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const soldCount = counts[topProductId];

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

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customersCount || 0,
      recentOrders: recentOrders || [],
      topProduct
    };
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    throw err;
  }
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
