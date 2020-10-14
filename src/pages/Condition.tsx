import React, { useState, useEffect } from "react";
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonText, IonList, IonItem, IonLabel, IonSpinner, IonListHeader, useIonViewWillLeave, useIonViewDidEnter } from "@ionic/react";
import { useParams, useHistory } from "react-router";
import moment from "moment";

import useToastManager from "../lib/toast-hook";
import { getById } from "../http/conditions";
import LoadingFallback from "../components/LoadingFallback";

export default function Condition() {
  const { conditionId } = useParams();
  const history = useHistory();
  let [condition, setCondition] = useState<any>(null);
  const { onError } = useToastManager();

  const getConditionDetails = async () => {
    try {
      const { data } = await getById(conditionId);
      if (!data) {
        onError("No condition details found");
        history.replace("/app/info");
      } else {
        setCondition(data);
      }
    } catch (error) {
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    getConditionDetails().then();
  }, []);

  useIonViewWillLeave(() => {
    setCondition = () => null;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/info" />
          </IonButtons>
          <IonTitle>Condition Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding-horizontal">
          {!condition ? (
            <LoadingFallback />
          ) : (
              <IonText>
                <h2 className="ion-text-capitalize">{condition.name}</h2>
                <small>Posted on {moment(condition.createdAt).format("LT")}</small>
                <p>{condition.description}</p>

                <IonList>
                  <IonListHeader>
                    <IonLabel>
                      <strong>Symptoms</strong>
                    </IonLabel>
                  </IonListHeader>
                  {condition.symptoms.split('\n').map((symp: string, index: number) => (
                    <IonItem key={index}>
                      <IonLabel>{symp}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>

                <IonList>
                  <IonListHeader>
                    <IonLabel>
                      <strong>Possible remedies</strong>
                    </IonLabel>
                  </IonListHeader>
                  {condition.remedies.split('\n').map((remedy: string, index: number) => (
                    <IonItem key={index}>
                      <IonLabel>{remedy}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonText>
            )}
        </div>
      </IonContent>
    </IonPage>
  );
}