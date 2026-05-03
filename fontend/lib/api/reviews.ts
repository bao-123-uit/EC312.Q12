import { apiClient } from './client';

// ============ REVIEWS ============
export const fetchAllReviews = async (limit = 50) => {
  const response = await apiClient.get(`/reviews?limit=${limit}`);
  return response.data;
};

export const fetchProductReviews = async (productId: number) => {
  const response = await apiClient.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (reviewData: {
  product_id: number;
  customer_id?: number;
  customer_name: string;
  customer_email?: string;
  rating: number;
  review_title?: string;
  review_text: string;
}) => {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
};

export const approveReview = async (reviewId: number, isApproved: boolean) => {
  const response = await apiClient.put(`/reviews/${reviewId}/approve`, { is_approved: isApproved });
  return response.data;
};

export const deleteReview = async (reviewId: number) => {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response.data;
};
