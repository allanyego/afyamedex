import { IonText } from "@ionic/react";
import React from "react";
import LoadingFallback from "./LoadingFallback";

const SuspenseFallback: React.FC = () => {
  return (
    <LoadingFallback color="secondary">
      <IonText className="ion-text-center">
        <p>Just a moment</p>
      </IonText>
    </LoadingFallback>
  );
};

export default SuspenseFallback;