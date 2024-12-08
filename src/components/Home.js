import React from 'react';
import Navbar from './Navbar'; // Import your Navbar component
import './style.css'; // Import the styles

const Home = () => {
  return (
    <div>
      <Navbar /> {/* Include the Navbar */}
      
      {/* Parallax Section */}
      <div className="parallax">
        <div className="parallax-text">
          <h1>NEC CBCS Portal</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
