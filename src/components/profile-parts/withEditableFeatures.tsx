import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { close, pencil } from "ionicons/icons";
import { ProfileData } from "../UserDetails";

export default function withEditableFeatures(Comp: React.FC<any>): React.FC<EditableProps> {
  return (props) => {
    const [isEditting, setEditting] = useState(false);

    const toggle = () => setEditting(!isEditting);

    return props.currentUserId !== props.user._id ?
      (
        <Comp {...props} />
      ) : (
        <div style={{
          position: "relative"
        }}>
          <Comp {...props} {...{ isEditting }} />
          <div
            className="d-flex ion-justify-content-center ion-align-items-center border-circle edit-floating-btn"
            onClick={toggle}>
            <IonIcon
              color={isEditting ? "danger" : "dark"}
              icon={isEditting ? close : pencil} />
          </div>
        </div>
      );
  };
}

export interface EditableProps {
  isEditting?: boolean
  user: ProfileData
  currentUserId: string
}