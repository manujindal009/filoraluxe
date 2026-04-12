
import { supabase } from "../lib/supabaseClient";

async function analyzeDataDistribution() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  console.log("Analysis Window:");
  console.log("Current Period:", thirtyDaysAgo.toISOString(), "to", now.toISOString());
  console.log("Previous Period:", sixtyDaysAgo.toISOString(), "to", thirtyDaysAgo.toISOString());

  const { data: orders } = await supabase.from("orders").select("created_at, final_amount");
  const { data: profiles } = await supabase.from("profiles").select("created_at").eq("role", "user");

  const orderCounts = { current: 0, previous: 0 };
  const revenue = { current: 0, previous: 0 };
  const customerCounts = { current: 0, previous: 0 };

  orders?.forEach(o => {
    const d = new Date(o.created_at);
    if (d >= thirtyDaysAgo) {
      orderCounts.current++;
      revenue.current += (o.final_amount || 0);
    } else if (d >= sixtyDaysAgo && d < thirtyDaysAgo) {
      orderCounts.previous++;
      revenue.previous += (o.final_amount || 0);
    }
  });

  profiles?.forEach(p => {
    const d = new Date(p.created_at);
    if (d >= thirtyDaysAgo) customerCounts.current++;
    else if (d >= sixtyDaysAgo && d < thirtyDaysAgo) customerCounts.previous++;
  });

  console.log("\nResults:");
  console.log("Orders:", orderCounts);
  console.log("Revenue:", revenue);
  console.log("Customers:", customerCounts);
}

analyzeDataDistribution();
