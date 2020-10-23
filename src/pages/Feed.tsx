import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonPage, IonText, IonList, IonItem, IonLabel, IonCardContent, IonAvatar, IonCard, IonIcon, IonChip } from '@ionic/react';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import { arrowForwardSharp, timeSharp } from 'ionicons/icons';
import moment from "moment";

import useToastManager from '../lib/toast-hook';
import { getConditions } from '../http/conditions';
import defaultAvatar from "../assets/img/default_avatar.jpg";
import { ProfileData } from '../components/UserDetails';
import Rating from '../components/Rating';
import LoadingFallback from '../components/LoadingFallback';
import UserHeader from '../components/UserHeader';
import { getUsers } from '../http/users';
import { getPublicThreads } from "../http/messages";
import "./Feed.css";
import { USER } from '../http/constants';
import useMounted from '../lib/mounted-hook';

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

  useEffect(() => {
    // getUsers({}).then(({ data }) => {
    //   isMounted && setProfessionals(data.splice(0, 6).filter((pro: ProfileData) => pro._id !== currentUser._id));
    // }).catch(err => {
    //   onError(err.message);
    // });

    return () => setMounted(false);
  }, []);

  return (
    <>
      <h6>Professionals</h6>
      <div>
        {!professionals ? (
          <LoadingFallback />
        ) : !professionals.length ? (
          <IonText className="ion-text-center">
            <p className="ion-no-margin">Nothing here yet</p>
          </IonText>
        ) : (
              <>
                <div className="d-flex profession-card-feed">
                  {professionals && professionals.map((pro: ProfileData) => (
                    <ProfessionalCard professional={pro} />
                  ))}
                </div>
                {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT && (
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
                )}
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

  useEffect(() => {
    getConditions().then(({ data }) => {
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
          <LoadingFallback />
        ) : !conditions.length ? (
          <IonText className="ion-text-center">
            <p className="ion-no-margin">Nothing here yet</p>
          </IonText>
        ) : (
              <>
                <IonList lines="full">
                  {conditions && conditions!.map((condition: any) => (
                    // <ConditionItem key={condition._id} condition={condition} />
                    <IonItem
                      key={condition._id}
                      routerLink={`/app/${condition._id}/details`}
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
                        <IonIcon icon={timeSharp} /><small>{moment(condition.createdAt).format("LT")}</small>
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
          <LoadingFallback />
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
      <IonCard routerLink={`/app/profile/${professional._id}`}>
        <IonCardContent>
          <div className="d-flex ion-justify-content-center ion-align-items-center">
            <div>
              <IonAvatar>
                <img src={defaultAvatar} alt={professional.fullName} />
              </IonAvatar>
              <IonText className="ion-text-center">
                <h4 className="ion-text-capitalize">{professional.fullName}</h4>
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
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
}