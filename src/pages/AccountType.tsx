import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonText, IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { businessOutline, personOutline, person } from 'ionicons/icons';
import { useAppContext } from '../lib/context-lib';
import { useHistory } from 'react-router';
import { editUser } from '../http/users';
import { USER } from '../http/constants';
import useToastManager from '../lib/toast-hook';
import useMounted from '../lib/mounted-hook';

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
          <div className="ion-text-center ion-padding-horizontal">
            <IonText>
              <h1>Select how you'd like to use Afyamedex</h1>
            </IonText>
            {accountTypes.map((type, index) => <AccountTypeCard key={index} {...{ settingUp, setSettingUp, userId: currentUser._id }} {...type} />)}
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
  const { isMounted, setMounted } = useMounted();

  const setAccountType = async (e: MouseEvent) => {
    if (settingUp) {
      return;
    }

    setLoading(true);
    setSettingUp(true);
    try {
      const { data } = await editUser(userId, currentUser.token, {
        accountType,
      });

      setCurrentUser({
        ...currentUser,
        accountType,
        token: data.token, // Replace old token with old details
      });

      onSuccess("Account type set");
      history.push("/app");
    } catch (error) {
      onError(error.message);
    } finally {
      if (isMounted) {
        setLoading(false);
        setSettingUp(false);
      }
    }
  };

  useEffect(() => () => setMounted(false));

  return (
    <IonButton size="large" color="secondary"
      expand="block"
      onClick={setAccountType as any}
      disabled={settingUp}
    >
      {loading ? "Setting up..." : accountType}
      {loading ? (
        <IonSpinner />
      ) : (
          <IonIcon icon={icon} slot="end" />
        )}
    </IonButton>
  );
}