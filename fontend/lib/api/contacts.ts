import { apiClient } from './client';

// ============ CONTACT MESSAGES ============
export const fetchAllContacts = async (limit = 50) => {
  const response = await apiClient.get(`/contacts?limit=${limit}`);
  return response.data;
};

export const createContactMessage = async (messageData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  const response = await apiClient.post('/contacts', messageData);
  return response.data;
};

export const updateContactStatus = async (id: number, status: string) => {
  const response = await apiClient.put(`/contacts/${id}/status`, { status });
  return response.data;
};

export const deleteContact = async (id: number) => {
  const response = await apiClient.delete(`/contacts/${id}`);
  return response.data;
};
