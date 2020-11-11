import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRow, IonCol, IonText, IonRouterLink, IonInput, IonItem, IonLabel, IonItemDivider, IonSelect, IonSelectOption, IonDatetime } from '@ionic/react';
import React, { useEffect } from 'react';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { signUp } from '../http/users';
import { useAppContext } from '../lib/context-lib';
import useToastManager from '../lib/toast-hook';
import FormFieldFeedback from '../components/FormFieldFeedback';
import { setObject } from '../lib/storage';
import { REGEX, STORAGE_KEY } from '../http/constants';
import useMounted from '../lib/mounted-hook';

const signUpSchema = Yup.object({
  fullName: Yup.string().required("Enter your full name.")
    .matches(REGEX.FULL_NAME, "Invalid name (letters only)"),
  email: Yup.string().email("Enter a valid email.").required("Enter your email."),
  username: Yup.string().required("Enter a username.")
    .matches(REGEX.USERNAME, "Invalid username (letters and numbes only)"),
  gender: Yup.mixed().oneOf(["male", "female"]),
  birthday: Yup.date(),
  password: Yup.string().min(8, "Too short.").max(32, "Too long.").required("Enter your password."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Confirm your password."),
});

const SignUp: React.FC = () => {
  const { setCurrentUser } = useAppContext() as any;
  const history = useHistory()
  const { isMounted, setMounted } = useMounted();
  const { onError, onSuccess } = useToastManager();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      delete values.confirmPassword;
      const { data } = await signUp(values);
      setCurrentUser(data);
      isMounted && setSubmitting(false);
      await setObject(STORAGE_KEY, {
        currentUser: data,
      });
      onSuccess("Welcome, " + data.username + ". Setup you account type");
      history.push("/account-type");
    } catch (error) {
      isMounted && setSubmitting(false);
      onError(error.message);
    }
  };

  useEffect(() => () => setMounted(false));

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRow className="h100">
          <IonCol className="ion-align-self-center">
            <IonText className="ion-text-center">
              <h1>Sign Up</h1>
            </IonText>
            <Formik
              validationSchema={signUpSchema}
              onSubmit={handleSubmit}
              initialValues={{}}
            >{({
              handleChange,
              handleBlur,
              errors,
              touched,
              isValid,
              isSubmitting,
            }: any) => (
                <Form noValidate>
                  <IonItem className={touched.fullName && errors.fullName ? "has-error" : ""}>
                    <IonLabel position="floating">Full name</IonLabel>
                    <IonInput type="text" name="fullName" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "fullName" }} />

                  <IonItem className={touched.email && errors.email ? "has-error" : ""}>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput type="email" name="email" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "email" }} />

                  <IonItem className={touched.username && errors.username ? "has-error" : ""}>
                    <IonLabel position="floating">Username</IonLabel>
                    <IonInput type="text" name="username" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "username" }} />

                  <IonText color="medium" className="ion-margin-top">
                    <small>Leave <strong>
                      gender</strong> and <strong>
                        birthday</strong> fields empty if you wish to join as an <strong>
                        institution</strong>.</small>
                  </IonText>
                  <IonRow>
                    <IonCol>
                      <IonItem className={touched.gender && errors.gender ? "has-error" : ""}>
                        <IonLabel>Gender</IonLabel>
                        <IonSelect name="gender" onIonChange={handleChange} onIonBlur={handleBlur}>
                          <IonSelectOption value="female">Female</IonSelectOption>
                          <IonSelectOption value="male">Male</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      <FormFieldFeedback {...{ errors, touched, fieldName: "gender" }} />
                    </IonCol>
                    <IonCol>
                      <IonItem className={touched.birthday && errors.birthday ? "has-error" : ""}>
                        <IonLabel>Birthday</IonLabel>
                        <IonDatetime displayFormat="MM DD YY" name="birthday" onIonChange={handleChange} onIonBlur={handleBlur} />
                      </IonItem>
                      <FormFieldFeedback {...{ errors, touched, fieldName: "birthday" }} />
                    </IonCol>
                  </IonRow>
                  <IonItem className={touched.password && errors.password ? "has-error" : ""}>
                    <IonLabel position="floating">Password</IonLabel>
                    <IonInput type="password" name="password" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "password" }} />

                  <IonItem className={touched.confirmPassword && errors.confirmPassword ? "has-error" : ""}>
                    <IonLabel position="floating">Confirm password</IonLabel>
                    <IonInput type="password" name="confirmPassword" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "confirmPassword" }} />

                  <IonRow>
                    <IonCol>
                      <IonButton
                        color="secondary"
                        expand="block"
                        type="submit"
                        disabled={!isValid || isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </Form>
              )}</Formik>
            <IonText className="ion-text-center">
              <p className="ion-no-margin">
                Already have an account? <IonRouterLink href="/sign-in">Sign in</IonRouterLink>
              </p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default SignUp;
