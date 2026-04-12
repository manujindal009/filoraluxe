import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    // 0. Preliminary Check for Environment Variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local. Please add it to enable diagnostics." 
      }, { status: 500 });
    }

    // 1. Authenticate the requestor as Admin using the Bearer token
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { data: { user: currentUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Fetch all orders
    const { data: allOrders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, total, final_amount, status, created_at");

    if (ordersError) throw ordersError;

    // 3. Identify orphaned orders (those with user_id that doesn't exist in profiles)
    const { data: allProfiles } = await supabaseAdmin.from("profiles").select("id");
    const profileIds = new Set(allProfiles?.map(p => p.id) || []);

    const orphanedOrders = allOrders.filter(order => 
      !order.user_id || !profileIds.has(order.user_id)
    );

    // 4. Fetch the specific orders for the current user
    const userOrders = allOrders.filter(order => order.user_id === currentUser.id);

    return NextResponse.json({
      currentUser: {
        uid: currentUser.id,
        email: currentUser.email,
        role: profile?.role
      },
      totalOrders: allOrders.length,
      orphanedOrders,
      userOrders,
      profileStatus: {
        exists: profileIds.has(currentUser.id),
        data: profile
      }
    });

  } catch (err: any) {
    console.error("[Diagnostics API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
