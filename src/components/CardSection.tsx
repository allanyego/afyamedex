import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import './CardSection.css'
import { IonText } from '@ionic/react';

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
    <label>
      <IonText className="ion-text-center">
        <p>Enter card details to complete payment of <strong>${amount}</strong></p>
      </IonText>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </label>
  );
};

export default CardSection;