import React, { PropsWithChildren } from "react";
import { IonItem, IonLabel, IonText, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/react";
import { calendarOutline, timeOutline } from "ionicons/icons";
import moment from "moment";

import { APPOINTMENT, APPOINTMENT_TYPE_LABELS, USER } from "../http/constants";
import { useAppContext } from "../lib/context-lib";
import calculateDuration from "../lib/calculate-duration";

const AppointmentTime: React.FC<{
  date: Date,
  time: Date,
  duration: number,
}> = ({ date, time, duration }) => {
  const endTime = calculateDuration(time, duration);

  const formatTime = (t: Date) => moment(t).format("LT");

  return (
    <IonGrid
      className="ion-no-padding datetime-grid"
    >
      <IonRow>
        <IonCol className="d-flex ion-align-items-center ion-no-padding d-col">
          <IonIcon icon={calendarOutline} />{" "} {moment(date).format("MMM Do YYYY")}
        </IonCol>
        <IonCol className="d-flex ion-align-items-center ion-no-padding ion-padding-start d-col">
          <IonIcon icon={timeOutline} />{" "} {formatTime(time)} - {formatTime(endTime)}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}

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
  const { currentUser } = useAppContext() as any;

  const handleClick = () => {
    onTap(appointment);
  };

  const isCurrentPatient = currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT;
  const isAppointmentPatient = appointment?.patient?._id === currentUser._id;

  const Inner = () => (
    <IonItem
      onClick={handleClick}
      detail={appointment.status === APPOINTMENT.STATUSES.CLOSED && !appointment.hasBeenBilled}
    >
      <div
        className={"appointment-status " + statusClasses[appointment.status]}
      ></div>
      <IonLabel>
        <h2 className="ion-text-capitalize">
          {
            isCurrentPatient ? (
              appointment.professional.fullName
            ) : (
                appointment.patient.fullName
              )}
          {" "}
          <small className="ion-text-uppercase">
            <i>
              <IonText color="medium">
                {APPOINTMENT_TYPE_LABELS[appointment.type]}
              </IonText>
            </i>
          </small>
        </h2>
        <IonText color="medium">
          <strong>Subject:{" "}</strong>
          {appointment.subject}
        </IonText>

        <AppointmentTime {...appointment} />

        <IonText color="medium" className="ion-text-uppercase">
          <small>
            <strong>
              {(appointment.status === APPOINTMENT.STATUSES.CLOSED) ? (
                <>
                  {appointment.status} - {appointment.hasBeenBilled ?
                    `KES.${appointment.amount}` :
                    (isAppointmentPatient ? (
                      <strong>
                        <IonText color="secondary">tap to pay</IonText>
                      </strong>
                    ) : "awaiting payment")}
                </>
              ) : appointment.status}
            </strong>
          </small>
        </IonText>

      </IonLabel>
    </IonItem>
  );

  return (
    <>
      <Inner key="appointment-inner" />
    </>
  );
}

export default AppointmentItem;