import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { voteActions } from '../store/vote-slice';

const Login = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
  };

  const loginVoter = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    if (!userData.email || !userData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/voters/login`,
        userData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const newVoter = response.data;
      localStorage.setItem("currentUser", JSON.stringify(newVoter));
      dispatch(voteActions.changeCurrentVoter(newVoter));
      navigate("/elections");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Login failed. Please try again."
      );
    }
  };

  return (
    <section className="register">
      <div className="container register_container">
        <h2>Sign In</h2>
        <form onSubmit={loginVoter}>
          {error && <p className="form_error-message">{error}</p>}
          <input
            type="email"
            name="email"
            value={userData.email} // ✅ binding value
            placeholder="Email Address"
            onChange={changeInputHandler}
            autoComplete="true"
            autoFocus
          />
          <input
            type="password"
            name="password"
            value={userData.password} // ✅ binding value
            placeholder="Password"
            onChange={changeInputHandler}
            autoComplete="true"
          />
          <p>Don't have an account? <Link to="/Register">Sign up</Link></p>
          <button type="submit" className="btn primary">Sign In</button>
        </form>
      </div>
    </section>
  );
};

export default Login;
