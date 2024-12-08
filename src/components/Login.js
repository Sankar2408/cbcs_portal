import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; 
import { getFirestore, getDoc, doc } from 'firebase/firestore'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../styles/LoginSignup.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', email)); 

      if (!userDoc.exists()) {
        toast.error('User not found in the database');
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

    
      if (userRole === 'staff') {
        toast.success('Welcome, Staff!');
        navigate('/staff-dashboard');
      } else if (userRole === 'student') {
        toast.success('Welcome, Student!');
        navigate('/student-dashboard');
      } else {
        toast.error('Role not found');
      }
    } catch (error) {
      toast.error('Login Failed. Please check your credentials.');
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
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
