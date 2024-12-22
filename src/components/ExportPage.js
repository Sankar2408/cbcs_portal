import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExportPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const departments = ['CSE', 'ECE', 'IT', 'CIVIL', 'MECH', 'AIDS'];
  const years = [1, 2, 3, 4];

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);

      const userDocRef = doc(db, 'users', userCredential.user.email);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role;
        if (role === 'staff') {
          setUserRole(role);
          toast.success('Logged in successfully!');
        } else {
          throw new Error('Access denied. User is not staff.');
        }
      } else {
        throw new Error('User document not found.');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      toast.error('Invalid login credentials or unauthorized access!');
    }
  };

  const fetchStudentDataAndExport = async (department, year) => {
    if (!department || !year) {
      toast.warning('Please select both department and year.');
      return;
    }

    if (!isLoggedIn || userRole !== 'staff') {
      toast.error('Unauthorized access. Please log in as a staff member.');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, `${department}${year}`));
      const data = {};
      querySnapshot.forEach((doc) => {
        const selections = doc.data().regno.reduce((acc, item) => ({
          ...acc,
          [item.subject]: item.staff,
        }), {});
        data[doc.id] = selections;
      });

      exportToPDF(data);
      exportToExcel(data);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error fetching student data:', error.message);
      toast.error('Error fetching data. Please try again.');
    }
  };

  const exportToPDF = (data) => {
    const pdf = new jsPDF();
    pdf.text('Student Selections', 10, 10);
    let yPosition = 20;
    Object.entries(data).forEach(([rollNumber, subjects]) => {
      pdf.text(`Roll Number: ${rollNumber}`, 10, yPosition);
      yPosition += 10;
      Object.entries(subjects).forEach(([subject, staff]) => {
        pdf.text(`- ${subject}: ${staff}`, 20, yPosition);
        yPosition += 10;
      });
    });
    pdf.save('student_selections.pdf');
  };

  const exportToExcel = (data) => {
    const formattedData = Object.entries(data).map(([rollNumber, subjects]) => ({
      RollNumber: rollNumber,
      ...subjects,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    XLSX.writeFile(wb, 'student_selections.xlsx');
  };

  return (
    <div className="container">
      <h2>Export Student Data</h2>

      <ToastContainer />

      {!isLoggedIn && (
        <div className="login-section">
          <h3>Login</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username" // Adding the autocomplete attribute for the email field
          />

          <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password" // For password field
              />


          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {isLoggedIn && (
        <div className="selection-section">
          <h3>Select Department and Year</h3>
          <select onChange={(e) => setSelectedDepartment(e.target.value)} value={selectedDepartment}>
            <option value="" disabled>Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept.toLowerCase()}>{dept}</option>
            ))}
          </select>
          <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
            <option value="" disabled>Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={() => fetchStudentDataAndExport(selectedDepartment, selectedYear)}>
            Fetch Data and Export
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
