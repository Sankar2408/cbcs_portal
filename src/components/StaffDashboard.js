import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const [subjectsPerYear, setSubjectsPerYear] = useState({
    1: [], 2: [], 3: [], 4: []
  });
  const [currentYear, setCurrentYear] = useState(1);
  const [subjectInput, setSubjectInput] = useState('');
  const [staffInput, setStaffInput] = useState('');
  const [department, setDepartment] = useState('');
  const [deleteDepartment, setDeleteDepartment] = useState('');
  const [deleteYear, setDeleteYear] = useState(1);
  const [deleteDeptYear, setDeleteDeptYear] = useState(''); // For deleting dept+year collection

  const departments = ['CSE', 'ECE', 'IT', 'AIDs', 'Mech', 'Civil'];
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/'); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Logout Functionality
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout successful!');
      navigate('/', { replace: true });
      window.history.replaceState(null, '', '/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout!');
    }
  };

  // Add Subject
  const handleAddSubject = () => {
    if (subjectInput.trim() && department) {
      setSubjectsPerYear((prev) => ({
        ...prev,
        [currentYear]: [...prev[currentYear], { subject: subjectInput, department, staff: [] }]
      }));
      setSubjectInput('');
      toast.success('Subject added successfully!');
    } else {
      toast.error('Please provide a subject and select a department.');
    }
  };

  // Add Staff to Subject
  const handleAddStaff = (subjectIndex) => {
    if (staffInput.trim()) {
      setSubjectsPerYear((prev) => {
        const updatedYearSubjects = [...prev[currentYear]];
        const selectedSubject = updatedYearSubjects[subjectIndex];
        if (selectedSubject.staff.length < 3) {
          selectedSubject.staff.push(staffInput);
          updatedYearSubjects[subjectIndex] = selectedSubject;
          toast.success('Staff added successfully!');
          return { ...prev, [currentYear]: updatedYearSubjects };
        } else {
          toast.error('You can only add up to 3 staff members per subject.');
          return prev;
        }
      });
      setStaffInput('');
    }
  };

  // Submit Subjects to Firestore
  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'staffSubjects'), {
        yearData: subjectsPerYear,
        timestamp: new Date(),
      });
      toast.success('Subjects and staff added successfully!');
    } catch (error) {
      console.error('Error adding staff data:', error);
      toast.error('Failed to save data!');
    }
  };

  // Delete Subjects for Specific Year and Department
  const handleDeleteSubjects = async () => {
    try {
      const q = query(collection(db, 'staffSubjects'));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data.yearData[deleteYear]) {
          const updatedSubjects = data.yearData[deleteYear].filter(
            (subject) => subject.department !== deleteDepartment
          );

          if (updatedSubjects.length !== data.yearData[deleteYear].length) {
            data.yearData[deleteYear] = updatedSubjects;

            // Update document in Firestore
            await updateDoc(doc(db, 'staffSubjects', docSnapshot.id), { yearData: data.yearData });
            toast.success(`Deleted all subjects for ${deleteDepartment} - Year ${deleteYear}`);
          }
        }
      });
    } catch (error) {
      console.error('Error deleting subjects:', error);
      toast.error('Failed to delete subjects.');
    }
  };

  // Delete Specific Department-Year Collection
  const handleDeleteDeptYear = async () => {
    const collectionName = `${deleteDeptYear.toLowerCase()}${deleteYear}`; // Construct collection name like 'cse3'

    try {
      const q = query(collection(db, collectionName)); // Reference to specific department-year collection
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error(`No collection found for ${collectionName}`);
        return;
      }

      // If collection exists, delete each document inside that collection
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        toast.success(`Deleted document in collection ${collectionName}`);
      });
    } catch (error) {
      console.error('Error deleting department-year collection:', error);
      toast.error('Failed to delete department-year collection.');
    }
  };
  return (
    <div className="container">
      <ToastContainer />

      {/* Logout */}
      <div className="logout-button">
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>Staff Dashboard</h2>

      {/* Year Selection */}
      <div className="year-selection">
        <label>Select Year:</label>
        {[1, 2, 3, 4].map((year) => (
          <button
            key={year}
            onClick={() => setCurrentYear(year)}
            className={currentYear === year ? 'active' : ''}
          >
            {year} Year
          </button>
        ))}
      </div>

      {/* Department Selection */}
      <div className="department-selection">
        <label>Select Department:</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Add Subject */}
      <div className="add-subject">
        <label>Subject:</label>
        <input
          type="text"
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          placeholder="Enter Subject Name"
        />
        <button onClick={handleAddSubject}>Add Subject</button>
      </div>

      {/* Subjects and Staff List */}
      <div className="subject-list">
        <h3>{currentYear} Year Subjects</h3>
        {subjectsPerYear[currentYear].length === 0 ? (
          <p>No subjects added yet for this year.</p>
        ) : (
          subjectsPerYear[currentYear].map((subject, index) => (
            <div key={index} className="subject-item">
              <strong>
                {subject.subject} ({subject.department})
              </strong>
              <ul>
                {subject.staff.map((staff, idx) => (
                  <li key={idx}>{staff}</li>
                ))}
              </ul>
              {subject.staff.length < 3 && (
                <div>
                  <input
                    type="text"
                    value={staffInput}
                    onChange={(e) => setStaffInput(e.target.value)}
                    placeholder="Enter Staff Name"
                  />
                  <button onClick={() => handleAddStaff(index)}>Add Staff</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button onClick={handleSubmit}>Save Subjects and Staff</button>

      {/* Delete Subjects Section */}
      <div className="delete-section">
        <h3>Delete Subjects</h3>
        <label>Year:</label>
        <select value={deleteYear} onChange={(e) => setDeleteYear(Number(e.target.value))}>
          {[1, 2, 3, 4].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <label>Department:</label>
        <select value={deleteDepartment} onChange={(e) => setDeleteDepartment(e.target.value)}>
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button onClick={handleDeleteSubjects}>Delete All Subjects</button>
      </div>

      {/* Delete Specific Department-Year Collection Section */}
      <div className="delete-section">
        <h3>Delete Specific Department-Year Collection</h3>
        <label>Department:</label>
        <select value={deleteDeptYear} onChange={(e) => setDeleteDeptYear(e.target.value)}>
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <label>Year:</label>
        <select value={deleteYear} onChange={(e) => setDeleteYear(Number(e.target.value))}>
          {[1, 2, 3, 4].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button onClick={handleDeleteDeptYear}>Delete Collection</button>
      </div>
    </div>
  );
};

export default StaffDashboard;