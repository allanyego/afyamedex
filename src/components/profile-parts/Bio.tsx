import React from "react";
import withEditableFeatures from "./withEditableFeatures";
import { IonText, IonTextarea, IonItem, IonButton } from "@ionic/react";
import { useAppContext } from "../../lib/context-lib";
import { EditableProps } from "./withEditableFeatures";

const Bio: React.FC<EditableProps> = ({ user, isEditting }) => {
  return isEditting ?
    <>
      <IonItem>
        <IonTextarea rows={2} value={user.bio} />
      </IonItem>
      <div className="d-flex ion-justify-content-end">
        <IonButton
          color="success"
          size="small"
        >Save</IonButton>
      </div>
    </> :
    <IonText>
      <p>{user.bio ? user.bio : "No bio"}</p>
    </IonText>;
};

export default withEditableFeatures(Bio);