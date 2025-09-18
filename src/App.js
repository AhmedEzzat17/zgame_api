import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import GameNavbar from "./components/gameNavbar/gameNavbar.jsx";
import Login from "./services/Login/Login.jsx";
import Register from "./services/Register/Register.jsx";
import Contact from "./services/Contact/Contact.jsx";
import MainSection from "./components/MainSection/MainSection.jsx";
import AboutUs from "./components/AboutUs/AboutUs.jsx";
import GameSection from "./components/GameSection/GameSection.jsx";
import Footer from "./components/Footer/Footer.jsx";
import OneCreateGame from "./pages/CreateGame/OneCreateGame.jsx";
import TwoCreateGame from "./pages/CreateGame/TwoCreateGame.jsx";
import TeamInfo from "./pages/CreateGame/TeamInfo.jsx";
import OneCreateChampion from "./pages/CreateChampion/OneCreateChampion.jsx";
import TwoCreateChampion from "./pages/CreateChampion/TwoCreateChampion.jsx";
import CreateChampionTwo from "./pages/CreateChampionTwo/CreateChampionTwo.jsx";
import GameBoard from "./pages/GameBoard/GameBoard.jsx";
import TheGame from "./pages/TheGame/TheGame.jsx";
import Dashboard from "./dashboard/dashboard.jsx"; // تعديل الاسم بحرف كبير
import Profile from "./components/profile/profile.jsx";
import MyGames from "./components/myGames/myGames.jsx";

function AppContent() {
  return (
    <>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <MainSection />
              <AboutUs />
              <GameSection />
              <Footer />
            </>
          }
        />

        <Route
          path="/OneCreateGame"
          element={
            <>
              <Navbar />
              <OneCreateGame />
              <TwoCreateGame />
              <TeamInfo />
              <Footer />
            </>
          }
        />

        <Route
          path="/OneCreateChampion"
          element={
            <>
              <Navbar />
              <OneCreateChampion />
              <TwoCreateChampion />
              <Footer />
            </>
          }
        />

        <Route
          path="/CreateChampionTwo"
          element={
            <>
              <Navbar />
              <OneCreateChampion />
              <CreateChampionTwo />
              <Footer />
            </>
          }
        />
        
        <Route
          path="/TheGame/:categoryId/:value"
          element={
            <>
              <GameNavbar />
              <TheGame />
            </>
          }
        />
        
        <Route path="/GameBoard" element={
          <>
            <GameNavbar />
            <GameBoard />
          </>
        } />
        
        <Route path="/login" element={
          <>
            <Navbar />
            <Login />
          </>
        } />
        
        <Route path="/register" element={
          <>
            <Navbar />
            <Register />
          </>
        } />
        
        <Route path="/Contact" element={
          <>
            <Navbar />
            <Contact />
          </>
        } />
        <Route path="/Profile" element={
          <>
            <Navbar />
            <Profile />
            <Footer />
          </>
        } />
        <Route path="/MyGames" element={
          <>
            <Navbar />
            <MyGames />
            <Footer />
          </>
        } />

        {/* تعديل هنا */}
        <Route path="/dashboard/*" element={<Dashboard />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;