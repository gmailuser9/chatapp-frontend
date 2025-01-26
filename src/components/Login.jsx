import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { realtimeDb } from "./firebase";
import { UserContext } from "./UserContext";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userRef = ref(realtimeDb, `Authentication/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          alert("Logged in successfully!");
          // Store user data in sessionStorage
          sessionStorage.setItem("user", JSON.stringify(userData)); // Temporary session storage
          setUser(userData); // Set user data in context
          navigate("/chat");
        } else {
          alert("Incorrect password.");
        }
      } else {
        alert("User ID not found.");
      }
    } catch (error) {
      alert("Login error. Try again.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <input
        className="login-input"
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        className="login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
      <p className="signup-login-link">
        Not registered?{" "}
        <button
          className="login-navigation-button"
          onClick={() => navigate("/Signup")}
        >
          Signup here
        </button>
      </p>
      <p className="signup-login-link">
        Learn How to use CipherThread?
        <button
          className="login-navigation-button"
          onClick={() => navigate("/Use")}
        >
          click here
        </button>
      </p>
    </div>
  );
};

export default Login;
