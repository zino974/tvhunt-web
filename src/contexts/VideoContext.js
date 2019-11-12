import React, { Component } from "react";
import { withRouter } from "react-router";
import api from "utils/api";
import { handleErrorMessage } from "utils/errorMessage";
import _ from "lodash";

const INITIAL_STATE = {
  tab: "all",
  tabs: [],
  player: null,
  status: null,
  playlist: [],
  currentIndex: 0,
  currentVideo: null,
  currentTime: 0,
  duration: 0,
  volume: 0,
  fullscreen: false
};

const VideoContext = React.createContext(INITIAL_STATE);
const { Provider, Consumer } = VideoContext;

class VideoProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: INITIAL_STATE,
      loadVideos: this.loadVideos,
      loadVideo: this.loadVideo,
      prev: this.prev,
      next: this.next,
      updateState: this.updateState,
      updateCurrentVideo: this.updateCurrentVideo,
      getVideoInfo: this.getVideoInfo
    };
  }

  updateState = newState => {
    this.setState({ value: { ...this.state.value, ...newState } });
  };

  getVideoInfo = () => {};

  loadVideos = (topic, slug) => {
    api
      .get("/videos.json")
      .then(({ total_count, videos }) => {
        const tabs = Object.entries(
          _.countBy(videos.reduce((acc, video) => acc.concat(video.tags), []))
        ).sort((a, b) => b[1] - a[1]);

        let currentVideo = null;
        let tab = "all";

        if (topic && slug) {
          currentVideo = _.find(videos, ["slug", slug]);
          tab = topic;
        } else {
          currentVideo = videos[0];
        }

        if (this.props.history.location.pathname === "/") {
          this.props.history.push(`${tab}/${currentVideo.slug}`);
        }

        this.updateState({
          playlist: videos,
          currentVideo,
          tabs,
          tab
        });
      })
      .catch(handleErrorMessage);
  };

  updateCurrentVideo = (topic, slug) => {
    const { playlist, currentVideo } = this.state.value;
    const foundVideo = _.find(playlist, ["slug", slug]);
    if (foundVideo && !_.isEqual(foundVideo, currentVideo)) {
      this.updateState({ currentVideo: foundVideo });
    }
  };

  updateTags = (id, tags) => {
    api
      .patch(`/vides/${id}.json`)
      .then(result => {})
      .catch(handleErrorMessage);
  };

  likeVideo = id => {
    api
      .patch(`/videos/${id}/like.json`)
      .then(({ success, vote_count }) => {
        if (success) {
          //save the id to local storage
          //set the vote count
        } else {
        }
      })
      .catch(handleErrorMessage);
  };

  unlikeVideo = id => {
    api
      .patch(`/videos/${id}/unlike.json`)
      .then(({ success, vote_count }) => {
        if (success) {
          //remove the id to local storage
        } else {
        }
      })
      .catch(handleErrorMessage);
  };

  prev = () => {
    const { currentIndex, playlist } = this.state.value;
    let prevIndex = (currentIndex - 1) % playlist.length;
    if (prevIndex < 0) prevIndex += playlist.length;
    this.updateState({
      currentIndex: prevIndex,
      currentVideo: playlist[prevIndex]
    });
  };

  next = () => {
    const { currentIndex, playlist } = this.state.value;
    const nextIndex = (currentIndex + 1) % playlist.length;
    this.updateState({
      currentIndex: nextIndex,
      currentVideo: playlist[nextIndex]
    });
  };

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

const videoWithRouter = withRouter(VideoProvider);

export { videoWithRouter as VideoProvider, Consumer as VideoConsumer };

export default VideoContext;
