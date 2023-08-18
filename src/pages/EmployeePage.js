import React from 'react';
import { useState, useEffect } from 'react';
import './EmployeePage.css';
import NavBar from '../components/NavBar';
import axios from "axios";
import { toast } from "react-toastify";
import { fireDb } from "../firebase/firebase";
import { UserDetailsApi } from "../services/Api"
import { logout, isAuthenticated } from "../services/Auth"
import { ref, set } from 'firebase/database';
import { useNavigate, useParams } from 'react-router-dom';
import { onValue } from 'firebase/database';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const EmployeePage = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", localId: "" })
  // info in Details node
  //const [data, setData] = useState({});

  const { id } = useParams();
  const [existuserDetails, setExistuserDetails] = useState({});
  const [nextweekuserDetails, setNextweekuserDetails] = useState({});

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
      setUser(userData || {});
    });
  }, [])

  useEffect(() => {
    if (id) {
      const userDetailsRef = ref(fireDb, `Details/${id}`);
      onValue(userDetailsRef, (snapshot) => {
        const userDetails = snapshot.val();
        setExistuserDetails(userDetails || {});
      });
    } else {
      setExistuserDetails({});
    }
  }, [id]);

  const buttonText = Object.keys(existuserDetails).length ? "Update" : "Submit";

  useEffect(() => {
    if (id) {
      const nextweekDetailsRef = ref(fireDb, `NextWeekDetails/${id}`);
      onValue(nextweekDetailsRef, (snapshot) => {
        const nextweekDetails = snapshot.val();
        setNextweekuserDetails(nextweekDetails || {});
      });
    } else {
      setNextweekuserDetails({});
    }
  }, [id]);


  useEffect(() => {
    // Check if existuserDetails has data (user has already submitted the form)
    if (Object.keys(existuserDetails).length > 0) {
      setHasSubmitted(true);
    } else {
      setHasSubmitted(false);
    }
  }, [existuserDetails]);

  const initialStateErrors = {
    shiftTimings: { required: false },
    isCabRequirement: { required: false },
    cabWorkingDays: { required: false },
    isDinnerRequired: { required: false },
    dinnerWorkingDays: { required: false },
    address: { required: false },
    contactNumber: { required: false, invalidNumber: false, invalidLength: false },
  };

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(initialStateErrors);

  const [shiftTimings, setShiftTimings] = useState('');
  const [isCabRequirement, setIsCabRequirement] = useState(false);
  const [cabWorkingDays, setCabWorkingDays] = useState([]);
  const [isDinnerRequired, setIsDinnerRequired] = useState(false);
  const [dinnerWorkingDays, setDinnerWorkingDays] = useState([]);
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [shownextweekdate, setshownextweekdate] = useState(false);

  const [shouldShowForm, setShouldShowForm] = useState(false);

  // Function to reset the form fields to initial state
  const resetForm = () => {
    setShiftTimings('');
    setIsCabRequirement(false);
    setCabWorkingDays([]);
    setIsDinnerRequired(false);
    setDinnerWorkingDays([]);
    setAddress('');
    setContactNumber('');
  };

  useEffect(() => {
    if (!hasSubmitted) {
      // If the user has not submitted the form, show the option to provide details for the next week
      setShowForm(true);
    }
  }, [hasSubmitted, showForm]);

  useEffect(() => {
    if (existuserDetails) {
      setShiftTimings(existuserDetails.shiftTimings || '');
      setIsCabRequirement(existuserDetails.isCabRequirement || '');
      setCabWorkingDays(existuserDetails.cabWorkingDays || []);
      setIsDinnerRequired(existuserDetails.isDinnerRequired || '');
      setDinnerWorkingDays(existuserDetails.dinnerWorkingDays || []);
      setAddress(existuserDetails.address || '');
      setContactNumber(existuserDetails.contactNumber || '');
    }
  }, [existuserDetails]);

  const handleShiftTimingsChange = (event) => {
    setShiftTimings(event.target.value);
  };

  const handleCabRequirementChange = (event) => {
    const value = event.target.value;
    setIsCabRequirement(value === 'required');

    if (value === 'notRequired') {
      // If cab is not required, clear the selected working days for cab
      setCabWorkingDays([]);
      // Set the dinnerWorkingDays state to an array containing "No" for the next five days
      setCabWorkingDays(Array.from({ length: 5 }, () => 'No'));
    }
    //setIsCabRequirement(event.target.value === 'required');
  };

  const isDateEditable = (date) => {
    const currentDate = new Date();
    const selectedDate = new Date(`${date.month} ${date.date}, ${date.year} 00:00:00`);

    // Check if the selected date is in the future
    return selectedDate >= currentDate;
  };

  const handleEditCurrentWeekDetails = () => {
    setHasSubmitted(false);
    setShowForm(true);
    setshownextweekdate(false);
    setShouldShowForm(true);
    navigate(`/employee/${id}-edit/currentweek`);
  };

  const handleProvideNextWeekDetails = () => {
    setHasSubmitted(false);
    // resetForm();
    setShowForm(true);
    setShouldShowForm(true);
    setshownextweekdate(true);
    setShiftTimings(nextweekuserDetails.shiftTimings || '');
    setIsCabRequirement(nextweekuserDetails.isCabRequirement || '');
    setCabWorkingDays(nextweekuserDetails.cabWorkingDays || []);
    setIsDinnerRequired(nextweekuserDetails.isDinnerRequired || '');
    setDinnerWorkingDays(nextweekuserDetails.dinnerWorkingDays || []);
    setAddress(nextweekuserDetails.address || '');
    setContactNumber(nextweekuserDetails.contactNumber || '');
    navigate(`/employee/${id}-edit/nextweek`);
  };

  let date;
  const handleCabWorkingDaysChange = (event) => {
    const { name, checked } = event.target;
    if (handleProvideNextWeekDetails) {
      date = upcomingWeekWorkingDaysWithDates.find((day) => day.day === name);
    } else {
      date = workingDaysWithDates.find((day) => day.day === name);
    }

    // Check if the selected date is editable (in the future)
    if (isDateEditable(date)) {
      if (checked) {
        setCabWorkingDays((prevDays) => [...prevDays, name]);
      } else {
        setCabWorkingDays((prevDays) => prevDays.filter((day) => day !== name));
      }
    }
  };

  const handleDinnerRequirementChange = (event) => {
    const value = event.target.value;
    setIsDinnerRequired(value === 'required');

    if (value === 'notRequired') {
      // If cab is not required, clear the selected working days for Dinner
      setDinnerWorkingDays([]);
      // Set the dinnerWorkingDays state to an array containing "No" for the next five days
      setDinnerWorkingDays(Array.from({ length: 5 }, () => 'No'));
    }
    //setIsDinnerRequired(event.target.value === 'required');
  };

  let dinnerdate;
  const handleDinnerWorkingDaysChange = (event) => {
    const { name, checked } = event.target;
    if (handleProvideNextWeekDetails) {
      date = upcomingWeekWorkingDaysWithDates.find((day) => day.day === name);
    } else {
      date = workingDaysWithDates.find((day) => day.day === name);
    }

    // Check if the selected date is editable (in the future)
    if (isDateEditable(date)) {
      if (checked) {
        setDinnerWorkingDays((prevDays) => [...prevDays, name]);
      } else {
        setDinnerWorkingDays((prevDays) => prevDays.filter((day) => day !== name));
      }
    }
  };

  const handlAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleContactNumberChange = (event) => {
    setContactNumber(event.target.value);
  };

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
        const year = nextDate.getFullYear();
        workingDays.push({ day, date, month, year });
      }
      // Increment daysToAdd to go to the next day
      daysToAdd++;
    }
    return workingDays;
  };

  // Check if you are on the desired page where you want the refresh behavior
