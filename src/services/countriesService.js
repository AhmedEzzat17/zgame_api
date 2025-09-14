// src/services/countriesService.js - تحديث لإضافة createJSON
import ApiFunctions from './ApiFunctions';

class CountriesService extends ApiFunctions {
  constructor() {
    super('dashboard/countries');
  }

  // للبيانات مع الصور (FormData)
  create = async (data) => {
    return await this.post(data);
  };

  // للبيانات بدون صور (JSON) - إضافة هذه الدالة
  createJSON = async (data) => {
    try {
      const response = await apiClient.post(this.endpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // للتحديث
  update = async (id, data) => {
    return await this.patchPOST(id, data);
  };

  // تحديث الحالة فقط
  updateStatus = async (id, data) => {
    return await this.patch(id, data);
  };
}

export default new CountriesService();