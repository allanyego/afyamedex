import React, { useState, useEffect } from "react";
import { useAppContext } from "../../lib/context-lib";
import { IonModal, IonToolbar, IonButtons, IonButton, IonTitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonTextarea, IonText, IonBadge, IonList, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonDatetime } from "@ionic/react";
import { Formik, Form, FormikValues, FormikHelpers } from "formik";
import * as Yup from "yup";
import moment from "moment";

import FormFieldFeedback from "../FormFieldFeedback";
import { USER } from "../../http/constants";
import { trash, addSharp } from "ionicons/icons";
import "./EditProfileModal.css";
import { editUser } from "../../http/users";
import useToastManager from "../../lib/toast-hook";
import useMounted from "../../lib/mounted-hook";
import trimLowerCase from "../../lib/trim-lowercase";

interface EditProfileModalProps {
  isOpen: boolean
  onClose: (arg?: any) => any
}

const userSchema = Yup.object({
  fullName: Yup.string().required("This shouldn't be empty"),
  bio: Yup.string(),
  experience: Yup.number().min(1, "Can't be less that 1 year").max(65, "Really? Seems a bit much"),
});

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, setCurrentUser } = useAppContext() as any;
  const [speciality, setSpeciality] = useState(currentUser.speciality);
  const [showModal, setShowModal] = useState(isOpen);
  const [conditions, setConditions] = useState(currentUser.conditions);
  const [education, setEducation] = useState(currentUser.education);
  const { onError, onSuccess } = useToastManager();
  const { isMounted, setMounted } = useMounted();

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleSubmit = async (values: FormikValues, { setSubmitting }: FormikHelpers<any>) => {
    try {
      const newDetails = {
        ...values,
        fullName: trimLowerCase(values.fullName),
        speciality,
        conditions,
        education,
      };

      await editUser(currentUser._id, currentUser.token, {
        ...newDetails
      });

      setCurrentUser(newDetails);

      isMounted && setSubmitting(false);
      onClose();
      onSuccess("Details updated");
    } catch (error) {
      isMounted && setSubmitting(false);
      onError(error.message);
    }
  };

  const tearDown = () => {
    onClose()
    setMounted(false);
  };

  return (
    <>
      <IonModal isOpen={showModal}
        onDidDismiss={tearDown}
      >
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
          <IonTitle className="ion-text-capitalize">Edit your profile</IonTitle>
        </IonToolbar>
        <IonGrid style={{
          overflowY: "scroll",
        }}>
          <IonRow>
            <IonCol>
              <Formik
                validationSchema={userSchema}
                onSubmit={handleSubmit}
                initialValues={{
                  fullName: currentUser.fullName,
                  bio: currentUser.bio || "",
                  experience: currentUser.experience || "",
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  errors,
                  isValid,
                  isSubmitting,
                }) => (
                    <>
                      <Form>
                        <IonItem className={touched.fullName && errors.fullName ? "has-error" : ""}>
                          <IonLabel position="floating">Full name</IonLabel>
                          <IonInput
                            value={values.fullName}
                            type="text" name="fullName" onIonChange={handleChange} onIonBlur={handleBlur} />
                        </IonItem>
                        <FormFieldFeedback {...{ errors, touched, fieldName: "fullName" }} />

                        <IonItem className={touched.fullName && errors.fullName ? "has-error" : ""}>
                          <IonLabel position="floating">Bio</IonLabel>
                          <IonTextarea
                            value={values.bio}
                            rows={2} name="bio" onIonChange={handleChange} onIonBlur={handleBlur} />
                        </IonItem>
                        <FormFieldFeedback {...{ errors, touched, fieldName: "bio" }} />

                        {currentUser.accountType === USER.ACCOUNT_TYPES.PATIENT ? (
                          <EditConditions
                            conditions={conditions}
                            setConditions={setConditions}
                          />
                        ) : (
                            <>
                              <IonItem className={touched.experience && errors.experience ? "has-error" : ""}>
                                <IonLabel position="floating">Experience (years)</IonLabel>
                                <IonInput
                                  value={values.experience}
                                  type="text" name="experience" onIonChange={handleChange} onIonBlur={handleBlur} />
                              </IonItem>
                              <FormFieldFeedback {...{ errors, touched, fieldName: "experience" }} />

                              <EditSpeciality
                                speciality={speciality}
                                setSpeciality={setSpeciality}
                              />

                              <EditEducation
                                education={education}
                                setEducation={setEducation}
                              />
                            </>
                          )}

                        <IonRow>
                          <IonCol>
                            <IonButton
                              color="secondary"
                              expand="block"
                              type="submit"
                              disabled={!isValid || isSubmitting}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </Form>
                    </>
                  )}
              </Formik>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </>
  );
}

