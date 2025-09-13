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

  // دالة للحصول على سؤال عشوائي حسب القسم والنقاط
  getRandomByCategoryAndPoints = async (categoryId, points, { withAuth = true, useCredentials = false } = {}) => {
    try {
      // جرب الـ API الأصلي أولاً
      return await this.apiClient.get(`${this.endpoint}/random/category/${categoryId}/points/${points}`, {
        withCredentials: useCredentials,
      });
    } catch (error) {
      console.warn(`Original API failed, trying alternative approach:`, error.message);
      
      // إذا فشل، جرب الحصول على جميع الأسئلة وفلترها
      try {
        // جرب الحصول على جميع الأسئلة أولاً
        console.log(`🔍 Trying to get all questions first...`);
        const allQuestionsResponse = await this.apiClient.get(`${this.endpoint}`, {
          withCredentials: useCredentials,
        });
        
        console.log(`📊 All questions response:`, allQuestionsResponse.data);
        
        if (allQuestionsResponse.data && allQuestionsResponse.data.data) {
          let allQuestions = allQuestionsResponse.data.data;
          
          // التأكد من أن البيانات عبارة عن array
          if (!Array.isArray(allQuestions)) {
            // إذا كانت البيانات object، جرب الحصول على questions منها
            if (allQuestions.questions && Array.isArray(allQuestions.questions)) {
              allQuestions = allQuestions.questions;
            } else if (allQuestions.data && Array.isArray(allQuestions.data)) {
              allQuestions = allQuestions.data;
            } else {
              console.error('❌ البيانات المرجعة ليست array:', allQuestions);
              throw new Error('البيانات المرجعة من API ليست في الصيغة المتوقعة');
            }
          }
          
          console.log(`📝 Total questions found: ${allQuestions.length}`);
          
          // فلترة الأسئلة حسب القسم والنقاط
          const filteredQuestions = allQuestions.filter(q => {
            const matchesCategory = q.category_id == categoryId || q.categories?.some(cat => cat.id == categoryId);
            const matchesPoints = q.points == points;
            console.log(`🔍 Question ${q.id}: category_id=${q.category_id}, points=${q.points}, matches=${matchesCategory && matchesPoints}`);
            return matchesCategory && matchesPoints;
          });
          
          console.log(`✅ Filtered questions: ${filteredQuestions.length}`);
          
          if (filteredQuestions.length > 0) {
            // اختيار سؤال عشوائي من النتائج المفلترة
            const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
            const randomQuestion = filteredQuestions[randomIndex];
            
            console.log(`🎯 Selected random question:`, randomQuestion);
            
            // إرجاع البيانات بنفس تنسيق الـ API الأصلي
            return {
              data: {
                data: randomQuestion
              }
            };
          } else {
            // إذا لم توجد أسئلة مطابقة، اختر سؤال عشوائي من أي قسم
            console.log(`⚠️ No matching questions, selecting random question from all available`);
            if (allQuestions.length > 0) {
              const randomIndex = Math.floor(Math.random() * allQuestions.length);
              const randomQuestion = allQuestions[randomIndex];
              
              return {
                data: {
                  data: randomQuestion
                }
              };
            } else {
              throw new Error('No questions found in database');
            }
          }
        } else {
          throw new Error('Invalid response format from questions API');
        }
      } catch (fallbackError) {
        console.error(`Fallback API also failed:`, fallbackError.response?.data || fallbackError.message);
        throw fallbackError;
      }
    }
  };
}

export default new questionsService();
