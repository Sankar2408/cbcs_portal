import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';

const ExportPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // To track user role

  const departments = ['CSE', 'ECE', 'IT']; // Example departments
  const years = [1, 2, 3, 4]; // Example years

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      setIsLoggedIn(true);

      // Fetch the user's role from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.email);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role;
        if (role === 'staff') {
          setUserRole(role);
        } else {
          throw new Error('User does not have the required role');
        }
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      alert('Invalid login credentials!');
    }
  };

  const fetchStudentDataAndExport = async (department, year) => {
    if (!isLoggedIn || userRole !== 'staff') {
      alert('Please log in as a staff member first.');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, `${department}${year}`));
      let data = {};
      querySnapshot.forEach((doc) => {
        const selections = doc.data().regno.reduce((acc, item) => ({
          ...acc,
          [item.subject]: item.staff
        }), {});
        data[doc.id] = selections;
      });

      // Export to PDF
      const doc = new jsPDF();
      doc.text("Student Selections", 10, 10);
      Object.keys(data).forEach((rollNumber, index) => {
        doc.text(`Roll Number: ${rollNumber}`, 10, 20 + index * 10);
        Object.keys(data[rollNumber]).forEach((subject, i) => {
          doc.text(`Subject ${i + 1}: ${subject} - ${data[rollNumber][subject]}`, 20, 30 + index * 10);
        });
      });
      doc.save("student_selections.pdf");

      // Export to Excel
      const formattedData = Object.keys(data).map((rollNumber) => ({
        RollNumber: rollNumber,
        ...Object.keys(data[rollNumber]).reduce((acc, subject, i) => ({
          ...acc,
          [subject]: data[rollNumber][subject]
        }), {})
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
      XLSX.writeFile(wb, "student_selections.xlsx");
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert('Error fetching data. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Export Student Data</h2>

      {/* Login Section */}
      {!isLoggedIn && (
        <div className="login-section">
          <h3>Login</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* Department and Year Selection */}
      {isLoggedIn && (
        <>
          <select onChange={(e) => setSelectedDepartment(e.target.value)} value={selectedDepartment}>
            <option value="" disabled>Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept.toLowerCase()}>{dept}</option>
            ))}
          </select>
          <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
            <option value="" disabled>Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={() => fetchStudentDataAndExport(selectedDepartment, selectedYear)}>Fetch Data and Export</button>
        </>
      )}
    </div>
  );
};

export default ExportPage;
