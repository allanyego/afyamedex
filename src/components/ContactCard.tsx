import React from "react";
import { useState } from "react";
import { IonCard, IonCardHeader, IonCol, IonRow, IonIcon, IonCardContent, IonText } from "@ionic/react";
import { caretUp, caretDown, call, mail } from "ionicons/icons";

export default function ContactCard({ phone, email }: { phone: string, email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => setIsOpen(open => !open);

  if (!phone && !email) {
    return null;
  }

  return (
    <IonCard className="ion-no-margin ion-margin-vertical contact-card">
      <IonCardHeader className="header">
        <IonRow onClick={onToggle}>
          <IonCol className="ion-no-padding">
            <h6 className="ion-no-margin">Contact</h6>
          </IonCol>
          <IonCol className="ion-no-padding ion-text-right">
            <IonIcon icon={isOpen ? caretUp : caretDown} />
          </IonCol>
        </IonRow>
      </IonCardHeader>
      {isOpen && (
        <IonCardContent className="body">
          {phone && (
            <div className="contact-row">
              <div><IonText>{phone}</IonText></div>
            </div>
          )}
          {email && (
            <div className="contact-row">
              <div><IonIcon icon={mail} /></div>
              <div>
                <IonText>
                  {email}
                </IonText>
              </div>
            </div>
          )}
        </IonCardContent>
      )}
    </IonCard>
  );
}