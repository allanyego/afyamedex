import React from "react";
import { IonItem, IonInput, IonButton, IonText } from "@ionic/react";

import withEditableFeatures, { EditableProps } from "./withEditableFeatures";

const Names: React.FC<EditableProps> = ({ user, isEditting }) => {
  return (
    <h4>
      {isEditting ? (
        <>
          <IonItem>
            <IonInput value={user.fullName} />
          </IonItem>
          <div className="d-flex ion-justify-content-end">
            <IonButton
              color="success"
              size="small"
            >Save</IonButton>
          </div>
        </>
      ) : (
          <>
            <span className="ion-text-capitalize">
              {user.fullName}
            </span><br />
          </>
        )}
      <IonText color="medium"><small>@{user.username}</small></IonText>
    </h4>
  )
};

export default withEditableFeatures(Names);