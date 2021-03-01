import { IonButton, IonIcon } from "@ionic/react";
import { micOffSharp, micSharp } from "ionicons/icons";
import React from "react";
import { ProfileData } from "../../components/UserProfile";

const PeerFooter: React.FC<{
  isAudioEnabled?: boolean,
  user: ProfileData,
}> = ({
  isAudioEnabled = true,
  user,
}) => {
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

export default PeerFooter;