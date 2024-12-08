import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Ensure the correct import
import { getFirestore, setDoc, doc } from 'firebase/firestore'; // For Firestore database
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
  const navigate = useNavigate();

  // Custom error messages for Firebase error codes
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please use another email.',
    'auth/weak-password': 'The password is too weak. Please use a stronger password.',
    'auth/invalid-email': 'The email address is not valid. Please check and try again.',
    default: 'An unexpected error occurred. Please try again.',
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate roll number for students
    let validRollNumber = false;
    if (role === 'student') {
      if (year === '1' && rollNumber.startsWith('24')) validRollNumber = true;
      else if (year === '2' && rollNumber.startsWith('23')) validRollNumber = true;
      else if (year === '3' && rollNumber.startsWith('22')) validRollNumber = true;
      else if (year === '4' && rollNumber.startsWith('21')) validRollNumber = true;

      if (!validRollNumber) {
        toast.error(`Invalid roll number for ${year} Year. Please enter a valid roll number.`);
        return;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const db = getFirestore();
      await setDoc(doc(db, 'users', user.email), {
        role,
        rollNumber: role === 'student' ? rollNumber : '',
        year: role === 'student' ? year : '',
      });

      toast.success('Sign-Up Successful!');
      navigate('/login');
    } catch (error) {
      const errorMessage = errorMessages[error.code] || errorMessages.default;
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
          </select>
        </div>
        {role === 'student' && (
          <>
            <div>
              <label htmlFor="year">Year</label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
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
