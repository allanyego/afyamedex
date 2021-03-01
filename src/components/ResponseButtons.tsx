import React, { useState } from "react";
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { checkmark, close } from "ionicons/icons";

import { editAppointment } from "../http/appointments";
import { APPOINTMENT } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";

const ResponseButtons: React.FC<{
  appointment: any,
  onUpdate: (any: any) => any,
}> = ({ appointment, onUpdate }) => {
  const [isUpdating, setUpdating] = useState({
    approving: false,
    rejecting: false,
  });
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const updateAppointment = async (status: string) => {
    await editAppointment(appointment._id, currentUser.token, {
      status,
    });
    onUpdate({
      status,
    });
  }

  const onReject = async () => {
    setUpdating({
      ...isUpdating,
      rejecting: true,
    });
    try {
      await updateAppointment(APPOINTMENT.STATUSES.REJECTED)
      setUpdating({
        ...isUpdating,
        rejecting: false,
      });
    } catch (error) {
      setUpdating({
        ...isUpdating,
        rejecting: false,
      });
      onError(error.message);
    }
  };

  const onApprove = async () => {
    setUpdating({
      ...isUpdating,
      approving: true,
    });
    try {
      await updateAppointment(APPOINTMENT.STATUSES.APPROVED);
      setUpdating({
        ...isUpdating,
        approving: false,
      });
    } catch (error) {
      setUpdating({
        ...isUpdating,
        approving: false,
      });
      onError(error.message);
    }
  };

  return (
    <IonGrid className="ion-no-padding ion-margin-top">
      <IonRow>
        <IonCol>
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={onReject}
            disabled={isUpdating.approving || isUpdating.rejecting}
            shape="round"
          >
            {isUpdating.rejecting ? "Rejecting..." : "Reject"}
            <IonIcon slot="end" icon={close} />
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            expand="block"
            color="success"
            onClick={onApprove}
            disabled={isUpdating.approving || isUpdating.rejecting}
            shape="round"
          >
            {isUpdating.approving ? "Approving..." : "Approve"}
            <IonIcon slot="end" icon={checkmark} />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}

export default ResponseButtons;