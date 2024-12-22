import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const UpdateProfile = () => {
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        return navigate('/login');
      }

      try {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
          // Redirect to staff dashboard if the role is 'staff'
          if (userData.role === 'staff') {
            return navigate('/staff-dashboard'); // Redirect staff to dashboard
          }

          setDepartment(userData.department || '');
          setYear(userData.year || '');
          setRollNumber(userData.rollNumber || '');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      return navigate('/login');
    }

    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.email);

      await updateDoc(userDocRef, {
        department,
        year,
        rollNumber,
      });

      // Notify the user with a toast after successful update
      toast.success('Profile updated successfully!');

      // Navigate after updating the profile
      navigate('/'); // Redirect to Home after successful update
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Update Profile</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} required>
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
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
            <option value="Mech">Mech</option>
            <option value="Civil">Civil</option>
            <option value="AIDS">AIDS</option>
          </select>
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {/* ToastContainer to show the toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default UpdateProfile;
