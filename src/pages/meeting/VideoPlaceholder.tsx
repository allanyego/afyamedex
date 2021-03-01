import React from "react";

const VideoPlaceholder: React.FC<{
  username: string
}> = ({ username }) => {
  return (
    <div className="video-placeholder ion-text-capitalize">
      {username[0]}
    </div>
  );
}

export default VideoPlaceholder;