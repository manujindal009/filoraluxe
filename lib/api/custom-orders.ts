import { supabase } from "@/lib/supabaseClient";

export interface CustomOrderRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  budget: string;
  timeline: string;
  image_url: string | null;
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'rejected';
  created_at: string;
}

export async function submitCustomOrderRequest(data: Omit<CustomOrderRequest, 'id' | 'status' | 'created_at'>) {
  const { data: result, error } = await supabase
    .from('custom_orders')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error submitting custom order:", error);
    throw error;
  }
  return result;
}

export async function fetchAllCustomOrders(): Promise<CustomOrderRequest[]> {
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching custom orders:", error);
    throw error;
  }
  return data || [];
}

export async function updateCustomOrderStatus(id: string, status: CustomOrderRequest['status']) {
  const { data, error } = await supabase
    .from('custom_orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating custom order status:", error);
    throw error;
  }
  return data;
}

export async function deleteCustomOrderRequest(id: string) {
  const { error } = await supabase
    .from('custom_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting custom order:", error);
    throw error;
  }
}
