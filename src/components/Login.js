import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
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
      // Attempt to sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Explicitly check if the user's email is verified
      if (!user.emailVerified) {
        toast.error('Your email is not verified. Please verify your email to log in.');
        await signOut(auth); // Immediately log the user out
        return;
      }

      // Fetch user data from Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.email); // Firestore document reference
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast.error('User data not found. Please contact support.');
        await signOut(auth); // Log out if user data is missing
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Redirect user based on their role
      if (userRole === 'staff') {
        toast.success('Welcome, Staff!');
        navigate('/staff-dashboard');
      } else if (userRole === 'student') {
        toast.success('Welcome, Student!');
        navigate('/student-dashboard');
      } else {
        toast.error('Invalid role. Please contact support.');
        await signOut(auth); // Log out on invalid role
      }
    } catch (error) {
      toast.error('Login failed. Please check your email and password.');
      console.error('Login Error:', error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again.');
      console.error('Password Reset Error:', error.message);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username" // Adding the autocomplete attribute for the email field
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password" // Adding autocomplete for the password field
          />
        </div>
        <button type="submit">Login</button>
        <button
          type="button"
          className="forgot-password"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;


