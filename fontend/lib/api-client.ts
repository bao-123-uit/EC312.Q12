/**
 * @deprecated Import từ '@/lib/api' thay vì file này
 * File này được giữ lại để tương thích ngược
 */

// Re-export tất cả từ thư mục api/
export * from './api';
export { apiClient, getAuthHeaders, client as default } from './api';
