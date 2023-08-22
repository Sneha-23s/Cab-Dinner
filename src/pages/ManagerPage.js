import React from 'react';
import NavBar from '../components/NavBar';
import { fireDb } from '../firebase/firebase';
import { ref, onValue } from 'firebase/database';
import { useState, useEffect } from 'react';
//import firebase from "firebase/app";
import "./AdminPage.css";
import { UserDetailsApi } from "../services/Api"
import { logout, isAuthenticated } from "../services/Auth"
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';


export default function ManagerPage() {

  const navigate = useNavigate();
  // info in Details node
  const [data, setData] = useState({});
  // info in users node
  const [user, setuser] = useState({});
  // to get manager
  const [Manager, setManager] = useState({});

  const { id } = useParams();

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

  useEffect(() => {
    if (isAuthenticated()) {
      UserDetailsApi().then((response) => {

        setManager({
          name: response.data.users[0].displayName,
          email: response.data.users[0].email,
          localId: response.data.users[0].localId,
        })
      })
    }
  }, [])

  //To get manager name(bhuvanesh) by his userid(balagar)
  const man = Manager.name;///balagar
  const [Managerdetails, setManagerdetails] = useState({});
  useEffect(() => {
    const startCountRef2 = ref(fireDb, `Users/${man}`);
    onValue(startCountRef2, (snapshot) => {
      const userData = snapshot.val();
      setManagerdetails(userData || {});
    });
  }, []);
  const manid = Managerdetails.name;

  const logoutUser = () => {
    logout();
    navigate('/login')
  }

  return (
    <div>
      <NavBar role="manager" managerId={man} logoutUser={logoutUser} />
      <div style={{ marginTop: "100px" }}>
        <table className="styled-table">
          <colgroup>
            <col style={{ width: "50px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "60px" }} />
            {datesOfNextWeek.map((_, index) => (
              <col key={index} style={{ width: "30px" }} />
            ))}
            {datesOfNextWeek.map((_, index) => (
              <col key={index} style={{ width: "30px" }} />
            ))}
            <col style={{ width: "80px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
          <thead>
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
              {/* Render "Yes" for each date in the "Need Cab" row */}
              {datesOfNextWeek.map((dateInfo, index) => (
                <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                  <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                  <div>{dateInfo.day}</div>
                </th>
              ))}
              {datesOfNextWeek.map((dateInfo, index) => (
                <th key={index} style={{ textAlign: "center", verticalAlign: "middle", height: "30px" }}>
                  <div>{`${dateInfo.month}-${dateInfo.date} `}</div>
                  <div>{dateInfo.day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(user).map((id, index) => {

              const userDetails = user[id];
              // Check if the user has the same managerName as the logged-in manager
              if (userDetails.managerName === manid) {
                return (

                  <tr key={id}>
                    <th scope="row">{index + 1}</th>
                    <td>{user[id].name}</td>
                    <td>{user[id].managerName}</td>
                    <td>{user[id].teamName}</td>
                    <td>{data[id]?.shiftTimings ?? "-"}</td>
                    {/* <td className="center-align">{data[id]?.isCabRequirement === true ? "Yes" : data[id]?.isCabRequirement === false ? "No" : "-"}</td> */}
                    {datesOfNextWeek.map((dateInfo, index) => (
                      <td key={index} style={{ textAlign: "center" }}>
                        {data[id]?.cabWorkingDays?.includes(dateInfo.day) === true
                          ? "Yes"
                          : data[id]?.cabWorkingDays?.includes(dateInfo.day) === false
                            ? "No"
                            : "-"}
                      </td>
                    ))}
                    {/* <td className="center-align">{data[id]?.isDinnerRequired === true ? "Yes" : data[id]?.isDinnerRequirement === false ? "No" : "-"}</td> */}
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
                      <Link to={`/employee/${id}-edit`}>
                        <button className='btn btn-edit'>Edit</button>
                      </Link>
                    </td>
                  </tr>
                )
              }
            })}
          </tbody>

        </table>

      </div>
    </div>
  );
}
