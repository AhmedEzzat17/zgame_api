// src/services/contactService.js
import ApiFunctions from './ApiFunctions';

class ContactService extends ApiFunctions {
  constructor() {
    super('dashboard/contact-us');
  }

  // إحصائيات رسائل التواصل
  async getStats() {
    try {
      const response = await this.apiClient.get('dashboard/contact-us-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // تحديث حالة الرسالة
  async updateStatus(id, status) {
    try {
      const response = await this.apiClient.patch(`${this.endpoint}/${id}/status`, { 
        status: status 
      });
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  // إنشاء رسالة تواصل جديدة (للمستخدمين العاديين)
  async createContactMessage(data) {
    try {
      const originalEndpoint = this.endpoint;
      this.endpoint = 'contact-us';
      
      const response = await this.post(data);
      
      // إعادة endpoint الأصلي
      this.endpoint = originalEndpoint;
      
      return response.data;
    } catch (error) {
      this.endpoint = 'dashboard/contact-us';
      throw error;
    }
  }

  // البحث في الرسائل
  async searchMessages(searchTerm, page = 1) {
    try {
      return await this.getWithPagination(page, searchTerm);
    } catch (error) {
      throw error;
    }
  }

  // فلترة الرسائل حسب الحالة
  async getMessagesByStatus(status, page = 1) {
    try {
      const response = await this.getWithPagination(page, '', { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ContactService();
