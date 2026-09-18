import ApiFunctions from "./ApiFunctions";

// إنشاء instances للـ API endpoints
const gamesApi = new ApiFunctions('dashboard/games');

const gamesService = {
  // إنشاء لعبة جديدة
  createGame: async (gameData) => {
    try {
      console.log('إنشاء لعبة جديدة:', gameData);
      const response = await gamesApi.post(gameData);
      console.log('تم إنشاء اللعبة بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في إنشاء اللعبة:', error);
      throw error;
    }
  },

  // تحديث بيانات اللعبة
  updateGame: async (gameId, gameData) => {
    try {
      console.log(`🔄 تحديث اللعبة ${gameId}:`, gameData);
      console.log(`🌐 URL: dashboard/games/${gameId}`);
      
      // جرب PUT أولاً
      let response;
      try {
        response = await gamesApi.put(gameId, gameData);
        console.log('✅ تم التحديث بـ PUT بنجاح:', response);
      } catch (putError) {
        console.log('⚠️ PUT فشل، جرب PATCH:', putError.response?.status);
        // إذا فشل PUT، جرب PATCH
        response = await gamesApi.patch(gameId, gameData);
        console.log('✅ تم التحديث بـ PATCH بنجاح:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث اللعبة:', error);
      console.error('❌ كود الخطأ:', error.response?.status);
      console.error('❌ رسالة الخطأ:', error.response?.data);
      throw error;
    }
  },

  // جلب قائمة الألعاب مع pagination
  getGames: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // إضافة المعاملات الاختيارية
      if (params.search) queryParams.append('search', params.search);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);
      
      const endpoint = queryParams.toString() ? `dashboard/games?${queryParams.toString()}` : 'dashboard/games';
      console.log('جلب قائمة الألعاب:', endpoint);
      
      // إنشاء instance جديد للـ endpoint المخصص
      const customApi = new ApiFunctions(endpoint);
      const response = await customApi.get();
      console.log('تم جلب قائمة الألعاب بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في جلب قائمة الألعاب:', error);
      throw error;
    }
  },

  // جلب لعبة واحدة
  getGame: async (gameId) => {
    try {
      console.log(`جلب اللعبة ${gameId}`);
      const response = await gamesApi.getById(gameId);
      console.log('تم جلب اللعبة بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في جلب اللعبة:', error);
      throw error;
    }
  },

  // حذف لعبة
  deleteGame: async (gameId) => {
    try {
      console.log(`حذف اللعبة ${gameId}`);
      const response = await gamesApi.delete(gameId);
      console.log('تم حذف اللعبة بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في حذف اللعبة:', error);
      throw error;
    }
  },

  // استخدام المساعدات
  useLifeline: async (gameId, lifelineData) => {
    try {
      console.log(`استخدام مساعدة في اللعبة ${gameId}:`, lifelineData);
      // إنشاء endpoint مخصص للـ lifeline
      const lifelineApi = new ApiFunctions(`dashboard/games/${gameId}/lifeline`);
      const response = await lifelineApi.patch('', lifelineData);
      console.log('تم استخدام المساعدة بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في استخدام المساعدة:', error);
      throw error;
    }
  },

  // تحديث حالة اللعبة
  updateGameStatus: async (gameId, status) => {
    try {
      console.log(`تحديث حالة اللعبة ${gameId} إلى:`, status);
      // إنشاء endpoint مخصص للـ status
      const statusApi = new ApiFunctions(`dashboard/games/${gameId}/status`);
      const response = await statusApi.patch('', { status });
      console.log('تم تحديث حالة اللعبة بنجاح:', response);
      return response;
    } catch (error) {
      console.error('خطأ في تحديث حالة اللعبة:', error);
      throw error;
    }
  }
};

export default gamesService;
