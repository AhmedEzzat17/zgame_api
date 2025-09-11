// src/services/ApiFunctions.js
import axios from "axios";

export const BASE_URL = "https://appgames.fikriti.com/api/v1/";

// إنشاء instance من axios مع إعدادات افتراضية
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 ثواني timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false, // تعطيل credentials بشكل افتراضي
});

// Interceptor للـ request لإضافة التوكن تلقائياً
apiClient.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للـ response لمعالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // معالجة خطأ 401 (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default class ApiFunctions {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.fullUrl = BASE_URL + endpoint;
    this.apiClient = apiClient;
  }

  getToken() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token || null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }

  // headers builder (محسّن)
  getHeaders({
    withAuth = true,
    useCredentials = false,
    isFormData = false,
  } = {}) {
    const headers = {
      Accept: "application/json",
    };

    // لا نضيف Content-Type لو البيانات FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (withAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return {
      headers,
      withCredentials: useCredentials,
      timeout: 10000,
    };
  }

  // GET
  get = async ({ withAuth = true, useCredentials = false } = {}) => {
    try {
      return await apiClient.get(this.endpoint, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET ${this.endpoint} failed:`, error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      console.log('Headers:', error.response?.headers);
      console.log('Full response:', error.response);
      throw error;
    }
  };

  // GET by ID
  getById = async (id, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await apiClient.get(`${this.endpoint}/${id}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // GET for edit
  edit = async (id, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await apiClient.get(`${this.endpoint}/${id}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`EDIT ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // POST (محسّن)
  post = async (data, { withAuth = true, useCredentials = false } = {}) => {
    try {
      const isFormData = data instanceof FormData;
      
      const config = {
        withCredentials: useCredentials,
        timeout: 15000, // زيادة timeout
      };

      // للـ FormData
      if (isFormData) {
        config.headers = {
          Accept: "application/json",
        };
        
        if (withAuth) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }
      // للـ JSON
      else {
        config.headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        
        if (withAuth) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }

      console.log('POST Config:', config);
      console.log('POST Data type:', isFormData ? 'FormData' : 'JSON');
      
      const response = await apiClient.post(this.endpoint, data, config);
      return response;
    } catch (error) {
      console.error(`POST ${this.endpoint} failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  };

  // PATCH (محسّن)
  patch = async (
    id,
    data,
    { withAuth = true, useCredentials = false } = {}
  ) => {
    try {
      const isFormData = data instanceof FormData;
      
      const config = {
        withCredentials: useCredentials,
      };

      if (isFormData) {
        config.headers = {
          Accept: "application/json",
        };
        
        if (withAuth) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }

      return await apiClient.patch(`${this.endpoint}/${id}`, data, config);
    } catch (error) {
      console.error(`PATCH ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // PATCH POST (للخوادم التي تتطلب POST مع _method=PATCH)
  patchPOST = async (
    id,
    data,
    { withAuth = true, useCredentials = false } = {}
  ) => {
    try {
      const isFormData = data instanceof FormData;

      if (isFormData) {
        // إضافة _method=PATCH للـ FormData
        data.append('_method', 'PATCH');
        
        const config = {
          withCredentials: useCredentials,
          headers: {
            Accept: "application/json",
          }
        };
        
        if (withAuth) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return await apiClient.post(`${this.endpoint}/${id}`, data, config);
      }

      return await this.patch(id, data, { withAuth, useCredentials });
    } catch (error) {
      console.error(`PATCH POST ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // DELETE
  delete = async (id, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await apiClient.delete(`${this.endpoint}/${id}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`DELETE ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // GET with pagination and optional search
  getWithPagination = async (
    pageNumber,
    searchTerm = "",
    { withAuth = true, useCredentials = false } = {}
  ) => {
    try {
      let url = `${this.endpoint}?page=${pageNumber}`;
      if (searchTerm.trim() !== "") {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      return await apiClient.get(url, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET Pagination ${url} failed:`, error.response?.data || error.message);
      throw error;
    }
  };
}