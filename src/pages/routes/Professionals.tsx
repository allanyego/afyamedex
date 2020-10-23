import React, { Suspense } from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import SuspenseFallback from "../../components/SuspenseFallback";
const Listing = React.lazy(() => import("../Listing"));
const BookAppointment = React.lazy(() => import("../BookAppointment"));

const Professionals = () => {
  const { path } = useRouteMatch();
  return (
    <IonPage>
      <Suspense fallback={<SuspenseFallback />}>
        <IonRouterOutlet>
          <Route path={path} component={Listing} exact />
          <Route path={`${path}/:professionalId/book`} component={BookAppointment} exact />
        </IonRouterOutlet>
      </Suspense>
    </IonPage>
  );
}

export default Professionals;