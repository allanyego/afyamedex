import { IonAlert, IonButton, IonContent, IonIcon, IonPage, IonText, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import { arrowBackSharp, arrowForwardSharp, pauseSharp, playSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import Centered from "../components/Centered";
import { APPOINTMENT } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import useMounted from "../lib/mounted-hook";
import { editAppointment } from "../http/appointments";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import MeetingMiniInfo from "../components/MeetingMiniInfo";
import pluralizeDuration from "../lib/pluralize-duration";
import BilledButton from "../components/BilledButton";
import ToReviewButton from "../components/ToReviewButton";
import { extractForDisplay } from "./meeting/helpers";
import ResponseButtons from "../components/ResponseButtons";
import Alert from "../components/Alert";

const OnSite: React.FC = () => {
  const [isProcessing, setProcessing] = useState(false);
  const [_appointment, setAppointment] = useState<any>(null);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [inSession, setInSession] = useState(false);
  const { currentUser, activeAppointment } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();
  const { onError } = useToastManager();
  let interval: NodeJS.Timeout;

  const startTimer = () => {
    interval = setInterval(() => setDuration((dur: number) => dur + 1), 60000);
  };

  const stopTimer = () => clearInterval(interval);

  const startMeeting = () => {
    setInSession(true);
    startTimer();
  }

  const closeMeeting = async () => {
    stopTimer();
    if (isMounted) {
      setProcessing(true);
      setInSession(false);
    }

    try {
      const newDetails = {
        status: APPOINTMENT.STATUSES.CLOSED,
        duration: duration > 10 ? duration : 10,
      };
      await editAppointment(_appointment._id, currentUser.token, newDetails);
      isMounted && setAppointment({
        ..._appointment,
        ...newDetails,
      });
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      onError(error.message);
    }
  }

  const onUpdate = (newDetails: any) => setAppointment({
    ..._appointment,
    ...newDetails,
  });

  // When user attempts to end meeting
  const onCloseAttempt = () => {
    isMounted && setAlertOpen(true);
  };

  const closeAlert = () => isMounted && setAlertOpen(false);

  useEffect(() => {
    activeAppointment && setAppointment(activeAppointment);
  }, [activeAppointment]);

  useIonViewDidEnter(() => {
    setMounted(true);
  });

  useIonViewWillLeave(() => {
    setMounted(false);
  });

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
              handler: closeMeeting,
            }
          ]}
        />
        <Centered fullHeight>
          {_appointment && (
            <div>
              <h3 className="ion-text-center">
                On-site consultation
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

                <ToReviewButton appointment={_appointment} />
              </div>
              <h3>Meeting with <strong className="ion-text-capitalize">
                {extractForDisplay(currentUser, _appointment).fullName}
              </strong>
              </h3>

              <MeetingMiniInfo {..._appointment} />

              {_appointment.patient._id === currentUser._id ? (
                <PatientView
                  appointment={_appointment}
                />
              ) : isProcessing ? (
                <LoadingFallback fullLength={false} />
              ) : (
                    <ProfessionalView
                      appointment={_appointment}
                      closeMeeting={onCloseAttempt}
                      {...{
                        duration,
                        inSession,
                        startMeeting,
                        onUpdate,
                      }}
                    />
                  )}
            </div>
          )}
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
  duration: number,
  inSession: boolean,
  closeMeeting: () => any,
  startMeeting: () => any,
  onUpdate: (any: any) => any,
}

function ProfessionalView({
  appointment,
  duration,
  inSession,
  closeMeeting,
  startMeeting,
  onUpdate,
}: ViewProps & ProViewProps) {
  const isUnapproved = appointment.status === APPOINTMENT.STATUSES.UNAPPROVED;
  const isClosed = appointment.status === APPOINTMENT.STATUSES.CLOSED;
  const isRejected = appointment.status === APPOINTMENT.STATUSES.REJECTED;

  return (
    <div>
      {(isClosed) ? (
        <ViewInner appointment={appointment} />
      ) : (
          isUnapproved ? (
            <ResponseButtons {...{ appointment, onUpdate }} />
          ) : (isRejected) ? (
            <Alert text="Appointment has been rejected." variant="danger" />
          ) : (
                <Centered>
                  {inSession ? (
                    <IonButton color="secondary" size="large" onClick={startMeeting}>
                      Start meeting
                      <IonIcon slot="end" icon={playSharp} />
                    </IonButton>
                  ) : (
                      <div>
                        <p className="ion-no-margin ion-text-center">
                          <strong>{duration} min</strong>
                        </p>
                        <IonButton color="danger" size="large" onClick={closeMeeting}>
                          End meeting
                        <IonIcon slot="end" icon={pauseSharp} />
                        </IonButton>
                      </div>
                    )}
                </Centered>
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
      ...appointment,
    });
  };

  const { hasBeenBilled } = appointment;

  return (
    <>
      {(appointment.patient._id === currentUser._id) ? (
        <>
          <p><strong>
            {pluralizeDuration(appointment.duration)}
          </strong> billed. {!hasBeenBilled && "Proceed to payment..."}
          </p>
          <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
            {!hasBeenBilled && (
              <IonButton color="secondary" onClick={toCheckout}>
                Pay
                <IonIcon slot="end" icon={arrowForwardSharp} />
              </IonButton>
            )}
          </div>
        </>
      ) : (
          <p>Session <strong>closed</strong>.</p>
        )}
      {hasBeenBilled && (
        <Centered>
          <BilledButton {...appointment} />
        </Centered>
      )}
    </>
  );
}