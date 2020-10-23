import React from "react";
import { IonSpinner } from "@ionic/react";
import Centered from "./Centered";

const LoadingFallback: React.FC<{
  fullLength?: boolean
  color?: string,
}> = ({ fullLength = true, color = "dark", children }) => {
  return (
    <Centered fullHeight={fullLength}>
      <div>
        <Centered>
          <IonSpinner color={color} name="crescent" />
        </Centered>
        {children}
      </div>
    </Centered>
  );
};

export default LoadingFallback;