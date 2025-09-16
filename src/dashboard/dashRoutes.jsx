import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './main/main';
// import Categories from './catagories/catagories';
import UserShow from "./users/UserShow";
import UserEdit from "./users/UserEdit";
import UserCreate from "./users/UserCreate";
import CategoryShow from "./catagories/CategoryShow";
import CategoryEdit from "./catagories/CategoryEdit";
import CategoryCreate from "./catagories/CategoryCreate";
import CountryShow from "./countries/CountryShow";
import CountryEdit from "./countries/CountryEdit";
import CountryCreate from "./countries/CountryCreate";
import QuestionShow from "./questions/QuestionShow";
import QuestionEdit from "./questions/QuestionEdit";
import QuestionCreate from "./questions/QuestionCreate";
import ContactUs from "./contact/ContactUs";
import ContactCreate from "./contact/ContactCreate";



const DashRoutes = () => {
  return (
    <Routes>
      {/* الصفحة الرئيسية للداشبورد */}
      <Route index element={
        <>
          <div className="welcome-banner">
            <h1>مرحباً بك في لوحة تحكم زد جيم</h1>
            <p>إدارة الألعاب والمحتوى الخاص بك</p>
            <div className="banner-overlay"></div>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon users">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>إجمالي المستخدمين</h3>
                <p className="stat-number">1,248</p>
                <span className="stat-change positive">+12% عن الشهر الماضي</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon games">
                <i className="fas fa-gamepad"></i>
              </div>
              <div className="stat-info">
                <h3>الألعاب المتاحة</h3>
                <p className="stat-number">47</p>
                <span className="stat-change">+3 ألعاب جديدة</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon categories">
                <i className="fas fa-tags"></i>
              </div>
              <div className="stat-info">
                <h3>الأقسام</h3>
                <p className="stat-number">12</p>
                <span className="stat-change">جميع الأقسام نشطة</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon played">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-info">
                <h3>الجيمز التي لعبت</h3>
                <p className="stat-number">2,487</p>
                <span className="stat-change positive">+24% عن الأسبوع الماضي</span>
              </div>
            </div>
          </div>
        </>
      } />

      <Route path="main" element={<Main />} />

      {/* <Route path="categories" element={<Categories />} /> */}

      <Route path="users" element={<UserShow />} />
      <Route path="users/create" element={<UserCreate />} />
      <Route path="users/edit/:id" element={<UserEdit />} />

      <Route path="categories" element={<CategoryShow />} />
      <Route path="categories/create" element={<CategoryCreate />} />
      <Route path="categories/edit/:id" element={<CategoryEdit />} />
      
      {/* Country Management Routes */}
      <Route path="countries" element={<CountryShow />} />
      <Route path="countries/create" element={<CountryCreate />} />
      <Route path="countries/edit/:id" element={<CountryEdit />} />

      {/* Question Management Routes */}
      <Route path="questions" element={<QuestionShow />} />
      <Route path="questions/create" element={<QuestionCreate />} />
      <Route path="questions/edit/:id" element={<QuestionEdit />} />

      {/* Contact Management Routes */}
      <Route path="contact" element={<ContactUs />} />
      <Route path="contact/create" element={<ContactCreate />} />
    </Routes>
  );
};

export default DashRoutes;