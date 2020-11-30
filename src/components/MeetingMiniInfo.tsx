import React from "react";
import moment from "moment";
import calculateDuration from "../lib/calculate-duration";

const MeetingMiniInfo: React.FC<{
  duration: number,
  subject: string,
  time: Date,
}> = ({ duration, subject, time }) => {
  const endTime = calculateDuration(time, duration);

  return (
    <>
      <p>
        <strong>Subject: </strong>{subject}
      </p>
      <p className="ion-no-margin">
        <small>Time: <strong>
          {moment(time).format("LT")} - {moment(endTime).format("LT")}
        </strong></small>
      </p>
    </>
  );
};

export default MeetingMiniInfo;