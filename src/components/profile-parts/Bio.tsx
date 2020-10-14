import React from "react";
import withEditableFeatures from "./withEditableFeatures";
import { IonText, IonTextarea, IonItem, IonButton } from "@ionic/react";
import { useAppContext } from "../../lib/context-lib";
import { EditableProps } from "./withEditableFeatures";
import { ProfileData } from "../UserDetails";

export interface PartProps {
  user: ProfileData,
  currentUserId: string,
}

const Bio: React.FC<PartProps> = ({ user, currentUserId }) => {
  if (currentUserId !== user._id && !user.bio) {
    return null;
  }

  return (
    <IonText>
      <p>{user.bio ? user.bio : "No bio"}</p>
    </IonText>
  );
};

export default Bio;