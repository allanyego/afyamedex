import React, { useState } from "react";
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonRow, IonIcon, IonText, IonGrid, IonCol, IonItemSliding, IonItemOptions, IonItemOption, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import moment from "moment";

import UserHeader from "../components/UserHeader";
import { calendarOutline, timeOutline, checkmarkCircle, closeCircle } from "ionicons/icons";
import "./Appointments.css";
import LoadingFallback from "../components/LoadingFallback";
import useToastManager from "../lib/toast-hook";
import { getAppointments } from "../http/appointments";
import { useAppContext } from "../lib/context-lib";
import { USER, APPOINTMENT } from "../http/constants";
import { editAppointment } from "../http/appointments";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";

export default function Appointments() {
  let [appointments, setAppointments] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments(currentUser._id, currentUser.token);
      isMounted && setAppointments(data);
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    fetchAppointments().then();
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <UserHeader title="Your appointments" />
      <IonContent fullscreen className="appointments-page">
        {loadError ? (
          <ErrorFallback />
        ) : !appointments ? (
          <LoadingFallback />
        ) : (
              <AppointmentList appointments={appointments} />
            )}
      </IonContent>
    </IonPage>
  );
}


function AppointmentList({ appointments }: { appointments: any[] }) {
  return (
    <IonList lines="full">
      {appointments.map(appointment => (
        <AppointmentItem appointment={appointment} key={appointment._id} />

      ))}
    </IonList>
  );
}

const statusClasses = {
  [APPOINTMENT.STATUSES.REJECTED]: "rejected",
  [APPOINTMENT.STATUSES.UNAPPROVED]: "unapproved",
  [APPOINTMENT.STATUSES.APPROVED]: "success",
}

function AppointmentItem({ appointment }: { appointment: any }) {
  const [_appointment, setAppointment] = useState(appointment);
  const [isUpdating, setUpdating] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const updateAppointment = async (status: string) => {
    await editAppointment(_appointment._id, currentUser.token, {
      status: (APPOINTMENT.STATUSES as any)[status]
    });
    setAppointment({
      ..._appointment,
      status,
    })
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

  return (
    <IonItemSliding key={_appointment._id}>
      {currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT && (
        <IonItemOptions side="start">
          {isUpdating ? (
            <LoadingFallback />
          ) : (
              <>
                <IonItemOption color="success" onClick={onApprove}>
                  <IonIcon slot="icon-only" icon={checkmarkCircle} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={onReject}>
                  <IonIcon slot="icon-only" icon={closeCircle} />
                </IonItemOption>
              </>
            )}
        </IonItemOptions>
      )}

      <IonItem>
        <div
          className={"appointment-status " + statusClasses[_appointment.status]}
        ></div>
        <IonLabel>
          <h2 className="ion-text-capitalize">
            {
              currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
                _appointment.professional.fullName
              ) : (
                  _appointment.patient.fullName
                )}
          </h2>
          <IonText color="medium">{_appointment.subject}</IonText>
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
        </IonLabel>
      </IonItem>

    </IonItemSliding>
  );
}