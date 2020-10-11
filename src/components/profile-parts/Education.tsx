import React from "react";
import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonText, IonList, IonItem, IonLabel } from "@ionic/react";
import { trash } from "ionicons/icons";
import moment from "moment";

const Education: React.FC<EditableProps> = ({ user, isEditting }) => {
  return (
    <div>
      <IonText>
        <h6 className="section-title">Education</h6>
      </IonText>
      {/* TODO: A form here */}
      <IonList>
        {user.education!.map((sch) => (
          <IonItemSliding key={sch._id}>
            <IonItemOptions side="start">
              <IonItemOption color="danger">
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>

            <IonItem>
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
          </IonItemSliding>
        ))}
      </IonList>
    </div>
  )
};

export default withEditableFeatures(Education);