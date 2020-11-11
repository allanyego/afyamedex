import React, { PropsWithChildren } from "react";

export default function Centered({
  vertical = true,
  horizontal = true,
  fullHeight = false,
  children
}: PropsWithChildren<{
  vertical?: boolean,
  horizontal?: boolean,
  fullHeight?: boolean,
}>) {
  let classStr = vertical ? "ion-align-items-center" : "";
  classStr += horizontal ? " ion-justify-content-center" : "";
  classStr += fullHeight ? " h100" : "";

  return (
    <div className={`d-flex ${classStr}`}>
      {children}
    </div>
  );
}