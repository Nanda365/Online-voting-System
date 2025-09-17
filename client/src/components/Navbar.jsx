import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { IoIosMoon, IoMdSunny } from "react-icons/io";
import { HiOutlineBars3 } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [showNav, setShowNav] = useState(window.innerWidth >= 600);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("voting-app-theme") || "");

  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);
  const token = useSelector(state => state?.vote?.currentVoter?.token)
  

  useEffect(() => {
    document.body.className = darkTheme;
  }, [darkTheme]);

  useEffect(() => {
    const handleResize = () => {
      setShowNav(window.innerWidth >= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeNavMenu = () => {
    if (window.innerWidth < 600) setShowNav(false);
  };

  const toggleTheme = () => {
    const newTheme = darkTheme === "dark" ? "" : "dark";
    localStorage.setItem("voting-app-theme", newTheme);
    setDarkTheme(newTheme);
  };

  return (
    <nav className="navbar">
      <div className="container nav_container">
        <Link to="/elections" className="nav_logo">One Voting</Link>
        <div className="nav_menu-container">
          {token && showNav && (
            <menu className="nav_menu">
              <NavLink to="/elections" onClick={closeNavMenu}>Elections</NavLink>
              {isAdmin ? (
                <NavLink to="/results" onClick={closeNavMenu}>Results</NavLink>
              ) : (
                <>
                  <NavLink to="/voteridpage" onClick={closeNavMenu}>VoterID</NavLink>
                  <NavLink to="/verify-voter" onClick={closeNavMenu}>Voting</NavLink>
                </>
              )}
              <NavLink to="/logout" onClick={closeNavMenu}>Logout</NavLink>
            </menu>
          )}
          <button className="theme_toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {darkTheme === "dark" ? <IoMdSunny /> : <IoIosMoon />}
          </button>
          <button className="nav_toggle-btn" onClick={() => setShowNav(!showNav)} aria-label="Toggle Navigation Menu">
            {showNav ? <AiOutlineClose /> : <HiOutlineBars3 />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
