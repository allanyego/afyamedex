import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonButton, IonRow, IonItem, IonCol, IonInput, IonGrid, IonText, IonBadge } from "@ionic/react";
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
      {
        user.conditions.map((c: string, index: number) => <IonBadge key={index} color="secondary">
          {c}
        </IonBadge>)
      }
    </div>
  );
}

export default Conditions;