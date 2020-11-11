import React from "react";
import { IonText, IonList, IonItem, IonLabel } from "@ionic/react";
import moment from "moment";

import { PartProps } from "./Bio";

const Education: React.FC<PartProps> = ({ user, currentUserId }) => {
  if (currentUserId !== user._id && !user.education!.length) {
    return null;
  }
  return (
    <div>
      <IonText>
        <h6 className="section-title">Education</h6>
      </IonText>
      <IonList>
        {user.education!.map((sch) => (
          <IonItem key={sch._id}>
            <div className="ion-margin-bottom">
              <IonLabel className="ion-text-capitalize"><strong>{sch.institution}</strong></IonLabel>
              <IonText color="medium">
                {moment(sch.startDate).format("MMM YYYY")} - {sch.endDate ? (moment(sch.endDate).format("MMM YYYY")) : "Current"}
              </IonText><br />
              <IonText className="ion-text-capitalize">
                {sch.areaOfStudy}
              </IonText>
            </div>
          </IonItem>
        ))}
      </IonList>
    </div>
  )
};

export default Education;