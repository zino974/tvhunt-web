import React, { useContext } from "react";
import { Icon } from "antd";
import VideoContext from "contexts/VideoContext";
import SubmitContext from "contexts/SubmitContext";
import isMobile from "ismobilejs";
import { STATUS_BUFFERING, STATUS_PLAYING, STATUS_PAUSED } from "./Video";
import _ from "lodash";

const HoverControls = props => {
  const { value, prev, next, likeUnlike } = useContext(VideoContext);
  const { videoId } = useContext(SubmitContext);

  const { player, status, currentVideo, liked, hover } = value;

  let playIcon = null;
  let playOnClick = null;
  if (status === STATUS_BUFFERING) {
    playIcon = "loading";
  } else if (status === STATUS_PLAYING) {
    playIcon = "pause";
    playOnClick = e => {
      e.stopPropagation();
      player.pauseVideo();
    };
  } else {
    playIcon = "caret-right";
    playOnClick = e => {
      e.stopPropagation();
      player.playVideo();
    };
  }

  const alreadyVoted =
    currentVideo &&
    liked &&
    _.find(liked, ["slug", currentVideo.slug]) !== undefined;

  const mobile = isMobile().phone;

  return (
    <div
      className={`hover-controls ${(hover || status === STATUS_PAUSED) &&
        "paused"}`}
      onClick={playOnClick}
    >
      <div className="row-align-center middle-container">
        <Icon type="step-backward" onClick={prev} />
        <Icon
          type={playIcon}
          className={`play-icon ${mobile && "mobile"}`}
          onClick={playOnClick}
        />
        <Icon type="step-forward" onClick={next} />
      </div>
      {!videoId && currentVideo && (
        <div
          className={`upvote-button mobile-landscape-hidden ${alreadyVoted &&
            "voted"}`}
          onClick={e => {
            e.stopPropagation();
            likeUnlike({ id: currentVideo.id, slug: currentVideo.slug });
          }}
        >
          {alreadyVoted ? "Unvote this video" : "Upvote this video"}
        </div>
      )}
    </div>
  );
};

export default HoverControls;
