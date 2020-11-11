import React from "react";

import { IonText, IonBadge } from "@ionic/react";

import { PartProps } from "./Bio";

const Speciality: React.FC<PartProps> = ({ user, currentUserId }) => {
  if (currentUserId !== user._id && !user.speciality!.length) {
    return null;
  }

  return (
    <div>
      <IonText>
        <h6 className="section-title">Speciality</h6 >
      </IonText >
      <div className="profile-badges-container">
        {
          user.speciality!.map((s: string, index: number) => <IonBadge key={index} color="secondary">
            {s}
          </IonBadge>)
        }
      </div>
    </div>
  );
}

export default Speciality;