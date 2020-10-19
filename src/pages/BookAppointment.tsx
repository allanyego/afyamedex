import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonText, IonItem, IonDatetime, IonLabel, IonRow, IonCol, IonButton, IonInput, IonList, IonRadioGroup, IonListHeader, IonRadio, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import { useHistory, useParams } from "react-router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { APPOINTMENT, USER } from "../http/constants";
import { getById } from "../http/users";
import { useAppContext } from "../lib/context-lib";
import { post } from "../http/appointments";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";

const { ONSITE_CONSULTATION, VIRTUAL_CONSULTATION, ONSITE_TESTS } = APPOINTMENT.TYPES;
const appointmentSchema = Yup.object({
  subject: Yup.string().required("Enter subject."),
  date: Yup.date().required("Select preferred date."),
  time: Yup.string().required("Select desired time."),
  type: Yup.string().oneOf([
    VIRTUAL_CONSULTATION,
    ONSITE_CONSULTATION,
    ONSITE_TESTS
  ]).required("Select the type of appointment"),
});

export default function BookAppointment() {
  const { professionalId } = useParams();
  let [professional, setProfessional] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const history = useHistory();
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(() => {
    if (!professionalId) {
      history.push("/app/professionals");
      return;
    }

    getById(professionalId).then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setProfessional(null);
      setLoadError(false);

      if (data && data.username) {
        if (data.accountType === USER.ACCOUNT_TYPES.PATIENT) {
          onError("User is not a professional.");
          history.replace("/app/professionals");
        } else {
          setProfessional(data);
        }
      } else {
        onError("No user found");
        history.replace("/app/professionals");
      }

    }).catch(error => {
      isMounted && setLoadError(true);
      onError(error.message);
    });
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await post(professionalId, currentUser.token, {
        patient: currentUser._id,
        ...values,
      });
      isMounted && setSubmitting(false);
      onSuccess("Nice! You've reserved your place");
      history.goBack();
    } catch (error) {
      isMounted && setSubmitting(false);
      onError(error.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Book appointment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loadError ? (
          <ErrorFallback />
        ) : !professional ? (
          <LoadingFallback />
        ) : (
              <div>
                <Formik
                  validationSchema={appointmentSchema}
                  onSubmit={handleSubmit}
                  initialValues={{}}
                >
                  {({
                    handleChange,
                    handleBlur,
                    errors,
                    touched,
                    isValid,
                    isSubmitting,
                  }: any) => (
                      <Form noValidate>
                        <IonItem className={touched.subject && errors.subject ? "has-error" : ""}>
                          <IonLabel position="floating">Subject</IonLabel>
                          <IonInput type="text" name="subject" onIonChange={handleChange} onIonBlur={handleBlur} />
                        </IonItem>
                        <IonText>
                          <p>Choose a date you would like to see <strong className="ion-text-capitalize">
                            {professional.fullName}
                          </strong></p>
                        </IonText>
                        <IonItem className={touched.date && errors.date ? "has-error" : ""}>
                          <IonLabel>Select date</IonLabel>
                          <IonDatetime displayFormat="MM DD YY" name="date" onIonChange={handleChange} onIonBlur={handleBlur} />
                        </IonItem>
                        <IonItem className={touched.time && errors.time ? "has-error" : ""}>
                          <IonLabel>Time</IonLabel>
                          <IonDatetime displayFormat="hh:mm"
                            name="time" onIonChange={handleChange} onIonBlur={handleBlur}
                          />
                        </IonItem>
                        <IonList>
                          <IonRadioGroup className={touched.type && errors.type ? "has-error" : ""}
                            name="type" onIonChange={handleChange} onBlur={handleBlur}
                          >
                            <IonListHeader>
                              <IonLabel>Appointment type</IonLabel>
                            </IonListHeader>

                            <IonItem>
                              <IonLabel>Onsite consultation</IonLabel>
                              <IonRadio slot="start" value={ONSITE_CONSULTATION} />
                            </IonItem>
                            <IonItem>
                              <IonLabel>Virtual consultation</IonLabel>
                              <IonRadio slot="start" value={VIRTUAL_CONSULTATION} />
                            </IonItem>
                            <IonItem>
                              <IonLabel>Onsite tests</IonLabel>
                              <IonRadio slot="start" value={ONSITE_TESTS} />
                            </IonItem>
                          </IonRadioGroup>
                        </IonList>
                        <IonRow>
                          <IonCol>
                            <IonButton
                              color="secondary"
                              expand="block"
                              type="submit"
                              disabled={!isValid || isSubmitting}
                            >{isSubmitting ? "Booking..." : "Book"}</IonButton>
                          </IonCol>
                        </IonRow>
                      </Form>
                    )}
                </Formik>
              </div>
            )}
      </IonContent>
    </IonPage>
  );
}