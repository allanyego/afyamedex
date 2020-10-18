import React, { useState, useEffect } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js"
import { Plugins, Capacitor } from '@capacitor/core';

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

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AccountType from './pages/AccountType';
import Main from './pages/Main';
import { AppContext } from './lib/context-lib';
import "./App.css";
import ToastManager from './components/ToastManager';
import { getObject, clear } from './lib/storage';
import { STORAGE_KEY, USER } from './http/constants';
import LoadingFallback from './components/LoadingFallback';
import { personSharp, peopleSharp, exitSharp, helpCircleSharp, fileTrayFullSharp, chatbubblesSharp, homeSharp } from 'ionicons/icons';
import useToastManager from './lib/toast-hook';
import { ProfileData } from './components/UserDetails';
import { Detector } from 'react-detect-offline';
import useMounted from './lib/mounted-hook';

const stripePromise = loadStripe("pk_test_lx1Waow5lgsLqWZfGakpklYO00rvf5kGYa");

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const history = useHistory();
  const [isAuthenticating, setAuthenticating] = useState(true);
  const { onError } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  const closeAlert = () => setAlertOpen(false)
  // Close app is there is nothing left in the stack
  const hardwareBackButtonHandler = () => {
    isMounted && setAlertOpen(true);
  };

  useEffect(() => {
    if (Capacitor.isNative) {
      Plugins.App.addListener("backButton", hardwareBackButtonHandler);
    }

    getObject(STORAGE_KEY).then(data => {
      if (data && data.currentUser) {
        setCurrentUser(data.currentUser);
      }

      setAuthenticating(false);
    });

    return () => {
      Plugins.App.removeAllListeners();
      setMounted(false);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await clear();
      setCurrentUser(null);
      history.replace("/sign-in");
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <IonApp>
        <IonAlert
          isOpen={isAlertOpen}
          onDidDismiss={closeAlert}
          cssClass="exit-app-alert"
          header={"Leaving?"}
          message="Are you you sure you want to leave?"
          buttons={[
            {
              text: 'Stay',
              role: 'cancel',
              cssClass: 'danger',
              handler: () => true
            },
            {
              text: 'Leave',
              handler: Plugins.App.exitApp
            }
          ]}
        />
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

                  <IonItem routerLink="/app/feed">
                    <IonIcon slot="start" icon={homeSharp} />
                    <IonLabel>Feed</IonLabel>
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
                <>
                  <IonRouterOutlet id="router-outlet">
                    <Route path="/home" render={redirectToApp(Home, currentUser)} exact />
                    <Route path="/sign-in" render={redirectToApp(SignIn, currentUser)} exact={true} />
                    <Route path="/sign-up" render={redirectToApp(SignUp, currentUser)} exact={true} />
                    <Route path="/app" render={() => currentUser ? <Main /> : redirect("/sign-in")} />
                    <Route
                      path="/account-type"
                      exact
                      render={() => currentUser ?
                        currentUser.accountType ? redirect("/app") : <AccountType />
                        : redirect("/sign-in")}
                    />
                    <Route path="/" render={() => redirect("/home")} exact />
                  </IonRouterOutlet>
                </>
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
  );
};

function redirect(path: string) {
  return <Redirect to={path} />
}

function redirectToApp(Comp: React.FC, currentUser: any) {
  return () => !currentUser ? <Comp /> : redirect("/app");
}

export default App;
