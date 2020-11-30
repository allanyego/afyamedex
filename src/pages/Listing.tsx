import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonPage, IonRow, IonCol, IonIcon, IonSearchbar, IonGrid, IonItem, IonLabel, IonAvatar, IonList, IonBadge, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import { search, person, businessOutline, close } from 'ionicons/icons';

import './Listing.css';
import { getUsers } from "../http/users";
import useToastManager from '../lib/toast-hook';
import LoadingFallback from '../components/LoadingFallback';
import { USER } from '../http/constants';
import UserHeader from '../components/UserHeader';
import debounce from '../lib/debounce';
import useMounted from '../lib/mounted-hook';
import ErrorFallback from '../components/ErrorFallback';
import { useAppContext } from '../lib/context-lib';
import { ProfileData } from '../components/UserProfile';
import RatingInfo from '../components/RatingInfo';
import userPicture from '../http/helpers/user-picture';

const Listing: React.FC = () => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isSearching, setSearching] = useState(false);
  let [professionals, setProfessionals] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [listMargin, setListMargin] = useState(0);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const fetchProfessionals = async (opts?: any) => {
    setProfessionals(null);
    try {
      const { data } = await getUsers(currentUser.token, opts);
      isMounted && setProfessionals(data.filter(
        (user: ProfileData) => user._id !== currentUser._id)
      );
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    fetchProfessionals({});
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  const onToggle = () => setShowSearchBar(!showSearchBar);
  const closeSearchBar = async () => {
    setShowSearchBar(false);
    await fetchProfessionals();
  };

  return (
    <IonPage>
      <UserHeader title="Listing" secondary={
        <IonButton onClick={onToggle} color={showSearchBar ? "danger" : "dark"}>
          <IonIcon slot="icon-only" icon={showSearchBar ? close : search} />
        </IonButton>
      }
      />
      <IonContent fullscreen className="listing-page">
        {showSearchBar && (
          <SearchBar {...{ fetchProfessionals, closeSearchBar, setListMargin, setSearching }} />
        )}

        {loadError ? (
          <ErrorFallback fullHeight />
        ) : (!professionals || isSearching) ? (
          <LoadingFallback />
        ) : (
              <IonList lines="full" style={{
                marginTop: listMargin,
              }}>
                {professionals.map((prof: any) => <ListingItem key={prof._id} prof={prof} />)}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  );
};

export default Listing;

function ListingItem({ prof }: {
  prof: ProfileData
}) {
  const [a, b, ...rest] = prof.speciality;

  return (
    <IonItem routerLink={`/app/profile/${prof._id}`} className="listing-item">
      <IonAvatar slot="start">
        <img src={userPicture(prof)} alt={prof.fullName} />
      </IonAvatar>
      <IonLabel>
        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
          {prof.fullName + "\t"}
          <IonIcon icon={
            prof.accountType === USER.ACCOUNT_TYPES.PROFESSIONAL ?
              person :
              businessOutline
          }
          />
        </h3>
        <p>{prof.bio || "No bio."}</p>
        <RatingInfo userId={prof._id as any} />
        <div className="profile-badges-container d-flex ion-align-items-center">
          {[a, b].map((s: any, idx: number) => <IonBadge key={`${s}${idx}`} color="secondary">{s}</IonBadge>)}{" "}
          <small>{rest.length ? `${rest.length} more` : null}</small>
        </div>
      </IonLabel>
    </IonItem>
  );
}

interface SearchBarProps {
  fetchProfessionals: (args: any) => Promise<any>
  closeSearchBar: (args: any) => void
  setListMargin: (args: any) => any
  setSearching: (args: any) => any
}

function SearchBar({ fetchProfessionals, closeSearchBar, setListMargin, setSearching }: SearchBarProps) {
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
      await fetchProfessionals({
        username: searchTerm
      });
    } catch (error) {
      onError(error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-bar" ref={searchBarRef}>
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
