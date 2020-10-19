import React from "react";
import { IonLoading } from "@ionic/react";


interface LoaderProps {
  isOpen: boolean
  message: string
  duration?: number
};

const Loader = ({ isOpen, message }: LoaderProps) => {
  return (
    <IonLoading
      mode="ios"
      {...{ isOpen, message }}
    />
  );
}

export default Loader;