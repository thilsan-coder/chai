import { apiRequest } from './api';
import type {
  InventoryCategory,
  InventoryItem,
  InventorySummary,
  ProductRecipe,
  StockMovement,
  Supplier,
} from '../types/inventory';

export const inventoryService = {
  /**
   * Fetch inventory items with stock summary and filters
   */
  async getInventory(params?: {
    category?: InventoryCategory;
    low_stock_only?: boolean;
    search?: string;
  }): Promise<{ items: InventoryItem[]; summary: InventorySummary }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.low_stock_only) query.append('low_stock_only', '1');
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: InventoryItem[];
      summary: InventorySummary;
    }>(`/inventory${qs}`);

    return {
      items: res.data,
      summary: res.summary,
    };
  },

  /**
   * Create a new raw material item
   */
  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiRequest<{ success: boolean; message: string; data: InventoryItem }>(
      '/inventory',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Update an existing raw material item
   */
  async updateItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiRequest<{ success: boolean; message: string; data: InventoryItem }>(
      `/inventory/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Record Stock In (Incoming Purchase)
   */
  async stockIn(
    id: number,
    data: { quantity: number; cost_price?: number; reference?: string; notes?: string }
  ): Promise<{ item: InventoryItem; movement: StockMovement }> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: { item: InventoryItem; movement: StockMovement };
    }>(`/inventory/${id}/stock-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Record Kitchen Spoilage / Stock Waste / Adjustment
   */
  async stockAdjust(
    id: number,
    data: { movement_type: 'waste_spoilage' | 'adjustment'; quantity: number; notes: string }
  ): Promise<{ item: InventoryItem; movement: StockMovement }> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: { item: InventoryItem; movement: StockMovement };
    }>(`/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Get items currently below min threshold
   */
  async getLowStockAlerts(): Promise<{ count: number; data: InventoryItem[] }> {
    const res = await apiRequest<{ success: boolean; count: number; data: InventoryItem[] }>(
      '/inventory/alerts/low-stock'
    );
    return {
      count: res.count,
      data: res.data,
    };
  },

  /**
   * Get recipe bill of materials for a product
   */
  async getProductRecipes(productId: number): Promise<ProductRecipe[]> {
    const res = await apiRequest<{ success: boolean; data: ProductRecipe[] }>(
      `/inventory/recipes/${productId}`
    );
    return res.data;
  },

  // Supplier Endpoints
  async getSuppliers(search?: string): Promise<Supplier[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest<{ success: boolean; data: Supplier[] }>(`/suppliers${query}`);
    return res.data;
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await apiRequest<{ success: boolean; message: string; data: Supplier }>(
      '/suppliers',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
    const res = await apiRequest<{ success: boolean; message: string; data: Supplier }>(
      `/suppliers/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};
