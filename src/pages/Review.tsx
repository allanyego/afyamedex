import React, { useEffect, useState } from "react";
import { IonButton, IonCol, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonText, IonTextarea } from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import * as Yup from "yup";
import { Formik, Form } from "formik";

import Centered from "../components/Centered";
import { useAppContext } from "../lib/context-lib";
import FormFieldFeedback from "../components/FormFieldFeedback";
import Rating from "../components/Rating";
import { arrowBackSharp } from "ionicons/icons";
import useToastManager from "../lib/toast-hook";
import useMounted from "../lib/mounted-hook";
import { addReview, getSessionReview } from "../http/reviews";
import LoadingFallback from "../components/LoadingFallback";

const Review: React.FC = () => {
  const [hasReview, setHasReview] = useState(false);
  const { state: appointment } = useLocation<any>();
  const { currentUser } = useAppContext() as any;
  const { onError, onSuccess } = useToastManager();

  const handleReview = async (values: any, { setSubmitting }: any) => {
    try {
      await addReview(appointment._id, currentUser.token, {
        ...values,
      });
      setSubmitting(false);
      setHasReview(true);
      onSuccess("Review posted successfully");
    } catch (error) {
      setSubmitting(false);
      onError(error.message);
    }
  };

  if (!appointment) {
    return null;
  }
  return (
    <IonPage>
      <IonContent fullscreen>
        <Centered fullHeight>
          <div>
            {(appointment.hasReview || hasReview) ? (
              <ReviewView appointmentId={appointment._id} />
            ) : (appointment.professional._id === currentUser._id) ? (
              <NoRewiewView />
            ) : (
                  <ReviewForm
                    appointment={appointment}
                    onSubmit={handleReview}
                  />
                )}
          </div>

        </Centered>
      </IonContent>
    </IonPage>
  );
};

export default Review;

const reviewSchema = Yup.object({
  rating: Yup.number().min(1, "Too low").max(5, "Too much").required("Enter rating out of 5"),
  feedback: Yup.string().min(20, "Too short"),
});

const initialReviewValues = {
  rating: undefined,
  feedback: "",
};

function ReviewForm({ onSubmit, appointment }: {
  onSubmit: (...args: any[]) => any,
  appointment: any,
}) {
  return (
    <Formik
      validationSchema={reviewSchema}
      onSubmit={onSubmit}
      initialValues={initialReviewValues}
    >
      {({
        handleChange,
        handleBlur,
        errors,
        touched,
        isValid,
        isSubmitting
      }) => (
          <Form noValidate>
            <IonButton
              fill="clear"
              color="medium"
              size="small"
              routerLink="/app/appointments">
              Back
                <IonIcon slot="start" icon={arrowBackSharp} />
            </IonButton>

            <IonText className="ion-text-center">
              <p>
                Enter feedback details for your session with <strong className="ion-text-capitalize">
                  {appointment.professional.fullName}
                </strong>
              </p>
            </IonText>
            <IonItem className={touched.rating && errors.rating ? "has-error" : ""}>
              <IonLabel position="floating">Rating</IonLabel>
              <IonInput name="rating" type="number" onIonChange={handleChange} onIonBlur={handleBlur} />
            </IonItem>
            <FormFieldFeedback {...{ errors, touched, fieldName: "rating" }} />

            <IonItem className={touched.feedback && errors.feedback ? "has-error" : ""}>
              <IonLabel position="floating">Feedback</IonLabel>
              <IonTextarea
                rows={2} name="feedback" onIonChange={handleChange} onIonBlur={handleBlur} />
            </IonItem>
            <FormFieldFeedback {...{ errors, touched, fieldName: "feedback" }} />

            <IonRow>
              <IonCol>
                <IonButton color="secondary" expand="block" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</IonButton>
              </IonCol>
            </IonRow>
          </Form>
        )}
    </Formik>
  );
}

function ReviewView({ appointmentId }: {
  appointmentId: string,
}) {
  const [review, setReview] = useState<any | null>(null);
  const { isMounted, setMounted } = useMounted();
  const { onError } = useToastManager();
  const { currentUser } = useAppContext() as any;

  const _fetchReview = async () => {
    try {
      const { data } = await getSessionReview(appointmentId, currentUser.token);
      isMounted && setReview(data);
    } catch (error) {
      onError(error.message);
    }
  };

  useEffect(() => {
    _fetchReview().then();
    return () => {
      setMounted(false);
    }
  }, []);

  return !review ? (
    <LoadingFallback />
  ) : (
      <>
        <p>
          <strong>Session rating</strong>
        </p>
        <div>
          <Rating rating={review.rating} />
        </div>
        <p>{review.feedback || "No feedback."}</p>
        <IonButton
          fill="clear"
          color="medium"
          size="small"
          routerLink="/app/appointments">
          Back
            <IonIcon slot="start" icon={arrowBackSharp} />
        </IonButton>

      </>
    );
}

function NoRewiewView() {
  return (
    <>
      <p>This session has no reviews yet.</p>
      <Centered>
        <IonButton
          fill="clear"
          color="medium"
          size="small"
          routerLink="/app/appointments">
          back
          <IonIcon slot="start" icon={arrowBackSharp} />
        </IonButton>
      </Centered>
    </>
  );
}