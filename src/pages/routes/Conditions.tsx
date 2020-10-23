import React, { Suspense } from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";

import SuspenseFallback from "../../components/SuspenseFallback";
const NewCondition = React.lazy(() => import("../NewCondition"));
const Condition = React.lazy(() => import("../Condition"));
const _Conditions = React.lazy(() => import("../Conditions"));

const Conditions = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      <Suspense fallback={<SuspenseFallback />}>
        <IonRouterOutlet>
          <Route path={path} component={_Conditions} exact />
          <Route path={`${path}/new`} component={NewCondition} exact />
          <Route path={`${path}/:conditionId/details`} component={Condition} exact />
        </IonRouterOutlet>
      </Suspense>
    </IonPage>
  );
}

export default Conditions;