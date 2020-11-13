import { IonAlert, IonButton, IonCard, IonCol, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonText, IonTextarea, useIonViewWillLeave } from "@ionic/react";
import { arrowBackSharp, arrowDownCircleSharp, arrowForwardSharp, attachSharp, checkmarkCircleSharp, playSharp, starSharp, stopSharp } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import download from "downloadjs";

import Centered from "../components/Centered";
import { ALLOWED_FILE_TYPES, APPOINTMENT, MAX_ATTACHMENT_SIZE, ROOT_URL, SERVER_URL } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import useMounted from "../lib/mounted-hook";
import { editAppointment } from "../http/appointments";
import useToastManager from "../lib/toast-hook";
import FormFieldFeedback from "../components/FormFieldFeedback";
import { ToReviewButton } from "./OnSite";

const Tests: React.FC = () => {
  const { state: selectedAppointment } = useLocation<any>();
  const [_appointment, setAppointment] = useState(selectedAppointment);
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const { data } = await editAppointment(_appointment._id, currentUser.token, {
        ...values,
        status: APPOINTMENT.STATUSES.CLOSED,
      }, true);  // true for multi-part data

      isMounted && setAppointment({
        ..._appointment,
        ...values,
        testFile: data.testFile,
        status: APPOINTMENT.STATUSES.CLOSED,
      });
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setSubmitting(false);
    }
  };

  if (!selectedAppointment) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding-horizontal">
        <Centered fullHeight>
          <div>
            <h3 className="ion-text-center">
              Test
          </h3>
            <div className="d-flex ion-align-items-center ion-justify-content-between">
              <IonButton
                fill="clear"
                color="medium"
                size="small"
                routerLink="/app/appointments">
                Back
                <IonIcon slot="start" icon={arrowBackSharp} />
              </IonButton>

              <ToReviewButton appointment={selectedAppointment} />
            </div>
            <h3>Test <strong className="ion-text-capitalize">
              #{selectedAppointment._id}
            </strong>
            </h3>
            <p>
              <strong>Subject: </strong>{selectedAppointment.subject}
            </p>
            {selectedAppointment.patient._id === currentUser._id ? (
              <PatientView
                appointment={_appointment}
              />
            ) : (
                <ProfessionalView
                  appointment={_appointment}
                  handleSubmit={handleSubmit}
                />
              )}
          </div>
        </Centered>
      </IonContent>
    </IonPage>
  );
};

export default Tests;

interface ViewProps {
  appointment: any,
}

function PatientView({ appointment }: ViewProps) {
  return (
    <div>
      {(appointment.status === APPOINTMENT.STATUSES.CLOSED) ? (
        <ViewInner appointment={appointment} />
      ) : (
          <IonText className="ion-text-center">
            <p>
              Youre results are not out yet. Please, check back later.{" "}
              This shouldn't take long.
            </p>
          </IonText>
        )
      }
    </div>
  );
}

const testSchema = Yup.object({
  testFile: Yup.mixed().test("fileSize", "That's too big (5MB max)", (value) =>
    value ? value.size <= MAX_ATTACHMENT_SIZE : true
  ).test("fileType", "Unsupported format (pdf/docx/doc allowed)", (value) =>
    value ? ALLOWED_FILE_TYPES.includes(value.type) : true
  ),
  testSummary: Yup.string().required("a little summary won't hurt"),
  amount: Yup.number().min(50, "Min KES50").required("Please enter amount to charge"),
});

interface ProViewProps {
  handleSubmit: any,
}