if (window.location.pathname === `/employee/${id}-edit` || `/employee/${id}`) {
    // Add an event listener to the popstate event (triggered when the user navigates back or forward)
    window.onpopstate = function(event) {
        console.log('popstate event triggered'); // Add this line to log the event
        // Reload the page to ensure the content is up-to-date
        window.location.reload();
    };
}

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

  // useEffect(() => {
  //   const startCountRef = ref(fireDb, 'Details/');
  //   onValue(startCountRef, (snapshot) => {
  //     const detailsData = snapshot.val();
  //     setData(detailsData || {});
  //   });
  // }, [])
  // const newuserDetails = data;
  // //console.log(newuserDetails);

  const workingDaysWithDates = getWorkingDaysWithDates();

  const upcomingWeekWorkingDaysWithDates = getUpcomingWeekWorkingDaysWithDates();

  const handleSubmit = (event) => {
    event.preventDefault();
    let hasError = false;
    const newErrors = { ...initialStateErrors };

    //validate shifttimings
    if (!shiftTimings) {
      newErrors.shiftTimings.required = true;
      hasError = true;
    }

    if (isCabRequirement === '') {
      newErrors.isCabRequirement.required = true;
      hasError = true;
    }

    if (isCabRequirement && cabWorkingDays.length === 0) {
      newErrors.cabWorkingDays.required = true;
      hasError = true;
    }

    if (isDinnerRequired === '') {
      newErrors.isDinnerRequired.required = true;
      hasError = true;
    }

    if (isDinnerRequired && dinnerWorkingDays.length === 0) {
      newErrors.dinnerWorkingDays.required = true;
      hasError = true;
    }

    // Validate address 
    if (!address) {
      newErrors.address.required = true;
      hasError = true;
    }

    // Validate contactNo to allow only numbers and 10 digits
    if (!contactNumber) {
      newErrors.contactNumber.required = true;
      hasError = true;
    } else if (!/^\d*$/.test(contactNumber)) {
      newErrors.contactNumber.invalidNumber = true;
      hasError = true;
    } else if (!/^\d{10}$/.test(contactNumber)) {
      newErrors.contactNumber.invalidLength = true;
      hasError = true;
    }
    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      if (shownextweekdate) {
        const nextweekpath = id ? `NextWeekDetails/${id}` : `NextWeekDetails/${user.name}`;

        set(ref(fireDb, nextweekpath),
          {
            shiftTimings,
            isCabRequirement,
            cabWorkingDays,
            isDinnerRequired,
            dinnerWorkingDays,
            address,
            contactNumber,
          }
        )
          .then(() => {
            console.log('Employee details saved successfully!');
            setLoading(false);
            alert("Your response is saved successfully!");

          })
          .catch((error) => {
            console.error('Error saving employee details:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
      else {
        const userPath = id ? `Details/${id}` : `Details/${user.name}`;

        set(ref(fireDb, userPath),
          {
            shiftTimings,
            isCabRequirement,
            cabWorkingDays,
            isDinnerRequired,
            dinnerWorkingDays,
            address,
            contactNumber,
          }
        )
          .then(() => {
            console.log('Employee details saved successfully!');
            setLoading(false);
            alert("Your response is saved successfully!");

          })
          .catch((error) => {
            console.error('Error saving employee details:', error);
          })
          .finally(() => {
            setLoading(false);
          });
        // axios.post('/api/employee',
        //     {
        //       shiftTimings,
        //       isCabRequirement,
        //       cabWorkingDays,
        //       isDinnerRequired,
        //       dinnerWorkingDays,
        //       contactNo: contactNumber,
        //     })
        //     .then(response => {
        //       console.log('Form data stored in the database:', response.data);
        //       // Perform any further actions after successful storage
        //     })
        //     .catch(error => {
        //       console.error('Error storing form data:', error);
        //       // Handle the error or show an error message to the user
        //     });

      }
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      UserDetailsApi().then((response) => {
        const userDetails = response.data.users[0];
        setUser({
          name: userDetails.displayName,
          email: userDetails.email,
          localId: userDetails.localId,
        });
      })
    }
  }, [])

  const logoutUser = () => {
    logout();
    navigate('/login')
  }

  if (hasSubmitted) {
    return (
      <div>
        <NavBar role="employee" logoutUser={logoutUser} />
        <div className="employee-page">
          <div>
            <h5>The Response has been already Submitted for this week</h5>
            </div><br></br><div>
            {/* <Link to={`/employee/${id}/edit`}> */}
            <button onClick={handleEditCurrentWeekDetails} className="btn btn-primary">
              Edit Current Week Details
            </button>
            {/* </Link> */}
            {/* <Link to={`/employee/${id}/edit`}> */}
            <button onClick={handleProvideNextWeekDetails} className="btn btn-primary">
              Provide Next Week Details
            </button>
          </div>

        </div>
      </div>
    )
  }
  else if (!hasSubmitted ) {
    return (
      <div>
        <NavBar role="employee" logoutUser={logoutUser} />
        <div className="employee-page">
          <h1>Employee Form</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="shiftTimings">Shift Timings</label>
              <select
                className="form-control"
                id="shiftTimings"
                value={shiftTimings}
                onChange={handleShiftTimingsChange}
                required
              >
                <option value="">Select Shift Timings</option>
                <option value="6 AM - 3 PM">6 AM to 3 PM</option>
                <option value="9 AM - 6 PM">9 AM to 6 PM</option>
                <option value="1 PM - 10 PM">1 PM to 10 PM</option>
                <option value="2 PM - 11 PM">2 PM to 11 PM</option>
                <option value="5 PM - 2 PM">5 PM to 2 AM</option>
                <option value="9 PM - 6 PM">9 PM to 6 AM</option>
              </select>
              {errors.shiftTimings.required ? (
                <span className="text-danger">shiftTimings is required.</span>
              ) : null}
            </div>
            <div className="form-group">
              <p>Cab Required:</p>
              <label>
                <input
                  type="radio"
                  name="isCabRequirement"
                  value="required"
                  //checked={isCabRequirement === 'required'}
                  onChange={handleCabRequirementChange}
                />{' '}
                Required
              </label>
              <label>
                <input
                  type="radio"
                  name="isCabRequirement"
                  value="notRequired"
                  //checked={isCabRequirement === 'notRequired'}
                  onChange={handleCabRequirementChange}
                //checked={isCabRequirement === 'notRequired'} 
                />{' '}
                Not Required
              </label>
              {errors.isCabRequirement.required ? (
                <span className="text-danger">required.</span>
              ) : null}
            </div>
            {isCabRequirement && (
              <div className="form-group">
                <p>Select Working Days for Cab:</p>
                {shownextweekdate ? (
                  upcomingWeekWorkingDaysWithDates.map((day) => (
                    <label key={day.day}>
                      <input
                        type="checkbox"
                        name={day.day}
                        checked={cabWorkingDays.includes(day.day)}
                        onChange={handleCabWorkingDaysChange}
                        disabled={!isDateEditable(day)}
                      />
                      {day.day}, {day.date} {day.month}
                    </label>
                  ))
                ) : (
                  workingDaysWithDates.map((day) => (
                    <label key={day.day}>
                      <input
                        type="checkbox"
                        name={day.day}
                        checked={cabWorkingDays.includes(day.day)}
                        onChange={handleCabWorkingDaysChange}
                        disabled={!isDateEditable(day)}
                      />
                      {day.day}, {day.date} {day.month}
                    </label>
                  ))
                )}
                {errors.cabWorkingDays.required ? (
                  <span className="text-danger">Please select at least one working day for Cab..</span>
                ) : null}
              </div>
            )}
            <div className="form-group">
              <p>Dinner Required</p>
              <label>
                <input
                  type="radio"
                  name="isDinnerRequired"
                  value="required"
                  onChange={handleDinnerRequirementChange}
                />{' '}
                Required
              </label>
              <label>
                <input
                  type="radio"
                  name="isDinnerRequired"
                  value="notRequired"
                  onChange={handleDinnerRequirementChange}
                />{' '}
                Not Required
              </label>
              {errors.isDinnerRequired.required ? (
                <span className="text-danger">required.</span>
              ) : null}
            </div>
            {isDinnerRequired && (
              <div className="form-group">
                <p>Select Working Days for Dinner:</p>
                {shownextweekdate ? (
                  upcomingWeekWorkingDaysWithDates.map((day) => (
                    <label key={day.day}>
                      <input
                        type="checkbox"
                        name={day.day}
                        checked={dinnerWorkingDays.includes(day.day)}
                        onChange={handleDinnerWorkingDaysChange}
                        disabled={!isDateEditable(day)}
                      />
                      {day.day}, {day.date} {day.month}
                    </label>
                  ))
                ) : (
                  workingDaysWithDates.map((day) => (
                    <label key={day.day}>
                      <input
                        type="checkbox"
                        name={day.day}
                        checked={dinnerWorkingDays.includes(day.day)}
                        onChange={handleDinnerWorkingDaysChange}
                        disabled={!isDateEditable(day)}
                      />
                      {day.day}, {day.date} {day.month}
                    </label>
                  ))
                )}
                {errors.dinnerWorkingDays.required ? (
                  <span className="text-danger">Please select at least one working day for Cab..</span>
                ) : null}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                value={address}
                onChange={handlAddressChange}
              />
              {errors.address.required ? (
                <span className="text-danger">Address is required.</span>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="text"
                className="form-control"
                id="contactNumber"
                value={contactNumber}
                onChange={handleContactNumberChange}
              />
              {errors.contactNumber.required ? (
                <span className="text-danger">Contact No is required.</span>
              ) : errors.contactNumber.invalidNumber ? (
                <span className="text-danger">Contact No should contain only numbers.</span>
              ) : errors.contactNumber.invalidLength ? (
                <span className="text-danger">Contact No should contain exactly 10 digits.</span>
              ) : null}
            </div>
            <div className="form-group">{loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary " role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : null}
              <button type="submit" className="btn btn-primary">
                {buttonText}
              </button>
            </div>
          </form>
        </div >
      </div >
    )
  }
}

export default EmployeePage;
