import React, { useState } from 'react';
import { IonButton, IonContent, IonPage, IonRow, IonCol, IonText, IonRouterLink, IonItem, IonLabel, IonInput, IonList, IonCardContent, IonAvatar, IonCard, useIonViewWillEnter, IonIcon } from '@ionic/react';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { signIn, getUsers } from '../http/users';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import useToastManager from '../lib/toast-hook';
import FormFieldFeedback from '../components/FormFieldFeedback';
import { setObject } from '../lib/storage';
import { STORAGE_KEY } from '../http/constants';
import { ConditionItem } from './Conditions';
import { getConditions } from '../http/conditions';
import defaultAvatar from "../assets/img/default_avatar.jpg";
import { ProfileData } from '../components/UserDetails';
import Rating from '../components/Rating';
import { caretForwardSharp } from 'ionicons/icons';
import LoadingFallback from '../components/LoadingFallback';
import UserHeader from '../components/UserHeader';

const Feed: React.FC = () => {
  const { currentUser } = useAppContext() as any;
  const [professionals, setProfessionals] = useState<any[] | null>(null);
  const [conditions, setConditions] = useState<any[] | null>(null);
  const history = useHistory();
  const { onError } = useToastManager();

  useIonViewWillEnter(async () => {
    try {
      const [proResp, conResp] = [
        await getUsers({}),
        await getConditions(),
      ];

      proResp.data && setProfessionals(proResp.data);
      conResp.data && setConditions(conResp.data);
    } catch (error) {
      onError(error.message);
    }
  });

  return (
    <IonPage>
      <UserHeader title="Feed" />
      <IonContent fullscreen className="iton-padding">
        <h2>Welcome <strong>@{currentUser.username}</strong></h2>
        {!conditions && !professionals ? (
          <LoadingFallback />
        ) : (
            <>
              <h4>Top professionals</h4>
              <IonRow className="ion-justify-content-center">
                {professionals && professionals.map((pro: ProfileData) => (
                  <IonCol key={pro._id} className="ion-align-self-center" size="4">
                    <IonCard routerLink={`/app/profile/${pro._id}`}>
                      <IonCardContent>
                        <div className="d-flex ion-justify-content-center ion-align-items-center">
                          <div>
                            <IonAvatar>
                              <img src={defaultAvatar} alt={pro.fullName} />
                            </IonAvatar>
                            <IonText className="ion-text-center">
                              <h3 className="ion-text-capitalize">{pro.fullName}</h3>
                              <small>{pro.rating ? (
                                <Rating rating={pro.rating} />
                              ) : "No rating"}</small>
                            </IonText>
                          </div>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
              <h4>Conditions</h4>
              <IonList lines="full">
                {conditions && conditions!.map((condition: any) => (
                  <ConditionItem key={condition._id} condition={condition} />
                ))}
              </IonList>
              <div className="d-flex ion-justify-content-center">
                <IonButton color="secondary" routerLink="/app/info">
                  Discover more
                  <IonIcon slot="end" icon={caretForwardSharp} />
                </IonButton>
              </div>
            </>
          )}
      </IonContent>
    </IonPage>
  );
};

export default Feed;
