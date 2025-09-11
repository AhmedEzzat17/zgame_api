// src/services/questionsService.js
import ApiFunctions from './ApiFunctions';

class questionsService extends ApiFunctions {
  constructor() {
    super('dashboard/questions');
  }

  // دالة لتحديث حالة السؤال (تفعيل/تعطيل)
  updateStatus = async (id, statusData) => {
    try {
      return await this.patch(id, statusData);
    } catch (error) {
      console.error(`Update status ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // دالة للتحديث (مع دعم FormData للملفات)
  update = async (id, data) => {
    try {
      let formData;

      if (data instanceof FormData) {
        formData = data;
        formData.append("_method", "PATCH"); // علشان الباك يفهم إنها PATCH
        return await this.patchPOST(id, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        return await this.patch(id, data); // JSON عادي
      }
    } catch (error) {
      console.error(`Update ${this.endpoint}/${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // دالة للإنشاء (مع دعم FormData للملفات)
  create = async (data) => {
    try {
      if (data instanceof FormData) {
        return await this.post(data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      return await this.post(data);
    } catch (error) {
      console.error(`Create ${this.endpoint} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // دالة للبحث في الأسئلة حسب القسم
  getByCategory = async (categoryId, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await this.apiClient.get(`${this.endpoint}?category_id=${categoryId}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET ${this.endpoint} by category ${categoryId} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // دالة للبحث في الأسئلة حسب النوع
  getByType = async (type, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await this.apiClient.get(`${this.endpoint}?type=${type}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET ${this.endpoint} by type ${type} failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  // دالة للبحث في الأسئلة حسب المستوى
  getByLevel = async (level, { withAuth = true, useCredentials = false } = {}) => {
    try {
      return await this.apiClient.get(`${this.endpoint}?level=${level}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.error(`GET ${this.endpoint} by level ${level} failed:`, error.response?.data || error.message);
      throw error;
    }
  };
}

export default new questionsService();
