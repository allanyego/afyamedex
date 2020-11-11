import React from "react";

import mascot from "../assets/img/error_mascot.png";
import Centered from "./Centered";

const ErrorFallback: React.FC<{
  fullHeight?: boolean
}> = ({ fullHeight = true, children }) => {
  return (
    <Centered fullHeight={fullHeight}>
      <div>
        <img src={mascot} alt="error mascot" style={{
          display: "block",
          width: "10em",
          margin: "auto",
        }} />
        {children}
      </div>
    </Centered>
  );
};

export default ErrorFallback;