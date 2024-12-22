import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Assuming Navbar is used across multiple pages
import Navbar from './components/Navbar'; // Import Navbar

import Home from './components/Home';  // Homepage with Navbar
import Login from './components/Login';
import Signup from './components/Signup';
import RolesPage from './components/RolesPage';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import ExportPage from './components/ExportPage'; // Import ExportPage
import UpdateProfile from './components/UpdateProfile';


function App() {
  return (
    <div>




      {/* Define Routes for different pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exportpage" element={<ExportPage />} /> {/* New route for ExportPage */}
        <Route path="/update-profile" element={<UpdateProfile />} /> {/* Route for UpdateProfile */}

      </Routes>
    </div>
  );
}

export default App;
