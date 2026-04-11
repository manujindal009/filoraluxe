"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Pencil, ImageOff, Check } from "lucide-react";
import { fetchProducts, createProduct, deleteProduct, updateProduct } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { uploadFile } from "@/lib/api/storage";
import { Category, Subcategory, Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/context/ToastContext";

const EMPTY_FORM = {
  name: "", price: "", description: "", 
  categoryId: "", subcategoryId: "",
  imageUrl: "", stock: true, featured: false,
  imageFile: null as File | null,
};

type FormState = typeof EMPTY_FORM;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { 
    loadProducts(); 
    loadCategories();
  }, []); // eslint-disable-line

  const loadCategories = async () => {
    try {
      setCategories(await fetchCategories());
    } catch (e) {
      console.error("Failed to load categories");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setProducts(await fetchProducts());
    } catch (e) {
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      categoryId: product.categoryId || "",
      subcategoryId: product.subcategoryId || "",
      imageUrl: product.images?.[0] ?? "",
      stock: product.inStock,
      featured: product.featured ?? false,
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let finalImageUrl = form.imageUrl.trim();

    // 1. Handle File Upload if present
    if (form.imageFile) {
      try {
        setIsUploading(true);
        // Clean naming: slugify name + timestamp
        const cleanName = form.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        const customPath = `products/main/${cleanName}-${Date.now()}`;
        finalImageUrl = await uploadFile(form.imageFile, "products", customPath);
        addToast("Image uploaded successfully!", "success");
      } catch (err) {
        addToast("Image upload failed. Falling back to URL.", "error");
      } finally {
        setIsUploading(false);
      }
    }

    const images = finalImageUrl ? [finalImageUrl] : [];
    const payload: Omit<Product, "id"> = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description || "Handcrafted with love.",
      categoryId: form.categoryId || undefined,
      subcategoryId: form.subcategoryId || undefined,
      images,
      inStock: form.stock,
      featured: form.featured,
      category: "", // Placeholder for required type
      subcategory: undefined,
      tags: [],
    };

    try {
      if (editingId) {
        // UPDATE path
        const updated = await updateProduct(editingId, payload);
        setProducts(products.map(p => p.id === editingId ? updated : p));
        addToast(`"${payload.name}" updated!`, "success");
      } else {
        // CREATE path
        const saved = await createProduct(payload);
        setProducts([saved, ...products]);
        addToast(`"${saved.name}" added to shop!`, "success");
      }
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addToast(`Failed: ${msg}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      addToast("Product deleted", "success");
    } catch {
      addToast("Failed to delete product", "error");
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-serif font-semibold">Products</h1>
          <button onClick={openAddModal}
            className="bg-foreground text-white px-4 py-2 rounded-md font-medium hover:bg-rose transition-colors flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
          <div className="p-4 border-b border-secondary flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input type="text" placeholder="Search products..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose" />
            </div>
            <span className="text-sm text-foreground/50 hidden sm:block">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
              <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <Loader size="md" className="mx-auto" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-foreground/50">
                    {searchQuery ? "No products match your search." : 'No products yet. Click "Add Product" to get started.'}
                  </td></tr>
                ) : filtered.map(product => (
                  <tr key={product.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded border border-secondary overflow-hidden bg-secondary/30 flex-shrink-0 flex items-center justify-center">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            : <ImageOff className="w-4 h-4 text-foreground/30" />
                          }
                        </div>
                        <span className="font-medium max-w-[180px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wider text-xs">{product.category}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      {product.featured
                        ? <Check className="w-4 h-4 text-sage" />
                        : <span className="text-foreground/30">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                        product.inStock ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"
                      }`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(product)}
                          className="p-2 hover:text-foreground hover:bg-secondary/50 rounded transition-colors text-foreground/40">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-2 hover:text-rose hover:bg-rose/10 rounded transition-colors text-foreground/40">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md border border-secondary flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-secondary flex justify-between items-center">
              <h2 className="font-serif font-semibold text-xl">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-secondary/50 rounded-full text-foreground/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">
                  Product Name <span className="text-rose">*</span>
                </label>
                <input required type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  placeholder="e.g. Sage Green Beanie" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none resize-none"
                  placeholder="Short description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Price (₹) <span className="text-rose">*</span>
                  </label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                    placeholder="45.00" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Category <span className="text-rose">*</span>
                    </label>
                    <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })}
                      className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none">
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {form.categoryId && (
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">
                        Subcategory
                      </label>
                      <select value={form.subcategoryId} onChange={e => setForm({ ...form, subcategoryId: e.target.value })}
                        className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none">
                        <option value="">None</option>
                        {categories.find(c => c.id === form.categoryId)?.subcategories?.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Upload Product Image</label>
                  <div className="relative border-2 border-dashed border-secondary rounded-lg p-6 hover:border-rose/50 hover:bg-rose/5 transition-all group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setForm({ ...form, imageFile: file, imageUrl: URL.createObjectURL(file) });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-rose/10 transition-colors">
                        <Plus className="w-5 h-5 text-foreground/40 group-hover:text-rose" />
                      </div>
                      <p className="text-xs font-medium text-foreground/60">
                        {form.imageFile ? form.imageFile.name : "Click or drag to upload"}
                      </p>
                      <p className="text-[10px] text-foreground/40">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-secondary"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-foreground/30 bg-white px-2">OR</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Image URL (External)</label>
                  <input type="url" value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value, imageFile: null })}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none text-sm"
                    placeholder="https://images.unsplash.com/..." />
                </div>
              </div>

              {form.imageUrl && (
                <div className="relative rounded-md overflow-hidden border border-secondary aspect-video bg-secondary/20">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "", imageFile: null })}
                    className="absolute top-2 right-2 p-1.5 bg-foreground/80 text-white rounded-full hover:bg-rose transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.stock} onChange={e => setForm({ ...form, stock: e.target.checked })}
                    className="w-4 h-4 accent-rose rounded" />
                  <span className="text-sm font-medium text-foreground/80">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-rose rounded" />
                  <span className="text-sm font-medium text-foreground/80">Featured</span>
                </label>
              </div>

              <div className="pt-4 border-t border-secondary flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-secondary/50 rounded-md transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || isUploading}
                  className="bg-foreground text-white px-6 py-2 rounded-md font-medium hover:bg-rose transition-colors flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-70">
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" />
                      <span>Uploading...</span>
                    </div>
                  ) : isSubmitting ? (
                    <Loader size="sm" />
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
