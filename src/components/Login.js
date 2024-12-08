import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Ensure the correct import
import { getFirestore, getDoc, doc } from 'firebase/firestore'; // For Firestore database
import '../styles/LoginSignup.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', email)); // Get the user's role from Firestore

      if (!userDoc.exists()) {
        setError('User not found in database');
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Redirect based on the role
      if (userRole === 'staff') {
        navigate('/staff-dashboard');
      } else if (userRole === 'student') {
        navigate('/student-dashboard');
      } else {
        setError('Role not found');
      }
    } catch (error) {
      setError('Login Failed: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
