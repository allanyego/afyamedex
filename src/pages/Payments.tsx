import React, { useState } from 'react';
import { IonContent, IonPage, IonItem, IonLabel, IonList, useIonViewDidEnter, useIonViewWillLeave, IonText, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleSharp } from 'ionicons/icons';
import moment from "moment";

import useToastManager from '../lib/toast-hook';
import LoadingFallback from '../components/LoadingFallback';
import { APPOINTMENT_TYPE_LABELS } from '../http/constants';
import UserHeader from '../components/UserHeader';
import useMounted from '../lib/mounted-hook';
import { useAppContext } from '../lib/context-lib';
import { getPayments } from '../http/appointments';

const Payments: React.FC = () => {
  let [appointments, setAppointments] = useState<any[] | null>(null);
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;
  const { isMounted, setMounted } = useMounted();

  const fetchPaidAppointments = async () => {
    setAppointments(null);
    try {
      const { data } = await getPayments(currentUser._id, currentUser.token);
      isMounted && setAppointments(data);
    } catch (error) {
      onError(error.message);
    }
  };

  useIonViewDidEnter(() => {
    setMounted(true);
    fetchPaidAppointments();
  }, []);

  useIonViewWillLeave(() => {
    setMounted(false);
  });

  return (
    <IonPage>
      <UserHeader title="Payments" />
      <IonContent fullscreen className="listing-page">
        {!appointments ? (
          <LoadingFallback />
        ) : (
            <IonList lines="full">
              {appointments.map((appointment: any) => <PaymentItem key={appointment._id} appointment={appointment} />)}
            </IonList>
          )}
      </IonContent>
    </IonPage>
  );
};

export default Payments;

function PaymentItem({ appointment }: {
  appointment: any,
}) {
  const { patient, type, amount, dateBilled } = appointment;

  return (
    <IonItem>
      <IonLabel>
        <h3 className="ion-text-capitalize d-flex ion-align-items-center">
          {patient.fullName}
          {" - "}
          <small className="ion-text-uppercase">
            <i>
              <IonText color="medium">
                {APPOINTMENT_TYPE_LABELS[type]}
              </IonText>
            </i>
          </small>
        </h3>
        <div className="d-flex ion-align-items-center">
          <IonButton
            fill="clear"
            color="success"
            disabled
          >
            KES.{amount}
            <IonIcon slot="start" icon={checkmarkCircleSharp} />
          </IonButton>
        - {" "}
          <small>{moment(dateBilled || Date.now()).format("lll")}</small>
        </div>
      </IonLabel>
    </IonItem>
  );
}