import React from "react";
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonRow, IonCol, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonText, IonIcon, IonCheckbox } from "@ionic/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppContext } from "../lib/context-lib";
import { addCondition } from "../http/conditions";
import { useHistory } from "react-router";
import useToastManager from "../lib/toast-hook";
import { informationCircle } from "ionicons/icons";

const newConditionSchema = Yup.object({
  name: Yup.string().required("Enter a name for this condition."),
  description: Yup.string().required("Enter condition description."),
  symptoms: Yup.string().required("Enter some symptoms."),
  remedies: Yup.string().required("Enter some remedies."),
  startThread: Yup.boolean(),
});

const NewCondition: React.FC = () => {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const { onError, onSuccess } = useToastManager();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await addCondition(currentUser.token, values);
      setSubmitting(false);
      onSuccess("Condition posted successfully");
      history.push("/app/info");
    } catch (error) {
      setSubmitting(false);
      onError(error.message);
    }
  };

  const wrapHandler = (fieldName: string, setFieldValue: any) => {
    return (e: any) => setFieldValue(fieldName, e.detail.checked);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/info" />
          </IonButtons>
          <IonTitle>Enter condition details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRow>
          <IonCol>
            <Formik
              validationSchema={newConditionSchema}
              onSubmit={handleSubmit}
              initialValues={{}}
            >{({
              handleChange,
              handleBlur,
              setFieldValue,
              errors,
              touched,
              isValid,
              isSubmitting
            }: any) => (
                <Form noValidate>
                  <IonItem className={touched.name && errors.name ? "has-error" : ""}>
                    <IonLabel position="floating">Name</IonLabel>
                    <IonInput
                      placeholder="Name of the condition"
                      name="name"
                      type="text"
                      onIonChange={handleChange}
                      onIonBlur={handleBlur}
                    />
                  </IonItem>

                  <IonItem className={touched.description && errors.description ? "has-error" : ""}>
                    <IonLabel position="floating">Description</IonLabel>
                    <IonTextarea name="description" rows={3}
                      placeholder="A description of the condition"
                      onIonChange={handleChange}
                      onIonBlur={handleBlur}
                    />
                  </IonItem>

                  <IonText className="ion-margin-top d-flex ion-align-items-center">
                    <IonIcon icon={informationCircle} />Write each symptom in a new line
                  </IonText>
                  <IonItem className={touched.symptoms && errors.symptoms ? "has-error" : ""}>
                    <IonLabel position="floating">Symptoms</IonLabel>
                    <IonTextarea name="symptoms" rows={3}
                      placeholder={'one\ntwo\nthree\nfour'} onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>

                  <IonText className="ion-margin-top d-flex ion-align-items-center">
                    <IonIcon icon={informationCircle} />Write each remedy in a new line
                  </IonText>
                  <IonItem className={touched.remedies && errors.remedies ? "has-error" : ""}>
                    <IonLabel position="floating">Remedy</IonLabel>
                    <IonTextarea name="remedies" rows={3}
                      placeholder={'one\ntwo\nthree\nfour'} onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>

                  <IonItem lines="full">
                    <IonLabel>Start matching thread</IonLabel>
                    <IonCheckbox
                      name="startThread"
                      slot="start"
                      onIonChange={wrapHandler("startThread", setFieldValue)}
                    />
                  </IonItem>

                  <IonRow>
                    <IonCol>
                      <IonButton
                        color="secondary"
                        expand="block"
                        type="submit"
                        disabled={!isValid || isSubmitting}
                      >{isSubmitting ? "Submitting..." : "Submit"}</IonButton>
                    </IonCol>
                  </IonRow>
                </Form>
              )}</Formik>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default NewCondition;