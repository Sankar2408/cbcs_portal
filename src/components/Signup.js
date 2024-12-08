import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Ensure the correct import
import { getFirestore, setDoc, doc } from 'firebase/firestore'; // For Firestore database
import '../styles/LoginSignup.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // State to store the selected role
  const [rollNumber, setRollNumber] = useState(''); // State to capture roll number
  const [year, setYear] = useState(''); // State to capture the selected year
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate if the roll number matches the selected year (only for students)
    let validRollNumber = false;
    if (role === 'student') {
      if (year === '1' && rollNumber.startsWith('24')) {
        validRollNumber = true;
      } else if (year === '2' && rollNumber.startsWith('23')) {
        validRollNumber = true;
      } else if (year === '3' && rollNumber.startsWith('22')) {
        validRollNumber = true;
      } else if (year === '4' && rollNumber.startsWith('21')) {
        validRollNumber = true;
      }

      if (!validRollNumber) {
        alert(`Invalid roll number for ${year} Year. Please enter a valid roll number.`);
        return; // Prevent sign-up if the roll number is not valid
      }
    }

    try {
      // Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's role and roll number in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.email), {
        role: role, // Save the role for the user
        rollNumber: role === 'student' ? rollNumber : '', // Store roll number only for students
        year: role === 'student' ? year : '', // Store year only for students
      });

      alert('Sign-Up Successful!');
      navigate('/login'); // Redirect to login page after successful sign-up
    } catch (error) {
      alert(error.message);
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
    </div>
  );
};

export default SignUp;
