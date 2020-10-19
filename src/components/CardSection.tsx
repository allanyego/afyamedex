import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import './CardSection.css'
import { IonText, IonCard, IonCardContent } from '@ionic/react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

function CardSection({ amount }: { amount: number }) {
  return (
    <IonCard>
      <IonCardContent>
        <IonText className="ion-text-center">
          <p>
            Enter card details to complete payment of:<br />
            <strong>KES{amount}</strong>
          </p>
        </IonText>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </IonCardContent>
    </IonCard>
  );
};

export default CardSection;