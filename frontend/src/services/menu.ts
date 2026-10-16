import { apiRequest } from './api';
import type { Category, Product, ProductFormData } from '../types/menu';

export const menuService = {
  // Categories
  async getCategories(activeOnly = false): Promise<Category[]> {
    const query = activeOnly ? '?active_only=1' : '';
    const res = await apiRequest<{ success: boolean; data: Category[] }>(`/categories${query}`);
    return res.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await apiRequest<{ success: boolean; data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const res = await apiRequest<{ success: boolean; data: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Products
  async getProducts(params?: { category_id?: number; search?: string; available_only?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.available_only) query.append('available_only', '1');

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: Product[] }>(`/products${queryString}`);
    return res.data;
  },

  async getProduct(id: number): Promise<Product> {
    const res = await apiRequest<{ success: boolean; data: Product }>(`/products/${id}`);
    return res.data;
  },

  async createProduct(data: ProductFormData): Promise<Product> {
    const res = await apiRequest<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
    const res = await apiRequest<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async toggleProductAvailability(id: number): Promise<boolean> {
    const res = await apiRequest<{ success: boolean; is_available: boolean }>(`/products/${id}/toggle-availability`, {
      method: 'POST',
    });
    return res.is_available;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
