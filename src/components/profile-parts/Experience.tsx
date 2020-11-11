import React from "react";

import { PartProps } from "./Bio";

const Experience: React.FC<PartProps> = ({ user }) => {
  return (
    <p className="ion-no-margin">
      {user.experience ? `${user.experience} years experience` : "No experience."}
    </p>
  );
}

export default Experience;