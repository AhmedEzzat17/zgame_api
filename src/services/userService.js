// src/services/userService.js
import ApiFunctions from './ApiFunctions';

class UserService extends ApiFunctions {
  constructor() {
    super('dashboard/users'); // نفس المسار المستخدم في Angular
  }

  // دالة تغيير كلمة المرور
  async resetPassword(passwordData) {
    try {
      // استخدام الدالة post الموروثة من ApiFunctions مع تعديل endpoint مؤقت
      const originalEndpoint = this.endpoint;
      this.endpoint = 'reset-password';
      
      const response = await this.post(passwordData);
      
      // إعادة endpoint الأصلي
      this.endpoint = originalEndpoint;
      
      return response.data;
    } catch (error) {
      // إعادة endpoint الأصلي في حالة الخطأ أيضاً
      this.endpoint = 'dashboard/users';
      throw error;
    }
  }

  // ممكن تضيف دوال مخصصة هنا
}

export default new UserService(); // بنصدر instance واحدة مباشرة