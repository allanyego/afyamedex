import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonCardTitle, IonCardContent, IonCard, IonCardHeader, IonCardSubtitle, IonButton, IonIcon, useIonViewDidEnter, useIonViewDidLeave, IonItem, IonLabel, IonList } from "@ionic/react";
import { useRouteMatch } from "react-router";
import moment from "moment";

import { getConditions } from "../http/conditions";
import useToastManager from "../lib/toast-hook";
import UserHeader from "../components/UserHeader";
import LoadingFallback from "../components/LoadingFallback";
import { add } from "ionicons/icons";
import { useAppContext } from "../lib/context-lib";
import { USER } from "../http/constants";

export default function Conditions() {
  let [conditions, setConditions] = useState<null | any[]>(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;

  useIonViewDidEnter(() => {
    getConditions().then(({ data }: any) => {
      setConditions(data);
    }).catch(error => {
      onError(error.message);
    });
  }, []);

  useIonViewDidLeave(() => {
    setConditions = () => null;
  });

  return (
    <IonPage>
      <UserHeader title="Conditions" secondary={
        !(currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT) ? (
          <AddButton />
        ) : null
      } />
      <IonContent fullscreen>
        {!conditions ? (
          <LoadingFallback />
        ) : (
            <IonList>
              {conditions!.map((condition: any) => (
                <ConditionItem key={condition._id} condition={condition} />
              ))}
            </IonList>
          )}
      </IonContent>
    </IonPage>
  );
}

type ConditionCardProps = {
  condition: {
    _id: string,
    name: string,
    description: string,
    createdAt: any,
  }
};

function ConditionItem({ condition }: ConditionCardProps) {
  const { url } = useRouteMatch();

  return (
    <IonItem routerLink={`${url}/${condition._id}`} className="listing-item">
      <IonLabel>
        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
          {condition.name}
        </h3>
        <p>{condition.description}</p>
        <small>{moment(condition.createdAt).format("LT")}</small>
      </IonLabel>
    </IonItem>
  );
}

function AddButton() {
  const { url } = useRouteMatch();
  return (
    <IonButton color="secondary" routerLink={`${url}/new`}>
      <IonIcon slot="icon-only" icon={add} />
    </IonButton>
  );
}