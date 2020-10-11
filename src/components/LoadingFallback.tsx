import React from "react";
import { IonSpinner } from "@ionic/react";

const LoadingFallback: React.FC = () => {
  return (
    <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
      <IonSpinner name="crescent" />
    </div>
  );
};

export default LoadingFallback;