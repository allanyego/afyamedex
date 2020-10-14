import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonButton, IonRow, IonItem, IonCol, IonInput, IonGrid, IonText, IonBadge } from "@ionic/react";
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
      {
        user.speciality!.map((s: string, index: number) => <IonBadge key={index} color="secondary">
          {s}
        </IonBadge>)
      }
    </div>
  );
}

export default Speciality;