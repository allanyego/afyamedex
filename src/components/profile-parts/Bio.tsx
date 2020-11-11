import React from "react";
import { IonText, IonTextarea, IonItem, IonButton } from "@ionic/react";

import { ProfileData } from "../UserProfile";

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