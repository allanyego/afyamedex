import React from "react";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";

import Centered from "../../components/Centered";
import pluralizeDuration from "../../lib/pluralize-duration";
import BilledButton from "../../components/BilledButton";
import { useAppContext } from "../../lib/context-lib";
import { useHistory } from "react-router";
import { arrowBackSharp } from "ionicons/icons";
import { APPOINTMENT } from "../../http/constants";
import ToReviewButton from "../../components/ToReviewButton";
import { extractForDisplay } from "./helpers";
import MeetingMiniInfo from "../../components/MeetingMiniInfo";
import ResponseButtons from "../../components/ResponseButtons";
import Alert from "../../components/Alert";

const JoinButton = ({ onClick }: {
  onClick: any
}) => (
    <Centered>
      <IonButton color="secondary" onClick={onClick}>
        Join
    </IonButton>
    </Centered>
  );

const SessionDetailsPatient: React.FC<{
  duration: number,
  amount: number,
  isUpdating: boolean,
  hasBeenBilled: boolean,
  onClick: (...args: any[]) => any,
}> = ({
  duration,
  amount,
  isUpdating,
  hasBeenBilled,
  onClick,
}) => (
      <div>
        <p>
          <strong>
            {pluralizeDuration(duration)}
          </strong> billed.{!hasBeenBilled && " Proceed to payment..."}
        </p>
        <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
          {hasBeenBilled ? (
            <BilledButton amount={amount} />
          ) : (
              <IonButton color="secondary" onClick={onClick} disabled={isUpdating}>
                {isUpdating ? (
                  <IonSpinner slot="icon-only" name="lines-small" />
                ) : "Pay"}
              </IonButton>
            )}
        </div>
      </div>
    );

const SessionDetailsProfessional: React.FC<{
  hasBeenBilled: boolean,
  amount?: number,
}> = ({ hasBeenBilled, amount }) => (
  <>
    <p>
      Session <strong>closed.</strong>
    </p>
    {hasBeenBilled && (
      <Centered>
        <BilledButton amount={amount!} />
      </Centered>
    )}
  </>
);

interface MeetingPageProps {
  hasMeetingStarted: boolean,
  hasMeetingEnded: boolean,
  isUpdating: boolean,
  appointment: any,
  startMeeting: (...args: []) => any,
  onUpdateAppointment: (newDetails: any) => any,
}

const MeetingPage: React.FC<MeetingPageProps> = ({
  hasMeetingStarted,
  hasMeetingEnded,
  isUpdating,
  appointment,
  startMeeting,
  onUpdateAppointment,
}) => {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();

  const toCheckout = () => {
    history.push("/app/appointments/checkout/" + appointment._id, {
      ...appointment,
    });
  };

  const isClosed = appointment && appointment.status === APPOINTMENT.STATUSES.CLOSED;
  const isUnapproved = appointment && appointment.status === APPOINTMENT.STATUSES.UNAPPROVED;
  const isRejected = appointment && appointment.status === APPOINTMENT.STATUSES.REJECTED;
  const isCurrentPatient = appointment && appointment.patient._id === currentUser._id;

  return (
    <Centered fullHeight>
      <div className="ion-padding-horizontal">
        <h3 className="ion-text-center">
          Virtual consultation
          </h3>
        <div className="d-flex ion-justify-content-between">
          {(hasMeetingEnded || !hasMeetingStarted || isClosed) && (
            <IonButton
              fill="clear"
              color="medium"
              size="small"
              routerLink="/app/appointments">
              Back
              <IonIcon slot="start" icon={arrowBackSharp} />
            </IonButton>
          )}

          <ToReviewButton appointment={appointment} />
        </div>
        <h3>Meeting with <strong className="ion-text-capitalize">
          {extractForDisplay(currentUser, appointment).fullName}
        </strong>
        </h3>

        <MeetingMiniInfo {...appointment} />

        {
          (isClosed) ? (
            appointment.patient._id === currentUser._id ? (
              <SessionDetailsPatient
                isUpdating={isUpdating}
                onClick={toCheckout}
                {...appointment}
              />
            ) : (
                <SessionDetailsProfessional {...appointment} />
              )
          ) : (isUnapproved && !isCurrentPatient) ? (
            <ResponseButtons appointment={appointment} onUpdate={onUpdateAppointment} />
          ) : (isRejected) ? (
            <Alert text="Appointment has been rejected." variant="danger" />
          ) : (
                  <JoinButton onClick={startMeeting} />
                )
        }
      </div>
    </Centered>
  );
};

export default MeetingPage;