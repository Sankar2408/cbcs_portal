import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import ExportPage from './ExportPage';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import '../styles/StudentDashboard.css'

const StudentDashboard = () => {
  const [year, setYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [studentData, setStudentData] = useState(null);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudentData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudentData(docSnap.data());
      } else {
        alert('No student data found.');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchSubjects = async () => {
    if (!year || !department) return;
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, 'staffSubjects'));
      let yearSubjects = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const yearData = data.yearData;

        if (yearData && yearData[year]) {
          const filteredSubjects = yearData[year].filter(
            (subject) => subject.department === department
          );
          yearSubjects = yearSubjects.concat(filteredSubjects);
        }
      });

      setSubjects(yearSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [year, department]);

  const handleSubmit = async () => {
    if (!studentData) {
      alert('Student data not loaded. Please refresh the page.');
      return;
    }

    // Validate roll number
    if (studentData.rollNumber !== rollNumber) {
      alert('Roll number mismatch. Please check your roll number.');
      return;
    }

    const selections = subjects.map((subject, index) => ({
      subject: subject.subject,
      staff: selectedStaff[index] || null,
    }));

    if (selections.some((item) => item.staff === null)) {
      alert('Please select staff for all subjects before submitting.');
      return;
    }

    try {
      // Use predefined collection name based on department and year
      const collectionName = `${department.toLowerCase()}${year}`;

      // Reference the predefined Firestore collection
      const studentDocRef = doc(db, collectionName, rollNumber);
      const studentDoc = await getDoc(studentDocRef);

      if (studentDoc.exists()) {
        alert('Your selections have already been submitted!');
        return;
      }

      await setDoc(studentDocRef, {
        regno: selections,
      });

      alert('Your selections have been successfully submitted!');
      setSelectedStaff({});
    } catch (error) {
      console.error('Error submitting selections:', error);
      alert('Failed to submit selections. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <div>
        <label htmlFor="rollNumber">Roll Number:</label>
        <input
          type="text"
          id="rollNumber"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="Enter your Roll Number"
        />
      </div>
      <div>
        <label htmlFor="year">Year:</label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">-- Select Year --</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>
      <div>
        <label htmlFor="department">Department:</label>
        <select
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">-- Select Department --</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="IT">IT</option>
          <option value="AIDs">AIDs</option>
          <option value="Mech">Mech</option>
          <option value="Civil">Civil</option>
        </select>
      </div>
      {/* Subjects */}
      <div>
        {subjects.map((subject, index) => (
          <div key={index}>
            <h3>{subject.subject}</h3>
            {subject.staff.map((staff, idx) => (
              <label key={idx}>
                <input
                  type="radio"
                  name={`subject-${index}`}
                  value={staff}
                  onChange={() => setSelectedStaff({ ...selectedStaff, [index]: staff })}
                />
                {staff}
              </label>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default StudentDashboard;
