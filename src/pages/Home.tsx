import { IonButton, IonContent, IonPage, IonTitle, IonToolbar, IonRow, IonCol, IonText } from '@ionic/react';
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
            <IonText color="light">
              <h3 className="ion-no-margin">Welcome</h3>
            </IonText>
            <IonButton color="light" expand="block" href="/sign-in">Sign in</IonButton>
            <IonText color="light">
              OR
            </IonText>
            <IonButton color="light" expand="block" href="/sign-up">Sign up</IonButton>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Home;
