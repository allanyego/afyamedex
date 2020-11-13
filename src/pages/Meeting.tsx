import React, { useState, useRef, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonIcon,
  useIonViewDidLeave,
  IonAlert,
  IonBadge,
  IonGrid,
  IonSpinner
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router';
import { micSharp, arrowBackSharp, micOffSharp, checkmarkCircleSharp } from 'ionicons/icons';
import Peer from "peerjs";

import { useAppContext } from '../lib/context-lib';
import useMounted from '../lib/mounted-hook';
import { editAppointment } from "../http/appointments";
import useToastManager from '../lib/toast-hook';
import videocamOffSharp from "../assets/img/videocam-off-sharp.svg";
import videocamSharp from "../assets/img/videocam-sharp.svg";
import { ProfileData } from '../components/UserProfile';
import { APPOINTMENT } from "../http/constants";
import Centered from '../components/Centered';
import { ToReviewButton } from './OnSite';
import "./Meeting.css";
import isProduction from '../lib/is-production';

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
      <>
        <p>Your session lasted <strong>
          {duration}mins (billed: 10min)
                    </strong>. Proceed to payment...</p>
        <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
          {hasBeenBilled ? (
            <IonButton
              fill="clear"
              color="success"
              size="small"
              disabled
            >
              KES.{amount}
              <IonIcon slot="start" icon={checkmarkCircleSharp} />
            </IonButton>
          ) : (
              <IonButton color="secondary" onClick={onClick} disabled={isUpdating}>
                {isUpdating ? (
                  <IonSpinner slot="icon-only" name="lines-small" />
                ) : "Pay"}
              </IonButton>
            )}
        </div>
      </>
    );

const SessionDetailsProfessional: React.FC<{
  duration: number,
}> = ({ duration }) => (
  <p>Your session lasted{" "}
    <strong>
      {duration}mins.
    </strong>
  </p>
);

interface MeetingPageProps {
  hasMeetingStarted: boolean,
  hasMeetingEnded: boolean,
  hasPeerJoined: boolean,
  isUpdating: boolean,
  duration: number,
  appointment: any,
  startMeeting: (...args: []) => any,
}

const MeetingPage: React.FC<MeetingPageProps> = ({
  hasMeetingStarted,
  hasMeetingEnded,
  hasPeerJoined,
  isUpdating,
  duration,
  appointment,
  startMeeting,
}) => {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const meetingDuration = appointment.duration || duration;

  const toCheckout = () => {
    history.push("/app/appointments/checkout/" + appointment._id, {
      duration: meetingDuration || 10,  // Bill at least 10 minutes
    });
  };

  const isClosed = appointment && appointment.status === APPOINTMENT.STATUSES.CLOSED;

  return (
    <Centered fullHeight>
      <div>
        <div>
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
          <p>
            <strong>Subject: </strong>{appointment.subject}
          </p>
          {
            (isClosed || (hasPeerJoined && hasMeetingEnded)) ? (
              appointment.patient._id === currentUser._id ? (
                <SessionDetailsPatient
                  duration={meetingDuration}
                  hasBeenBilled={appointment.hasBeenBilled}
                  isUpdating={isUpdating}
                  amount={appointment.amount}
                  onClick={toCheckout}
                />
              ) : (
                  <SessionDetailsProfessional duration={meetingDuration} />
                )
            ) : (
                <JoinButton onClick={startMeeting} />
              )
          }
        </div>
      </div>
    </Centered>
  );
};

const Meeting: React.FC = () => {
  const [hasMeetingStarted, setMeetingStarted] = useState(false);
  const [hasMeetingEnded, setMeetingEnded] = useState(false);
  const [hasPeerJoined, setPeerJoined] = useState(false);
  const [duration, setDuration] = useState(0);
  let [isUpdating, setUpdating] = useState(false);
  const { state } = useLocation<any>();
  const [selectedAppointment, setSelectedAppointment] = useState(state);


  const startMeeting = () => setMeetingStarted(true);
  const stopMeeting = () => {
    hasPeerJoined && setSelectedAppointment({
      ...selectedAppointment,
      status: APPOINTMENT.STATUSES.CLOSED,
    });
    setMeetingStarted(false);
    setMeetingEnded(true);
  };

  useIonViewDidLeave(() => {
    setMeetingEnded(false);
    setMeetingStarted(false);
    setUpdating(false);
  });

  if (!selectedAppointment || !selectedAppointment.professional) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen className="d-flex">
        {(!hasMeetingStarted || hasMeetingEnded) ? (
          <MeetingPage
            {...{
              appointment: selectedAppointment,
              hasMeetingStarted,
              hasMeetingEnded,
              hasPeerJoined,
              duration,
              isUpdating,
              startMeeting,
            }}
          />
        ) : (
            <MeetingScreen {...{
              stopMeeting,
              duration,
              setDuration,
              selectedAppointment,
              setUpdating,
              hasPeerJoined,
              setPeerJoined,
            }} />
          )}

      </IonContent>
    </IonPage >
  );
};

