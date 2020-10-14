import React from "react";

import mascot from "../assets/img/error_mascot.png";

const ErrorFallback: React.FC = () => {
  return (
    <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
      <img src={mascot} alt="error mascot" style={{
        display: "block",
        width: "10em",
      }} />
    </div>
  );
};

export default ErrorFallback;