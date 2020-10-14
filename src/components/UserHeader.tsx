import React, { useState } from "react";
import { IonHeader, IonToolbar, IonAvatar, IonTitle, IonButtons } from "@ionic/react";
import { menuController } from "@ionic/core"

import { useAppContext } from "../lib/context-lib";
import defaultAvatar from "../assets/img/default_avatar.jpg";

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
        <IonAvatar slot="start" className="ion-padding" onClick={toggleMenu}>
          <img src={defaultAvatar} alt={currentUser.fullName} />
        </IonAvatar>
        <IonTitle>{title}</IonTitle>
        {secondary && (
          <IonButtons slot="end">
            {secondary}
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
}
