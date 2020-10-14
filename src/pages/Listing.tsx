import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRow, IonCol, IonText, IonIcon, IonButtons, IonBackButton, IonSearchbar, IonGrid, IonItem, IonLabel, IonRange, IonCheckbox, IonInput, IonToggle, IonSelectOption, IonSelect, IonDatetime, IonThumbnail, IonAvatar, IonList, IonChip, IonBadge, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import { caretBackCircle, search, personCircle, ellipsisHorizontal, ellipsisVertical, checkmarkCircle, shuffle, star, informationCircle, navigate, home, closeCircle, person, businessOutline, close } from 'ionicons/icons';

import './Listing.css';
import Rating from '../components/Rating';
import defaultAvatar from "../assets/img/default_avatar.jpg";
import { getUsers } from "../http/users";
import useToastManager from '../lib/toast-hook';
import LoadingFallback from '../components/LoadingFallback';
import { USER } from '../http/constants';
import UserHeader from '../components/UserHeader';
import debounce from '../lib/debounce';
import useMounted from '../lib/mounted-hook';
import ErrorFallback from '../components/ErrorFallback';
import { useAppContext } from '../lib/context-lib';
import { ProfileData } from '../components/UserDetails';

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
      const { data } = await getUsers(opts);
      isMounted && setProfessionals(data.filter(
        (user: ProfileData) => user._id !== currentUser._id)
      );
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    fetchProfessionals({}).then();
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  const onToggle = () => setShowSearchBar(!showSearchBar);
  const closeSearchBar = async () => {
    setShowSearchBar(false);
    console.log("Fetching");
    await fetchProfessionals();
  };


  return (
    <IonPage>
      <UserHeader title="Professionals" secondary={
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
          <ErrorFallback />
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
    </IonPage >
  );
};

export default Listing;

function ListingItem({ prof }: any) {
  return (
    <IonItem routerLink={`/app/profile/${prof._id}`} className="listing-item">
      <IonAvatar slot="start">
        <img src={defaultAvatar} alt={prof.fullName} />
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
        {prof.rating ? (
          <>
            <Rating rating={prof.rating} /><br />
          </>
        ) : "No rating."}
        {prof.speciality.map((s: any) => <IonBadge color="secondary">{s}</IonBadge>)}
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
