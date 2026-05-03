import { apiClient } from './client';

// ============ COLLECTIONS ============
export const fetchAllCollections = async () => {
  const response = await apiClient.get('/collections');
  return response.data;
};

export const fetchCollectionsByType = async (type: string) => {
  const response = await apiClient.get(`/collections/type/${type}`);
  return response.data;
};

export const fetchCollectionBySlug = async (slug: string) => {
  const response = await apiClient.get(`/collections/slug/${slug}`);
  return response.data;
};

export const fetchCollectionProductCounts = async () => {
  const response = await apiClient.get('/collections/counts');
  return response.data;
};

export const fetchProductsByCollection = async (slug: string) => {
  const response = await apiClient.get(`/collections/slug/${slug}/products`);
  return response.data;
};

export const fetchProductCollections = async (productId: number) => {
  const response = await apiClient.get(`/collections/product/${productId}`);
  return response.data;
};

export const addProductToCollection = async (productId: number, collectionId: number) => {
  const response = await apiClient.post('/collections/product', { productId, collectionId });
  return response.data;
};

export const updateProductCollections = async (productId: number, collectionIds: number[]) => {
  const response = await apiClient.put(`/collections/product/${productId}`, { collectionIds });
  return response.data;
};

export const removeProductFromCollection = async (productId: number, collectionId: number) => {
  const response = await apiClient.delete('/collections/product', { 
    data: { productId, collectionId } 
  });
  return response.data;
};

export const createCollection = async (collectionData: {
  collection_name: string;
  collection_slug: string;
  collection_description?: string;
  collection_image?: string;
  collection_gradient?: string;
  collection_icon?: string;
  collection_type?: string;
  display_order?: number;
}) => {
  const response = await apiClient.post('/collections', collectionData);
  return response.data;
};

export const updateCollection = async (id: number, collectionData: any) => {
  const response = await apiClient.put(`/collections/${id}`, collectionData);
  return response.data;
};

export const deleteCollection = async (id: number) => {
  const response = await apiClient.delete(`/collections/${id}`);
  return response.data;
};
