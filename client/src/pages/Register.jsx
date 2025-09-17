import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    voterId: "",
    phoneNumber: "",
    password: "",
    password2: "",
    dob: ""
  })

  const [error, setError] = useState("");
  const navigate = useNavigate()

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const registerVoter = async (e) => {
    e.preventDefault();
    try {
      const age = calculateAge(userData.dob);
    if (age <= 18) {
      setError("You must be older than 18 years to register.");
      return;
      }
      await axios.post(`${process.env.REACT_APP_API_URL}/voters/register`, userData)
      navigate('/')
    } catch (error) {
      setError(error.response.data.message)
    }
  }

  return (
    <section className="register">
      <div className="container register_container">
        <h2>Sign Up</h2>
        <form onSubmit={registerVoter}>
          {error && <p className="form_error-message">{error}</p>}
          
          <input 
            type="text" 
            name="fullName" 
            placeholder="Full Name" 
            onChange={changeInputHandler} 
            autoComplete="true" 
            autoFocus 
          />
          <input 
            type="date" 
            name="dob" 
            onChange={changeInputHandler} 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            onChange={changeInputHandler} 
            autoComplete="true" 
          />
          <input 
            type="text" 
            name="voterId" 
            placeholder="Voter ID" 
            onChange={changeInputHandler} 
            autoComplete="true" 
          />
          <input 
            type="tel" 
            name="phoneNumber" 
            placeholder="Phone Number" 
            onChange={changeInputHandler} 
            autoComplete="true" 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={changeInputHandler} 
            autoComplete="true" 
          />
          <input 
            type="password" 
            name="password2" 
            placeholder="Confirm Password" 
            onChange={changeInputHandler} 
            autoComplete="true" 
          />

          <p>Already have an account? <Link to="/">Sign in</Link></p>
          <button type="submit" className="btn primary">Register</button>
        </form>
      </div>
    </section>
  );
};

export default Register;
