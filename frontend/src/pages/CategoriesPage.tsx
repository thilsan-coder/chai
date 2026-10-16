import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { menuService } from '../services/menu';
import type { Category } from '../types/menu';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  Utensils,
  CupSoda,
  Cake,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

const iconOptions = [
  { name: 'Coffee', icon: Coffee, label: 'Chai / Coffee' },
  { name: 'Utensils', icon: Utensils, label: 'Fast Food / Burgers' },
  { name: 'Layers', icon: Layers, label: 'Submarines / Subs' },
  { name: 'CupSoda', icon: CupSoda, label: 'Mojitos / Drinks' },
  { name: 'Cake', icon: Cake, label: 'Desserts / Brownies' },
  { name: 'Sparkles', icon: Sparkles, label: 'Specials' },
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Coffee',
    sort_order: 1,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await menuService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    menuService.getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Failed to load categories');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);


  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Coffee',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'Coffee',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, formData);
      } else {
        await menuService.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await menuService.deleteCategory(id);
      setDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const getIconComponent = (iconName?: string | null) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 text-amber-400" />;
      case 'Cake':
        return <Cake className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Coffee':
      default:
        return <Coffee className="w-5 h-5 text-amber-400" />;
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.products_count || 0), 0);
  const activeCount = categories.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Module: MOD-05
            </span>
            <span className="text-xs text-zinc-400">Database Synchronized</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mt-1">
            Menu Category Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Configure chai, food, and beverage categories displayed on POS terminals and kitchen order tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchCategories}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Add New Category
          </Button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-zinc-400 uppercase font-semibold">Total Categories</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-400 uppercase font-semibold">Active for Ordering</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount} / {categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-400 uppercase font-semibold">Linked Menu Items</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalProducts} Items</p>
        </Card>
      </div>

      {/* Main Categories Grid */}
      <Card>
        <CardHeader
          title="All Categories"
          subtitle="Display order dictates the arrangement of touch categories on POS register"
        />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading categories from MySQL...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            <FolderOpen className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p>No categories found. Click 'Add New Category' above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        {getIconComponent(cat.icon)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-100 truncate">{cat.name}</h4>
                        <span className="text-[11px] font-mono text-zinc-500">/{cat.slug}</span>
                      </div>
                    </div>
                    <Badge variant={cat.is_active ? 'success' : 'default'} size="sm">
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="font-semibold text-zinc-200">
                      {cat.products_count || 0}
                    </span>
                    <span>items</span>
                    <span className="text-zinc-600">•</span>
                    <span>Sort #{cat.sort_order}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-850 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(cat.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-850 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Menu Category'}
        subtitle="Categories group items for cashier POS buttons and customer receipts"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chai & Hot Brews, Burgers & Subs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Brief description for staff and customers..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category Icon</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {iconOptions.map((opt) => {
                const IconCmp = opt.icon;
                const isSelected = formData.icon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: opt.name })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <IconCmp className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Sort Position</label>
              <Input
                type="number"
                min={1}
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">POS Availability</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`w-full h-[42px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center transition-colors ${
                  formData.is_active
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                {formData.is_active ? 'Active on POS' : 'Hidden from POS'}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <Modal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="Confirm Category Deletion"
          subtitle="Are you sure you want to remove this category?"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Deleting this category will also remove all menu products associated with it. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteId)}>
                Yes, Delete Category
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
