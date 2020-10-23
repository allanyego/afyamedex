import React, { Suspense } from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import SuspenseFallback from "../../components/SuspenseFallback";
const Checkout = React.lazy(() => import("../Checkout"));
const Meeting = React.lazy(() => import("../Meeting"));
const OnSite = React.lazy(() => import("../OnSite"));
const Review = React.lazy(() => import("../Review"));
const _Appointments = React.lazy(() => import("../Appointments"));

const Appointments: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      <Suspense fallback={<SuspenseFallback />}>
        <IonRouterOutlet>
          <Route path={path} component={_Appointments} exact />
          <Route path={`${path}/review`} component={Review} exact />
          <Route path={`${path}/virtual`} component={Meeting} exact />
          <Route path={`${path}/on-site`} component={OnSite} exact />
          <Route path={`${path}/checkout/:appointmentId`} component={Checkout} exact />
        </IonRouterOutlet>
      </Suspense>
    </IonPage>
  );
}

export default Appointments;