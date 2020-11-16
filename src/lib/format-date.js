import moment from "moment";

const MILLISECONDS_IN_WEEK = 6.048e8;

export default function formatDate(date) {
  const isOverAWeek =
    Date.now() - new Date(date).getTime() > MILLISECONDS_IN_WEEK;
  const momentObject = moment(date);
  return isOverAWeek ? momentObject.format("I") : momentObject.fromNow();
}
