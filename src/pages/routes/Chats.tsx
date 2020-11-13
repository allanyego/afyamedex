import React from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import Thread from "../Thread";
import Chat from "../Chat";

const Chats = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={`${path}/:threadId`} component={Thread} exact />
        <Route path={path} component={Chat} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

export default Chats;