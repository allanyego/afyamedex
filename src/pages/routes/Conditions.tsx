import React from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";
import Condition from "../Condition";
import NewCondition from "../NewCondition";
import _Conditions from "../Conditions";

const Conditions = () => {
  const { path } = useRouteMatch();

  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={`${path}/:conditionId/details`} component={Condition} exact />
        <Route path={`${path}/new`} component={NewCondition} exact />
        <Route path={path} component={_Conditions} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

export default Conditions;