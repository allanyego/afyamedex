import React, { useState } from "react";
import { IonPage, IonContent, IonList, useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";

import UserHeader from "../components/UserHeader";
import LoadingFallback from "../components/LoadingFallback";
import useToastManager from "../lib/toast-hook";
import { getAppointments } from "../http/appointments";
import { useAppContext } from "../lib/context-lib";
import { APPOINTMENT } from "../http/constants";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";
import { useHistory } from "react-router";
import AppointmentItem from "../components/AppointmentItem";
import "./Appointments.css";

export default function Appointments() {
  let [appointments, setAppointments] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const history = useHistory();
  const { onError } = useToastManager();
  const { currentUser, setActiveAppointment } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const onTapAppointment = (appointment: any) => {
    const isRejected = appointment.status === APPOINTMENT.STATUSES.REJECTED;
    const isNotApproved = appointment.status === APPOINTMENT.STATUSES.UNAPPROVED;
    const isClosed = appointment.status === APPOINTMENT.STATUSES.CLOSED;
    const isUnbilled = !appointment.hasBeenBilled;
    const isCurrentUserPatient = (appointment.patient._id === currentUser._id);

    if (isRejected || (isCurrentUserPatient && isNotApproved)) {
      return;
    }

    if (isClosed && isUnbilled && isCurrentUserPatient) {
      history.push("/app/appointments/checkout/" + appointment._id, {
        ...appointment,
      });
    } else {
      setActiveAppointment(appointment);
      if (appointment.type === APPOINTMENT.TYPES.VIRTUAL_CONSULTATION) {
        history.push("/app/appointments/virtual", {
          ...appointment,
        });
      } else if (appointment.type === APPOINTMENT.TYPES.ONSITE_CONSULTATION) {
        history.push("/app/appointments/on-site", {
          ...appointment,
        });
      } else {
        history.push("/app/appointments/tests", {
          ...appointment,
        });
      }
    }
  }

  const fetchAppointments = async () => {
    if (isMounted) {
      setAppointments(null);
      setLoadError(false);
    }

    try {
      const { data } = await getAppointments(currentUser._id, currentUser.token);
      isMounted && setAppointments(data);
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    setActiveAppointment(null);
    fetchAppointments();
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
              <IonList lines="full">
                {appointments.map(appointment => (
                  <AppointmentItem
                    appointment={appointment}
                    key={appointment._id}
                    onTap={onTapAppointment}
                  />
                ))}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  );
}
