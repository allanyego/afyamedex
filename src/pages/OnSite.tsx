import { IonAlert, IonButton, IonContent, IonIcon, IonPage, IonText, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import { arrowBackSharp, arrowForwardSharp, playSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import Centered from "../components/Centered";
import { APPOINTMENT } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import { extractForDisplay } from "./Meeting";
import useMounted from "../lib/mounted-hook";
import { editAppointment } from "../http/appointments";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import MeetingMiniInfo from "../components/MeetingMiniInfo";
import pluralizeDuration from "../lib/pluralize-duration";
import BilledButton from "../components/BilledButton";
import ToReviewButton from "../components/ToReviewButton";

const OnSite: React.FC = () => {
  const [isProcessing, setProcessing] = useState(false);
  const { currentUser, activeAppointment } = useAppContext() as any;
  const [_appointment, setAppointment] = useState<any>(null);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const { isMounted, setMounted } = useMounted();
  const { onError } = useToastManager();

  const closeMeeting = async () => {
    if (isMounted) {
      setProcessing(true);
    }

    try {
      const status = APPOINTMENT.STATUSES.CLOSED;
      await editAppointment(_appointment._id, currentUser.token, {
        status,
      });
      isMounted && setAppointment({
        ..._appointment,
        status,
      });
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setProcessing(false);
    }
  }

  // When use attempts to end meeting
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
  closeMeeting: () => any,
}

function ProfessionalView({
  closeMeeting,
  appointment,
}: ViewProps & ProViewProps) {
  return (
    <div>
      {(appointment.status === APPOINTMENT.STATUSES.CLOSED) ? (
        <ViewInner appointment={appointment} />
      ) : (
          <Centered>
            <IonButton color="secondary" size="large" onClick={closeMeeting}>
              Mark closed
              <IonIcon slot="end" icon={playSharp} />
            </IonButton>
          </Centered>
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