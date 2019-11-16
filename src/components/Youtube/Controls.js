import React, { useEffect, useContext, useState } from "react";
import { withRouter } from "react-router";
import { Icon, Slider } from "antd";
import fullScreenImg from "assets/images/full-screen.svg";
import volumeImg from "assets/images/volume-light.svg";
import volumeMuteImg from "assets/images/volume-mute-light.svg";
import VideoContext from "contexts/VideoContext";
import numeral from "numeral";
import isMobile from "ismobilejs";

export const STATUS_UNSTARTED = "unstarted";
export const STATUS_ENDED = "ended";
export const STATUS_PLAYING = "playing";
export const STATUS_PAUSED = "paused";
export const STATUS_BUFFERING = "buffering";
export const STATUS_CUED = "cued";
export const PLAYBACK_STATUS = {
  "-1": STATUS_UNSTARTED,
  "0": STATUS_ENDED,
  "1": STATUS_PLAYING,
  "2": STATUS_PAUSED,
  "3": STATUS_BUFFERING,
  "5": STATUS_CUED
};

const Controls = props => {
  const [slider, setSlider] = useState(0);

  const { value, next, updateState } = useContext(VideoContext);

  const { player, volume, status, duration, currentTime } = value;

  const mobile = isMobile().phone;

  useEffect(() => {
    let ticker = null;

    let tick = () => {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      setSlider((currentTime / duration) * 100);
      updateState({ currentTime, duration });
      console.log("tick");
    };

    if (player && status === STATUS_PLAYING) {
      tick();
      ticker = setInterval(tick, 1000);
    }

    return () => ticker && clearInterval(ticker);
  }, [player, status]); //eslint-disable-line

  let playIcon = null;
  let playOnClick = null;
  if (status === STATUS_BUFFERING) {
    playIcon = "loading";
  } else if (status === STATUS_PLAYING) {
    playIcon = "pause";
    playOnClick = () => player.pauseVideo();
  } else {
    playIcon = "caret-right";
    playOnClick = () => player.playVideo();
  }

  return (
    <div className={`controls ${mobile && "mobile"}`}>
      <Slider
        className="slider"
        value={slider}
        tipFormatter={value => {
          if (player) {
            const duration = player.getDuration();
            return numeral(duration * (value / 100)).format("00:00:00");
          }
        }}
        onChange={value => {
          setSlider(value);
        }}
        onAfterChange={value => {
          const duration = player.getDuration();
          const currentTime = duration * (value / 100);
          player.seekTo(duration * (value / 100));
          updateState({ currentTime });
        }}
      />
      <div className="slider-container">
        <div className="row-align-center controls-left">
          <Icon type={playIcon} className="play-button" onClick={playOnClick} />
          <Icon type="step-forward" className="forward-button" onClick={next} />
          <div className="sound-control">
            <img
              src={volume === 0 ? volumeMuteImg : volumeImg}
              alt=""
              className="sound-button"
              onClick={() => {
                if (volume === 0) {
                  player && player.unMute();
                  player && player.setVolume(100);
                  updateState({ volume: 100 });
                } else {
                  updateState({ volume: 0 });
                  player && player.mute();
                  player && player.setVolume(0);
                }
              }}
            />
            {!mobile && (
              <Slider
                className="volume-slider"
                value={volume}
                onChange={volume => {
                  updateState({ volume });
                  player && player.setVolume(volume);
                }}
              />
            )}
          </div>
          <div className="small">
            {currentTime ? numeral(currentTime).format("00:00:00") : "00:00:00"}
          </div>
          /
          <div className="small">
            {duration ? numeral(duration).format("00:00:00") : "00:00:00"}
          </div>
        </div>
        <img
          className="fullscreen-img hover-link"
          src={fullScreenImg}
          alt=""
          onClick={() => {
            const iframe = document.getElementById("youtube-iframe");
            var requestFullScreen =
              iframe.requestFullScreen ||
              iframe.mozRequestFullScreen ||
              iframe.webkitRequestFullScreen;
            if (requestFullScreen) {
              requestFullScreen.bind(iframe)();
            }
          }}
        />
      </div>
    </div>
  );
};

export default withRouter(Controls);
