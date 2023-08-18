import { useState } from 'react';
import './RegisterPage.css';
import React from 'react';
import { RegisterApi } from '../services/Api';
import { storeUserData } from '../services/Storage';
import { Link, Navigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { toast } from 'react-toastify';
import { fireDb } from '../firebase/firebase';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from "../services/Auth"

export default function RegisterPage() {

  const initialStateErrors = {
    email: { required: false, invalidEmail: false },
    password: { required: false, invalidPassword: false },
    name: { required: false, invalidCharacters: false },
    userId: { required: false },
    teamName: { required: false, invalidCharacters: false },
    managerName: { required: false, invalidCharacters: false },
    role: { required: false },
    custom_error: null,
  };

  const [inputs, setInputs] = useState({
    email: '',
    password: '',
    name: '',
    userId: '',
    teamName: '',
    managerName: '',
    role: '',
  });

  const [errors, setErrors] = useState(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  const navigate = useNavigate();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    let hasError = false;
    const newErrors = { ...initialStateErrors };

    // Validate name to not contain numbers or special characters
    const hasInvalidCharactersName = /[^a-zA-Z ]/.test(inputs.name);
    if (!inputs.name) {
      newErrors.name.required = true;
      hasError = true;
    } else if (hasInvalidCharactersName) {
      newErrors.name.invalidCharacters = true;
      hasError = true;
    }

    // Validate teamName 
    if (!inputs.teamName) {
      newErrors.teamName.required = true;
      hasError = true;
    }

    // Validate managerName to not contain numbers or special characters
    const hasInvalidCharactersManagerName = /[^a-zA-Z ]/.test(inputs.managerName);
    if (!inputs.managerName) {
      newErrors.managerName.required = true;
      hasError = true;
    } else if (hasInvalidCharactersManagerName) {
      newErrors.managerName.invalidCharacters = true;
      hasError = true;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputs.email) {
      newErrors.email.required = true;
      hasError = true;
    } else if (!emailPattern.test(inputs.email)) {
      newErrors.email.invalidEmail = true;
      hasError = true;
    }

    // Validate password
    if (!inputs.password) {
      newErrors.password.required = true;
      hasError = true;
    } else if (inputs.password.length < 6) {
      newErrors.password.invalidPassword = true;
      hasError = true;
    }

    // Validate userId
    if (!inputs.userId) {
      newErrors.userId.required = true;
      hasError = true;
    }

    // Validate role
    if (!inputs.role) {
      newErrors.role.required = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      RegisterApi(inputs)
        .then((response) => {
          storeUserData(response.data.idToken);

          const userPath = `Users/${inputs.userId}`;

          set(ref(fireDb, userPath), {
            name: inputs.name,
            email: inputs.email,
            userId: inputs.userId,
            teamName: inputs.teamName,
            managerName: inputs.managerName,
            role: inputs.role,
            // address: inputs.address,
            // contactNo: inputs.contactNo,
          })
            .then(() => {
              console.log('User data saved successfully!');
              alert("User is registered successfully!");
              setInputs({  // Clear all the fields after successful registration
                email: '',
                password: '',
                name: '',
                userId: '',
                teamName: '',
                managerName: '',
                role: '',
                // address: '',
                // contactNumber: '',
              });
            });
        })
        .catch((err) => {
          if (err.response.data.error.message === 'EMAIL_EXISTS') {
            setErrors({ ...newErrors, custom_error: 'This email is already registered!' });
          } else if (String(err.response.data.error.message).includes('WEAK_PASSWORD')) {
            setErrors({ ...newErrors, custom_error: 'Password should be at least 6 characters!' });
          } else {
            console.error(err); // Log other errors for debugging purposes
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleBlur = (event) => {
    if (event.target.name === 'email') {
      setTouchedEmail(true);
    }
  };

  const logoutUser = () => {
    logout();
    navigate('/login')
  }
  return (
    <div>
      <NavBar logoutUser={logoutUser}/>
      <section className="register-block">
        <div className="container">
          <div className="row">
            <div className="col register-sec">
              <h2 className="text-center">Register Now</h2>

              <form onSubmit={handleSubmit} className="register-form" action="">

                <div className="form-group">
                  <label htmlFor="exampleInputEmail1" className="text-uppercase">
                    Name
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="name" id="" />
                  {errors.name.required ? (
                    <span className="text-danger">Name is required.</span>
                  ) : errors.name.invalidCharacters ? (
                    <span className="text-danger">Name should contain alphabets only</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="exampleInputEmail1" className="text-uppercase">
                    Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={handleInput}
                    onBlur={handleBlur} // Call handleBlur on blur event
                    name="email"
                    id=""
                  />
                  {errors.email.required ? (
                    <span className="text-danger">Email is required.</span>
                  ) : errors.email.invalidEmail && touchedEmail ? (
                    <span className="text-danger">Email is invalid.</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="exampleInputPassword1" className="text-uppercase">
                    Password
                  </label>
                  <input className="form-control" type="password" onChange={handleInput} name="password" id="" />
                  {errors.password.required ? (
                    <span className="text-danger">Password is required.</span>
                  ) : errors.password.invalidPassword ? (
                    <span className="text-danger">Password should be at least 6 characters!</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="userId" className="text-uppercase">
                    User ID
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="userId" id="userId" />
                  {errors.userId.required ? (
                    <span className="text-danger">User ID is required.</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="teamName" className="text-uppercase">
                    Team Name
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="teamName" id="teamName" />
                  {errors.teamName.required ? (
                    <span className="text-danger">Team Name is required.</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="managerName" className="text-uppercase">
                    Manager Name
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="managerName" id="managerName" />
                  {errors.managerName.required ? (
                    <span className="text-danger">Manager Name is required.</span>
                  ) : errors.managerName.invalidCharacters ? (
                    <span className="text-danger">Manager Name should contain alphabets only</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="text-uppercase">
                    Role
                  </label>
                  <select className="form-control" onChange={handleInput} name="role" value={inputs.role}>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                  {errors.role.required ? (
                    <span className="text-danger">Role is required.</span>
                  ) : null}
                </div>

                {/* <div className="form-group">
                  <label htmlFor="address" className="text-uppercase">
                    Address
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="address" id="address" />
                  {errors.address.required ? (
                    <span className="text-danger">Address is required.</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="contactNo" className="text-uppercase">
                    Contact No
                  </label>
                  <input type="text" className="form-control" onChange={handleInput} name="contactNo" id="contactNo" />
                  {errors.contactNo.required ? (
                    <span className="text-danger">Contact No is required.</span>
                  ) : errors.contactNo.invalidNumber ? (
                    <span className="text-danger">Contact No should contain only numbers.</span>
                  ) : errors.contactNo.invalidLength ? (
                    <span className="text-danger">Contact No should contain exactly 10 digits.</span>
                  ) : null}
                </div> */}

                <div className="form-group">
                  <span className="text-danger">
                    {errors.custom_error ? <p>{errors.custom_error}</p> : null}
                  </span>
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary " role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : null}
                  <input type="submit" className="btn btn-login float-right" disabled={loading} value="Register" />
                </div>

                <div className="clearfix"></div>

              
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
