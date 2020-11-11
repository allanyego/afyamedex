import { IonButton, IonContent, IonPage, IonTitle, IonToolbar, IonRow, IonCol, IonText, IonRouterLink } from '@ionic/react';
import React from 'react';

import logo from "../assets/img/logo.png";

import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRow className="h100 ion-text-center home-page">
          <IonCol className="ion-align-self-center">
            <IonRow className="ion-justify-content-center">
              <IonCol size="7">
                <img src={logo} alt="afyamedex brand" className="d-block p-centered border-circle" />
              </IonCol>
            </IonRow>
            <IonButton color="light" expand="block" href="/sign-in">Sign in</IonButton>
            <IonText className="ion-text-center">
              <p>
                Don't have an account? <IonRouterLink href="/sign-up"
                  style={{
                    color: "var(--ion-color-secondary-contrast",
                  }}
                >Sign up</IonRouterLink>
              </p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Home;
