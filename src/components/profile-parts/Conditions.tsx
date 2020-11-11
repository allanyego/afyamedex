import React from "react";
import { IonText, IonBadge } from "@ionic/react";
import { PartProps } from "./Bio";

const Conditions: React.FC<PartProps> = ({ user, currentUserId }) => {
  if (currentUserId !== user._id && !user.speciality!.length) {
    return null;
  }

  return (
    <div>
      <IonText>
        <h6 className="section-title">Conditions</h6 >
      </IonText >
      <div className="profile-badges-container">
        {
          user.conditions.map((c: string, index: number) => <IonBadge key={index} color="secondary">
            {c}
          </IonBadge>)
        }
      </div>
    </div>
  );
}

export default Conditions;