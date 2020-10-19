import React from "react";

import mascot from "../assets/img/error_mascot.png";

const ErrorFallback: React.FC = (props) => {
  return (
    <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
      <div>
      <img src={mascot} alt="error mascot" style={{
        display: "block",
        width: "10em",
        margin: "auto",
      }} />
      {props.children}
      </div>
    </div>
  );
};

export default ErrorFallback;