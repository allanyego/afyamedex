import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRow, IonCol, IonText, IonIcon, IonButtons, IonBackButton, IonSearchbar, IonGrid, IonItem, IonLabel, IonRange, IonCheckbox, IonInput, IonToggle, IonSelectOption, IonSelect, IonDatetime, IonThumbnail, IonAvatar, IonList, IonChip, IonBadge } from '@ionic/react';
import { caretBackCircle, search, personCircle, ellipsisHorizontal, ellipsisVertical, checkmarkCircle, shuffle, star, informationCircle, navigate, home, closeCircle, person, businessOutline, close } from 'ionicons/icons';

import './Listing.css';
import Rating from '../components/Rating';
import defaultAvatar from "../assets/img/default_avatar.jpg";
import { getUsers } from "../http/users";
import useToastManager from '../lib/toast-hook';
import LoadingFallback from '../components/LoadingFallback';
import { USER } from '../http/constants';
import UserHeader from '../components/UserHeader';

const Listing: React.FC = () => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [professionals, setProfessionals] = useState<any[] | null>(null);
  const [listMargin, setListMargin] = useState(0);
  const { onError } = useToastManager();

  const fetchProfessionals = async (opts?: any) => {
    try {
      const { data } = await getUsers(opts);
      setProfessionals(data);
    } catch (error) {
      onError(error.message);
    }
  };

  useEffect(() => {
    fetchProfessionals({}).then();
  }, []);

  const onToggle = () => setShowSearchBar(!showSearchBar);
  const closeSearchBar = () => setShowSearchBar(false);


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
          <SearchBar {...{ fetchProfessionals, closeSearchBar, setListMargin }} />
        )}

        {!professionals ? (
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
}

function SearchBar({ fetchProfessionals, closeSearchBar, setListMargin }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setSearching] = useState(false);
  const { onError } = useToastManager() as any;
  const searchBarRef = useRef(null);

  useEffect(() => {
    setListMargin((searchBarRef.current as any).getBoundingClientRect().height);

    return () => setListMargin(0);
  }, [])

  const handleChange = (e: any) => {
    setSearchTerm(e.target.value.trim());
  };
  const handleSearch = async () => {
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
              value={searchTerm}
              onIonChange={handleChange}
              showCancelButton="focus"
              cancelButtonText="Custom Cancel"
              onIonCancel={closeSearchBar}
            />
          </IonCol>
          <IonCol
            className="ion-no-padding d-flex ion-align-items-center"
            size="2">
            <IonButton expand="block" onClick={handleSearch}
              disabled={isSearching}>
              Go
          </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
}
