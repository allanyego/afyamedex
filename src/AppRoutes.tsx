import React, { Suspense, useEffect, useState } from "react";
import { Plugins, Capacitor } from '@capacitor/core';
import { BackButtonEvent } from "@ionic/core";

import SuspenseFallback from './components/SuspenseFallback';
import useMounted from './lib/mounted-hook';
import { useAppContext } from "./lib/context-lib";
import { IonAlert, IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router";
const Home = React.lazy(() => import("./pages/Home"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const AccountType = React.lazy(() => import("./pages/AccountType"));
const Main = React.lazy(() => import("./pages/Main"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));

const AppRoutes: React.FC = () => {
  const [isAlertOpen, setAlertOpen] = useState(false);
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;

  const closeAlert = () => setAlertOpen(false);

  const hardwareBackBtnHandler = (ev: BackButtonEvent) => {
    ev.detail.register(5, () => {
      const path = window.location.pathname;
      const isFirstPage = path === "/" || path === "/app/feed";
      if (window.history.length === 1 || isFirstPage) {
        isMounted && setAlertOpen(true);
      } else {
        window.history.back();
      }
    });
  };

  useEffect(() => {
    if (Capacitor.isNative) {
      document.addEventListener("ionBackButton" as any, hardwareBackBtnHandler);
    }

    return () => {
      document.removeEventListener("ionBackButton" as any, hardwareBackBtnHandler);
      setMounted(false);
    }
  }, []);

  return (
    <>
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
            handler: () => true,
          },
          {
            text: 'Leave',
            handler: Plugins.App.exitApp
          }
        ]}
      />

      <Suspense fallback={<SuspenseFallback />}>
        <IonRouterOutlet id="router-outlet">
          <Route path="/home" render={redirectToApp(Home, currentUser)} exact />
          <Route path="/sign-in" render={redirectToApp(SignIn, currentUser)} exact />
          <Route path="/sign-up" render={redirectToApp(SignUp, currentUser)} exact />
          <Route path="/reset-password" render={redirectToApp(ResetPassword, currentUser)} exact />
          <Route path="/app" render={() => currentUser ? <Main /> : redirect("/sign-in")} />
          <Route
            path="/account-type"
            exact
            render={() => currentUser ?
              currentUser.accountType ? redirect("/app") : <AccountType />
              : redirect("/sign-in")}
          />
          <Route render={() => redirect("/home")} exact />
        </IonRouterOutlet>
      </Suspense>
    </>
  );
}

export default AppRoutes;

// Helper functions to aid in navigation
function redirect(path: string) {
  return <Redirect to={path} />
}

function redirectToApp(Comp: React.FC, currentUser: any) {
  return () => !currentUser ? <Comp /> : redirect("/app");
}