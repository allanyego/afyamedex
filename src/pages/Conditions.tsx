import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonCardTitle, IonCardContent, IonCard, IonCardHeader, IonCardSubtitle, IonButton, IonIcon } from "@ionic/react";
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
  const [conditions, setConditions] = useState<null | any[]>(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;

  useEffect(() => {
    getConditions().then(({ data }: any) => {
      setConditions(data);
    }).catch(error => {
      onError(error.message);
    });
  }, []);

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
            <>
              {conditions!.map((condition: any) => (
                <ConditionCard key={condition._id} condition={condition} />
              ))}
            </>
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

function ConditionCard({ condition }: ConditionCardProps) {
  const { url } = useRouteMatch();

  return (
    <IonCard routerLink={`${url}/${condition._id}`}>
      <IonCardHeader>
        <IonCardTitle>{condition.name}</IonCardTitle>
        <IonCardSubtitle>
          <small>{moment(condition.createdAt).format("LT")}</small>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {condition.description.slice(0, 150) + "..."}
      </IonCardContent>
    </IonCard>
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