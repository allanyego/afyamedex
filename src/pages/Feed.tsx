import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonPage, IonText, IonList, IonItem, IonLabel, IonCardContent, IonAvatar, IonCard, IonIcon, IonChip, useIonViewDidEnter, useIonViewWillLeave, IonSkeletonText, IonGrid, IonRow, IonCol, IonBadge } from '@ionic/react';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import { arrowForwardSharp, calendarOutline, createSharp } from 'ionicons/icons';
import moment from "moment";

import useToastManager from '../lib/toast-hook';
import { getConditions } from '../http/conditions';
import { ProfileData } from '../components/UserProfile';
import Rating from '../components/Rating';
import UserHeader from '../components/UserHeader';
import { getUsers } from '../http/users';
import { getPublicThreads } from "../http/messages";
import "./Feed.css";
import { USER } from '../http/constants';
import useMounted from '../lib/mounted-hook';
import Centered from '../components/Centered';
import userPicture from '../http/helpers/user-picture';
import Alert from '../components/Alert';

const Feed: React.FC = () => {
  const { currentUser } = useAppContext() as any;
  return (
    <IonPage>
      <UserHeader title="Home" />
      <IonContent fullscreen className="ion-padding-horizontal">
        {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT && (
          <Users />
        )}
        <Conditions />
        <PublicThreads />
      </IonContent>
    </IonPage>
  );
};

export default Feed;

