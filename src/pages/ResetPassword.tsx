import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import useToastManager from "../lib/toast-hook";
import { IonButton, IonCol, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonText } from "@ionic/react";
import FormFieldFeedback from "../components/FormFieldFeedback";
import { confirmReset, resetPassword } from "../http/users";
import trimLowerCase from "../lib/trim-lowercase";
import Centered from "../components/Centered";
import { arrowBackSharp } from "ionicons/icons";
import { useHistory } from "react-router";

const passwordChangeSchema = Yup.object({
  resetCode: Yup.string().min(6, "Too short").max(6, "Too long").required("Enter reset code"),
  newPassword: Yup.string().min(8, "Too short.").max(40, "Too long.").required("Enter your password."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm your password"),
});

const resetSchema = Yup.object({
  username: Yup.string().required("Enter a username."),
});

const ResetPassword: React.FC = () => {
  const [user, setUser] = useState({
    username: null,
    hasCode: false,
    activeRequest: false,
  });
  const history = useHistory();
  const { onError, onSuccess } = useToastManager();

  const handleReset = async (values: any, { setSubmitting }: any) => {
    try {
      const username = trimLowerCase(values.username);
      await resetPassword(username);
      setSubmitting(false);
      setUser({
        ...user,
        username,
        hasCode: true,
      });
      onSuccess("Reset code sent to email");
    } catch (error) {
      setSubmitting(false);
      if (error.message === "present_active_request") {
        setUser({
          hasCode: true,
          activeRequest: true,
          ...values,
        });
      }

      onError(error.message);
    }
  };

  const handlePasswordChange = async (values: any, { setSubmitting }: any) => {
    try {
      await confirmReset(user.username, values.newPassword, values.resetCode);
      setSubmitting(false);
      onSuccess("Success. You can now login.");
      history.push("/sign-in");
    } catch (error) {
      setSubmitting(false);
      onError(error.message);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRow className="h100">
          <IonCol className="ion-align-self-center">
            <IonText className="ion-text-center">
              <h1>Reset Password</h1>
            </IonText>
            {user.hasCode ? (
              <ChangePasswordForm
                onSubmit={handlePasswordChange}
                user={user}
              />
            ) : (
                <ResetForm
                  onSubmit={handleReset}
                />
              )}
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;

interface FormProps {
  onSubmit: (...args: any[]) => any,
}

function ResetForm({ onSubmit }: FormProps) {
  const history = useHistory();

  return (
    <Formik
      validationSchema={resetSchema}
      onSubmit={onSubmit}
      initialValues={{}}
    >{({
      handleChange,
      handleBlur,
      errors,
      touched,
      isValid,
      isSubmitting
    }: any) => (
        <Form noValidate>
          <IonText className="ion-text-center">
            <p>Enter your username/email to initiate reset</p>
          </IonText>
          <IonItem className={touched.username && errors.username ? "has-error" : ""}>
            <IonLabel position="floating">Username</IonLabel>
            <IonInput name="username" type="text" onIonChange={handleChange} onIonBlur={handleBlur} />
          </IonItem>
          <FormFieldFeedback {...{ errors, touched, fieldName: "username" }} />
          <IonRow>
            <IonCol>
              <IonButton color="secondary" expand="block" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</IonButton>
            </IonCol>
          </IonRow>
          <Centered>
            <IonButton
              fill="clear"
              color="medium"
              size="small"
              onClick={history.goBack}
            >
              back
              <IonIcon slot="start" icon={arrowBackSharp} />
            </IonButton>
          </Centered>
        </Form>
      )}</Formik>
  );
}

function ChangePasswordForm({ onSubmit, user }: FormProps & {
  user: any,
}) {
  const history = useHistory();

  return (
    <>
      <Formik
        validationSchema={passwordChangeSchema}
        onSubmit={onSubmit}
        initialValues={{}}
      >{({
        handleChange,
        handleBlur,
        errors,
        touched,
        isValid,
        isSubmitting
      }: any) => (
          <Form noValidate>
            <IonText className="ion-text-center">
              {user.activeRequest && (
                <p className="ion-no-margin" style={{
                  color: "var(--ion-color-danger)"
                }}>
                  <strong>You already have an active reset request</strong>
                </p>
              )}
              <p>Use the code in your mail in your mail to complete reset.</p>
            </IonText>
            <IonItem className={touched.resetCode && errors.resetCode ? "has-error" : ""}>
              <IonLabel position="floating">Reset code</IonLabel>
              <IonInput name="resetCode" type="text" onIonChange={handleChange} onIonBlur={handleBlur} />
            </IonItem>
            <FormFieldFeedback {...{ errors, touched, fieldName: "resetCode" }} />

            <IonItem className={touched.newPassword && errors.newPassword ? "has-error" : ""}>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput type="password" name="newPassword" onIonChange={handleChange} onIonBlur={handleBlur} />
            </IonItem>
            <FormFieldFeedback {...{ errors, touched, fieldName: "newPassword" }} />

            <IonItem className={touched.confirmPassword && errors.confirmPassword ? "has-error" : ""}>
              <IonLabel position="floating">Confirm password</IonLabel>
              <IonInput type="password" name="confirmPassword" onIonChange={handleChange} onIonBlur={handleBlur} />
            </IonItem>
            <FormFieldFeedback {...{ errors, touched, fieldName: "confirmPassword" }} />

            <IonRow>
              <IonCol>
                <IonButton color="secondary" expand="block" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</IonButton>
              </IonCol>
            </IonRow>
          </Form>
        )}</Formik>
      <Centered>
        <IonButton
          fill="clear"
          color="medium"
          size="small"
          onClick={history.goBack}
        >
          back
              <IonIcon slot="start" icon={arrowBackSharp} />
        </IonButton>
      </Centered>
    </>
  );
}