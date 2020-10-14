import React from "react";
import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonButton, IonItem, IonInput } from "@ionic/react";
import { PartProps } from "./Bio";

const Experience: React.FC<PartProps> = ({ user }) => {
  return (
    <>
      {user.experience ? `${user.experience} years experience` : "No experience."}
    </>
  );
}

export default Experience;