function Users() {
  const [professionals, setProfessionals] = useState<any[] | null>(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(() => {
    getUsers(currentUser.token).then(({ data }) => {
      isMounted && setProfessionals(data.filter((pro: ProfileData) => {
        return pro._id !== currentUser._id && !!pro.speciality;
      }).splice(0, 6));
    }).catch(err => {
      onError(err.message);
    });
  });

  useIonViewWillLeave(() => setMounted(false));

  return (
    <>
      <h6>Professionals</h6>

      <Alert text="Click a professional below or explore more and book an appointment." variant="success" />

      <div>
        {!professionals ? (
          <UsersLoader />
        ) : !professionals.length ? (
          <IonText className="ion-text-center">
            <p className="ion-no-margin">Nothing here yet</p>
          </IonText>
        ) : (
              <>
                <div className="d-flex profession-card-feed">
                  {professionals && professionals.map((pro: ProfileData) => (
                    <ProfessionalCard professional={pro} key={pro._id} />
                  ))}
                </div>
                <div className="d-flex ion-justify-content-center">
                  <IonButton
                    fill="clear"
                    color="medium"
                    size="small"
                    routerLink="/app/professionals">
                    Discover more
                    <IonIcon slot="end" icon={arrowForwardSharp} />
                  </IonButton>
                </div>
              </>
            )}
      </div>
    </>
  );
}

function Conditions() {
  const [conditions, setConditions] = useState<any[] | null>(null);
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;

  useEffect(() => {
    getConditions(currentUser.token).then(({ data }) => {
      isMounted && setConditions(data);
    }).catch(err => {
      onError(err.message);
    });

    return () => setMounted(false);
  }, []);

  return (
    <>
      <h6>Conditions</h6>
      <div>
        {!conditions ? (
          <ConditionsLoader />
        ) : !conditions.length ? (
          <IonText className="ion-text-center">
            <p className="ion-no-margin">Nothing here yet</p>
          </IonText>
        ) : (
              <>
                <IonList lines="full">
                  {conditions.map((condition: any) => (
                    <IonItem
                      key={condition.id}
                      routerLink={`/app/info/${condition.id}/details`}
                      className="listing-item"
                    >
                      <IonLabel>
                        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
                          {condition.name}
                        </h3>
                        <p>{condition.description}</p>
                      </IonLabel>
                      <IonLabel
                        slot="end"
                        className="d-flex ion-justify-content-end ion-align-items-center"
                        style={{
                          gap: "0.15em",
                        }}
                      >
                        <IonIcon icon={calendarOutline} /><small>{moment(condition.createdAt).format("ll")}</small>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
                <div className="d-flex ion-justify-content-center">
                  <IonButton
                    fill="clear"
                    color="medium"
                    size="small"
                    routerLink="/app/info">
                    Discover more
                  <IonIcon slot="end" icon={arrowForwardSharp} />
                  </IonButton>
                </div>
              </>
            )}

        {(currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT) && (
          <Centered>
            <IonButton
              fill="clear"
              color="success"
              size="small"
              routerLink="/app/info/new">
              Post
            <IonIcon slot="end" icon={createSharp} />
            </IonButton>
          </Centered>
        )}
      </div>
    </>
  );
}

function PublicThreads() {
  const history = useHistory();
  const [threads, setThreads] = useState<any[] | null>(null);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useEffect(() => {
    getPublicThreads(currentUser.token).then(({ data }) => {
      isMounted && setThreads(data);
    }).catch(err => {
      onError(err.message);
    });

    return () => setMounted(false);
  }, []);

  const toThread = (thread: any) => () => {
    history.push("/app/chat/" + thread._id, {
      fullName: thread.name || thread._id,
    });
  }

  return (
    <>
      <h6>Public chats</h6>
      <div>
        {!threads ? (
          <ThreadsLoader />
        ) : !threads.length ? (
          <IonText className="ion-text-center">
            <p className="ion-no-margin">Nothing here yet</p>
          </IonText>
        ) : threads?.map(thread => (
          <IonChip
            onClick={toThread(thread)}
            key={thread._id}
            outline={true}
            color="secondary">
            {thread.name ? thread.name : thread._id}
          </IonChip>
        ))}
      </div>
    </>
  );
}

function ProfessionalCard({ professional }: {
  professional: any,
}) {
  return (
    <div className="ion-align-self-center ion-align-items-center">
      <IonCard routerLink={`/app/profile/${professional._id}`} style={{
        minWidth: "10em",
      }}>
        <IonCardContent style={{
          padding: "0.5em",
        }}>
          <Centered>
            <div>
              <Centered>
                <IonAvatar>
                  <img src={userPicture(professional)} alt={professional.fullName} />
                </IonAvatar>
              </Centered>
              <IonText className="ion-text-center">
                <h4 className="ion-text-capitalize">{professional.fullName}</h4>
                <IonBadge color="secondary">
                  {professional.speciality}
                </IonBadge>
                <p className="ion-no-margin">
                  <small>
                    <strong>
                      {professional.rating ? (
                        <Rating rating={professional.rating} />
                      ) : "No rating"}
                    </strong>
                  </small>
                </p>
              </IonText>
            </div>
          </Centered>
        </IonCardContent>
      </IonCard>
    </div>
  );
}

function UsersLoader() {
  const Inner = () => (
    <IonCol size="4">
      <IonSkeletonText animated style={{
        width: "100%",
        height: "6em",
        borderRadius: "0.5em"
      }} />
    </IonCol>
  );

  return (
    <IonGrid>
      <IonRow>
        {[1, 2, 3].map((val) => (
          <Inner key={val} />
        ))}
      </IonRow>
    </IonGrid>
  );
}

function ConditionsLoader() {
  const Inner = () => (
    <IonSkeletonText animated style={{
      width: "100%",
      height: "3em"
    }} />
  );

  return (
    <div>
      {[1, 2, 3].map((val) => (
        <Inner key={val} />
      ))}
    </div>
  );
}

function ThreadsLoader() {
  const Inner = () => (
    <IonSkeletonText animated style={{
      width: "8em",
      height: "2em",
      borderRadius: "1em",
    }} />
  );

  return (
    <div className="d-flex" style={{ gap: "0.5em" }}>

      {[1, 2, 3, 4, 5].map(val => (
        <Inner key={val} />
      ))}
    </div>
  );
}