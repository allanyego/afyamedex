import { IonButton, IonIcon } from "@ionic/react";
import { checkmarkCircleSharp } from "ionicons/icons";
import React from "react";

const BilledButton: React.FC<{
  amount: number,
}> = ({ amount }) => {
  return (
    <IonButton
      fill="clear"
      color="success"
      disabled
    >
      KES.{amount}
      <IonIcon slot="start" icon={checkmarkCircleSharp} />
    </IonButton>
  );
};

export default BilledButton;