export default Meeting;

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
  if (!stream || !video) {
    return;
  }

  video.srcObject = stream;
}

export function extractForDisplay(current: any, other: any) {
  if (current._id === other.patient._id) {
    return other.professional;
  }
  return other.patient;
}

interface MeetingProps {
  selectedAppointment: any,
  setDuration: any,
  duration: number,
  stopMeeting: any,
  setUpdating: any,
  hasPeerJoined: boolean,
  setPeerJoined: (arg: boolean) => any,
}

function MeetingScreen({
  selectedAppointment,
  setDuration,
  duration,
  stopMeeting,
  setUpdating,
  setPeerJoined,
  hasPeerJoined,
}: MeetingProps) {
  const myVideoFeed = useRef<HTMLVideoElement | null>(null);
  const otherVideoFeed = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [peerAudioOn, setPeerAudioOn] = useState(true);
  const [peerVideoOn, setPeerVideoOn] = useState(true);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const { socket, currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();
  const { onError } = useToastManager();
  let interval: NodeJS.Timeout;
  let myPeer: Peer;
  const peers: {
    [key: string]: any
  } = {};

  const setupPeerStream = (s: MediaStream) => {
    socket.on("video-off", ({ userId }: any) => {
      if (peers[userId]) {
        setPeerVideoOn(false);
      }
    });

    socket.on("video-on", ({ userId }: any) => {
      if (peers[userId]) {
        setPeerVideoOn(true);
      }
    });

    socket.on("audio-off", ({ userId }: any) => {
      if (peers[userId]) {
        setPeerAudioOn(false);
      }
    });

    socket.on("audio-on", ({ userId }: any) => {
      if (peers[userId]) {
        setPeerAudioOn(true);
      }
    });
  }

  // Start session timer
  const startTimer = () => {
    interval = setInterval(() => {
      setDuration((dur: number) => ++dur);
    }, 60000);
  };
  // Stop session timer
  const stopTimer = () => {
    clearInterval(interval);
  }
  // When use attempts to leave meeting
  const onLeaveAttempt = () => {
    isMounted && setAlertOpen(true);
  };
  // Close confirmation prompt
  const closeAlert = () => isMounted && setAlertOpen(false);
  // Toggle video and audio tracks
  const toggleAudio = () => {
    isMounted && setAudioEnabled(!isAudioEnabled);
    socket.emit(isAudioEnabled ? "audio-off" : "audio-on");
  };

  const toggleVideo = () => {
    isMounted && setVideoEnabled(!isVideoEnabled);
    socket.emit(isVideoEnabled ? "video-off" : "video-on");
  };
  // Receive stream from peer
  const receiveStream = (stream: MediaStream) => {
    setPeerJoined(true);
    setupPeerStream(stream);
    addVideoStream(otherVideoFeed.current as any, stream);
  };
  // Connect to a peer
  const connectToUser = (peerId: string, userId: string, stream: MediaStream) => {
    const call = myPeer.call(peerId, stream);
    call.on("stream", receiveStream);

    call.on("close", () => {
      endMeeting();
    });

    peers[userId] = call;
  };

  // Video handler
  const onLoadedMetadata = (e: any) => {
    e.target.play();
  };
  // When the peer leaves the room
  const leaveRoom = ({ userId }: {
    userId: string,
  }) => {
    const peer = peers[userId];
    if (peer) {
      peer.close();
    }
  }

  async function endMeeting() {
    if (isMounted) {
      stopTimer();
      setPeerJoined(false);
    }

    try {
      // Only initiate billing if both users joined
      if (hasPeerJoined) {
        setUpdating(true);
        await editAppointment(selectedAppointment._id, currentUser.token, {
          minutesBilled: duration > 10 ? duration : 10,
          status: APPOINTMENT.STATUSES.CLOSED,
        });
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setUpdating(false);
    }

    for (let peer of Object.keys(peers)) {
      peers[peer].close();
    }

    socket.emit("left-room", {
      room: selectedAppointment._id,
    });

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    isMounted && setStream(null);
    stopMeeting();
  }

  useEffect(() => {
    myPeer = new Peer({
      host: "localhost",
      port: isProduction() ? 443 : 9000,
      secure: isProduction(),
    });

    myPeer.on("open", (peerId) => {
      window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        addVideoStream(myVideoFeed.current as any, stream);
        setStream(stream);

        socket.emit("join", {
          room: selectedAppointment._id,
          peer: peerId,
        });

        myPeer.on("call", (call) => {
          call.answer(stream);
          !interval && startTimer();
          call.on("stream", receiveStream);
          call.on("close", () => {
            endMeeting();
          });
          const peerUId = extractForDisplay(currentUser, selectedAppointment)._id;
          peers[peerUId] = call;
        });

        socket.on("user-joined", ({ userId, peer }: any) => {
          if (!peer) {
            return;
          }

          !interval && startTimer();
          connectToUser(peer, userId, stream);
        });
      });
    });

    socket.on("left-room", leaveRoom);
    socket.on("disconnected", leaveRoom);

    return () => {
      stopTimer();
      setMounted(false);
    };
  }, []);

  return (
    <div className="meeting-screen h100 d-flex">
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
            handler: endMeeting,
          }
        ]}
      />
      <div className="d-flex h100 meeting-pane">
        <IonBadge className="duration-badge" color="danger">{duration}min</IonBadge>


        <div className="meeting-tab">
          {hasPeerJoined && (
            <div>
              {!peerVideoOn && (
                <VideoPlaceholder username={extractForDisplay(currentUser, selectedAppointment).fullName} />
              )}
              <video ref={otherVideoFeed} onLoadedMetadata={onLoadedMetadata}></video>
              <Controls
                disabled={true}
                user={extractForDisplay(currentUser, selectedAppointment)}
                video={false}
                isAudioEnabled={peerAudioOn}
                isVideoEnabled={peerVideoOn}
              />
            </div>
          )}
        </div>

        <div className="meeting-tab">
          {!isVideoEnabled && (
            <VideoPlaceholder username={currentUser.fullName} />
          )}
          <video ref={myVideoFeed} playsInline onLoadedMetadata={onLoadedMetadata} muted></video>
          <Controls
            user={currentUser}
            {...{
              isVideoEnabled,
              isAudioEnabled,
              toggleVideo,
              toggleAudio,
            }}
          />
        </div>


      </div >
      <div className="meeting-btn-footer">
        <IonButton
          onClick={onLeaveAttempt}
          color="danger"
          expand="block"
        >Leave</IonButton>
      </div>
    </div>
  );
}

