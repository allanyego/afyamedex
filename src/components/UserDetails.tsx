import React, { useState } from "react";
import moment from "moment";

import { useAppContext } from "../lib/context-lib";
import { IonCol, IonRow, IonText, IonButton, IonIcon, IonBadge, IonList, IonItem, IonLabel, IonInput } from "@ionic/react";
import { USER } from "../http/constants";
import Rating from "./Rating";
import defaultAvatar from "../assets/img/default_avatar.jpg";
import ContactCard from "./ContactCard";
import { chatbubbleEllipses, heart, calendar, pencil, close, heartOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import "./UserDetails.css";
import Education from "./profile-parts/Education";
import Speciality from "./profile-parts/Speciality";
import Bio from "./profile-parts/Bio";
import Experience from "./profile-parts/Experience";
import Names from "./profile-parts/Names";

export interface ProfileData {
  _id?: string,
  fullName: string,
  username: string,
  gender: string,
  bio: string,
  conditions: string[],
  accountType: string | null,
  phone: string,
  email: string,
  picture?: string,
  experience?: number,
  speciality?: string[],
  education?: {
    _id?: string,
    institution: string,
    areaOfStudy: string,
    startDate: Date,
    endDate?: Date,
  }[],
  rating?: number,
};

export default function UserDetails({ user }: { user: ProfileData }) {
  const { currentUser } = useAppContext() as any;
  const history = useHistory();
  const toChat = () => history.push({
    pathname: "/app/chat/no-thread",
    state: {
      ...user,
      fetch: true,
    }
  });

  return (
    <IonCol>
      <IonRow className="ion-justify-content-center">
        <IonCol size="6">
          <img src={(user.picture || defaultAvatar) as any} alt={user.fullName} className="user-avatar" />
        </IonCol>
      </IonRow>
      <IonText className="ion-text-center">
        <Names user={user} currentUserId={currentUser._id} />
        {user.accountType !== USER.ACCOUNT_TYPES.PATIENT && (
          <p>
            <Experience user={user} currentUserId={currentUser._id} />
            {user.rating ? (
              <Rating rating={user.rating} />
            ) : (
                <IonText>No ratings</IonText>
              )}
          </p>
        )}
      </IonText>
      <Bio user={user} currentUserId={currentUser._id} />
      {user.accountType === USER.ACCOUNT_TYPES.PATIENT && (
        <div>
          <ContactCard phone={user.phone} email={user.email} />
        </div>
      )}
      {[
        USER.ACCOUNT_TYPES.INSTITUTION,
        USER.ACCOUNT_TYPES.PROFESSIONAL
      ].includes(user.accountType as string) && (
          <div>
            {user._id !== currentUser._id && (
              <IonRow className="ion-justify-content-center">
                <IonCol size="5">
                  <IonButton color="dark" expand="block" onClick={toChat}>
                    Chat
                    <IonIcon slot="end" icon={chatbubbleEllipses} />
                  </IonButton>
                </IonCol>
                <IonCol size="5">
                  <IonButton color="dark" expand="block" routerLink={`/app/book/${user._id}`}>
                    Meet
                    <IonIcon slot="end" icon={calendar} />
                  </IonButton>
                </IonCol>
                <IonCol size="2" className="d-flex ion-justify-content-center ion-align-items-center">
                  <IonIcon color="danger" icon={heartOutline} style={{
                    fontSize: "1.5em"
                  }} />
                </IonCol>
              </IonRow>
            )}
            <Speciality user={user} currentUserId={currentUser._id} />
          </div>
        )}
      <Education user={user} currentUserId={currentUser._id} />
    </IonCol>
  );
}