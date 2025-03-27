import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyAccount from "./pages/VerifyAccount.jsx";
import { Toaster } from "react-hot-toast";
import PasswordReset from "./pages/PasswordReset.jsx";
import Home1 from "./pages/Home1.jsx";

const App = () => {
  return (
    <>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/chat-now" element={<Home1 />} />

        <Route path="/register" element={<Register />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password-reset" element={<PasswordReset />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
