import React from 'react';
import { IonButton, IonContent, IonPage, IonRow, IonCol, IonText, IonRouterLink, IonItem, IonLabel, IonInput, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { signIn } from '../http/users';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import useToastManager from '../lib/toast-hook';
import FormFieldFeedback from '../components/FormFieldFeedback';
import { setObject } from '../lib/storage';
import { STORAGE_KEY } from '../http/constants';
import useMounted from "../lib/mounted-hook";

const loginSchema = Yup.object({
  username: Yup.string().required("Enter your username."),
  password: Yup.string().required("Enter your password.")
});

const SignIn: React.FC = () => {
  const { setCurrentUser } = useAppContext() as any;
  const history = useHistory();
  const { onError } = useToastManager();
  const {isMounted, setMounted} = useMounted();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const { data } = await signIn(values.username.trim(), values.password);
      isMounted && setSubmitting(false);
      isMounted && setCurrentUser(data);
      await setObject(STORAGE_KEY, {
        currentUser: data,
      });

      if (data.accountType) {
        history.push("/app");
      } else {
        history.push("/account-type");
      }
    } catch (error) {
      isMounted && setSubmitting(false);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
  });

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRow className="h100">
          <IonCol className="ion-align-self-center">
            <IonText className="ion-text-center">
              <h1>Sign In</h1>
            </IonText>
            <Formik
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
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
                  <IonItem className={touched.username && errors.username ? "has-error" : ""}>
                    <IonLabel position="floating">Username</IonLabel>
                    <IonInput name="username" type="text" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "username" }} />

                  <IonItem className={touched.password && errors.password ? "has-error" : ""}>
                    <IonLabel position="floating">Password</IonLabel>
                    <IonInput name="password" type="password" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "password" }} />

                  <IonRow>
                    <IonCol>
                      <IonButton color="secondary" expand="block" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</IonButton>
                    </IonCol>
                  </IonRow>
                </Form>
              )}</Formik>
            <IonText className="ion-text-center">
              <p className="ion-no-margin">
                Don't have an account? <IonRouterLink href="/sign-up">Sign up</IonRouterLink>
              </p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default SignIn;
