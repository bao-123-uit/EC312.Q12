import { apiClient /*, getAuthHeaders */ } from './client';

// ============ AUTHENTICATION ============

export const registerCustomer = async (customerData: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
}) => {
  try {
    // Ghép first_name + last_name thành full_name nếu cần
    const fullName = customerData.full_name || 
      `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
    
    const response = await apiClient.post('/auth/register', {
      email: customerData.email.trim().toLowerCase(),
      password: customerData.password,
      full_name: fullName,
      phone: customerData.phone?.trim() || undefined,
    });
    return response.data;
  } catch (error: any) {
    // Trả về error message từ backend
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại',
    };
  }
};

export const loginCustomer = async (email: string, password: string) => {
  try {
    // Old login config (khong gui cookie):
    // const response = await apiClient.post('/auth/login', {
    //   email: email.trim().toLowerCase(),
    //   password,
    // });

    const response = await apiClient.post('/auth/login', { 
      email: email.trim().toLowerCase(), 
      password 
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    // Trả về error message từ backend
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};

export const validateToken = async (token: string) => {
  try {
    const response = await apiClient.post('/auth/validate', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      valid: false,
      message: error.response?.data?.message || 'Token không hợp lệ',
    };
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const response = await apiClient.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
    };
  }
};

export const changeEmail = async (newEmail: string) => {
  try {
    // Old Bearer-token flow (giu lai de tham khao, hien tai dung cookie session):
    // const headers = getAuthHeaders();
    // if (!headers) {
    //   return {
    //     success: false,
    //     message: 'Vui lòng đăng nhập để đổi email',
    //   };
    // }

    const response = await apiClient.put(
      '/auth/change-email',
      { newEmail },
      // Old config: { headers }
      { withCredentials: true },
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đổi email thất bại',
    };
  }
};
