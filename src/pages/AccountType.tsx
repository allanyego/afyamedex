import React, { useState } from 'react';
import { IonPage, IonContent, IonText, IonCard, IonCardContent, IonIcon, IonSpinner } from '@ionic/react';
import { businessOutline, personOutline, person } from 'ionicons/icons';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import { editUser } from '../http/users';
import { USER } from '../http/constants';
import useToastManager from '../lib/toast-hook';

const accountTypes = [
  {
    accountType: USER.ACCOUNT_TYPES.PROFESSIONAL,
    icon: person,
  },
  {
    accountType: USER.ACCOUNT_TYPES.PATIENT,
    icon: personOutline,
  },
  {
    accountType: USER.ACCOUNT_TYPES.INSTITUTION,
    icon: businessOutline,
  },
];

export default function AccountType() {
  const { currentUser } = useAppContext() as any;
  const [settingUp, setSettingUp] = useState(false);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="d-flex ion-justify-content-center ion-align-items-center" style={{
          height: '100%'
        }}>
          <div className="ion-text-center">
            <IonText>
              <h1>Select how you'd like to use Afyamedex</h1>
            </IonText>
            {accountTypes.map(type => <AccountTypeCard {...{ settingUp, setSettingUp, userId: currentUser._id }} {...type} />)}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

type AccountTypeProps = {
  accountType: string,
  icon: any,
  userId: any,
  settingUp: boolean,
  setSettingUp: any,
};

function AccountTypeCard({ accountType, icon, userId, settingUp, setSettingUp }: AccountTypeProps) {
  const [loading, setLoading] = useState(false);
  const { currentUser, setCurrentUser } = useAppContext() as any;
  const history = useHistory();
  const { onError, onSuccess } = useToastManager();

  const setAccountType = settingUp ? null : async () => {
    setSettingUp(true);
    try {
      await editUser(userId, currentUser.token, {
        accountType,
      });

      setCurrentUser({
        ...currentUser,
        accountType
      });

      setLoading(false);
      onSuccess("Account type set");
      history.push("/app/profile");
    } catch (error) {
      setLoading(false);
      setSettingUp(false);
      onError(error.message);
    }
  };
  return (
    <IonCard button onClick={setAccountType as any}>
      <IonCardContent>
        <div className="ion-justify-content-center">
          {loading ? <IonSpinner name="crescent" /> : <IonIcon icon={icon} />}
        </div>
        <IonText>
          <p>{accountType}</p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );
}