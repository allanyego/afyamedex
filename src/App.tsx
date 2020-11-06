import React, { useState, useEffect } from 'react';
import { IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js"
import { Capacitor, SplashScreen } from '@capacitor/core';

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

import { AppContext } from './lib/context-lib';
import "./App.css";
import ToastManager from './components/ToastManager';
import { getObject, clear, setObject } from './lib/storage';
import { STORAGE_KEY, USER } from './http/constants';
import LoadingFallback from './components/LoadingFallback';
import { personSharp, peopleSharp, exitSharp, fileTrayFullSharp, chatbubblesSharp, homeSharp } from 'ionicons/icons';
import { ProfileData } from './components/UserDetails';
import { Detector } from 'react-detect-offline';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

const stripePromise = loadStripe("pk_test_lx1Waow5lgsLqWZfGakpklYO00rvf5kGYa");

const App: React.FC = () => {
  const [currentUser, setCurrUser] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  // const [isAlertOpen, setAlertOpen] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(true);
  // const { isMounted, setMounted } = useMounted();

  // Close app is there is nothing left in the stack
  // const hardwareBackButtonHandler = () => {
  //   isMounted && setAlertOpen(true);
  // };

  const setCurrentUser = async (currUser: ProfileData) => {
    const newDetails = {
      ...currentUser,
      ...currUser,
    };
    await setObject(STORAGE_KEY, {
      currentUser: newDetails,
    });

    setCurrUser(newDetails);
  };

  useEffect(() => {
    // Hide splashscreen if app loads in under 4s
    SplashScreen.hide();

    if (Capacitor.isNative) {
      // Plugins.App.addListener("backButton", hardwareBackButtonHandler);
    }

    getObject(STORAGE_KEY).then(data => {
      if (data && data.currentUser) {
        setCurrUser(data.currentUser);
      }

      setAuthenticating(false);
    });

    return () => {
      // Plugins.App.removeAllListeners();
      // setMounted(false);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await clear();
      setCurrUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ErrorBoundary>
      <Elements stripe={stripePromise}>
        <IonApp>
          <AppContext.Provider value={{
            currentUser,
            setCurrentUser,
            notifications,
            setNotifications,
            socket,
            setSocket,
          }}>
            {currentUser && (
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

                    {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT && (
                      <IonItem routerLink="/app/professionals">
                        <IonIcon slot="start" icon={peopleSharp} />
                        <IonLabel>Browse</IonLabel>
                      </IonItem>
                    )}

                    <IonItem routerLink="/app/appointments">
                      <IonIcon slot="start" icon={fileTrayFullSharp} />
                      <IonLabel>Appointments</IonLabel>
                    </IonItem>

                    <IonItem routerLink="/app/chat">
                      <IonIcon slot="start" icon={chatbubblesSharp} />
                      <IonLabel>Chat</IonLabel>
                    </IonItem>

                    <IonItem onClick={handleLogout}>
                      <IonIcon color="danger" slot="start" icon={exitSharp} />
                      <IonLabel color="danger">Logout</IonLabel>
                    </IonItem>

                  </IonList>
                </IonContent>
              </IonMenu>
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