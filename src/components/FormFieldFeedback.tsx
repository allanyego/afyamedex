import React, { useState, useEffect } from "react";
import { IonText } from "@ionic/react";

interface FeedbackProps {
  errors: any
  touched: any
  fieldName: string
}

export default function FormFieldFeedback({ errors, touched, fieldName }: FeedbackProps) {
  const [error, setError] = useState(touched[fieldName] && errors[fieldName] ?
    errors[fieldName] :
    null
  );

  useEffect(() => {
    setError(touched[fieldName] && errors[fieldName] ?
      errors[fieldName] :
      null
    );
  }, [errors, touched]);

  return error ? (
    <IonText color="danger" className="ion-padding-start">
      <small>{error}</small>
    </IonText>
  ) : null;
}