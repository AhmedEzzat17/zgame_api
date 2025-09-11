// src/services/Auth/registerService.js
import ApiFunctions from "../ApiFunctions";

class RegisterService extends ApiFunctions {
  constructor() {
    super("register"); // endpoint للتسجيل
  }

  // دالة التسجيل
  async register(userData) {
    try {
      // التأكد من وجود البيانات المطلوبة
      if (!userData.email || !userData.password) {
        throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
      }

      // طباعة البيانات للتأكد من صحتها
      console.log("📤 Sending registration data:", userData);

      // إرسال البيانات بدون Authentication header (لأن المستخدم لم يسجل دخول بعد)
      const response = await this.post(userData, { 
        withAuth: false, // مهم: بدون authentication للتسجيل
        useCredentials: false 
      });

      console.log("✅ Registration successful:", response.data);
      return response;

    } catch (error) {
      console.error("❌ Registration failed:", error.response?.data || error.message);
      
      // إعادة throw للـ error ليتم التعامل معه في الـ component
      throw error;
    }
  }

  // دالة للتحقق من توفر البريد الإلكتروني (اختيارية)
  async checkEmailAvailability(email) {
    try {
      const response = await this.post({ email }, { 
        withAuth: false,
        useCredentials: false 
      });
      return response;
    } catch (error) {
      console.error("Email check failed:", error);
      throw error;
    }
  }

  // دالة للتحقق من قوة كلمة المرور (client-side)
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`كلمة المرور يجب أن تكون على الأقل ${minLength} أحرف`);
    }
    if (!hasUpperCase) {
      errors.push("كلمة المرور يجب أن تحتوي على حرف كبير");
    }
    if (!hasLowerCase) {
      errors.push("كلمة المرور يجب أن تحتوي على حرف صغير");
    }
    if (!hasNumbers) {
      errors.push("كلمة المرور يجب أن تحتوي على رقم");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // دالة للتحقق من تطابق كلمات المرور
  validatePasswordConfirmation(password, passwordConfirmation) {
    return password === passwordConfirmation;
  }

  // دالة للتحقق من صحة البريد الإلكتروني
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // دالة للتحقق من رقم الهاتف (للدول العربية)
  validatePhone(phone, countryCode) {
    // إزالة المسافات والشرطات
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    // التحقق من الطول (عادة 10-11 رقم للدول العربية)
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return false;
    }

    // التحقق من أن الرقم يحتوي على أرقام فقط
    const phoneRegex = /^\d+$/;
    return phoneRegex.test(cleanPhone);
  }

  // دالة للتحقق من العمر (يجب أن يكون أكبر من 13 سنة)
  validateBirthDate(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 13;
  }

  // دالة شاملة للتحقق من جميع البيانات
  validateRegistrationData(formData) {
    const errors = {};

    // التحقق من الاسم الأول
    if (!formData.first_name || formData.first_name.trim().length < 2) {
      errors.first_name = "الاسم الأول يجب أن يكون أكثر من حرفين";
    }

    // التحقق من اسم العائلة
    if (!formData.last_name || formData.last_name.trim().length < 2) {
      errors.last_name = "اسم العائلة يجب أن يكون أكثر من حرفين";
    }

    // التحقق من البريد الإلكتروني
    if (!this.validateEmail(formData.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }

    // التحقق من كلمة المرور
    const passwordValidation = this.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }

    // التحقق من تطابق كلمات المرور
    if (!this.validatePasswordConfirmation(formData.password, formData.password_confirmation)) {
      errors.password_confirmation = "كلمات المرور غير متطابقة";
    }

    // التحقق من رقم الهاتف
    if (formData.phone && !this.validatePhone(formData.phone, formData.country_code)) {
      errors.phone = "رقم الهاتف غير صحيح";
    }

    // التحقق من تاريخ الميلاد
    if (formData.birth_date && !this.validateBirthDate(formData.birth_date)) {
      errors.birth_date = "يجب أن تكون أكبر من 13 سنة";
    }

    // التحقق من كود الدولة
    if (formData.phone && !formData.country_code) {
      errors.country_code = "يرجى اختيار كود الدولة";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// إنشاء instance واحد ومشاركته
const registerService = new RegisterService();
export default registerService;