import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryService } from '../services/inventory';
import type { Supplier } from '../types/inventory';

export const PurchasesPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State for Add / Edit Supplier
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    supplied_categories: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSuppliers = useCallback(async () => {
    try {
      const list = await inventoryService.getSuppliers();
      setSuppliers(list);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const list = await inventoryService.getSuppliers();
        if (isMounted) {
          setSuppliers(list);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
        (s.supplied_categories && s.supplied_categories.toLowerCase().includes(q))
      );
    });
  }, [suppliers, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      supplied_categories: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      supplied_categories: supplier.supplied_categories || '',
      notes: supplier.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingSupplier) {
        await inventoryService.updateSupplier(editingSupplier.id, formData);
        showToast(`Supplier ${formData.name} updated.`);
      } else {
        await inventoryService.createSupplier(formData);
        showToast(`Supplier ${formData.name} added successfully.`);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      alert('Could not save supplier. Please check if phone number is already registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove supplier "${name}"?`)) {
      try {
        await inventoryService.deleteSupplier(id);
        showToast(`Supplier ${name} removed.`);
        fetchSuppliers();
      } catch (err) {
        console.error('Delete supplier failed:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-oonjal-cream">Suppliers &amp; Purchasing</h1>
            <p className="text-xs text-zinc-400">
              Raw Material Vendors, Contacts &amp; Daily Delivery Partners
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="rounded-xl bg-oonjal-gold px-4 py-2 text-xs font-bold text-oonjal-black hover:bg-oonjal-gold-hover shadow-lg transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          + Add New Supplier
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, contact, category..."
            className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface pl-10 pr-4 py-2 text-xs text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
          />
        </div>

        <span className="text-xs text-zinc-400">
          Total {suppliers.length} active vendors
        </span>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400">Loading vendors...</span>
          </div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card text-center p-6">
          <p className="text-sm font-semibold text-zinc-300">No suppliers found</p>
          <p className="text-xs text-zinc-500 mt-1">Try another search keyword or add a new supplier</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex flex-col justify-between rounded-2xl border border-oonjal-border bg-oonjal-card p-4 transition-all hover:border-oonjal-gold/50 shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-oonjal-border/60 pb-3">
                  <div>
                    <h3 className="font-bold text-oonjal-cream text-base">{supplier.name}</h3>
                    {supplier.contact_person && (
                      <span className="text-xs text-oonjal-gold font-medium block">
                        Contact: {supplier.contact_person}
                      </span>
                    )}
                  </div>
                  <span className="rounded-lg bg-oonjal-surface px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-oonjal-border">
                    {supplier.inventory_items_count ?? 0} Items
                  </span>
                </div>

                {/* Details */}
                <div className="my-3 space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 shrink-0">Phone:</span>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="font-mono font-bold text-oonjal-gold hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  </div>

                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 shrink-0">Email:</span>
                      <span className="truncate text-zinc-300">{supplier.email}</span>
                    </div>
                  )}

                  {supplier.supplied_categories && (
                    <div className="pt-1">
                      <span className="text-[10px] text-zinc-500 block uppercase">Categories:</span>
                      <span className="text-xs font-medium text-emerald-400">
                        {supplier.supplied_categories}
                      </span>
                    </div>
                  )}

                  {supplier.notes && (
                    <div className="mt-1 rounded bg-oonjal-surface p-2 text-[11px] text-zinc-400 italic">
                      {supplier.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-oonjal-border/60 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(supplier)}
                  className="rounded-lg border border-oonjal-border bg-oonjal-surface px-3 py-1 text-xs text-zinc-300 hover:text-white hover:border-oonjal-gold transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(supplier.id, supplier.name)}
                  className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1 text-xs text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-oonjal-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-oonjal-cream">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Record vendor profile for purchasing and stock-in
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Supplier / Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kotmale Dairy Lanka"
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Sunil Perera"
                    className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 077 234 5678"
                    className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Supplied Categories
                </label>
                <input
                  type="text"
                  value={formData.supplied_categories}
                  onChange={(e) => setFormData({ ...formData, supplied_categories: e.target.value })}
                  placeholder="e.g. Fresh Milk, Tea Dust, Burger Buns..."
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Delivery Notes / Schedule (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Daily delivery at 2:30 PM before shift opening"
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-oonjal-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-oonjal-border px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-oonjal-gold px-5 py-2 text-xs font-bold text-oonjal-black hover:bg-oonjal-gold-hover shadow-lg transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
