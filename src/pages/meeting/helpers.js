export function addVideoStream(video, stream) {
  if (!stream || !video) {
    return;
  }

  video.srcObject = stream;
}

export function extractForDisplay(current, other) {
  if (current._id === other.patient._id) {
    return other.professional;
  }
  return other.patient;
}
