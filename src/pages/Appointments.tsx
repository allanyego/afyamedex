import React, { useState, useRef } from "react";
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonRow, IonIcon, IonText, IonGrid, IonCol, IonItemSliding, IonItemOptions, IonItemOption, useIonViewDidEnter, useIonViewWillLeave, IonLoading, IonModal, IonButton, IonAlert, IonBadge } from "@ionic/react";
import moment from "moment";
import Peer from "peerjs";

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
import { useHistory } from "react-router";

export default function Appointments() {
  let [appointments, setAppointments] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [duration, setDuration] = useState(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const onClose = () => {
    setOpen(false);
    setSelectedAppointment(null);
  };

  const closeAlert = () => setAlertOpen(false);

  const onTapAppointment = (appointment: any) => {
    if (appointment.status !== APPOINTMENT.STATUSES.APPROVED) {
      return;
    }
    setSelectedAppointment(appointment);
    setAlertOpen(true);
  }

  const fetchAppointments = async () => {
    setAppointments(null);
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
              <>
                <IonAlert
                  isOpen={isAlertOpen}
                  onDidDismiss={closeAlert}
                  cssClass="exit-app-alert"
                  header={"Start session"}
                  message="Starting the session will initiate the timer and will be billed at the end. Proceed?"
                  buttons={[
                    {
                      text: 'No',
                      role: 'cancel',
                      cssClass: 'danger',
                      handler: () => true
                    },
                    {
                      text: 'Yes',
                      handler: () => setOpen(true),
                    }
                  ]}
                />

                <IonList lines="full">
                  {appointments.map(appointment => (
                    <AppointmentItem
                      appointment={appointment}
                      key={appointment._id}
                      onTap={onTapAppointment}
                    />
                  ))}
                </IonList>

                <MeetingModal {...{
                  showModal: isOpen,
                  setFinalDuration: setDuration,
                  onClose,
                  selectedAppointment,
                }}
                />
              </>
            )}
      </IonContent>
    </IonPage>
  );
}

const statusClasses = {
  [APPOINTMENT.STATUSES.REJECTED]: "rejected",
  [APPOINTMENT.STATUSES.UNAPPROVED]: "unapproved",
  [APPOINTMENT.STATUSES.APPROVED]: "success",
}

