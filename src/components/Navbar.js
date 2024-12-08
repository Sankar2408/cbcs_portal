// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom'; // For navigation links
// import '../styles/Navbar.css'; // Importing CSS for styling

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo"></Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/exportpage">Export Data.....</Link> {/* New link to ExportPage */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
