import React from 'react'
import './LoginPage.css';
import { useState, useEffect } from 'react';
import { LoginApi } from '../services/Api';
import { storeUserData } from '../services/Storage';
import { isAuthenticated } from '../services/Auth';
import { Link, Navigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { fireDb } from '../firebase/firebase';
import { ref, get, onValue } from 'firebase/database';


export default function LoginPage() {

    const initialStateErrors = {
        email: { required: false },
        password: { required: false },
        role: { required: false },
        custom_error: null
    };
    const [errors, setErrors] = useState(initialStateErrors);

    const [loading, setLoading] = useState(false);

    const [selectedOption, setSelectedOption] = useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [displayName, setDisplayName] = useState('');


    const [user, setuser] = useState({});


    // Function to fetch userId based on email from Firebase
    // import { ref, get } from 'firebase/database';

    const fetchUserDataByEmail = async (email) => {
        const userRef = ref(fireDb, 'Users/');
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            for (const userId in userData) {
                if (userData[userId].email === email) {
                    return { userId, role: userData[userId].role };
                }
            }
        }

        return null; // Return null if user not found with the given email
    };
    const [hasPermission, setHasPermission] = useState(true);

    // ...

    // useEffect(() => {
    //   // Perform the permission check whenever inputs.role or selectedOption changes

    // }, [inputs.role, selectedOption]);

    useEffect(() => {

        const startCountRef1 = ref(fireDb, 'Users/');
        onValue(startCountRef1, (snapshot) => {
            const userData = snapshot.val();
            setuser(userData || {});
        });
    }, [])

    const [inputs, setInputs] = useState({
        email: "",
        password: "",
        role: "",
        userId: ""
    })

    const handleSubmit = (event) => {
        event.preventDefault();
        let newErrors = { ...initialStateErrors }; // Copy initial errors to avoid mutation
        let hasError = false;
    
        if (inputs.email === "") {
            newErrors.email.required = true;
            hasError = true;
        }
        if (inputs.password === "") {
            newErrors.password.required = true;
            hasError = true;
        }
        if (selectedOption === "") {
            newErrors.role.required = true;
            hasError = true;
        }
    
        if (!hasError) {
            setLoading(true);
    
            fetchUserDataByEmail(inputs.email)
                .then((userData) => {
                    if (!userData) {
                        setErrors({
                            ...newErrors,
                            custom_error: "User not found with the provided email.",
                        });
                    } else {
                        setInputs({ ...inputs, userId: userData.userId, role: userData.role });
    
                        if (userData.role !== selectedOption) {
                            setHasPermission(false);
                            setErrors({
                                ...newErrors,
                                custom_error: "You do not have permission for this role.",
                            });
                        } else {
                            setHasPermission(true);
                            setErrors({
                                ...newErrors,
                                custom_error: null,
                            });
    
                            LoginApi(inputs)
                                .then((response) => {
                                    setDisplayName(response.data.displayName);
                                    storeUserData(response.data.idToken);
                                    setIsLoggedIn(true);
                                })
                                .catch((err) => {
                                    if (err.code === "ERR_BAD_REQUEST") {
                                        setErrors({ ...newErrors, custom_error: "Invalid Credentials." });
                                    }
                                });
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data", error);
                    setErrors({ ...newErrors });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
            setErrors({ ...newErrors }); // Update errors if there are any
        }
    };
    
    // const handleSubmit = (event) => {
    //     event.preventDefault();
    //     let newErrors = { ...initialStateErrors }; // Copy initial errors to avoid mutation
    //     let hasError = false;

    //     if (inputs.email === "") {
    //         newErrors.email.required = true;
    //         hasError = true;
    //     }
    //     if (inputs.password === "") {
    //         newErrors.password.required = true;
    //         hasError = true;
    //     }
    //     if (selectedOption === "") {
    //         newErrors.role.required = true;
    //         hasError = true;
    //     }

    //     if (!hasError) {
    //         setLoading(true);

    //         fetchUserDataByEmail(inputs.email)
    //             .then((userData) => {
    //                 if (!userData) {
    //                     setErrors({
    //                         ...newErrors,
    //                         custom_error: "User not found with the provided email.",
    //                     });
    //                     setLoading(false);
    //                     return;
    //                 }

    //                 setInputs({ ...inputs, userId: userData.userId, role: userData.role });

    //                 if (userData.role !== selectedOption) {
    //                     setHasPermission(false);
    //                     setErrors({
    //                         ...newErrors,
    //                         custom_error: "You do not have permission for this role.",
    //                     });
    //                 }
    //                 else {
    //                     setHasPermission(true);
    //                     setErrors({
    //                         ...newErrors,
    //                         custom_error: null,
    //                     });

    //                     LoginApi(inputs)
    //                         .then((response) => {
    //                             setDisplayName(response.data.displayName);
    //                             storeUserData(response.data.idToken);
    //                             setIsLoggedIn(true);
    //                         })
    //                         .catch((err) => {
    //                             if (err.code === "ERR_BAD_REQUEST") {
    //                                 setErrors({ ...newErrors, custom_error: "Invalid Credentials." });
    //                             }
    //                         })
    //                         .finally(() => {
    //                             setLoading(false);
    //                         });
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error("Error fetching user data", error);
    //                 setLoading(false);
    //             });
    //     }
    //     else {
    //         setLoading(false);
    //         setErrors({ ...newErrors }); // Update errors if there are any
    //     }
    // };


    const handleInput = (event) => {
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    const handleSelect = (event) => {
        setSelectedOption(event.target.value);
    };

    if (isAuthenticated() && isLoggedIn && hasPermission) {
        if (selectedOption === 'admin') {
            // Redirect to admin page
            return <Navigate to="/admin" />;
        } else if (selectedOption === 'manager') {
            // Redirect to manager page
            return <Navigate to="/manager" />;
        } else if (selectedOption === 'employee') {
            // Redirect to employee page
            return <Navigate to={{
                // pathname: "/employee",
                pathname: `/employee/${inputs.userId}`,
                state: { displayName },
            }}
            />;
        }
    }
    //if (isAuthenticated()) {
    //redirect user to dashboard
    //  return <Navigate to="/dashboard" />
    //}

    return (
        <div>
            <NavBar isLoggedIn={isLoggedIn} />
            <section className="login-block">
                <div className="login-content">
                    <p>Register with Cab & Dine!! Experience a new era of convenience.</p>
                </div>
                <div className="container">
                    <div className="row ">
                        <div className="col login-sec">
                            <h2 className="text-center">Login Now</h2>
                            <form onSubmit={handleSubmit} className="login-form" action="">
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1" className="text-uppercase">Email</label>
                                    <input type="email" className="form-control" onChange={handleInput} name="email" id="" placeholder="email" />
                                    {errors.email.required ?
                                        (<span className="text-danger" >
                                            Email is required.
                                        </span>) : null
                                    }
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputPassword1" className="text-uppercase">Password</label>
                                    <input className="form-control" type="password" onChange={handleInput} name="password" placeholder="password" id="" />
                                    {errors.password.required ?
                                        (<span className="text-danger" >
                                            Password is required.
                                        </span>) : null
                                    }
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role" className="text-uppercase">Role</label>
                                    <select className="form-control" onChange={handleSelect} name="role" value={selectedOption}>
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                    {errors.role.required ?
                                        (<span className="text-danger">
                                            Role is required.
                                        </span>) : null
                                    }
                                </div>

                                <div className="form-group">
                                    {loading ?
                                        (<div className="text-center">
                                            <div className="spinner-border text-primary " role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>) : null
                                    }
                                    <span className="text-danger" >
                                        {errors.custom_error ?
                                            (<p>{errors.custom_error}</p>)
                                            : null
                                        }
                                    </span>
                                    <input type="submit" className="btn btn-login float-right" disabled={loading} value="Login" />
                                </div>
                                <div className="clearfix"></div>
                                <div className="form-group">
                                    <Link to="/#"></Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>

    )
}
