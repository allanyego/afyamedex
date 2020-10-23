import React from "react";
import { IonIcon } from "@ionic/react";
import { star, starHalf } from "ionicons/icons";

export default function Rating({ rating }: { rating: number }) {
  return (
    <span className="rating-container">
      {([...Array(Math.floor(rating)).keys()]).map(key => <IonIcon key={key} icon={star} />)}
      {((rating % 1) >= 0.5) && (<IonIcon icon={starHalf} />)}
    </span>
  );
}