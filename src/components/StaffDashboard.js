import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import '../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const [subjectsPerYear, setSubjectsPerYear] = useState({
    1: [], 2: [], 3: [], 4: [] // Each year will hold its subjects and staffs
  });
  const [currentYear, setCurrentYear] = useState(1);
  const [subjectInput, setSubjectInput] = useState('');
  const [staffInput, setStaffInput] = useState('');
  const [department, setDepartment] = useState(''); // State to store department selection

  const departments = ['CSE', 'ECE', 'IT', 'AIDs', 'Mech', 'Civil'];

  const handleAddSubject = () => {
    if (subjectInput.trim() && department) {
      setSubjectsPerYear((prev) => ({
        ...prev,
        [currentYear]: [...prev[currentYear], { subject: subjectInput, department, staff: [] }]
      }));
      setSubjectInput('');
    } else {
      alert('Please provide a subject and select a department.');
    }
  };

  const handleAddStaff = (subjectIndex) => {
    if (staffInput.trim()) {
      setSubjectsPerYear((prev) => {
        const updatedYearSubjects = [...prev[currentYear]];
        const selectedSubject = updatedYearSubjects[subjectIndex];
        if (selectedSubject.staff.length < 3) {
          selectedSubject.staff.push(staffInput);
          updatedYearSubjects[subjectIndex] = selectedSubject;
          return { ...prev, [currentYear]: updatedYearSubjects };
        } else {
          alert('You can only add up to 3 staff members per subject.');
          return prev;
        }
      });
      setStaffInput('');
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'staffSubjects'), {
        yearData: subjectsPerYear,
        timestamp: new Date(),
      });
      alert('Subjects and staff added successfully!');
    } catch (error) {
      console.error('Error adding staff data:', error);
      alert('Failed to save data!');
    }
  };

  return (
    <div className="container">
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

      {/* Display Subjects and Staffs */}
      <div className="subject-list">
        <h3>{currentYear} Year Subjects</h3>
        {subjectsPerYear[currentYear].length === 0 ? (
          <p>No subjects added yet for this year.</p>
        ) : (
          subjectsPerYear[currentYear].map((subject, index) => (
            <div key={index} className="subject-item">
              <strong>{subject.subject} ({subject.department})</strong>
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

      {/* Submit Button */}
      <button onClick={handleSubmit}>Save Subjects and Staff</button>
    </div>
  );
};

export default StaffDashboard;
