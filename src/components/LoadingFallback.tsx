import React from "react";
import { IonSpinner } from "@ionic/react";
import Centered from "./Centered";

const LoadingFallback: React.FC<{
  fullLength?: boolean
  color?: string,
  name?: any,
}> = ({ fullLength = true, color = "dark", children, name = "crescent" }) => {
  return (
    <Centered fullHeight={fullLength}>
      <div>
        <Centered>
          <IonSpinner {...{ color, name }} />
        </Centered>
        {children}
      </div>
    </Centered>
  );
};

export default LoadingFallback;