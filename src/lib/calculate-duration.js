export default function calculateDuration(startTime, duration) {
  let endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + duration);

  return endTime;
}
