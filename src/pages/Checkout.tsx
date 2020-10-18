import React, { useState } from "react";
import { IonPage, IonContent, IonButton, useIonViewDidEnter } from "@ionic/react";
import { useParams, useLocation, useHistory } from "react-router";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import CardSection from "../components/CardSection";
import { checkout } from "../http/appointments";
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import ErrorFallback from "../components/ErrorFallback";


const Checkout: React.FC = () => {
  const [data, setData] = useState<{
    clientSecret: string,
    amount: number,
  } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { appointmentId } = useParams();
  const { state } = useLocation<{ duration: number }>();
  const history = useHistory();
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();

  useIonViewDidEnter(async () => {
    if (!state || !state.duration) {
      history.replace("/app/appointments");
    }
    try {
      const { data } = await checkout(appointmentId, currentUser.token, {
        duration: 30,
      });
      setData(data);
    } catch (error) {
      setLoadError(true);
      onError(error.message);
    }
  });

  const handleSubmit = async (event: any) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(data!.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement) as any,
          billing_details: {
            name: currentUser.fullName,
          },
        }
      });

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        onError(result.error.message);
        console.log(result.error.message);
      } else {
        // The payment has been processed!
        if (result.paymentIntent!.status === 'succeeded') {
          // Show a success message to your customer
          // There's a risk of the customer closing the window before callback
          // execution. Set up a webhook or plugin to listen for the
          // payment_intent.succeeded event that handles any business critical
          // post-payment actions.
          onSuccess(`Payment of $${data!.amount}completed successfully.`);
        }
      }
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {!data ? (
          <LoadingFallback />
        ) : loadError ? (
          <ErrorFallback />
        ) : (
              <div className="d-flex ion-justify-align-items-center">
                <form onSubmit={handleSubmit}>
                  <CardSection amount={data.amount} />
                  <IonButton type="submit" disabled={!stripe}>Pay ${data.amount}</IonButton>
                </form>
              </div>
            )}
      </IonContent>
    </IonPage>
  );
};

export default Checkout;