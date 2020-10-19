import React, { useState, useRef, useEffect, PropsWithChildren } from 'react';
import { IonButton, IonContent, IonPage, IonRow, IonCol, IonText, IonList, IonCardContent, IonAvatar, IonCard, useIonViewWillEnter, IonIcon, IonChip, useIonViewDidEnter, useIonViewDidLeave, IonAlert, IonBadge, IonGrid, IonPopover, IonToggle, IonLabel, IonItem, IonSpinner } from '@ionic/react';
import { useHistory, useLocation } from 'react-router';
import { micSharp, cogSharp, arrowBackSharp, settingsSharp, micOffSharp } from 'ionicons/icons';
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

const Meeting: React.FC = () => {
  const [hasMeetingStarted, setMeetingStarted] = useState(false);
  const [hasMeetingEnded, setMeetingEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  let [isUpdating, setUpdating] = useState(false);
  const { state: selectedAppointment } = useLocation<any>();
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const history = useHistory();
  const { currentUser } = useAppContext() as any;


  const startMeeting = () => setMeetingStarted(true);
  const stopMeeting = () => {
    setMeetingStarted(false);
    setMeetingEnded(true);
  };
  const openPopover = (e: any) => {
    e.persist()
    setPopoverEvent(e);
    setPopoverOpen(true);
  };
  const closePopover = () => setPopoverOpen(false);

  const toggleAudioOn = (e: any) => setAudioOn(e.detail.checked);
  const toggleVideoOn = (e: any) => setVideoOn(e.detail.checked);
  const toCheckout = () => {
    history.push("/app/checkout/" + selectedAppointment._id, {
      duration: duration || 1,
    });
  };

  useIonViewDidLeave(() => {
    setMeetingEnded(false);
    setMeetingStarted(false);
    setAudioOn(true);
    setVideoOn(true);
    setPopoverOpen(false);
    setPopoverEvent(null);
    setUpdating = () => null;
  });

  if (!selectedAppointment || !selectedAppointment.professional) {
    // history.replace("/app/appointments");
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen className="d-flex">
        {!hasMeetingStarted ? (
          <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
            <div>
              <div>
                {!hasMeetingEnded && (
                  <IonButton
                    fill="clear"
                    color="medium"
                    size="small"
                    routerLink="/app/appointments">
                    Back
                    <IonIcon slot="start" icon={arrowBackSharp} />
                  </IonButton>
                )}
                <h3>Meeting with <strong className="ion-text-capitalize">
                  {extractForDisplay(currentUser, selectedAppointment).fullName}
                </strong>
                </h3>
                <p>
                  <strong>Subject: </strong>{selectedAppointment.subject}
                </p>
                {!hasMeetingEnded ? (
                  <>
                    <IonButton color="secondary" onClick={startMeeting}>
                      Join
                    </IonButton>
                    <IonButton onClick={openPopover}>
                      <IonIcon slot="icon-only" icon={settingsSharp} />
                    </IonButton>
                  </>
                ) : selectedAppointment.patient._id === currentUser._id ? (
                  <>
                    <p>Your session lasted <strong>{duration}mins</strong>. Proceed to payment...</p>
                    <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
                      <IonButton color="secondary" onClick={toCheckout} disabled={isUpdating}>
                        {isUpdating ? (
                          <IonSpinner slot="icon-only" name="lines-small" />
                        ) : "Go"}
                      </IonButton>
                    </div>
                  </>
                ) : (
                      <>
                        <p>Your session lasted <strong>{duration}mins.</strong></p>
                        <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
                          <IonButton
                            fill="clear"
                            color="medium"
                            size="small"
                            routerLink="/app/appointments">
                            Appointments
                  <IonIcon slot="start" icon={arrowBackSharp} />
                          </IonButton>
                        </div>
                      </>
                    )}
              </div>
              <IonPopover isOpen={popoverOpen}
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
              </IonPopover>
            </div>

          </div>
        ) : (
            <MeetingScreen {...{
              stopMeeting,
              duration,
              setDuration,
              selectedAppointment,
              setUpdating,
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

function extractForDisplay(current: any, other: any) {
  if (current._id === other.patient._id) {
    return other.professional;
  }
  return other.patient;
}

function MeetingScreen({ selectedAppointment, setDuration, duration, stopMeeting,
  setUpdating }: {
    selectedAppointment: any,
    setDuration: any,
    duration: number,
    stopMeeting: any,
    setUpdating: any,
  }) {
  const myVideoFeed = useRef<HTMLVideoElement | null>(null);
  const otherVideoFeed = useRef<HTMLVideoElement | null>(null);
  const [peerHasJoined, setPeerJoined] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [peerAudioOn, setPeerAudioOn] = useState(true);
  const [peerVideoOn, setPeerVideoOn] = useState(true);
  const [peerVideoTrack, setPeerVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [peerAudioTrack, setPeerAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
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
    console.log("Got stream", s.getTracks());
    s.getTracks().forEach(track => {
      if (track.kind === "audio") {
        setPeerAudioTrack(track);
      } else {
        setPeerVideoTrack(track);
      }
    })
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
    const audios = stream?.getAudioTracks();
    if (!audios?.length) {
      return;
    }
    audios[0].enabled = isAudioEnabled ? false : true;
    isMounted && setAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    const videos = stream?.getVideoTracks();
    if (!videos?.length) {
      return;
    }
    videos[0].enabled = isVideoEnabled ? false : true;
    isMounted && setVideoEnabled(!isVideoEnabled);
  };
  // Receive stream from peer
  const receiveStream = (stream: MediaStream) => {
    isMounted && setPeerJoined(true);
    setupPeerStream(stream);
    addVideoStream(otherVideoFeed.current as any, stream);
  };
  // Connect to a peer
  const connectToUser = (peerId: string, userId: string, stream: MediaStream) => {
    const call = myPeer.call(peerId, stream);
    call.on("stream", receiveStream);

    call.on("close", () => {
      endMeeting();
      console.log("closing stream");
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
      setPeerStream(null);
    }

    try {
      setUpdating(true);
      await editAppointment(selectedAppointment._id, currentUser.token, {
        minutesBilled: duration > 10 ? duration : 10,
        status: APPOINTMENT.STATUSES.CLOSED,
      });
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
    myPeer = new Peer();
    myPeer.on("open", (peerId) => {
      console.log("Connected peer", peerId);
      window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        addVideoStream(myVideoFeed.current as any, stream);
        setStream(stream);
        console.log("joining", stream, selectedAppointment);
        socket.emit("join", {
          room: selectedAppointment._id,
          peer: peerId,
        });

        myPeer.on("call", (call) => {
          console.log("someone called us", call.peer);
          call.answer(stream);
          !interval && startTimer();
          call.on("stream", receiveStream);
          call.on("close", () => {
            endMeeting();
            console.log("caller closed");
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
      setMounted(false);
      stopTimer();
    };
  }, []);

  return (
    <div className="meeting-screen">
      <div className="meeting-feed">
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
        <IonBadge className="duration-badge" color="danger">{duration}min</IonBadge>


        {peerHasJoined && (
          <div>
            <video ref={otherVideoFeed} onLoadedMetadata={onLoadedMetadata}></video>
            <Controls disabled={true} user={extractForDisplay(currentUser, selectedAppointment)} />
          </div>
        )
        }
        <div>
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
}

function Controls({
  disabled = false,
  isVideoEnabled = true,
  isAudioEnabled = true,
  toggleAudio = null,
  toggleVideo = null,
  user,
}: ControlProps) {
  return (
    <IonGrid className="ion-no-padding controls">
      <IonRow className="ion-align-items-stretch">
        <IonCol size="4">
          <Centered horizontal={false} fullHeight>
            <small className="ion-text-capitalize">{user.fullName}</small>
          </Centered>
        </IonCol>
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