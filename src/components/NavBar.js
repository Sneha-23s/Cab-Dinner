import React from 'react';
import { isAuthenticated,  logout } from '../services/Auth';
import { Link, Navigate } from 'react-router-dom';
import ApteanLogo from '../pics/ApteanLogo.png';

const handleLogout = () => {
    logout(); // Call the logout function from Auth.js
    // You can also add any additional code to handle logout here, such as redirecting to the login page, etc.
    return <Navigate to="/login" />;
  };

export default function NavBar(props){
    const { role, managerId, logoutUser } = props;
    return(
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
            <img src={ApteanLogo} alt="Company Logo" className="company-logo" />
            <a className="navbar-brand" >Cab & Dine</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul className="navbar-nav mr-auto"  >
                    {/* {!isAuthenticated()?<li><Link className="nav-link" to="/login" >Login</Link></li>:null} */}
                    {/* {isAuthenticated() && role === 'admin' ? <li className="nav-item"><Link className="nav-link" to="#">View Details</Link></li>:null} */}
                    {/* {isAuthenticated() && role === 'admin' ? <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>:null} */}
                    {/* {isAuthenticated() && role === 'manager' ? <li className="nav-item"><Link className="nav-link" to="#">Reportees Details</Link></li>:null} */}
                    {isAuthenticated() && role === 'manager' ? <li className="nav-item"><Link className="nav-link" to={`/employee/${managerId}`}>Book a Cab</Link></li>:null}
                    {/* {isAuthenticated() && role === 'employee' ? <li className="nav-item"><Link className="nav-link" to="/employee">Book a Cab</Link></li>:null} */}
                    {isAuthenticated() ? <li><a className="nav-link" onClick={props.logoutUser} style={{ cursor: "pointer" }}>Logout</a></li>:null}
                    </ul>
            </div>
        </nav>
    )
}
         