function AppointmentItem({ appointment, onTap }: {
  appointment: any
  onTap: (arg: any) => any,
}) {
  const [_appointment, setAppointment] = useState(appointment);
  const [isUpdating, setUpdating] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const handleClick = () => {
    onTap(appointment);
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

  const Inner = () => (
    <IonItem onClick={handleClick}>
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
  );

  return (
    <>
      {currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT &&
        _appointment.status === APPOINTMENT.STATUSES.UNAPPROVED ? (
          <>
            <Loader isOpen={isUpdating} message="Responding" />
            <IonItemSliding key={_appointment._id}>
              <IonItemOptions side="start">
                <IonItemOption color="success" onClick={onApprove}>
                  <IonIcon slot="icon-only" icon={checkmarkCircle} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={onReject}>
                  <IonIcon slot="icon-only" icon={closeCircle} />
                </IonItemOption>
              </IonItemOptions>
              <Inner key="appointment-inner" />

            </IonItemSliding>
          </>
        ) : (
          <Inner key="appointment-inner" />
        )}

    </>
  );
}

interface LoaderProps {
  isOpen: boolean
  message: string
  duration?: number
};

function Loader({ isOpen, message }: LoaderProps) {
  return (
    <IonLoading
      mode="ios"
      {...{ isOpen, message }}
    />
  );
}

function MeetingModal({ showModal, onClose, selectedAppointment, setFinalDuration }: {
  showModal: boolean,
  onClose: (args?: any) => any,
  selectedAppointment: any,
  setFinalDuration: (args: any) => any,
}) {
  const myVideoFeed = useRef<HTMLVideoElement | null>(null);
  const otherVideoFeed = useRef<HTMLVideoElement | null>(null);
  const [peerHasJoined, setPeerJoined] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const history = useHistory();
  const { socket, currentUser } = useAppContext() as any;
  const [duration, setDuration] = useState(0);
  const { isMounted, setMounted } = useMounted();

  let interval: NodeJS.Timeout;
  let myPeer: Peer;

  const peers: {
    [key: string]: any
  } = {};

  const startTimer = () => {
    interval = setInterval(() => {
      setDuration(dur => ++dur);
    }, 60000);
  };

  const stopTimer = () => {
    clearInterval(interval);
  }

  const onCloseModal = () => {
    setAlertOpen(true);
  };

  const onModalClosed = () => {
    if (!peerHasJoined) {
      return onClose();
    }

    setFinalDuration(duration);
    const {
      _id: appointmentId,
      patient,
    } = selectedAppointment;
    onClose();
    if (patient._id !== currentUser._id) {
      return;
    }
    history.push(`/app/checkout/${appointmentId}`, {
      duration,
    })
  };

  const closeAlert = () => isMounted && setAlertOpen(false);

  const onLoadedMetadata = (e: any) => {
    e.target.play();
  };

  const receiveStream = (stream: MediaStream) => {
    setPeerJoined(true);
    addVideoStream(otherVideoFeed.current as any, stream);
  };

  const connectToUser = (userId: string, stream: MediaStream) => {
    const call = myPeer.call(userId, stream);
    call.on("stream", receiveStream);

    call.on("close", () => {
      stopTimer();
      setPeerJoined(false);
      onModalClosed();
    });

    peers[userId] = call;
  };

  const leaveRoom = ({ userId }: {
    userId: string,
  }) => {
    const peer = peers[userId];
    if (peer) {
      console.log(peer, " left");
      peer.close();
    }
  };

  const setup = () => {
    myPeer = new Peer(currentUser._id);
    myPeer.on("open", (id) => {
      window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        addVideoStream(myVideoFeed.current as any, stream);
        socket.emit("join", {
          room: selectedAppointment._id,
        });

        myPeer.on("call", (call) => {
          call.answer(stream);
          !interval && startTimer();
          call.on("stream", receiveStream);
          peers[call.peer] = call;
        });

        socket.on("user-joined", ({ userId }: any) => {
          !interval && startTimer();
          connectToUser(userId, stream);
        });
      });
    });

    socket.on("left-room", leaveRoom);
    socket.on("disconnected", leaveRoom);
  };

  // When current user navigates away
  const tearDown = () => {
    stopTimer();
    for (let peer of Object.keys(peers)) {
      peers[peer].close();
    }

    socket.emit("left-room", {
      room: selectedAppointment._id,
    });

    setMounted(false);
  }

  if (!selectedAppointment) {
    return null;
  }

  return (
    <IonModal isOpen={showModal}
      cssClass='my-custom-class'
      onWillPresent={setup}
      onWillDismiss={tearDown}
    >
      <IonContent fullscreen>
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
              handler: onModalClosed,
            }
          ]}
        />

        <div className="meeting-feed">
          <IonBadge className="duration-badge" color="danger">{duration}min</IonBadge>


          {peerHasJoined && (
            <div>
              <video ref={otherVideoFeed} onLoadedMetadata={onLoadedMetadata}></video>
              <small className="ion-text-capitalize">
                {currentUser._id === selectedAppointment.professional._id ?
                  selectedAppointment.patient.fullName :
                  selectedAppointment.professional.fullName}
              </small>
            </div>
          )}
          <div>
            <video ref={myVideoFeed} playsInline onLoadedMetadata={onLoadedMetadata} muted></video>
            <small className="ion-text-capitalize">{currentUser.fullName}</small>
          </div>

        </div>
      </IonContent>
      <IonButton onClick={onCloseModal} color="danger" fill="outline">Leave</IonButton>
    </IonModal>
  );
}

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
  if (!stream) {
    return;
  }

  video.srcObject = stream;
}