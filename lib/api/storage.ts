import { supabase } from "@/lib/supabaseClient";

/**
 * Handle file uploads to Supabase Storage
 */
export async function uploadFile(file: File, bucket: string, customPath?: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = customPath 
      ? `${customPath}.${fileExt}`
      : `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error("Supabase Storage Error:", error.message);
      throw error;
    }

    // Get the public URL for the newly uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Error in uploadFile helper:", err);
    throw err;
  }
}

/**
 * Cleanup helper for aborted uploads
 */
export async function deleteFileFromStorage(bucket: string, url: string) {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error("Supabase delete storage error:", error);
    }
  } catch (err) {
    console.error("Error in deleteFileFromStorage:", err);
  }
}
