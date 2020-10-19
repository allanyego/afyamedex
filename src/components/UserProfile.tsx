import React, { useState } from "react";

import { useAppContext } from "../lib/context-lib";
import { IonCol, IonRow, IonText, IonButton, IonIcon, IonGrid, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonModal } from "@ionic/react";
import { USER } from "../http/constants";
import Rating from "./Rating";
import defaultAvatar from "../assets/img/default_avatar.jpg";
import ContactCard from "./ContactCard";
import { chatbubbleEllipses, calendar, heartOutline, pencilSharp } from "ionicons/icons";
import { useHistory } from "react-router";
import "./UserDetails.css";
import Education from "./profile-parts/Education";
import Speciality from "./profile-parts/Speciality";
import Bio from "./profile-parts/Bio";
import Experience from "./profile-parts/Experience";
import Names from "./profile-parts/Names";
import LoadingFallback from "./LoadingFallback";
import EditProfileModal from "./profile-parts/EditProfileModal";
import ErrorFallback from "./ErrorFallback";

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

export default function UserProfile({ user, loadError = false }: {
  user: ProfileData | null,
  loadError?: boolean
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { currentUser } = useAppContext() as any;
  const onClose = () => setModalOpen(false);
  const onOpen = () => setModalOpen(true);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/feed" />
          </IonButtons>
          <IonTitle>Profile</IonTitle>
          {(user && currentUser._id === user._id) && (
            <IonButtons slot="end">
              <IonButton onClick={onOpen}>
                <IonIcon slot="icon-only" icon={pencilSharp} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loadError ? (
          <ErrorFallback />
        ) : !user ? (
          <LoadingFallback />
        ) : (
              <>
                <UserDetails user={user} />
                <EditProfileModal isOpen={isModalOpen} onClose={onClose} />
              </>
            )}
      </IonContent>
    </IonPage>
  );
}

function UserDetails({ user }: { user: ProfileData }) {
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
    <>
      <IonGrid className="ion-no-padding ion-padding-vertical" style={{
        backgroundColor: "var(--ion-color-dark)",
        color: "var(--ion-color-light)"
      }}>
        <IonRow>
          <IonCol
            size="3"
            className="ion-margin-horizontal d-flex ion-justify-content-center ion-align-items-center">
            <img src={(user.picture || defaultAvatar) as any} alt={user.fullName} className="user-avatar" />
          </IonCol>
          <IonCol>
            <Names user={user} currentUserId={currentUser._id} />
            {[
              USER.ACCOUNT_TYPES.INSTITUTION,
              USER.ACCOUNT_TYPES.PROFESSIONAL
            ].includes(user.accountType as string) &&
              user._id !== currentUser._id &&
              (
                <IonRow>
                  <IonCol size="5">
                    <IonButton
                      shape="round"
                      fill="outline"
                      color="secondary"
                      expand="block"
                      onClick={toChat}
                    >
                      <IonIcon slot="icon-only" icon={chatbubbleEllipses} />
                    </IonButton>
                  </IonCol>
                  <IonCol size="5">
                    <IonButton shape="round"
                      fill="outline"
                      color="secondary"
                      expand="block"
                      routerLink={`/app/professionals/${user._id}/book`}
                    >
                      <IonIcon slot="icon-only" icon={calendar} />
                    </IonButton>
                  </IonCol>
                  <IonCol size="2" className="d-flex ion-justify-content-center ion-align-items-center">
                    <IonIcon
                      color="danger"
                      icon={heartOutline} style={{
                        fontSize: "1.5em"
                      }}
                    />
                  </IonCol>
                </IonRow>
              )}
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonText className="ion-text-center ion-margin-bottom">
              {user.accountType !== USER.ACCOUNT_TYPES.PATIENT && (
                <>
                  <p className="ion-no-margin">
                    <Experience user={user} currentUserId={currentUser._id} />
                  </p>
                  <p className="ion-no-margin">
                    {user.rating ? (
                      <Rating rating={user.rating} />
                    ) : (
                        <IonText>No ratings</IonText>
                      )}
                  </p>
                </>
              )}
            </IonText>
            <Bio user={user} currentUserId={currentUser._id} />
            {user.accountType === USER.ACCOUNT_TYPES.PATIENT && (
              <div>
                <ContactCard phone={user.phone} email={user.email} />
              </div>
            )}
            <Speciality user={user} currentUserId={currentUser._id} />
            <Education user={user} currentUserId={currentUser._id} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
}
