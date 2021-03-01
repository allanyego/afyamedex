import React, { useRef } from "react";
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonRow, IonCol, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonText, IonIcon, IonCheckbox, IonGrid } from "@ionic/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppContext } from "../lib/context-lib";
import { addCondition } from "../http/conditions";
import { useHistory } from "react-router";
import useToastManager from "../lib/toast-hook";
import { filmSharp, imageSharp, informationCircle } from "ionicons/icons";
import { ALLOWED_VIDEO_FILE_TYPES, PROFILE_PICTURE_FORMATS, MAX_VIDEO_ATTACHMENT_SIZE } from "../http/constants";
import FormFieldFeedback from "../components/FormFieldFeedback";

const newConditionSchema = Yup.object({
  name: Yup.string().required("Enter a name for this condition."),
  description: Yup.string().required("Enter condition description."),
  symptoms: Yup.string().required("Enter some symptoms."),
  remedies: Yup.string().required("Enter some remedies."),
  startThread: Yup.boolean(),
  media: Yup.mixed().test("fileSize", "That's too big (100MB max)", (value) =>
    value ? value.size <= MAX_VIDEO_ATTACHMENT_SIZE : true
  ).test("fileType", "Unsupported format (mp4/webm allowed)", (value) =>
    value ? (ALLOWED_VIDEO_FILE_TYPES.includes(value.type) ||
      PROFILE_PICTURE_FORMATS.includes(value.type)) : true
  )
});

const NewCondition: React.FC = () => {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const { onError, onSuccess } = useToastManager();
  const customMediaUpload = useRef<HTMLInputElement | null>(null);

  const onMediaFile = () => customMediaUpload.current!.click();

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await addCondition(currentUser.token, {
        ...values,
        symptoms: values.symptoms.trim(),
        remedies: values.remedies.trim(),
      }, !!values.media);
      setSubmitting(false);
      resetForm({});
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

  const wrapFileHandler = (fieldName: any, setFieldValue: any) => {
    return (event: any) => {
      setFieldValue(fieldName, event.currentTarget.files[0]);
    }
  }

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
              initialValues={{
                name: "",
                media: undefined,
                description: "",
                symptoms: "",
                remedies: "",
              }}
            >{({
              handleChange,
              handleBlur,
              setFieldValue,
              values,
              errors,
              touched,
              isValid,
              isSubmitting,
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

                  <IonGrid>
                    <small>(Optional) Attach either a video or an image</small>
                    <IonRow className="ion-justify-content-center">
                      <IonCol size="5">
                        <input
                          name="media"
                          type="file"
                          onChange={wrapFileHandler("media", setFieldValue)}
                          accept="video/*,image/*"
                          hidden
                          ref={customMediaUpload}
                        />
                        <IonButton expand="block" color="medium" onClick={onMediaFile}>
                          <IonIcon icon={filmSharp} slot="start" /> or <IonIcon icon={imageSharp} slot="end" />
                        </IonButton>
                      </IonCol>
                    </IonRow>

                    {values.media && (
                      <p className="ion-no-margin">{values.media.name}</p>
                    )}

                    <FormFieldFeedback
                      {...{ errors, touched: { media: true }, fieldName: "media" }}
                    />
                  </IonGrid>

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