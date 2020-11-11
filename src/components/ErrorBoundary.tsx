import { IonText } from "@ionic/react";
import React from "react";
import ErrorFallback from "./ErrorFallback";

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback fullHeight>
        <IonText className="ion-text-center" style={{
          color: "var(--ion-color-danger)"
        }}>
          <p>
            <strong>Something went wrong. Try restarting the app.</strong>
          </p>
        </IonText>
      </ErrorFallback>
    }

    return this.props.children;
  }
}

export default ErrorBoundary;