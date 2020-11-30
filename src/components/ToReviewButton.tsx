import { IonButton, IonIcon } from "@ionic/react";
import { starSharp } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { APPOINTMENT } from "../http/constants";

import { useAppContext } from "../lib/context-lib";

const ToReviewButton: React.FC<{
  appointment: any,
}> = ({ appointment }) => {
  const history = useHistory();
  const { currentUser } = useAppContext() as any;

  const toReview = () => history.push("/app/appointments/review", {
    ...appointment
  });

  const { status, patient, hasBeenBilled, hasReview } = appointment;
  const isClosed = status === APPOINTMENT.STATUSES.CLOSED;
  const isCurrentPatient = patient._id === currentUser._id;

  const isVisible = (hasReview && !isCurrentPatient) ||
    (isClosed && isCurrentPatient && hasBeenBilled);
  return (isVisible) ? (
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

export default ToReviewButton;