import React, { useState } from "react";
import { IonPage, IonIcon, IonContent, IonText, IonButton, useIonViewDidEnter, useIonViewWillLeave, IonSpinner } from "@ionic/react";
import { useParams, useLocation, useHistory } from "react-router";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { arrowBackSharp, checkmark } from 'ionicons/icons';

import CardSection from "../components/CardSection";
import { checkout, editAppointment } from "../http/appointments";
import { useAppContext } from "../lib/context-lib";
import useToastManager from "../lib/toast-hook";
import LoadingFallback from "../components/LoadingFallback";
import ErrorFallback from "../components/ErrorFallback";
import useMounted from "../lib/mounted-hook";
import Centered from "../components/Centered";


const Checkout: React.FC = () => {
  const [data, setData] = useState<{
    clientSecret: string,
    amount: number,
  } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isPaymentComplete, setPaymentComplete] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { appointmentId } = useParams<{
    appointmentId: string,
  }>();
  const { state } = useLocation<{ duration: number }>();
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useIonViewDidEnter(async () => {
    try {
      const resp = await checkout(appointmentId, currentUser.token);

      isMounted && setData(resp.data);
    } catch (error) {
      isMounted && setLoadError(true);
      onError(error.message);
    }
  });

  useIonViewWillLeave(() => {
    setData(null);
    setLoadError(false);
    setPaymentComplete(false);
    setMounted(false);
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
    setSubmitting(true);
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
      } else {
        // The payment has been processed!
        if (result.paymentIntent!.status === 'succeeded') {
          // Show a success message to your customer
          // There's a risk of the customer closing the window before callback
          // execution. Set up a webhook or plugin to listen for the
          // payment_intent.succeeded event that handles any business critical
          // post-payment actions.
          onSuccess(`Payment of KES.${data!.amount} completed successfully.`);
          setPaymentComplete(true);
          try {
            await editAppointment(appointmentId, currentUser.token, {
              hasBeenBilled: true,
              paymentId: result.paymentIntent!.id,
              amount: result.paymentIntent!.amount,
            });
          } catch (error) {
            onError("There was an error uploading payment details");
          };
        }
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!state || state.duration == undefined) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        {(!data && !loadError) ? (
          <LoadingFallback />
        ) : loadError ? (
          <ErrorFallback fullHeight>
            <IonText className="ion-text-center">
              <h5 className="ion-margin-horizontal">Something didn't go right. Try again later.</h5>
              <div className="d-flex ion-justify-content-center">
                <IonButton
                  fill="clear"
                  color="medium"
                  size="small"
                  routerLink="/app">
                  home
                  <IonIcon slot="start" icon={arrowBackSharp} />
                </IonButton>
              </div>
            </IonText>
          </ErrorFallback>
        ) : (
              <Centered fullHeight>
                {isPaymentComplete ? (
                  <div>
                    <p className="ion-text-center">
                      Your payment was proccessed <strong>successfully</strong>.<br />
                      Amount: <strong>KES.{data!.amount}</strong>
                    </p>
                    <div className="h100 d-flex ion-justify-content-center ion-align-items-center">
                      <IonButton
                        fill="clear"
                        color="medium"
                        routerLink="/app/appointments">
                        back
                          <IonIcon icon={arrowBackSharp} slot="end" />
                      </IonButton>
                    </div>
                  </div>
                ) : (
                    <div>
                      <IonText>
                        <h3 className="ion-text-center">
                          Checkout
                        </h3>
                      </IonText>
                      <form onSubmit={handleSubmit}>
                        <CardSection amount={data!.amount} />
                        <div className="d-flex ion-justify-content-center ion-margin-top">
                          <IonButton
                            type="submit"
                            color="secondary"
                            disabled={!stripe || isSubmitting}
                          >

                            {isSubmitting ? (
                              <>
                                Confirming...
                                <IonSpinner slot="end" name="lines-small" />
                              </>
                            ) : (
                                <>
                                  Confirm
                                  <IonIcon slot="end" icon={checkmark} />
                                </>
                              )}
                          </IonButton>
                        </div>
                      </form>
                      <Centered>
                        <IonButton
                          fill="clear"
                          color="medium"
                          size="small"
                          routerLink="/app/appointments">
                          <IonIcon slot="start" icon={arrowBackSharp} />
                            Later
                        </IonButton>
                      </Centered>
                    </div>
                  )}

              </Centered>
            )
        }
      </IonContent>
    </IonPage>
  );
};

export default Checkout;