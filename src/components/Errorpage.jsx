import React from "react";
import { useNavigate } from "react-router-dom";

const Errorpage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button className="error-button" onClick={() => navigate("/")}>
        Go to Homepage
      </button>
    </div>
  );
};

export default Errorpage;