function EditSpeciality({ speciality, setSpeciality }: {
  speciality: any[],
  setSpeciality: any
}) {
  const [val, setVal] = useState("");
  const [inputError, setInputError] = useState<null | string>(null);

  const onChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }

    setVal(e.target.value.trim());
  };

  const handleSubmit = () => {
    if (!val) {
      return setInputError("Cannot be empty");
    }

    setSpeciality([...speciality, val]);
    setVal("");
  };

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol className="ion-no-padding">
            <IonItem
              className={inputError ? "has-error" : ""}
            >
              <IonLabel position="floating">Speciality</IonLabel>
              <IonInput
                value={val}
                onIonChange={onChange}
              />
            </IonItem>
            {inputError && (
              <FormFieldFeedback
                errors={{
                  speciality: inputError,
                }}
                touched={{
                  speciality: true,
                }}
                fieldName="speciality"
              />
            )}
          </IonCol>
          <IonCol
            className="ion-no-padding d-flex ion-align-items-center"
            size="2">
            <IonButton
              fill="clear"
              color="secondary"
              onClick={handleSubmit}
              disabled={!!inputError}
            >
              <IonIcon icon={addSharp} slot="icon-only" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      <div className="edit-modal-badges">
        {
          speciality.map((s: string, index: number) => <IonBadge key={index} color="dark">
            {s}
          </IonBadge>)
        }
      </div>
    </div>
  );
}

function EditConditions({ conditions, setConditions }: {
  conditions: any[],
  setConditions: any
}) {
  const [val, setVal] = useState("");
  const [inputError, setInputError] = useState<null | string>(null);

  const onChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }

    setVal(e.target.value.trim());
  };

  const handleSubmit = () => {
    if (!val) {
      return setInputError("Cannot be empty");
    }

    setConditions([...conditions, val]);
    setVal("");
  };

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol className="ion-no-padding">
            <IonItem
              className={inputError ? "has-error" : ""}
            >
              <IonLabel position="floating">Conditions</IonLabel>
              <IonInput
                value={val}
                onIonChange={onChange}
              />
            </IonItem>
            {inputError && (
              <FormFieldFeedback
                errors={{
                  condition: inputError,
                }}
                touched={{
                  condition: true,
                }}
                fieldName="condition"
              />
            )}

          </IonCol>
          <IonCol
            className="ion-no-padding d-flex ion-align-items-center"
            size="2">
            <IonButton
              fill="clear"
              color="secondary"
              onClick={handleSubmit}
              disabled={!!inputError}
            >
              <IonIcon icon={addSharp} slot="icon-only" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      <div className="edit-modal-badges">
        {
          conditions.map((s: string, index: number) => <IonBadge key={index} color="secondary">
            {s}
          </IonBadge>)
        }
      </div>
    </div>
  );
}

function EditEducation({ education, setEducation }: {
  education: any[],
  setEducation: any
}) {
  const [institution, setInstitution] = useState("")
  const [areaOfStudy, setAreaofStudy] = useState("");
  const [start, setStart] = useState(undefined);
  const [end, setEnd] = useState(undefined);
  const [inputError, setInputError] = useState<null | string>(null);

  const onInsChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }
    setInstitution(e.target.value.trim());
  };

  const onAOSChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }
    setAreaofStudy(e.target.value.trim());
  };

  const onStartChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }
    setStart(e.target.value);
  };

  const onEndChange = (e: any) => {
    if (inputError) {
      setInputError(null);
    }
    setEnd(e.target.value);
  };

  const handleSubmit = () => {
    if (!institution || !areaOfStudy || !start || !end) {
      return setInputError("Please, fill all fields");
    }

    const newEducationInfo = {
      institution,
      areaOfStudy,
      startDate: start,
      endDate: end,
    };
    setEducation([...education, newEducationInfo]);
    setInstitution("");
    setAreaofStudy("");
    setStart(undefined);
    setEnd(undefined);
  };

  return (
    <div>
      <IonLabel>
        <strong>Education</strong>
      </IonLabel>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem
              className={inputError ? "has-error" : ""}
            >
              <IonLabel position="floating">Institution</IonLabel>
              <IonInput
                value={institution}
                onIonChange={onInsChange}
              />
            </IonItem>
            <IonItem
              className={inputError ? "has-error" : ""}
            >
              <IonLabel position="floating">Area of study</IonLabel>
              <IonInput
                value={areaOfStudy}
                onIonChange={onAOSChange}
              />
            </IonItem>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonLabel>Start date</IonLabel>
                    <IonDatetime displayFormat="MM DD YY" onIonChange={onStartChange} />
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonLabel>End date</IonLabel>
                    <IonDatetime displayFormat="MM DD YY" name="birthday" onIonChange={onEndChange} />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
            {inputError && (
              <FormFieldFeedback
                errors={{
                  speciality: inputError,
                }}
                touched={{
                  speciality: true,
                }}
                fieldName="speciality"
              />
            )}
          </IonCol>
          <IonCol
            className="ion-no-padding d-flex ion-align-items-center"
            size="2">
            <IonButton
              fill="clear"
              color="secondary"
              onClick={handleSubmit}
              disabled={!!inputError}
            >
              <IonIcon icon={addSharp} slot="icon-only" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* TODO: A form here */}
      <IonList>
        {education.map((sch: any, index: number) => (
          <IonItemSliding key={index}>
            <IonItemOptions side="start">
              <IonItemOption color="danger">
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>

            <IonItem>
              <div className="ion-margin-bottom">
                <IonLabel className="ion-text-capitalize"><strong>{sch.institution}</strong></IonLabel>
                <IonText color="medium">
                  {moment(sch.startDate).format("MMM YYYY")} - {sch.endDate ? (moment(sch.endDate).format("MMM YYYY")) : "Current"}
                </IonText><br />
                <IonText className="ion-text-capitalize">
                  {sch.areaOfStudy}
                </IonText>
              </div>
            </IonItem>
          </IonItemSliding>
        ))}
      </IonList>
    </div>
  );
}