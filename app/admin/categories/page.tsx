"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Pencil, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Grid2X2,
  MoreVertical,
  Check,
  AlertCircle
} from "lucide-react";
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  createSubcategory, 
  updateSubcategory, 
  deleteSubcategory 
} from "@/lib/api/categories";
import { Category, Subcategory } from "@/types";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Form states
  const [catForm, setCatForm] = useState({ name: "", description: "", id: "" });
  const [subForm, setSubForm] = useState({ name: "", description: "", categoryId: "", id: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      addToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddCat = () => {
    setCatForm({ name: "", description: "", id: "" });
    setEditingId(null);
    setIsCatModalOpen(true);
  };

  const openEditCat = (cat: Category) => {
    setCatForm({ name: cat.name, description: cat.description || "", id: cat.id });
    setEditingId(cat.id);
    setIsCatModalOpen(true);
  };

  const openAddSub = (catId: string) => {
    setSubForm({ name: "", description: "", categoryId: catId, id: "" });
    setEditingId(null);
    setIsSubModalOpen(true);
  };

  const openEditSub = (sub: Subcategory) => {
    setSubForm({ name: sub.name, description: sub.description || "", categoryId: sub.categoryId, id: sub.id });
    setEditingId(sub.id);
    setIsSubModalOpen(true);
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { name: catForm.name, description: catForm.description });
        addToast("Category updated", "success");
      } else {
        await createCategory({ name: catForm.name, description: catForm.description, slug: "" });
        addToast("Category created", "success");
      }
      setIsCatModalOpen(false);
      loadCategories();
    } catch (err) {
      addToast("Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateSubcategory(editingId, { name: subForm.name, description: subForm.description });
        addToast("Subcategory updated", "success");
      } else {
        await createSubcategory({ 
          name: subForm.name, 
          description: subForm.description, 
          categoryId: subForm.categoryId,
          slug: ""
        });
        addToast("Subcategory added", "success");
      }
      setIsSubModalOpen(false);
      loadCategories();
    } catch (err) {
      addToast("Failed to save subcategory", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category? This will not delete products but may affect filtering.")) return;
    try {
      await deleteCategory(id);
      addToast("Category deleted", "success");
      loadCategories();
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await deleteSubcategory(id);
      addToast("Subcategory deleted", "success");
      loadCategories();
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Categories</h1>
          <p className="text-sm text-foreground/50 mt-1">Manage your shop hierarchy and subcategories.</p>
        </div>
        <button 
          onClick={openAddCat}
          className="bg-foreground text-white px-4 py-2 rounded-md font-medium hover:bg-rose transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader size="lg" /></div>
        ) : categories.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <Layers className="w-12 h-12 text-secondary mx-auto" />
            <p className="text-foreground/50">No categories found.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white">
                {/* Category Row */}
                <div className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 hover:bg-secondary rounded transition-colors text-foreground/40"
                    >
                      {expandedCats[cat.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="p-2 bg-rose/5 rounded-lg text-rose">
                      <Grid2X2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cat.name}</h3>
                      <p className="text-xs text-foreground/40 truncate max-w-[300px]">{cat.description || "No description"}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 bg-secondary/30 px-2 py-0.5 rounded ml-2">
                      {cat.subcategories?.length || 0} Subcategories
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openAddSub(cat.id)}
                      className="text-xs font-semibold text-rose hover:bg-rose/5 px-2 py-1 rounded transition-colors"
                    >
                      + Add Sub
                    </button>
                    <button 
                      onClick={() => openEditCat(cat)}
                      className="p-2 hover:bg-secondary rounded text-foreground/40 hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCat(cat.id)}
                      className="p-2 hover:bg-rose/5 rounded text-foreground/40 hover:text-rose"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Expanded) */}
                <AnimatePresence>
                  {expandedCats[cat.id] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-secondary/5 border-t border-secondary/50"
                    >
                      <div className="pl-14 pr-4 py-2 space-y-1">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          cat.subcategories.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between py-2 group/sub border-b border-secondary/30 last:border-0">
                              <div>
                                <h4 className="text-sm font-medium text-foreground/80">{sub.name}</h4>
                                <p className="text-[10px] text-foreground/40">{sub.description || "No description"}</p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openEditSub(sub)}
                                  className="p-1.5 hover:bg-secondary rounded text-foreground/40 hover:text-foreground"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSub(sub.id)}
                                  className="p-1.5 hover:bg-rose/5 rounded text-foreground/40 hover:text-rose"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-xs text-foreground/40 italic flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            No subcategories added yet.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md border border-secondary"
          >
            <div className="p-4 border-b border-secondary flex justify-between items-center">
              <h2 className="font-serif font-semibold text-xl">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 hover:bg-secondary rounded-full text-foreground/60"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Category Name</label>
                <input required type="text" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
                <textarea rows={3} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-secondary rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-foreground text-white px-6 py-2 rounded-md font-medium hover:bg-rose transition-all flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader size="sm" /> : editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md border border-secondary"
          >
            <div className="p-4 border-b border-secondary flex justify-between items-center">
              <h2 className="font-serif font-semibold text-xl">
                {editingId ? "Edit Subcategory" : "Add New Subcategory"}
              </h2>
              <button onClick={() => setIsSubModalOpen(false)} className="p-1 hover:bg-secondary rounded-full text-foreground/60"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubSubmit} className="p-6 space-y-4">
              <div className="bg-secondary/20 p-3 rounded text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">
                Parent Category: {categories.find(c => c.id === subForm.categoryId)?.name}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Subcategory Name</label>
                <input required type="text" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
                <textarea rows={3} value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSubModalOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-secondary rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-foreground text-white px-6 py-2 rounded-md font-medium hover:bg-rose transition-all flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader size="sm" /> : editingId ? "Save Changes" : "Add Subcategory"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
