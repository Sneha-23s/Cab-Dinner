import React, { useRef } from 'react';
import NavBar from '../components/NavBar';
import { fireDb } from '../firebase/firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useState, useEffect } from 'react';
import firebase from "firebase/app";
import "./AdminPage.css";
import { useNavigate, useParams } from 'react-router-dom';
import { logout, isAuthenticated } from "../services/Auth"
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { DeleteApi } from '../services/Api';
import { get, set } from 'firebase/database';



export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [user, setuser] = useState({});



  useEffect(() => {
    const handlePopstate = () => {
      // Logout the user when the popstate event occurs (browser back/forward buttons)
      logout();
      window.location.href = '/login'; // Redirect to login page
    };

    // Add the event listener for the popstate event
    window.addEventListener('popstate', handlePopstate);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  useEffect(() => {
    const startCountRef1 = ref(fireDb, 'Users/');
    onValue(startCountRef1, (snapshot) => {
      const userData = snapshot.val();
      setuser(userData || {});
    });
  }, [])

  useEffect(() => {
    const startCountRef = ref(fireDb, 'Details/');
    onValue(startCountRef, (snapshot) => {
      const detailsData = snapshot.val();
      setData(detailsData || {});
    });
  }, [])



  const getWorkingDaysWithDates = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const daysInWeek = 5;
    const workingDays = [];
    let daysToAdd;

    // Calculate the number of days to subtract to reach Monday
    if (currentDay === 0) {
      // If today is Sunday, subtract 6 days to reach Monday of the previous week
      daysToAdd = 1;
    } else if (currentDay === 6) {
      // If today is Sunday, subtract 6 days to reach Monday of the previous week
      daysToAdd = 2;
    } else {
      // Otherwise, subtract the current day (e.g., if today is Wednesday, subtract 3 days)
      daysToAdd = -currentDay;
    }

    for (let i = 0; workingDays.length < daysInWeek; i++) {
      const nextDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      const day = nextDate.toLocaleString('en-us', { weekday: 'short' });
      if (day !== 'Sat' && day !== 'Sun') {
        const date = nextDate.getDate();
        const month = nextDate.toLocaleString('default', { month: 'short' });
        const year = nextDate.toLocaleString('en-us', { year: '2-digit' });
        workingDays.push({ day, date, month, year });
      }
      // Increment daysToAdd to go to the next day
      daysToAdd++;
    }
    return workingDays;
  };

  // Get the dates of July 30 to August 4
  const datesOfNextWeek = getWorkingDaysWithDates();

  // Function to get upcoming week's working days with dates
  const getUpcomingWeekWorkingDaysWithDates = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const daysInWeek = 5; // Assuming the workweek has 5 working days
    const workingDays = [];
    let daysToAdd;

    // Calculate the number of days to add to reach Monday of the upcoming week
    if (currentDay === 0) {
      // If today is Sunday, add 1 day to reach Monday of the upcoming week
      daysToAdd = 1;
    } else if (currentDay === 6) {
      // If today is Saturday, add 2 days to reach Monday of the upcoming week
      daysToAdd = 2;
    } else {
      // Otherwise, add the number of days required to reach Monday of the upcoming week
      daysToAdd = 8 - currentDay;
    }

    for (let i = 0; workingDays.length < daysInWeek; i++) {
      const nextDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      const day = nextDate.toLocaleString('en-us', { weekday: 'short' });
      if (day !== 'Sat' && day !== 'Sun') {
        const date = nextDate.getDate();
        const month = nextDate.toLocaleString('default', { month: 'short' });
        const year = nextDate.getFullYear();
        workingDays.push({ day, date, month, year });
      }
      // Increment daysToAdd to go to the next day
      daysToAdd++;
    }
    return workingDays;
  };

  const upcomingWeekWorkingDaysWithDates = getUpcomingWeekWorkingDaysWithDates();

  const tableRef = useRef(null);
  const exportLinkRef = useRef(null);
  // const { deleteid } = useParams();
  // Function to export the table to Excel
  const handleExportExcel = () => {
    try {
      const table = tableRef.current;
      if (!table) {
        console.error('Table element not found.');
        return;
      }
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert the table to a worksheet and add it to the workbook
      const worksheet = XLSX.utils.table_to_sheet(table);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate a Blob with the workbook data
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });

      // Revoke any existing temporary URLs to free up memory
      if (exportLinkRef.current) {
        URL.revokeObjectURL(exportLinkRef.current.href);
      }

      // Create a temporary URL for the Blob and attach it to the download link
      const url = URL.createObjectURL(blob);
      exportLinkRef.current.href = url;

      // Set the filename for the download link
      exportLinkRef.current.download = 'admin_table.xlsx';

      // Trigger the click event on the download link to show the "Save As" dialog box
      exportLinkRef.current.click();
    }
    catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  // const onDelete = (id) => {
  //   if (window.confirm("Are you sure that you wanted to delete this user?")) {
  //     remove(ref(fireDb, `Users/${id}`), (err) => {
  //       if (err) {
  //         toast.error(err);
  //       } else {
  //         toast.success("Deleted successfully");
  //       }
  //     });
  //     remove(ref(fireDb, `Details/${id}`), (err) => {
  //       if (err) {
  //         toast.error(err);
  //       } else {
  //         // toast.success("Deleted successfully");
  //       }
  //     });
  //   }
  // };
  const onDelete = async (id) => {
    if (window.confirm("Are you sure that you want to delete this user?")) {

      try {
        // Step 1: Delete the user from Firebase Authentication
        DeleteApi(id)
          .then(() => {
            // If the user is deleted successfully, you can perform any additional actions here
            toast.success("User deleted successfully.");
          })
          .catch((error) => {
            // Handle any errors that occur during user deletion
            toast.error("Error deleting user: " + error.message);
          });

        // Step 2: Delete user data from Realtime Database
        remove(ref(fireDb, `Users/${id}`), (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("User data deleted from Realtime Database.");
          }
        });
        remove(ref(fireDb, `Details/${id}`), (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("User details data deleted from Realtime Database.");
          }
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        console.log('Error deleting user.');
      }
    }
  };

  
  const handleSendMail = () => {
    // Navigate to the SendMailPage to trigger email sending
    navigate('/sendmail');
  };
  const [forceRerender, setForceRerender] = useState(0);
  const handleGetNextWeekDetails = async () => {
    const firstConfirmation = window.confirm("Are you sure you want to move the data from next week?");

    if (firstConfirmation) {
      const secondConfirmation = window.confirm(
        "The current week details will be permanently deleted. Are you sure you want to continue?"
      );

      if (secondConfirmation) {
        try {
          // Step 1: Delete the data in the "Details" node
          const detailsRef = ref(fireDb, 'Details/');
          await remove(detailsRef);

          console.log("Details data deleted successfully.");

          // Step 2: Move data from "NextWeekDetails" to "Details" node
          const nextWeekDetailsRef = ref(fireDb, 'NextWeekDetails/');
          const snapshot = await get(nextWeekDetailsRef);

          const nextWeekData = snapshot.val();
          if (nextWeekData) {
            // Set the moved data to the "Details" node manually
            await set(detailsRef, nextWeekData);

            console.log("Data moved successfully.");

            // Step 3: Delete data from the "NextWeekDetails" node
            await remove(nextWeekDetailsRef);

            console.log("Next week details data deleted successfully.");
          } else {
            console.log("Next week details data is empty.");
          }
        } catch (error) {
          console.error("Error:", error.message);
        }
      } else {
        return;
      }
    } else {
      return;
    }
  };


  const logoutUser = () => {
    logout();
    navigate('/login')
  }

  return (
    <div>
      <NavBar role="admin" logoutUser={logoutUser} />
      <div style={{ marginTop: "100px" }}>
        <table className="styled-table" ref={tableRef}>
          <colgroup>
            <col style={{ width: "50px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "60px" }} />
            {/* Add col elements for each date in the table */}
            {datesOfNextWeek.map((_, index) => (
              <col key={index} style={{ width: "30px" }} />
            ))}
            {/* Add col elements for each date in the table */}
            {datesOfNextWeek.map((_, index) => (
              <col key={index} style={{ width: "30px" }} />
            ))}
            <col style={{ width: "50px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>

          <thead >
            <tr>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>No</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Name</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Manager</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Product Line</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Shift Timings</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} colSpan={datesOfNextWeek.length}>Need Cab</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} colSpan={datesOfNextWeek.length}>Need Dinner</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Contact No</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Address</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>Action</th>
            </tr>
            <tr>
              {handleGetNextWeekDetails ? (
                <>
                  {/* Render "Yes" for each date in the "Need Cab" row */}
                  {upcomingWeekWorkingDaysWithDates.map((dateInfo, index) => (
                    <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                      <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                      <div>{dateInfo.day}</div>
                    </th>
                  ))}
                  {/* Render "Yes" for each date in the "Need Dinner" row */}
                  {upcomingWeekWorkingDaysWithDates.map((dateInfo, index) => (
                    <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                      <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                      <div>{dateInfo.day}</div>
                    </th>
                  ))}
                </>
              ) : (
                <>
                  {/* Render "Yes" for each date in the "Need Cab" row */}
                  {datesOfNextWeek.map((dateInfo, index) => (
                    <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                      <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                      <div>{dateInfo.day}</div>
                    </th>
                  ))}
                  {/* Render "Yes" for each date in the "Need Dinner" row */}
                  {datesOfNextWeek.map((dateInfo, index) => (
                    <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                      <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                      <div>{dateInfo.day}</div>
                    </th>
                  ))}
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {Object.keys(user).map((id, index) => {
              return (
                <tr key={id}>
                  <th scope="row">{index + 1}</th>
                  <td>{user[id].name}</td>
                  <td>{user[id].managerName}</td>
                  <td>{user[id].teamName}</td>
                  <td>{data[id]?.shiftTimings ?? "-"}</td>
                  {datesOfNextWeek.map((dateInfo, index) => (
                    <td key={index} style={{ textAlign: "center" }}>
                      {data[id]?.cabWorkingDays?.includes(dateInfo.day) === true
                        ? "Yes"
                        : data[id]?.cabWorkingDays?.includes(dateInfo.day) === false
                          ? "No"
                          : "-"}
                    </td>
                  ))}
                  {datesOfNextWeek.map((dateInfo, index) => (
                    <td key={index} style={{ textAlign: "center" }}>
                      {/* Render "Yes" or "No" based on the dinner requirement for the specific date */}
                      {data[id]?.dinnerWorkingDays.includes(dateInfo.day) === true
                        ? "Yes"
                        : data[id]?.dinnerWorkingDays?.includes(dateInfo.day) === false
                          ? "No"
                          : "-"}
                    </td>
                  ))}
                  <td>{data[id]?.contactNumber ?? "-"}</td>
                  <td>{data[id]?.address}</td>
                  <td>
                    <Link>
                      <button className='btn btn-delete' onClick={() => onDelete(id)}>Delete</button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        <div className="export-button-container">
          {/* Hidden anchor element to download the Excel file */}
          <a ref={exportLinkRef} style={{ display: 'none' }} />
          <button onClick={handleGetNextWeekDetails}>Get Next Week Details</button>
          <button onClick={handleExportExcel}>Export excel</button>
        </div>
        <button onClick={handleSendMail}>Send Mail</button>
        
      </div>

    </div>
  );
}
