import React, { useState, useEffect, useRef } from "react";
import { IonPage, IonContent, IonButton, IonIcon, useIonViewDidEnter, useIonViewDidLeave, IonItem, IonLabel, IonList, useIonViewWillLeave, IonGrid, IonRow, IonCol, IonSearchbar } from "@ionic/react";
import { useRouteMatch } from "react-router";
import moment from "moment";

import { getConditions } from "../http/conditions";
import useToastManager from "../lib/toast-hook";
import UserHeader from "../components/UserHeader";
import LoadingFallback from "../components/LoadingFallback";
import { add, close, search } from "ionicons/icons";
import { useAppContext } from "../lib/context-lib";
import { USER } from "../http/constants";
import useMounted from "../lib/mounted-hook";
import ErrorFallback from "../components/ErrorFallback";
import debounce from "../lib/debounce";

export default function Conditions() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isSearching, setSearching] = useState(false);
  let [conditions, setConditions] = useState<null | any[]>(null);
  const [loadError, setLoadError] = useState(false);
  const [listMargin, setListMargin] = useState(0);
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  const fetchConditions = async (_search?: string) => {
    try {
      const { data } = await getConditions(currentUser.token, _search);
      isMounted && setConditions(data);
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    fetchConditions();
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  const onToggle = () => setShowSearchBar(!showSearchBar);
  const closeSearchBar = async () => {
    setShowSearchBar(false);
    await fetchConditions();
  };

  return (
    <IonPage>
      <UserHeader title="Conditions" secondary={
        <Buttons {...{ showSearchBar, onClick: onToggle }} />
      } />
      <IonContent fullscreen className="listing-page">
        {showSearchBar && (
          <SearchBar {...{
            fetchResource: fetchConditions,
            closeSearchBar,
            setListMargin,
            setSearching
          }} />
        )}

        {loadError ? (
          <ErrorFallback />
        ) : (!conditions || isSearching) ? (
          <LoadingFallback />
        ) : (
              <IonList lines="full" style={{
                marginTop: listMargin,
              }}>
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
    <IonItem routerLink={`${url}/${condition._id}/details`} className="listing-item">
      <IonLabel>
        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
          {condition.name}
        </h3>
        <p>{condition.description}</p>
        <small>{moment(condition.createdAt).format("ll")}</small>
      </IonLabel>
    </IonItem>
  );
}

function Buttons({ showSearchBar, onClick }: any) {
  const { currentUser } = useAppContext() as any;
  return (
    <>
      <IonButton onClick={onClick} color={showSearchBar ? "danger" : "dark"}>
        <IonIcon slot="icon-only" icon={showSearchBar ? close : search} />
      </IonButton>
      {(currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT) && (
        <IonButton color="success" routerLink={`/app/info/new`}>
          <IonIcon slot="icon-only" icon={add} />
        </IonButton>
      )}
    </>
  );
}

interface SearchBarProps {
  fetchResource: (args: any) => Promise<any>
  closeSearchBar: (args: any) => void
  setListMargin: (args: any) => any
  setSearching: (args: any) => any
}

function SearchBar({ fetchResource, closeSearchBar, setListMargin, setSearching }: SearchBarProps) {
  const { onError } = useToastManager() as any;
  const searchBarRef = useRef(null);

  useEffect(() => {
    setListMargin((searchBarRef.current as any).getBoundingClientRect().height);

    return () => setListMargin(0);
  }, []);

  const handleSearch = async (e: any) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      return;
    }

    setSearching(true);

    try {
      await fetchResource(searchTerm);
    } catch (error) {
      onError(error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-bar" ref={searchBarRef} style={{
      top: "56px",
    }}>
      <IonGrid>
        <IonRow>
          <IonCol className="ion-no-padding">
            <IonSearchbar
              onIonChange={debounce(handleSearch, 1500)}
              showCancelButton="focus"
              cancelButtonText="Custom Cancel"
              onIonCancel={closeSearchBar}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
}