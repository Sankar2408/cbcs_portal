import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../styles/LoginSignup.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email to the user's email
      await sendEmailVerification(user);
      toast.info('Verification email sent. Please check your inbox and verify your email.');

      // Save user data to Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.email), {
        role,
        rollNumber: role === 'student' ? rollNumber : '',
        year: role === 'student' ? year : '',
        department: role === 'student' ? department : '', // Save department for students
      });

      toast.success('Account created successfully. Please verify your email before logging in.');
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      toast.error(`Sign Up Failed: ${error.message}`);
      console.error('Sign Up Error:', error.message);
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
          </select>
        </div>
        {role === 'student' && (
          <>
            <div>
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} required>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label>Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="Mech">Mech</option>
                <option value="Civil">Civil</option>
                <option value="AIDS">AIDS</option>
              </select>
            </div>
          </>
        )}
        <button type="submit">Sign Up</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
