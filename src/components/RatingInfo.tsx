import { IonSpinner, IonText } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { getUserRating } from "../http/reviews";

import { useAppContext } from "../lib/context-lib";
import useMounted from "../lib/mounted-hook";
import useToastManager from "../lib/toast-hook";
import Centered from "./Centered";
import Rating from "./Rating";

const RatingInfo: React.FC<{
  userId: string,
}> = ({ userId }) => {
  const [isFetching, setFetching] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const { isMounted, setMounted } = useMounted();
  const { currentUser } = useAppContext() as any;
  const { onError } = useToastManager();

  const _fetchRating = async () => {
    try {
      const { data } = await getUserRating(userId, currentUser.token);
      if (data.length && isMounted) {
        setRating(data[0].rating);
      }
    } catch (error) {
      onError(error.message);
    } finally {
      isMounted && setFetching(false);
    }
  };

  useEffect(() => {
    _fetchRating().then();
    return () => setMounted(false);
  }, []);

  return isFetching ? (
    <Centered>
      <IonSpinner name="dots" />
    </Centered>
  ) : (
      <p className="ion-no-margin">
        {rating ? (
          <Rating rating={rating} />
        ) : (
            <IonText>No ratings</IonText>
          )}
      </p>
    );
}

export default RatingInfo;