import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore to get user role
import { auth } from '../firebaseConfig'; // Importing the Firebase auth instance

const RolesPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // To store the selected role
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For storing error messages

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole); // Set the role when a button is clicked
  };

  const handleLoginSubmit = async () => {
    try {
      // Sign in the user with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Get the user's role from Firestore
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', email)); // Assuming email is the document ID

      if (!userDoc.exists()) {
        setError('User not found in database');
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Check if the role matches the selected role
      if (userRole !== role) {
        setError(`You are not authorized to access the ${role} dashboard.`);
        return;
      }

      // Redirect based on the role
      if (role === 'staff') {
        navigate('/staff-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      }
    } catch (error) {
      setError('Incorrect email or password, please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Select Your Role</h2>

      {/* Role Selection */}
      {!role ? (
        <>
          <button onClick={() => handleRoleSelection('staff')}>Staff</button>
          <button onClick={() => handleRoleSelection('student')}>Student</button>
        </>
      ) : (
        <div>
          <h3>Enter your credentials to continue as {role}</h3>

          {/* Email and Password Input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button onClick={handleLoginSubmit}>Login</button>

          {/* Error Message */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default RolesPage;
