import React, { useState, useRef, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonPage,
  IonIcon,
  useIonViewDidLeave,
  IonAlert,
  IonBadge,
  IonSpinner,
  useIonViewDidEnter,
  IonText
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router';
import { micSharp, arrowBackSharp, micOffSharp, checkmarkCircleSharp, callSharp } from 'ionicons/icons';
import Peer from "peerjs";

import { useAppContext } from '../lib/context-lib';
import useMounted from '../lib/mounted-hook';
import { editAppointment } from "../http/appointments";
import useToastManager from '../lib/toast-hook';
import videocamOffSharp from "../assets/img/videocam-off-sharp.svg";
import videocamSharp from "../assets/img/videocam-sharp.svg";
import { ProfileData } from '../components/UserProfile';
import { APPOINTMENT, PEER_HOST } from "../http/constants";
import Centered from '../components/Centered';
import LoadingFallback from "../components/LoadingFallback";
import { ToReviewButton } from './OnSite';
import "./Meeting.css";

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
      <div>
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
      </div>
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
      <div className="ion-padding-horizontal">
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
          (isClosed) ? (
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
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const { onError } = useToastManager();


  const startMeeting = () => {
    setMeetingStarted(true);
    setMeetingEnded(false);
  };
  const stopMeeting = () => {
    hasPeerJoined && setSelectedAppointment({
      ...selectedAppointment,
      status: APPOINTMENT.STATUSES.CLOSED,
    });
    setMeetingStarted(false);
    setMeetingEnded(true);
  };
  const onCloseAppointment = async () => {
    setUpdating(true);
    try {
      const minutesBilled = duration > 10 ? duration : 10;
      const status = APPOINTMENT.STATUSES.CLOSED;
      hasPeerJoined && (await editAppointment(selectedAppointment._id, currentUser.token, {
        minutesBilled: duration > 10 ? duration : 10,
        status: APPOINTMENT.STATUSES.CLOSED,
      }));
      setUpdating(false);
      setSelectedAppointment({
        ...selectedAppointment,
        minutesBilled,
        status,
      });
    } catch (error) {
      setUpdating(false);
      onError(error.message);
    }
  }

  useIonViewDidEnter(() => {
    if (!selectedAppointment || !selectedAppointment.professional) {
      history.replace("/app/appointments");
    }
  })

  useIonViewDidLeave(() => {
    setMeetingEnded(false);
    setMeetingStarted(false);
    setUpdating(false);
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
  hasPeerJoined: boolean,
  onCloseAppointment: () => any,
  setPeerJoined: (arg: boolean) => any,
}

function MeetingScreen({
  selectedAppointment,
  setDuration,
  duration,
  stopMeeting,
  onCloseAppointment,
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
  const onLeaveRoom = ({ userId }: {
    userId: string,
  }) => {
    const peer = peers[userId];
    if (peer) {
      peer.close();
      delete peers[userId];
    }
  }
  const emitLeftRoom = () => socket.emit("left-room", {
    room: selectedAppointment._id,
  });

  async function endMeeting() {
    stopTimer();

    if (hasPeerJoined || Object.keys(peers).length) {
      onCloseAppointment();
    }

    for (let peer of Object.keys(peers)) {
      peers[peer].close();
      delete peers[peer];
    }

    emitLeftRoom();

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    isMounted && setStream(null);
    stopMeeting();
  }

  useEffect(() => {
    myPeer = new Peer({
      host: PEER_HOST,
      secure: true,
    });

    myPeer.on("open", (peerId) => {
      window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        if (!isMounted) {
          return;
        }

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

    socket.on("left-room", onLeaveRoom);
    socket.on("disconnected", onLeaveRoom);

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
        cssClass="app-alert"
        header={"End session"}
        message="Are you sure you want to end this session?"
        buttons={[
          {
            text: 'No',
            role: 'cancel',
            handler: () => true
          },
          {
            text: 'Yes',
            cssClass: 'danger',
            handler: endMeeting,
          }
        ]}
      />
      <div className="d-flex meeting-pane">
        <IonBadge className="duration-badge" color="danger">{duration}min</IonBadge>

        <div className="peer-tab h100">
          {hasPeerJoined ? (
            <div className="h100 joined-screen">
              {!peerVideoOn && (
                <VideoPlaceholder username={extractForDisplay(currentUser, selectedAppointment).fullName} />
              )}
              <video ref={otherVideoFeed} onLoadedMetadata={onLoadedMetadata}></video>
              <PeerFooter
                user={extractForDisplay(currentUser, selectedAppointment)}
                isAudioEnabled={peerAudioOn}
              />
            </div>
          ) : (
              <Centered fullHeight>
                <h6>
                  <IonText color="light">
                    Waiting on user
                </IonText>

                </h6>
              </Centered>
            )}
        </div>

        <div className="current-user-tab">
          {!stream && (
            <div className="stream-loader">
              <LoadingFallback name="lines-small" fullLength />
            </div>
          )}
          {!isVideoEnabled && (
            <VideoPlaceholder username={currentUser.fullName} />
          )}
          <video ref={myVideoFeed} playsInline onLoadedMetadata={onLoadedMetadata} muted></video>
        </div>


      </div >
      <MeetingFooter
        {...{
          isAudioEnabled,
          isVideoEnabled,
          toggleAudio,
          toggleVideo,
          onLeaveAttempt,
        }}
      />
    </div>
  );
}

function MeetingFooter({
  isAudioEnabled,
  isVideoEnabled,
  toggleAudio,
  toggleVideo,
  onLeaveAttempt,
}: {
  isVideoEnabled: boolean,
  isAudioEnabled: boolean,
  toggleVideo: (...args: any[]) => any,
  toggleAudio: (...args: any[]) => any,
  onLeaveAttempt: (...args: any[]) => any,
}) {
  return (
    <div className="meeting-footer">
      <div className="d-flex ion-align-items-center ion-justify-content-between">
        <IonButton
          fill="clear"
          size="small"
          onClick={toggleVideo}
          color="light"
        >
          <IonIcon icon={isVideoEnabled ? videocamSharp : videocamOffSharp} slot="icon-only"
          />
        </IonButton>

        <IonButton
          className="end-call-btn"
          shape="round"
          onClick={onLeaveAttempt}
          size="large"
          color="danger"
        >
          <IonIcon slot="icon-only" icon={callSharp} />
        </IonButton>

        <IonButton
          fill="clear"
          size="small"
          onClick={toggleAudio}
          color="light"
        >
          <IonIcon icon={isAudioEnabled ? micSharp : micOffSharp} slot="icon-only"
          />
        </IonButton>
      </div>
    </div>
  );
}

function PeerFooter({
  isAudioEnabled = true,
  user,
}: {
  isAudioEnabled?: boolean,
  user: ProfileData,
}) {
  return (
    <div className="d-flex ion-justify-content-between ion-align-items-center footer">
      <h6 className="ion-text-capitalize">{user.fullName}</h6>
      <IonButton
        fill="clear"
        size="small"
        color="light"
        disabled
      >
        <IonIcon icon={isAudioEnabled ? micSharp : micOffSharp} slot="icon-only"
        />
      </IonButton>
    </div>
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