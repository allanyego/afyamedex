import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonRow, IonIcon, IonText, IonGrid, IonCol, IonItemSliding, IonItemOptions, IonItemOption } from "@ionic/react";
import moment from "moment";

import UserHeader from "../components/UserHeader";
import { calendarOutline, timeOutline, checkmarkCircle, closeCircle } from "ionicons/icons";
import "./Appointments.css";
import LoadingFallback from "../components/LoadingFallback";
import useToastManager from "../lib/toast-hook";
import { getAppointments } from "../http/appointments";
import { useAppContext } from "../lib/context-lib";
import { USER } from "../http/constants";

export default function Appointments() {
  let [appointments, setAppointments] = useState<any[] | null>(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments(currentUser._id, currentUser.token);
      setAppointments(data);
    } catch (error) {
      onError(error.message);
    }
  };

  useEffect(() => {
    fetchAppointments().then();
    return () => {
      setAppointments = () => null;
    }
  }, [])

  return (
    <IonPage>
      <UserHeader title="Your appointments" />
      <IonContent fullscreen className="appointments-page">
        {!appointments ? (
          <LoadingFallback />
        ) : (
            <AppointmentList appointments={appointments} />
          )}
      </IonContent>
    </IonPage>
  );
}


function AppointmentList({ appointments }: { appointments: any[] }) {
  const { currentUser } = useAppContext() as any;
  return (
    <IonList lines="full">
      {appointments.map(appointment => (

        <IonItemSliding key={appointment._id}>
          <IonItemOptions side="start">
            <IonItemOption color="success">
              <IonIcon slot="icon-only" icon={checkmarkCircle} />
            </IonItemOption>
            <IonItemOption color="danger">
              <IonIcon slot="icon-only" icon={closeCircle} />
            </IonItemOption>
          </IonItemOptions>

          <IonItem>
            <IonLabel>
              <h2 className="ion-text-capitalize">
                {
                  currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
                    appointment.professional.fullName
                  ) : (
                      appointment.patient.fullName
                    )}
              </h2>
              <IonText color="medium">{appointment.subject}</IonText>
              <IonGrid
                className="ion-no-padding datetime-grid"
              >
                <IonRow>
                  <IonCol className="d-flex ion-align-items-center ion-no-padding d-col">
                    <IonIcon icon={calendarOutline} />{" "} {moment(appointment.date).format("MMM Do YYYY")}
                  </IonCol>
                  <IonCol className="d-flex ion-align-items-center ion-no-padding ion-padding-start d-col">
                    <IonIcon icon={timeOutline} />{" "} {moment(appointment.time).format("LT")}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonLabel>
          </IonItem>
        </IonItemSliding>
      ))}
    </IonList>
  );
}