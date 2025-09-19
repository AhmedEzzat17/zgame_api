import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    const parsed = JSON.parse(userData);
    
    
    // التحقق من صلاحيات الأدمن
    if (parsed.user?.isAdmin && parsed.user?.email === "admin@gmail.com") {
      return { ...parsed, role: "admin" };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

const ProtectedRoute = () => {
  const user = getUserFromStorage();
  const token = user?.token;


  // إذا لم يكن مسجل دخول أو ليس أدمن، إعادة توجيه للصفحة الرئيسية
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
