// src/services/Categorieservice.js
import ApiFunctions from './ApiFunctions';

class Categorieservice extends ApiFunctions {
  constructor() {
    super('dashboard/categories'); // نفس المسار المستخدم في Angular
  }

  // إضافة دوال مخصصة إضافية إذا لزم الأمر
  
  // دالة للحصول على جميع الفئات بدون pagination
  getAllCategories = async () => {
    try {
      const response = await this.get();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // دالة للبحث في الفئات
  searchCategories = async (searchTerm) => {
    try {
      const response = await this.getWithPagination(1, searchTerm);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // دالة لرفع الصورة منفصلة (إذا لزم الأمر)
  uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await this.post(formData, {
        withAuth: true,
        useCredentials: false
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // دالة للحصول على الفئات الفرعية
  getSubCategories = async (parentId) => {
    try {
      const response = await this.getById(parentId);
      return response;
    } catch (error) {
      throw error;
    }
  };
}

export default new Categorieservice(); // بنصدر instance واحدة مباشرة