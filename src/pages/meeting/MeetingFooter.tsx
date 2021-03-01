import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { callSharp, micOffSharp, micSharp } from "ionicons/icons";

import videocamOffSharp from "../../assets/img/videocam-off-sharp.svg";
import videocamSharp from "../../assets/img/videocam-sharp.svg";

const MeetingFooter: React.FC<{
  isVideoEnabled: boolean,
  isAudioEnabled: boolean,
  toggleVideo: (...args: any[]) => any,
  toggleAudio: (...args: any[]) => any,
  onLeaveAttempt: (...args: any[]) => any,
}> = ({
  isAudioEnabled,
  isVideoEnabled,
  toggleAudio,
  toggleVideo,
  onLeaveAttempt,
}) => {
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

export default MeetingFooter;