import React from "react";
import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Route, useRouteMatch } from "react-router";
import BookAppointment from "../BookAppointment";
import Listing from "../Listing";

// const Listing = React.lazy(() => import("../Listing"));
// const BookAppointment = React.lazy(() => import("../BookAppointment"));

const Professionals = () => {
  const { path } = useRouteMatch();
  return (
    <IonPage>
      <IonRouterOutlet>
        <Route path={`${path}/:professionalId/book`} component={BookAppointment} exact />
        <Route path={path} component={Listing} exact />
      </IonRouterOutlet>
    </IonPage>
  );
}

export default Professionals;