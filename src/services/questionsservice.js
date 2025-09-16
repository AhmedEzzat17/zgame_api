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
      throw error;
    }
  };

  // دالة للحصول على سؤال عشوائي حسب القسم والنقاط
  getRandomByCategoryAndPoints = async (categoryId, points, { withAuth = true, useCredentials = false } = {}) => {
    console.log(`🔍 طلب سؤال: القسم ${categoryId}, النقاط ${points}`);
    
    // استخدام الـ fallback مباشرة بدلاً من محاولة API الأصلي
    try {
      console.log('📡 جلب جميع الأسئلة من API...');
      const allQuestionsResponse = await this.apiClient.get(`${this.endpoint}`, {
        withCredentials: useCredentials,
      });
      
      console.log('📊 استجابة API:', allQuestionsResponse.data);
      
      if (allQuestionsResponse.data && allQuestionsResponse.data.data) {
        let allQuestions = allQuestionsResponse.data.data;
        
        // التأكد من أن البيانات عبارة عن array
        if (!Array.isArray(allQuestions)) {
          if (allQuestions.questions && Array.isArray(allQuestions.questions)) {
            allQuestions = allQuestions.questions;
          } else if (allQuestions.data && Array.isArray(allQuestions.data)) {
            allQuestions = allQuestions.data;
          } else {
            console.error('❌ البيانات المرجعة ليست في الصيغة المتوقعة:', allQuestions);
            throw new Error('البيانات المرجعة من API ليست في الصيغة المتوقعة');
          }
        }
        
        console.log(`📋 إجمالي الأسئلة المتوفرة: ${allQuestions.length}`);
        
        // فلترة الأسئلة حسب القسم والنقاط
        const filteredQuestions = allQuestions.filter(q => {
          const matchesCategory = q.category_id == categoryId || q.categories?.some(cat => cat.id == categoryId);
          const matchesPoints = q.points == points;
          console.log(`🔍 فحص السؤال ${q.id}: القسم ${q.category_id}, النقاط ${q.points}, مطابق للقسم: ${matchesCategory}, مطابق للنقاط: ${matchesPoints}`);
          return matchesCategory && matchesPoints;
        });
        
        console.log(`✅ الأسئلة المفلترة: ${filteredQuestions.length} سؤال`);
        
        // فحص أنواع الوسائط المتوفرة
        const mediaTypes = allQuestions.map(q => ({
          id: q.id,
          type: q.type,
          media_mime: q.media_mime,
          has_media: !!q.question_media_url
        })).filter(q => q.has_media);
        
        
        if (filteredQuestions.length > 0) {
          // اختيار سؤال عشوائي من النتائج المفلترة
          const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
          const randomQuestion = filteredQuestions[randomIndex];
          
          console.log('🎯 السؤال المختار:', randomQuestion);
          
          // إرجاع البيانات بنفس تنسيق الـ API الأصلي
          return {
            data: {
              data: randomQuestion
            }
          };
        } else {
          console.log('⚠️ لم توجد أسئلة مطابقة، اختيار سؤال عشوائي من أي قسم...');
          // إذا لم توجد أسئلة مطابقة، اختر سؤال عشوائي من أي قسم
          if (allQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * allQuestions.length);
            const randomQuestion = allQuestions[randomIndex];
            
            console.log('🎲 السؤال العشوائي المختار:', randomQuestion);
            
            return {
              data: {
                data: randomQuestion
              }
            };
          } else {
            console.error('❌ لا توجد أسئلة في قاعدة البيانات');
            throw new Error('No questions found in database');
          }
        }
      } else {
        console.error('❌ تنسيق استجابة API غير صحيح:', allQuestionsResponse.data);
        throw new Error('Invalid response format from questions API');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الأسئلة:', error);
      throw error;
    }
  };
}

export default new questionsService();
