import React, { useState } from "react";
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonText, IonList, IonLabel, IonListHeader, useIonViewWillLeave, useIonViewDidEnter, IonCard, IonCardContent } from "@ionic/react";
import { useParams, useHistory } from "react-router";
import moment from "moment";

import useToastManager from "../lib/toast-hook";
import { getById } from "../http/conditions";
import LoadingFallback from "../components/LoadingFallback";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";
import { useAppContext } from "../lib/context-lib";
import mediaUrl from "../http/helpers/media-url";

export default function Condition() {
  const { conditionId } = useParams<any>();
  const history = useHistory();
  let [condition, setCondition] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;

  const getConditionDetails = async () => {
    try {
      const { data } = await getById(conditionId, currentUser.token);
      if (!data) {
        onError("No condition details found");
        history.replace("/app/info");
      } else {
        isMounted && setCondition(data);
      }
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    getConditionDetails();
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app" />
          </IonButtons>
          <IonTitle>Condition Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loadError ? (
          <ErrorFallback />
        ) : !condition ? (
          <LoadingFallback />
        ) : (
              <ConditionDetails condition={condition} />
            )}
      </IonContent>
    </IonPage>
  );
}

function ConditionDetails({ condition }: {
  condition: any,
}) {
  const { media } = condition;
  const url = mediaUrl(condition._id);

  return (
    <div className="ion-padding-horizontal">
      <IonText>
        <h2 className="ion-text-capitalize">{condition.name}</h2>
        <small>Posted on <strong>
          {moment(condition.createdAt).format("ll")} - {" "}
          {moment(condition.createdAt).format("LT")}
        </strong></small>

        {media.kind && (
          media.kind === "image" ? (
            <img src={url} alt="condition media" />
          ) : (
              <video src={url} className="w100" controls />
            )
        )}

        <p>{condition.description}</p>

        <IonList>
          <IonListHeader>
            <IonLabel>
              <strong>Symptoms</strong>
            </IonLabel>
          </IonListHeader>
          {splitParagraphs(condition.symptoms).map((symp: string, index: number) => (
            <CardItem key={index} text={symp} />
          ))}
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>
              <strong>Possible remedies</strong>
            </IonLabel>
          </IonListHeader>
          {splitParagraphs(condition.remedies).filter(
            (c: any) => !!c
          ).map(
            (remedy: string, index: number) => (
              <CardItem key={index} text={remedy} />
            )
          )}
        </IonList>
      </IonText>
    </div>
  );
}

function CardItem({ text }: { text: any }) {
  return (
    <IonCard>
      <IonCardContent style={{
        padding: "0.5em"
      }}>
        <IonText color="dark">
          {text}
        </IonText>
      </IonCardContent>
    </IonCard>
  );
}

function splitParagraphs(text: string): string[] {
  return text.split("\n").filter((s: string) => !!s)
}