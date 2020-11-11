import React, { Suspense } from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import SuspenseFallback from "../../components/SuspenseFallback";
import Thread from "../Thread";
import Chat from "../Chat";
// const Chat = React.lazy(() => import("../Chat"));
// const Thread = React.lazy(() => import("../Thread"));

const Chats = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      {/* <Suspense fallback={<SuspenseFallback />}> */}
      <IonRouterOutlet>
        <Route path={`${path}/:threadId`} component={Thread} exact />
        <Route path={path} component={Chat} exact />
      </IonRouterOutlet>
      {/* </Suspense> */}
    </IonPage>
  );
}

export default Chats;