import { IonAlert, IonButton, IonContent, IonIcon, IonPage, IonText, useIonViewWillLeave } from "@ionic/react";
import { arrowBackSharp, arrowForwardSharp, checkmarkCircleSharp, playSharp, starSharp, stopSharp } from "ionicons/icons";
import React, { useState } from "react";
import { useHistory, useLocation } from "react-router";
import Centered from "../components/Centered";
import { APPOINTMENT } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import { extractForDisplay } from "./Meeting";
import useMounted from "../lib/mounted-hook";
import { editAppointment } from "../http/appointments";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";

const OnSite: React.FC = () => {
  const [hasMeetingStarted, setMeetingStarted] = useState(false);
  const [hasMeetingEnded, setMeetingEnded] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const { state: selectedAppointment } = useLocation<any>();
  const [_appointment, setAppointment] = useState(selectedAppointment);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  let interval: NodeJS.Timeout;

  const startMeeting = () => {
    setMeetingStarted(true);
    interval = setInterval(() => {
      setDuration((dur: number) => ++dur);
    }, 60000);
  }

  const endMeeting = async () => {
    if (isMounted) {
      setProcessing(true);
      setMeetingStarted(false);
      setMeetingEnded(true);
    }

    clearInterval(interval);
    try {
      await editAppointment(_appointment._id, currentUser.token, {
        minutesBilled: duration > 10 ? duration : 10,
        status: APPOINTMENT.STATUSES.CLOSED,
      });
      isMounted && setAppointment({
        ..._appointment,
        minutesBilled: duration || 1,
      });
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setProcessing(false);
    }
  }

  // When use attempts to end meeting
  const onEndAttempt = () => {
    isMounted && setAlertOpen(true);
  };

  const closeAlert = () => isMounted && setAlertOpen(false);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  if (!selectedAppointment || !selectedAppointment._id) {
    return null;
  }

  console.log("page mounted successfully");

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding-horizontal">
        <IonAlert
          isOpen={isAlertOpen}
          onDidDismiss={closeAlert}
          cssClass="exit-app-alert"
          header={"End session"}
          message="Are you sure you want to end this session?"
          buttons={[
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'danger',
              handler: () => true
            },
            {
              text: 'Yes',
              handler: endMeeting,
            }
          ]}
        />
        <Centered fullHeight>
          <div>
            <div className="d-flex ion-align-items-center ion-justify-content-between">
              {(hasMeetingEnded || !hasMeetingStarted) && (
                <IonButton
                  fill="clear"
                  color="medium"
                  size="small"
                  routerLink="/app/appointments">
                  Back
                  <IonIcon slot="start" icon={arrowBackSharp} />
                </IonButton>
              )}

              <ToReviewButton appointment={selectedAppointment} />
            </div>
            <h3>Meeting with <strong className="ion-text-capitalize">
              {extractForDisplay(currentUser, selectedAppointment).fullName}
            </strong>
            </h3>
            <p>
              <strong>Subject: </strong>{selectedAppointment.subject}
            </p>
            {selectedAppointment.patient._id === currentUser._id ? (
              <PatientView
                appointment={_appointment}
              />
            ) : isProcessing ? (
              <LoadingFallback fullLength={false} />
            ) : (
                  <ProfessionalView
                    appointment={_appointment}
                    startMeeting={startMeeting}
                    endMeeting={onEndAttempt}
                    {...{
                      hasMeetingEnded,
                      hasMeetingStarted,
                      duration,
                    }}
                  />
                )}
          </div>
        </Centered>
      </IonContent>
    </IonPage>
  );
};

export default OnSite;

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
            <p>Session pending. If you are currently in session, wait till the end and then check again</p>
          </IonText>
        )
      }
    </div>
  );
}

interface ProViewProps {
  hasMeetingEnded: boolean
  hasMeetingStarted: boolean
  startMeeting: any
  endMeeting: any
  duration: number
}

function ProfessionalView({
  appointment, hasMeetingEnded, hasMeetingStarted,
  startMeeting, endMeeting, duration
}: ViewProps & ProViewProps) {
  return (
    <div>
      {(appointment.status === APPOINTMENT.STATUSES.CLOSED || hasMeetingEnded) ? (
        <ViewInner appointment={appointment} />
      ) : (
          hasMeetingStarted ? (
            <IonButton color="danger" size="large" onClick={endMeeting}>
              {duration}min
              <IonIcon slot="end" icon={stopSharp} />
            </IonButton>
          ) : (
              <IonButton color="secondary" size="large" onClick={startMeeting}>
                Start
                <IonIcon slot="end" icon={playSharp} />
              </IonButton>

            )
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
      <p>Your session lasted <strong>
        {appointment.minutesBilled}mins {appointment.minutesBilled < 10 && "(billed: 10min)"}
      </strong>. {!appointment.hasBeenBilled && "Proceed to payment..."}
      </p>
      <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
        {appointment.hasBeenBilled ? (
          <IonButton color="success" fill="clear" size="small" disabled>
            Billed
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
        <p>Your session lasted <strong>{appointment.minutesBilled}mins.</strong></p>
      </>
    );
}

export function ToReviewButton({ appointment }: ViewProps) {
  const history = useHistory();
  const toReview = () => history.push("/app/appointments/review", {
    ...appointment
  });

  return (appointment.status === APPOINTMENT.STATUSES.CLOSED &&
    appointment.hasBeenBilled) ? (
      <IonButton
        fill="clear"
        color="warning"
        size="small"
        onClick={toReview}
      >
        Review
        <IonIcon slot="start" icon={starSharp} />
      </IonButton>
    ) : null;
}