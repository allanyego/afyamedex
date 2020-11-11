import React, { PropsWithChildren, useRef, useState } from "react";
import { useHistory } from "react-router";
import { useAppContext } from "../lib/context-lib";
import useMounted from "../lib/mounted-hook";
import { IonModal, IonContent, IonAlert, IonButton, IonBadge, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/react";
import Peer from "peerjs";
import { micSharp, videocamSharp } from "ionicons/icons";

interface Props {
  showModal: boolean,
  onClose: (args?: any) => any,
  selectedAppointment: any,
  setDuration: (args: any) => any,
  duration: number,
};

const MeetingModal: React.FC<PropsWithChildren<Props>> = ({ showModal, onClose, selectedAppointment, setDuration, duration }) => {
  const myVideoFeed = useRef<HTMLVideoElement | null>(null);
  const otherVideoFeed = useRef<HTMLVideoElement | null>(null);
  const [peerHasJoined, setPeerJoined] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const { socket, currentUser } = useAppContext() as any;
  // const [duration, setDuration] = useState(0);

  let interval: NodeJS.Timeout;
  let myPeer: Peer;

  const peers: {
    [key: string]: any
  } = {};

  const startTimer = () => {
    interval = setInterval(() => {
      setDuration((dur: number) => ++dur);
    }, 60000);
  };

  const stopTimer = () => {
    clearInterval(interval);
  }

  const onCloseModal = () => {
    setAlertOpen(true);
  };

  const toggleAudio = () => {
    const audios = stream?.getAudioTracks();
    if (!audios?.length) {
      return;
    }
    audios[0].enabled = isAudioEnabled ? false : true;
    setAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    const videos = stream?.getVideoTracks();
    console.log("videos", videos);
    if (!videos?.length) {
      return;
    }
    videos[0].enabled = isVideoEnabled ? false : true;
    setVideoEnabled(!isVideoEnabled);
  };

  const onModalClosed = () => {
    tearDown();

    if (!peerHasJoined) {
      return onClose();
    }

    onClose();
  };

  const closeAlert = () => setAlertOpen(false);

  const onLoadedMetadata = (e: any) => {
    e.target.play();
  };

  const receiveStream = (stream: MediaStream) => {
    setPeerJoined(true);
    addVideoStream(otherVideoFeed.current as any, stream);
  };

  const connectToUser = (peerId: string, userId: string, stream: MediaStream) => {
    const call = myPeer.call(peerId, stream);
    call.on("stream", receiveStream);

    call.on("close", () => {
      stopTimer();
      setPeerJoined(false);
      console.log("called peer closed");
      onModalClosed();
    });

    peers[userId] = call;
  };

  const leaveRoom = ({ userId }: {
    userId: string,
  }) => {
    const peer = peers[userId];
    if (peer) {
      peer.close();
      onModalClosed();
    }
  };

  const setup = () => {
    // myPeer = new Peer(currentUser._id);
    console.log("modal came thru", myPeer);
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
          call.answer(stream);
          !interval && startTimer();
          call.on("stream", receiveStream);
          call.on("close", () => {
            stopTimer();
            setPeerJoined(false);
            console.log("caller peer closed");
            onModalClosed();
          })
        });

        socket.on("user-joined", ({ userId, peer }: any) => {
          console.log("joined", peer);
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

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
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
            <IonGrid className="ion-no-padding controls">
              <IonRow className="ion-align-items-stretch">
                <IonCol size="4">
                  <small className="ion-text-capitalize">{currentUser.fullName}</small>
                </IonCol>
                <IonCol size="4">
                  <IonButton
                    fill="clear"
                    onClick={toggleVideo}
                    color={isVideoEnabled ? "secondary" : "medium"}
                  >
                    <IonIcon icon={videocamSharp} slot="icon-only"
                    />
                  </IonButton>
                </IonCol>
                <IonCol size="4">
                  <IonButton
                    fill="clear"
                    onClick={toggleAudio}
                    color={isAudioEnabled ? "secondary" : "medium"}
                  >
                    <IonIcon icon={micSharp} slot="icon-only"
                    />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

        </div>
      </IonContent>
      <IonButton onClick={onCloseModal} color="danger" fill="outline">Leave</IonButton>
    </IonModal>
  );
}

export default MeetingModal;

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
  if (!stream) {
    return;
  }

  video.srcObject = stream;
}
