import { IonCard, IonCardContent, IonText } from "@ionic/react";
import React from "react";

import "./Alert.css";

const Alert: React.FC<{
  text: any,
  variant: "danger" | "success" | undefined,
}> = ({ text, variant = "success" }) => (
  <IonCard>
    <IonCardContent className={"a-alert " + (variant || "")}>
      <IonText>
        <small>{text}</small>
      </IonText>
    </IonCardContent>
  </IonCard>
);

export default Alert;