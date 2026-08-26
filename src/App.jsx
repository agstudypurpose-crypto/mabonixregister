
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

import { useEffect, useState } from "react";


function App() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("students");
    return saved ? JSON.parse(saved) : [];
  });

  const [addNumber, setAddNumber] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // ADD STUDENT
  const addStudent = () => {
    if (
      !addNumber.trim() ||
      !name.trim() ||
      !mobile.trim()
    ) {
      alert(
        "Please enter Add Number, Name and Mobile Number"
      );
      return;
    }

    const newStudent = {
      id: Date.now(),
      addNumber: addNumber.trim(),
      name: name.trim(),
      mobile: mobile.trim(),
      present: false,
    };

    setStudents((prev) => [...prev, newStudent]);

    setAddNumber("");
    setName("");
    setMobile("");
  };

  // DELETE STUDENT
  const deleteStudent = (id) => {
    if (window.confirm("Delete this student?")) {
      setStudents((prev) =>
        prev.filter((student) => student.id !== id)
      );
    }
  };

  // ATTENDANCE
  const toggleAttendance = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              present: !student.present,
            }
          : student
      )
    );
  };

  // CLEAR ALL
  const clearAll = () => {
    if (window.confirm("Delete all students?")) {
      setStudents([]);
    }
  };

  // ==========================================
  // SEND ALL STUDENTS TO PYTHON
  // ==========================================
  const sendAll = async () => {
    if (students.length === 0) {
      alert("No students available.");
      return;
    }

    if (sending) {
      return;
    }

    const confirmSend = window.confirm(
      `Send ${students.length} students to Python?`
    );

    if (!confirmSend) {
      return;
    }

    setSending(true);

    const studentData = students.map((student) => ({
      addNumber: student.addNumber,
      name: student.name,
      mobile: student.mobile,
      attendanceStatus: student.present
        ? "Present"
        : "Absent",
    }));

    console.log("Sending:", studentData);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/send-all-students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            students: studentData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();

      console.log("Python response:", result);

      alert(
        `${students.length} student records sent successfully!`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Cannot connect to Python.\n\n" +
          "Please start Flask using:\n" +
          "python app.py"
      );
    } finally {
      setSending(false);
    }
  };

  // SEARCH
  const filteredStudents = students.filter(
    (student) =>
      student.addNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.mobile.includes(search)
  );

  // STATISTICS
  const presentCount = students.filter(
    (student) => student.present
  ).length;

  const absentCount =
    students.length - presentCount;

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>Student Attendance Register</h1>
        <p>Attendance Management System</p>
      </header>

      <div className="container">

        {/* ADD STUDENT */}
        <div className="card">

          <h2>Add Student</h2>

          <div className="form">

            <input
              type="text"
              placeholder="Add Number"
              value={addNumber}
              onChange={(e) =>
                setAddNumber(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Student Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
            />

            <button
              className="add-btn"
              onClick={addStudent}
            >
              + Add Student
            </button>

          </div>
        </div>

        {/* STATISTICS */}
        <div className="stats">

          <div className="stat-card">
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>

          <div className="stat-card">
            <span>Present</span>
            <strong>{presentCount}</strong>
          </div>

          <div className="stat-card">
            <span>Absent</span>
            <strong>{absentCount}</strong>
          </div>

        </div>

        {/* SEARCH */}
        <div className="toolbar">

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="clear-btn"
            onClick={clearAll}
          >
            Clear All
          </button>

        </div>

        {/* SEND ALL AREA */}
        <div className="send-all-area">

          <button
            type="button"
            className="send-all-btn"
            onClick={sendAll}
            disabled={sending}
          >
            {sending
              ? "Sending..."
              : "📤 Send All"}
          </button>

        </div>

        {/* TABLE */}
        <div className="table-card">

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>SL NO</th>
                  <th>ADD NUMBER</th>
                  <th>NAME</th>
                  <th>CHK BOX</th>
                  <th>MOBILE NUMBER</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="empty"
                    >
                      No students found
                    </td>
                  </tr>

                ) : (

                  filteredStudents.map(
                    (student, index) => (

                      <tr
                        key={student.id}
                        className={
                          student.present
                            ? "present-row"
                            : ""
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <b>
                            {student.addNumber}
                          </b>
                        </td>

                        <td>
                          {student.name}
                        </td>

                        <td>

                          <input
                            className="attendance-checkbox"
                            type="checkbox"
                            checked={
                              student.present
                            }
                            onChange={() =>
                              toggleAttendance(
                                student.id
                              )
                            }
                          />

                        </td>

                        <td>
                          {student.mobile}
                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <footer>
        Student Attendance Register
      </footer>

    </div>
  );
}

export default App;