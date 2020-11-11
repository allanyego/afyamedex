import React, { useState, PropsWithChildren } from "react";
import { IonItem, IonLabel, IonText, IonGrid, IonRow, IonCol, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, IonButton } from "@ionic/react";
import { calendarOutline, timeOutline, checkmarkCircle, closeCircle, close, checkmark } from "ionicons/icons";
import moment from "moment";

import { APPOINTMENT, USER } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";
import { editAppointment } from "../http/appointments";
import Loader from "./Loader";

const statusClasses = {
  [APPOINTMENT.STATUSES.REJECTED]: "rejected",
  [APPOINTMENT.STATUSES.UNAPPROVED]: "unapproved",
  [APPOINTMENT.STATUSES.APPROVED]: "success",
  [APPOINTMENT.STATUSES.CLOSED]: "closed",
}

interface Props {
  appointment: any
  onTap: (arg: any) => any,
}

const AppointmentItem: React.FC<PropsWithChildren<Props>> = ({ appointment, onTap }) => {
  const [_appointment, setAppointment] = useState(appointment);
  const [isUpdating, setUpdating] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const handleClick = () => {
    onTap(_appointment);
  };

  const updateAppointment = async (status: string) => {
    await editAppointment(_appointment._id, currentUser.token, {
      status: (APPOINTMENT.STATUSES as any)[status]
    });
    setAppointment({
      ..._appointment,
      status,
    });
  }

  const onReject = async () => {
    setUpdating(true);
    try {
      await updateAppointment(APPOINTMENT.STATUSES.REJECTED)
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      onError(error.message);
    }
  };

  const onApprove = async () => {
    setUpdating(true);
    try {
      await updateAppointment(APPOINTMENT.STATUSES.APPROVED);
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      onError(error.message);
    }
  };

  const isCurrentNonPatient = currentUser.accountType &&
    currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT;
  const isCurrentPatient = currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT;
  const isAppointmentPatient = _appointment?.patient?._id === currentUser._id;

  const Inner = () => (
    <IonItem
      onClick={handleClick}
      detail={_appointment.minutesBilled && !_appointment.hasBeenBilled}
    >
      <div
        className={"appointment-status " + statusClasses[_appointment.status]}
      ></div>
      <IonLabel>
        <h2 className="ion-text-capitalize">
          {
            isCurrentPatient ? (
              _appointment.professional.fullName
            ) : (
                _appointment.patient.fullName
              )}
        </h2>
        <IonText color="medium">
          <strong>Subject:{" "}</strong>
          {_appointment.subject}
        </IonText>
        <IonGrid
          className="ion-no-padding datetime-grid"
        >
          <IonRow>
            <IonCol className="d-flex ion-align-items-center ion-no-padding d-col">
              <IonIcon icon={calendarOutline} />{" "} {moment(_appointment.date).format("MMM Do YYYY")}
            </IonCol>
            <IonCol className="d-flex ion-align-items-center ion-no-padding ion-padding-start d-col">
              <IonIcon icon={timeOutline} />{" "} {moment(_appointment.time).format("LT")}
            </IonCol>
          </IonRow>
        </IonGrid>
        {(_appointment.status === APPOINTMENT.STATUSES.CLOSED) && (
          <IonText color="medium" className="ion-text-uppercase">
            {_appointment.status}/{_appointment.hasBeenBilled ?
              `KES.${_appointment.amount}` :
              (isAppointmentPatient ? (
                <strong>
                  <IonText color="secondary">tap to pay</IonText>
                </strong>
              ) : "unpaid")}
          </IonText>
        )}

        {(_appointment.status === APPOINTMENT.STATUSES.UNAPPROVED && isCurrentNonPatient) && (
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol>
                <IonButton
                  expand="block"
                  color="danger"
                  fill="outline"
                  onClick={onReject}
                  disabled={isUpdating}
                  shape="round"
                >
                  Reject
                  <IonIcon slot="end" icon={close} />
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton
                  expand="block"
                  color="success"
                  onClick={onApprove}
                  disabled={isUpdating}
                  shape="round"
                >
                  Approve
                  <IonIcon slot="end" icon={checkmark} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonLabel>
    </IonItem>
  );

  return (
    <>
      <Loader isOpen={isUpdating} message="Responding" />
      <Inner key="appointment-inner" />
    </>
  );
}

export default AppointmentItem;