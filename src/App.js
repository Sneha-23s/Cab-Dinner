
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from "./pages/Dashboard";
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import EmployeePage from './pages/EmployeePage';
import UpdatePage from './pages/UpdatePage';
import React from 'react';
// import SendMailPage from './SendMailPage';
// import EmailSender from "./automatic-data-move/server";
//import { AuthProvider } from './AuthContext';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/manager" element={<ManagerPage />} />
          {/* <Route path="/sendmail" component={SendMailPage} /> Add this route */}
          <Route path="/employee/:id-edit/currentweek" element={<EmployeePage />} />
          <Route path="/employee/:id-edit/nextweek" element={<EmployeePage />} />
          <Route path="/employee/:id-edit" element={<EmployeePage />} />
          <Route path="/employee/:id" element={<EmployeePage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
