import React, { useState } from "react";
import { IonHeader, IonToolbar, IonAvatar, IonTitle, IonButtons, IonButton, IonIcon } from "@ionic/react";
import { menuController } from "@ionic/core"

import { useAppContext } from "../lib/context-lib";
import defaultAvatar from "../assets/img/default_avatar.jpg";
import { menuSharp } from "ionicons/icons";
import userPicture from "../http/helpers/user-picture";

interface HeaderProps {
  title: string
  secondary?: any,
}

export default function UserHeader({ title, secondary }: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useAppContext() as any;

  const toggleMenu = () => {
    if (isMenuOpen) {
      menuController.close();
      setMenuOpen(false);
    } else {
      menuController.open();
      setMenuOpen(true);
    }
  }

  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={toggleMenu}>
            <IonIcon slot="icon-only" icon={menuSharp} />
          </IonButton>
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        {secondary ? (
          <IonButtons slot="end">
            {secondary}
          </IonButtons>
        ) : (
            <IonAvatar slot="end" className="ion-padding">
              <img src={userPicture(currentUser)} alt={currentUser.fullName} />
            </IonAvatar>
          )}
      </IonToolbar>
    </IonHeader>
  );
}
