import { apiClient } from './client';

// ============ CUSTOM DESIGNS ============
export interface CreateDesignData {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  templateId?: string;
  phoneModel: string;
  designData: any;
  previewImageBase64?: string;
}

export interface SubmitDesignData {
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}

// Lấy danh sách phone templates
export const getPhoneTemplates = async () => {
  const response = await apiClient.get('/designs/templates');
  return response.data;
};

// Tạo thiết kế mới
export const createDesign = async (data: CreateDesignData) => {
  const response = await apiClient.post('/designs', data);
  return response.data;
};

// Lấy thiết kế theo ID
export const getDesignById = async (designId: string) => {
  const response = await apiClient.get(`/designs/${designId}`);
  return response.data;
};

// Cập nhật thiết kế
export const updateDesign = async (designId: string, data: any) => {
  const response = await apiClient.put(`/designs/${designId}`, data);
  return response.data;
};

// Gửi thiết kế cho admin
export const submitDesign = async (designId: string, data: SubmitDesignData) => {
  const response = await apiClient.post(`/designs/${designId}/submit`, data);
  return response.data;
};

// Lấy thiết kế của user
export const getUserDesigns = async (userId: string) => {
  const response = await apiClient.get(`/designs/user/${userId}`);
  return response.data;
};

// Admin: Lấy tất cả thiết kế
export const getAllDesigns = async (status?: string) => {
  const url = status ? `/designs/admin/all?status=${status}` : '/designs/admin/all';
  const response = await apiClient.get(url);
  return response.data;
};

// Admin: Duyệt thiết kế
export const approveDesign = async (designId: string, adminNotes?: string) => {
  const response = await apiClient.put(`/designs/admin/${designId}/approve`, { adminNotes });
  return response.data;
};

// Admin: Từ chối thiết kế
export const rejectDesign = async (designId: string, adminNotes: string) => {
  const response = await apiClient.put(`/designs/admin/${designId}/reject`, { adminNotes });
  return response.data;
};

// Xóa thiết kế
export const deleteDesign = async (designId: string) => {
  const response = await apiClient.delete(`/designs/${designId}`);
  return response.data;
};
