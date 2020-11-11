import React, { useEffect, useState } from "react";

import { useAppContext } from "../lib/context-lib";
import { IonCol, IonRow, IonText, IonButton, IonIcon, IonGrid, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonModal, IonSpinner } from "@ionic/react";
import { USER } from "../http/constants";
import Rating from "./Rating";
import defaultAvatar from "../assets/img/default_avatar.jpg";
import ContactCard from "./ContactCard";
import { chatbubbleEllipses, calendar, heartOutline, pencilSharp, heart } from "ionicons/icons";
import { useHistory } from "react-router";
import Education from "./profile-parts/Education";
import Speciality from "./profile-parts/Speciality";
import Bio from "./profile-parts/Bio";
import Experience from "./profile-parts/Experience";
import Names from "./profile-parts/Names";
import LoadingFallback from "./LoadingFallback";
import EditProfileModal from "./profile-parts/EditProfileModal";
import ErrorFallback from "./ErrorFallback";
import Conditions from "./profile-parts/Conditions";
import useToastManager from "../lib/toast-hook";
import useMounted from "../lib/mounted-hook";
import { checkIfFavorited, favorite } from "../http/favorites";
import { getUserRating } from "../http/reviews";
import Centered from "./Centered";
import RatingInfo from "./RatingInfo";
import "./UserProfile.css";

export interface ProfileData {
  _id?: string,
  birthday: Date,
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
  disabled: boolean,
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
  loadError?: boolean,
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
      <div
        style={{
          backgroundColor: "var(--ion-color-dark)",
          color: "var(--ion-color-light)"
        }}
      >
        <IonGrid className="ion-no-padding ion-padding-top d-flex ion-align-items-center">
          <IonRow>
            <IonCol
              size="3"
              className="ion-margin-horizontal d-flex ion-justify-content-center ion-align-items-center">
              <img src={(user.picture || defaultAvatar) as any} alt={user.fullName} className="user-avatar" />
            </IonCol>
            <IonCol>
              <Names user={user} currentUserId={currentUser._id} />
            </IonCol>
          </IonRow>
        </IonGrid>
        <div className="ion-margin-bottom">
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
                    Chat
                    <IonIcon slot="end" icon={chatbubbleEllipses} />
                  </IonButton>
                </IonCol>
                <IonCol size="5">
                  <IonButton shape="round"
                    fill="outline"
                    color="secondary"
                    expand="block"
                    routerLink={`/app/professionals/${user._id}/book`}
                  >
                    Book
                    <IonIcon slot="end" icon={calendar} />
                  </IonButton>
                </IonCol>
                <IonCol size="2" className="d-flex ion-justify-content-center ion-align-items-center">
                  <FavButton userId={user._id as string} />
                </IonCol>
              </IonRow>
            )}
        </div>
      </div>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonText className="ion-text-center ion-margin-bottom">
              {user.accountType !== USER.ACCOUNT_TYPES.PATIENT && (
                <>
                  <Experience user={user} currentUserId={currentUser._id} />
                  <RatingInfo userId={user._id as string} />
                </>
              )}
            </IonText>
            <Bio user={user} currentUserId={currentUser._id} />
            {user.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
              <Conditions user={user} currentUserId={currentUser._id} />
            ) : (
                <>
                  <div>
                    <ContactCard phone={user.phone} email={user.email} />
                  </div>
                  <Speciality user={user} currentUserId={currentUser._id} />
                  <Education user={user} currentUserId={currentUser._id} />
                </>
              )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
}

function FavButton({ userId }: {
  userId: string,
}) {
  const [isFetching, setFetching] = useState(true);
  const [isFavorite, setFavorite] = useState(false);
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useEffect(() => {
    checkIfFavorited(userId, currentUser.token).then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setFetching(false);
      if (data) {
        setFavorite(true);
      } else {
        setFavorite(false);
      }
    }).catch(error => onError(error.message));

    return () => {
      setMounted(false);
    }
  }, []);

  const handleToggle = async () => {
    setFetching(true);
    try {
      await favorite(userId, currentUser.token);
      if (isMounted) {
        setFavorite(!isFavorite);
      }
      onSuccess(`Successfully ${isFavorite ? 'unfavorited' : 'favorited'} user`);
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setFetching(false);
    }
  };

  return isFetching ? (
    <IonSpinner name="lines-small" />
  ) : (
      <IonIcon
        color="danger"
        onClick={handleToggle}
        icon={isFavorite ? heart : heartOutline} style={{
          fontSize: "1.5em"
        }}
      />
    );
}