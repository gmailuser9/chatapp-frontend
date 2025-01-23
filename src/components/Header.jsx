import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  useEffect(() => {
    // Restore user data from sessionStorage on page refresh
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && !user) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.userId) {
        setUser(parsedUser); // Only set valid user data
      }
    }
  }, [user, setUser]);

  const handleUserClick = () => {
    if (user) navigate("/dashboard");
  };

  // Hide user details on login and signup pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <header className="header">
      <div className="header-logo">CipherThread</div>
      {!isAuthPage && user?.userId ? ( // Show user details only if logged in and not on auth pages
        <div className="header-user" onClick={handleUserClick}>
          <span className="header-user-id">{user.userId}</span>
          <FontAwesomeIcon icon={faUserCircle} className="header-logo-icon" />
        </div>
      ) : null}
    </header>
  );
};

export default Header;