function ProfessionalView({
  appointment, handleSubmit
}: ViewProps & ProViewProps) {
  const customUploadInput = useRef<HTMLInputElement | null>(null);

  const onFile = () => customUploadInput.current!.click();

  const wrapFileHandler = (fieldName: any, setFieldValue: any) => {
    return (event: any) => {
      setFieldValue(fieldName, event.currentTarget.files[0]);
    }
  }

  return (
    <div>
      {(appointment.status === APPOINTMENT.STATUSES.CLOSED) ? (
        <ViewInner appointment={appointment} />
      ) : (
          <Formik
            validationSchema={testSchema}
            onSubmit={handleSubmit}
            initialValues={{
              testFile: undefined,
              testSummary: "",
              amount: undefined,
            }}
          >
            {({
              handleChange,
              handleBlur,
              setFieldValue,
              errors,
              values,
              touched,
              isValid,
              isSubmitting
            }) => (
                <Form noValidate>
                  <input
                    name="testFile"
                    type="file"
                    onChange={wrapFileHandler("testFile", setFieldValue)}
                    className="form-control"
                    hidden
                    ref={customUploadInput}
                  />
                  <IonCard button onClick={onFile} style={{
                    padding: "0 var(--padding-start)"
                  }}>
                    <IonText color={errors.testFile ? "danger" : "secondary"}>
                      <div className="d-flex ion-align-items-center ion-justify-content-between">
                        <p>
                          {values.testFile ?
                            (errors.testFile ? "Invalid file" : (values.testFile as any).name) :
                            "Add file"}
                        </p>
                        <p>
                          <IonIcon icon={attachSharp} />
                        </p>
                      </div>
                    </IonText>
                  </IonCard>
                  <FormFieldFeedback
                    {...{ errors, touched: { testFile: true }, fieldName: "testFile" }}
                  />

                  <IonItem className={touched.testSummary && errors.testSummary ? "has-error" : ""}>
                    <IonLabel position="floating">Test summary</IonLabel>
                    <IonTextarea
                      rows={2} name="testSummary" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "testSummary" }} />

                  <IonItem className={touched.amount && errors.amount ? "has-error" : ""}>
                    <IonLabel position="floating">Amount to charge <strong>(KES)</strong></IonLabel>
                    <IonInput name="amount" type="number" onIonChange={handleChange} onIonBlur={handleBlur} />
                  </IonItem>
                  <FormFieldFeedback {...{ errors, touched, fieldName: "amount" }} />

                  <IonRow>
                    <IonCol>
                      <IonButton
                        color="secondary"
                        expand="block"
                        type="submit"
                        disabled={!isValid || isSubmitting}
                      >{isSubmitting ? "Submitting..." : "Submit results"}</IonButton>
                    </IonCol>
                  </IonRow>
                </Form>
              )}
          </Formik>
        )
      }
    </div >
  );
}

function ViewInner({ appointment }: ViewProps) {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const toCheckout = () => {
    history.push("/app/checkout/" + appointment._id, {
      duration: appointment.minutesBilled,
    });
  };

  return (appointment.patient._id === currentUser._id) ? (
    <>
      {(appointment.type === APPOINTMENT.TYPES.ONSITE_TESTS) ? (
        <TestResultView appointment={appointment} />
      ) : (
          <p>Your session lasted <strong>
            {appointment.minutesBilled}mins {appointment.minutesBilled < 10 && "(billed: 10min)"}
          </strong>. {appointment.hasBeenBilled && "Proceed to payment..."}
          </p>
        )}
      <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
        {appointment.hasBeenBilled ? (
          <IonButton color="success" fill="clear" size="small" disabled>
            KES.{appointment.amount}
            <IonIcon slot="end" icon={checkmarkCircleSharp} />
          </IonButton>
        ) : (
            <IonButton color="secondary" onClick={toCheckout}>
              Pay
              <IonIcon slot="end" icon={arrowForwardSharp} />
            </IonButton>
          )}
      </div>
    </>
  ) : (
      <>
        {(appointment.type === APPOINTMENT.TYPES.ONSITE_TESTS) ? (
          <TestResultView appointment={appointment} />
        ) : (
            <p>Your session lasted <strong>{appointment.minutesBilled}mins.</strong></p>
          )}
      </>
    );
}

function TestResultView({ appointment }: ViewProps) {
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess, onInfo } = useToastManager();

  const onDownload = () => {
    let url = `${SERVER_URL}/appointments/test-file/${appointment.testFile}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.token}`
      }
    }).then(function (resp) {
      onInfo("Downloading file");
      return resp.blob();
    }).then(function (blob) {
      (download as any)(blob);
      onSuccess("Downloaded file");
    }).catch(error => onError(error.message));
  };

  return (
    <>
      <div>
        <strong>Test file</strong>{" "}
        <div
          className="d-flex ion-align-items-center"
          onClick={onDownload}
          style={{
            color: "var(--ion-color-primary)",
            cursor: "pointer"
          }}
        >
          <IonText>
            {appointment.testFile}
          </IonText>
          <IonIcon icon={arrowDownCircleSharp} />
        </div>
      </div>
      <strong>Test summary</strong>
      <IonText color="medium">
        <p>{appointment.testSummary}</p>
      </IonText>
    </>
  );
}