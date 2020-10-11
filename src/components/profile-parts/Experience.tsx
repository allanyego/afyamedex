import React from "react";
import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonButton, IonItem, IonInput } from "@ionic/react";

const Experience: React.FC<EditableProps> = ({ user, isEditting }) => {
  return <>
    {isEditting ? (
      <>
        <IonItem>
          <IonInput value={user.experience as any} />
        </IonItem>
        <div className="d-flex ion-justify-content-end">
          <IonButton
            color="success"
            size="small"
          >Save</IonButton>
        </div>
      </>
    ) :
      (
        <>
          {user.experience ? `${user.experience} years experience` : "No experience."}<br />
        </>
      )
    }
  </>
}

export default withEditableFeatures(Experience);