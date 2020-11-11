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
    <div>
      <div className="d-flex ion-justify-content-center ion-align-items-center" style={{
        fontSize: "3em",
        gap: "0.25em"
      }}>
        <IonText color="medium">
          <strong>KES</strong>
        </IonText>
        <div style={{
          background: "var(--ion-color-success-tint)",
          padding: "0.25em",
          borderRadius: "0.25em",
        }}>
          <strong>{amount}</strong>
        </div>
      </div>
      <IonText className="ion-text-center">
        <p>
          Enter card details to complete payment.
        </p>
      </IonText>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </div>
  );
};

export default CardSection;