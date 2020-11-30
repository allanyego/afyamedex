export default function pluralizeDuration(duration) {
  return duration + (duration > 1 ? "hrs" : "hr");
}
