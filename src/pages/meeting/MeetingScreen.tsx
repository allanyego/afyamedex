import { Capacitor } from "@capacitor/core";
import { IonAlert, IonBadge, IonText } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

import Centered from "../../components/Centered";
import LoadingFallback from "../../components/LoadingFallback";
import { useAppContext } from "../../lib/context-lib";
import useMounted from "../../lib/mounted-hook";
import { addVideoStream, extractForDisplay } from "./helpers";
import MeetingFooter from "./MeetingFooter";
import PeerFooter from "./PeerFooter";
import VideoPlaceholder from "./VideoPlaceholder";
import { PEER_HOST } from "../../http/constants";

interface MeetingProps {
  selectedAppointment: any,
  stopMeeting: any,
  hasPeerJoined: boolean,
  onCloseAppointment: (any: number) => any,
  setPeerJoined: (arg: boolean) => any,
}

const MeetingScreen: React.FC<MeetingProps> = ({
  selectedAppointment,
  stopMeeting,
  onCloseAppointment,
  setPeerJoined,
  hasPeerJoined,
}) => {
  const myVideoFeed = useRef<HTMLVideoElement | null>(null);
  const otherVideoFeed = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
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
      setDuration((dur: number) => (dur + 1));
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
  const receiveStream = (_stream: MediaStream) => {
    !interval && startTimer();
    setPeerJoined(true);
    setupPeerStream(_stream);
    addVideoStream(otherVideoFeed.current as any, _stream);
  };
  // Connect to a peer
  const connectToUser = (peerId: string, userId: string, _stream: MediaStream) => {
    const call = myPeer.call(peerId, _stream);
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
      onCloseAppointment(duration);
    }

    for (let peer of Object.keys(peers)) {
      peers[peer].close();
      delete peers[peer];
    }

    emitLeftRoom();

    if (stream) {
      stream.getTracks().forEach((track: any) => track.stop());
    }
    isMounted && setStream(null);
    stopMeeting();
  }

  useEffect(() => {
    myPeer = new Peer({
      host: PEER_HOST,
      secure: true,
    });

    let constraints: {
      audio: any,
      video: any
    } = { audio: true, video: true };

    if (!Capacitor.isNative) {
      constraints = {
        ...constraints,
        video: {
          frameRate: {
            min: 10,
            ideal: 30,
          },
        }
      }
    }

    myPeer.on("open", (peerId: any) => {
      window.navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        if (!isMounted) {
          return;
        }

        addVideoStream(myVideoFeed.current as any, stream);
        setStream(stream);

        socket.emit("join", {
          room: selectedAppointment._id,
          peer: peerId,
        });

        myPeer.on("call", (call: any) => {
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

export default MeetingScreen;