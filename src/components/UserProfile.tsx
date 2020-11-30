import React, { useEffect, useState } from "react";
import { IonCol, IonRow, IonText, IonButton, IonIcon, IonGrid, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner } from "@ionic/react";
import { chatbubbleEllipses, calendar, heartOutline, pencilSharp, heart, checkmarkCircle } from "ionicons/icons";
import * as Yup from "yup";

import { useAppContext } from "../lib/context-lib";
import { MAX_ATTACHMENT_SIZE, PROFILE_PICTURE_FORMATS, USER } from "../http/constants";
import ContactCard from "./ContactCard";
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
import RatingInfo from "./RatingInfo";
import "./UserProfile.css";
import userPicture from "../http/helpers/user-picture";
import { editUser } from "../http/users";
import { Field, Form, Formik } from "formik";
import CustomPhotoUpload from "./CustomPhotoUpload";

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

const profilePictureSchema = Yup.object({
  picture: Yup.mixed()
    .test("fileType", "Unsupported format.", (value) =>
      value ? PROFILE_PICTURE_FORMATS.includes(value.type) : true
    )
    .test("fileSize", "That's too big", (value) =>
      value ? value.size <= MAX_ATTACHMENT_SIZE : true
    )
});

function UserDetails({ user }: { user: ProfileData }) {
  const history = useHistory();
  const [photoPreview, setPhotoPreview] = useState(userPicture(user));
  const { currentUser, setCurrentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();
  const { isMounted, setMounted } = useMounted();
  const isCurrent = user._id === currentUser._id;

  const onPhotoEdit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const { data } = await editUser(user._id, currentUser.token, values, true);
      isMounted && resetForm({});
      setCurrentUser({
        picture: data.picture,
      });
      onSuccess("Profile picture updated");
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setSubmitting(false);
    }
  };

  const toChat = () => history.push({
    pathname: "/app/chat/no-thread",
    state: {
      ...user,
      fetch: true,
    }
  });

  useEffect(() => () => setMounted(false), []);

  return (
    <>
      <div
        style={{
          backgroundColor: "var(--ion-color-dark)",
          color: "var(--ion-color-light)"
        }}
      >
        <IonGrid
          className={
            "d-flex ion-align-items-center ion-no-padding ion-padding-top" + (isCurrent ?
              " ion-padding-bottom"
              : "")
          }
        >
          <IonRow>
            <IonCol
              size="3"
              className="ion-margin-horizontal d-flex ion-justify-content-center ion-align-items-center photo-section">
              {isCurrent && (
                <Formik
                  validationSchema={profilePictureSchema}
                  onSubmit={onPhotoEdit}
                  initialValues={{
                    picture: undefined,
                  }}
                >
                  {({
                    setFieldValue,
                    setFieldError,
                    values,
                    isValid,
                    errors,
                    isSubmitting,
                  }) => {
                    const fieldName = "picture";
                    const canShowSubmit = (values.picture && isValid);

                    return (
                      <Form noValidate className="photo-edit-form">
                        <div className="d-flex ion-align-items-center">
                          <Field
                            name={fieldName}
                            component={CustomPhotoUpload}
                            {...{ setFieldValue, setPhotoPreview }}
                          />

                          {canShowSubmit && (
                            <IonButton
                              color="success"
                              type="submit"
                              disabled={isSubmitting}
                              shape="round"
                            >
                              {isSubmitting ? (
                                <IonSpinner name="lines-small" className="button-icon" />
                              ) : (
                                  <IonIcon icon={checkmarkCircle} className="button-icon" />
                                )}
                            </IonButton>
                          )}

                        </div>
                        {errors[fieldName] && (
                          <div
                            className="error-tooltip"
                          >
                            {errors[fieldName]}
                          </div>
                        )}
                      </Form>
                    );
                  }}
                </Formik>
              )}
              <img src={photoPreview as any} alt={user.fullName} className="user-avatar" />
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