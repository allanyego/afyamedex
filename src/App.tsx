import React, { useState, useEffect } from 'react';
import { IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardContent, IonButton, IonText } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js"
import { SplashScreen } from '@capacitor/core';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { AppContext, useAppContext } from './lib/context-lib';
import "./App.css";
import ToastManager from './components/ToastManager';
import { getObject, clear, setObject } from './lib/storage';
import { STORAGE_KEY, USER } from './http/constants';
import { editUser, removeNotificationToken } from "./http/users";
import LoadingFallback from './components/LoadingFallback';
import { personSharp, peopleSharp, exitSharp, fileTrayFullSharp, chatbubblesSharp, homeSharp, ellipseSharp, walletSharp, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { ProfileData } from './components/UserProfile';
import { Detector } from 'react-detect-offline';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import useToastManager from './lib/toast-hook';
import NotificationsCTA from './components/NotificationsCTA';

const stripePromise = loadStripe("pk_test_lx1Waow5lgsLqWZfGakpklYO00rvf5kGYa");

const BookAppointmentCTA = () => (
  <IonCard>
    <IonCardContent>
      <IonButton
        expand="block"
        shape="round"
        routerLink="/app/professionals"
        color="secondary"
      >
        Book Appointment</IonButton>
    </IonCardContent>
  </IonCard>
);

const ToggleAvailabilityCTA = () => {
  const [isUpdating, setUpdating] = useState(false);
  const { currentUser, setCurrentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const toggleAvailability = async () => {
    setUpdating(true);
    try {
      const available = currentUser.available;
      await editUser(currentUser._id, currentUser.token, {
        available: !available,
      });
      setCurrentUser({
        available: !available,
      });
      setUpdating(false);
    } catch (error) {
      onError(error.message);
      setUpdating(false);
    }
  }
  return (
    <IonCard>
      <IonCardContent>
        <p className="ion-no-margin ion-text-center">
          {currentUser.available ? (
            <IonText color="success"><IonIcon icon={checkmarkCircle} /> Available</IonText>
          ) : (
              <IonText color="danger"><IonIcon icon={closeCircle} /> Unavailable</IonText>
            )}
        </p>
        <IonButton
          expand="block"
          shape="round"
          color="secondary"
          onClick={toggleAvailability}
          disabled={isUpdating}
        >
          {isUpdating ? "Changing..." : "Change"}
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
}

const Menu: React.FC<{
  currentUser: any,
  handleLogout: any,
}> = ({ currentUser, handleLogout }) => (
  <IonMenu side="start" menuId="super-cool-menu" contentId="router-outlet"
    swipeGesture={false}
  >
    <IonHeader>
      <IonToolbar color="secondary">
        <IonTitle className="ion-text-capitalize">{currentUser.fullName}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonList lines="full">
        <IonItem routerLink="/app/profile">
          <IonIcon slot="start" icon={personSharp} />
          <IonLabel>Profile</IonLabel>
        </IonItem>

        <IonItem routerLink="/app">
          <IonIcon slot="start" icon={homeSharp} />
          <IonLabel>Home</IonLabel>
        </IonItem>

        <IonItem routerLink="/app/info">
          <IonIcon slot="start" icon={ellipseSharp} />
          <IonLabel>Conditions</IonLabel>
        </IonItem>

        {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT && (
          <IonItem routerLink="/app/professionals">
            <IonIcon slot="start" icon={peopleSharp} />
            <IonLabel>Professionals/Institutions</IonLabel>
          </IonItem>
        )}

        <IonItem routerLink="/app/appointments">
          <IonIcon slot="start" icon={fileTrayFullSharp} />
          <IonLabel>Appointments</IonLabel>
        </IonItem>

        {currentUser.accountType !== USER.ACCOUNT_TYPES.PATIENT && (
          <IonItem routerLink="/app/appointments/payments">
            <IonIcon slot="start" icon={walletSharp} />
            <IonLabel>Payments</IonLabel>
          </IonItem>
        )}

        <IonItem routerLink="/app/chat">
          <IonIcon slot="start" icon={chatbubblesSharp} />
          <IonLabel>Inbox</IonLabel>
        </IonItem>

        <IonItem onClick={handleLogout} button>
          <IonIcon color="danger" slot="start" icon={exitSharp} />
          <IonLabel color="danger">Logout</IonLabel>
        </IonItem>

      </IonList>

      {(currentUser.accountType && currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT) ? (
        <BookAppointmentCTA />
      ) : (
          <ToggleAvailabilityCTA />
        )}

      <NotificationsCTA />

    </IonContent>
  </IonMenu>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [socket, setSocket] = useState(null);
  // const [isAlertOpen, setAlertOpen] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(true);

  const _setCurrentUser = async (currUser: ProfileData | null) => {
    if (!currUser) {
      await clear();
      return setCurrentUser(currUser);
    }

    const newDetails = {
      ...currentUser,
      ...currUser,
    };
    await setObject(STORAGE_KEY, {
      currentUser: newDetails,
    });

    setCurrentUser(newDetails);
  };

  useEffect(() => {
    // Hide splashscreen if app loads in under 4s
    SplashScreen.hide();

    getObject(STORAGE_KEY).then(data => {
      if (data && data.currentUser) {
        setCurrentUser(data.currentUser);
      }

      setAuthenticating(false);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await removeNotificationToken(currentUser?._id, currentUser?.pushNotifications, currentUser?.token);
      _setCurrentUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ErrorBoundary>
      <Elements stripe={stripePromise}>
        <IonApp>
          <AppContext.Provider value={{
            setCurrentUser: _setCurrentUser,
            activeAppointment,
            setActiveAppointment,
            currentUser,
            notifications,
            setNotifications,
            socket,
            setSocket,
          }}>
            {currentUser && (
              <Menu {...{ currentUser, handleLogout }} />
            )}
            <IonReactRouter>
              <ToastManager />
              {isAuthenticating ? (
                <LoadingFallback />
              ) : (
                  <AppRoutes />
                )}

              <Detector render={(props) => {
                return props.online ?
                  null : <div
                    className="network-detector-status">Seems you're offline</div>
              }} />
            </IonReactRouter>
          </AppContext.Provider>
        </IonApp>
      </Elements>
    </ErrorBoundary>
  );
};

export default App;