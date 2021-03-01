import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  useIonViewDidLeave,
} from '@ionic/react';

import { useAppContext } from '../../lib/context-lib';
import { editAppointment } from "../../http/appointments";
import useToastManager from '../../lib/toast-hook';
import { APPOINTMENT } from "../../http/constants";
import MeetingPage from './MeetingPage';
import MeetingScreen from './MeetingScreen';
import "./Meeting.css";

const Meeting: React.FC = () => {
  const [hasMeetingStarted, setMeetingStarted] = useState(false);
  const [hasMeetingEnded, setMeetingEnded] = useState(false);
  const [hasPeerJoined, setPeerJoined] = useState(false);
  let [isUpdating, setUpdating] = useState(false);
  const { currentUser, activeAppointment } = useAppContext() as any;
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const { onError } = useToastManager();

  const startMeeting = () => {
    setMeetingStarted(true);
    setMeetingEnded(false);
  };
  const stopMeeting = () => {
    setMeetingStarted(false);
    setMeetingEnded(true);
  };
  const onCloseAppointment = async (duration: number) => {
    setUpdating(true);
    try {
      const newDetails = {
        status: APPOINTMENT.STATUSES.CLOSED,
        duration: duration > 10 ? duration : 10,
      };
      hasPeerJoined && (await editAppointment(selectedAppointment._id, currentUser.token, newDetails));
      setUpdating(false);
      setSelectedAppointment({
        ...selectedAppointment,
        ...newDetails,
      });
    } catch (error) {
      setUpdating(false);
      onError(error.message);
    }
  }
  const onUpdateAppointment = (details: any) => {
    setSelectedAppointment({
      ...selectedAppointment,
      ...details,
    });
  }

  useEffect(() => {
    activeAppointment && setSelectedAppointment(activeAppointment);
  }, [activeAppointment]);

  useIonViewDidLeave(() => {
    // setMeetingEnded(false);
    // setMeetingStarted(false);
    // setSelectedAppointment(null);
    // setUpdating(false);
  });

  return (
    <IonPage>
      <IonContent fullscreen className="d-flex">
        {selectedAppointment && (
          <>
            {(!hasMeetingStarted || hasMeetingEnded) ? (
              <MeetingPage
                {...{
                  appointment: selectedAppointment,
                  onUpdateAppointment,
                  hasMeetingStarted,
                  hasMeetingEnded,
                  hasPeerJoined,
                  duration: selectedAppointment.duration,
                  isUpdating,
                  startMeeting,
                }}
              />
            ) : (
                <MeetingScreen {...{
                  stopMeeting,
                  selectedAppointment,
                  onCloseAppointment,
                  hasPeerJoined,
                  setPeerJoined,
                }} />
              )}
          </>
        )}

      </IonContent>
    </IonPage >
  );
};

export default Meeting;