interface ControlProps {
  disabled?: boolean,
  isVideoEnabled?: boolean,
  isAudioEnabled?: boolean,
  user: ProfileData,
  toggleVideo?: ((arg?: any) => any) | null,
  toggleAudio?: ((arg?: any) => any) | null,
  video?: boolean,
}

function Controls({
  disabled = false,
  isVideoEnabled = true,
  isAudioEnabled = true,
  toggleAudio = null,
  toggleVideo = null,
  user,
  video = true,
}: ControlProps) {
  return (
    <IonGrid className="ion-no-padding controls">
      <IonRow className="ion-align-items-stretch ion-justify-content-between">
        <IonCol size="4">
          <Centered horizontal={false} fullHeight>
            <small className="ion-text-capitalize">{user.fullName}</small>
          </Centered>
        </IonCol>
        {video && (
          <IonCol size="4">
            <Centered>
              <IonButton
                fill="clear"
                size="small"
                disabled={disabled}
                onClick={toggleVideo as any}
                color="light"
              >
                <IonIcon icon={isVideoEnabled ? videocamSharp : videocamOffSharp} slot="icon-only"
                />
              </IonButton>
            </Centered>
          </IonCol>
        )}
        <IonCol size="4">
          <Centered>
            <IonButton
              fill="clear"
              size="small"
              disabled={disabled}
              onClick={toggleAudio as any}
              color="light"
            >
              <IonIcon icon={isAudioEnabled ? micSharp : micOffSharp} slot="icon-only"
              />
            </IonButton>
          </Centered>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}

function VideoPlaceholder({ username }: {
  username: string
}) {
  return (
    <div className="video-placeholder ion-text-capitalize">
      {username[0]}
    </div>
  );
}

{/* <IonPopover isOpen={popoverOpen}
  onWillDismiss={closePopover}
  event={popoverEvent}
>
  <IonList lines="full">
    <IonItem>
      <IonLabel>Audio</IonLabel>
      <IonToggle slot="end"
        color="medium"
        checked={audioOn}
        onIonChange={toggleAudioOn} />
    </IonItem>
    <IonItem>
      <IonLabel>Video</IonLabel>
      <IonToggle
        checked={videoOn}
        slot="end"
        color="medium"
        onIonChange={toggleVideoOn}
      />
    </IonItem>
  </IonList>
</IonPopover> */}