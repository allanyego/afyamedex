import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import withEditableFeatures, { EditableProps } from "./withEditableFeatures";
import { IonButton, IonRow, IonItem, IonCol, IonInput, IonGrid, IonText, IonBadge } from "@ionic/react";
import FormFieldFeedback from "../FormFieldFeedback";
import { editUser } from "../../http/users";
import { useAppContext } from "../../lib/context-lib";
import useToastManager from "../../lib/toast-hook";

const specialitySchema = Yup.object({
  speciality: Yup.string().required("This shouldn't be empty."),
});

const initialValues: {
  speciality: string
} = {
  speciality: ""
};

const Speciality: React.FC<EditableProps> = ({ user, isEditting }) => {
  const [speciality, setSpeciality] = useState(user.speciality);
  const [isSaving, setSaving] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const handleSubmit = (values: any, { setSubmitting, resetForm }: any) => {
    setSpeciality([...speciality, values.speciality.trim()]);
    setSubmitting(false);
    resetForm({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await editUser(currentUser._id, currentUser.token, {
        speciality
      });
      setSaving(false);
    } catch (error) {
      setSaving(false);
      onError(error.message);
    }
  };

  return (
    <>
      <IonText>
        <h6 className="section-title">Speciality</h6 >
      </IonText >
      {isEditting && (
        <IonGrid>
          <Formik
            validationSchema={specialitySchema}
            onSubmit={handleSubmit}
            initialValues={initialValues}
          >
            {({
              handleChange,
              handleBlur,
              errors,
              values,
              touched,
              isValid,
              isSubmitting,
            }) => (
                <Form noValidate>
                  <IonRow>
                    <IonCol className="ion-no-padding">
                      <IonItem
                        className={touched.speciality && errors.speciality ? "has-error" : ""}
                      >
                        <IonInput
                          value={values.speciality}
                          onIonChange={handleChange}
                          onIonBlur={handleBlur}
                        />
                      </IonItem>
                      <FormFieldFeedback {...{ errors, touched, fieldName: "speciality" }} />
                    </IonCol>
                    <IonCol
                      className="ion-no-padding d-flex ion-align-items-center"
                      size="2">
                      <IonButton expand="block" type="submit"
                        disabled={!isValid || isSubmitting}>
                        Add
                    </IonButton>
                    </IonCol>
                  </IonRow>
                </Form>
              )}
          </Formik>
        </IonGrid>
      )}

      {
        speciality!.map((s, index) => <IonBadge key={index} color="secondary">
          {s}
        </IonBadge>)
      }

      {isEditting && (
        <div className="d-flex ion-justify-content-end">
          <IonButton
            color="success"
            size="small"
            disabled={isSaving}
            onClick={handleSave}
          >Save</IonButton>
        </div>
      )}
    </>
  );
}

export default withEditableFeatures(Speciality);