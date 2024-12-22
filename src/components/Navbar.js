import React from 'react';
import { Link } from 'react-router-dom'; // For navigation links
import { auth } from '../firebaseConfig'; // Import auth from firebase
import { signOut } from 'firebase/auth';
// Importing CSS for styling

const Navbar = () => {
  // Function to handle logout

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          {/* Always visible links */}
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/exportpage">Export Data</Link>
          
          {/* Conditionally render the UpdateProfile link if the user is logged in */}
          {auth.currentUser && (
            <Link to="/update-profile">Update Profile</Link>
          )}


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
