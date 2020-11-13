import React, { Suspense } from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import SuspenseFallback from "../../components/SuspenseFallback";
import Checkout from "../Checkout";
import OnSite from "../OnSite";
import Review from "../Review";
import Tests from "../Tests";
import Meeting from "../Meeting";
import _Appointments from "../Appointments";

const Appointments: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={`${path}/checkout/:appointmentId`} component={Checkout} exact />
        <Route path={`${path}/on-site`} component={OnSite} exact />
        <Route path={`${path}/review`} component={Review} exact />
        <Route path={`${path}/tests`} component={Tests} exact />
        <Route path={`${path}/virtual`} component={Meeting} exact />
        <Route path={path} component={_Appointments} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

export default Appointments;