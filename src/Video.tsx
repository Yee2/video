import * as React from "react";
import {Component} from "react";
import "./video.scss"

interface Props {
    src: string
}

interface State {
    paused: boolean,
    current: number,
    buffer: number,
    duration: number,
    full: boolean,
    screenshot: boolean
    picture?: string
    pictureLeft?: string
    pictureTime?: string
    showController: boolean
}

export default class Video extends Component<Props, State> {
    div?: HTMLDivElement;
    video?: HTMLVideoElement;
    videoBox = <video ref={v => this.bind(v)} src={this.props.src}/>;

    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            showController: true,
            screenshot: false,
            full: false,
            duration: 0,
            buffer: 0,
            current: 0,
            paused: true
        }
    }

    get buffer(): number {
        if (!this.video) return 0;
        let {duration, buffered} = this.video;
        return ((buffered.end(0) - buffered.start(0)) / duration) * 100;
    }

    get current(): number {
        if (!this.video) return 0;
        let {duration, currentTime} = this.video;
        return (currentTime / duration) * 100;
    }

    canvas?: HTMLCanvasElement;
    videoScreenShot?: HTMLVideoElement;

    getScreenshot(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        let div = e.currentTarget;
        let x = e.clientX - div.getBoundingClientRect().left;
        let position = (x / div.clientWidth) * this.video.duration;

        if (!this.videoScreenShot) {
            this.videoScreenShot = document.createElement("video");
            this.videoScreenShot.src = this.video.src;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.video.clientWidth * 0.2;
            this.canvas.height = this.video.clientHeight * 0.2;
            this.videoScreenShot.setAttribute('crossorigin', 'anonymous');
            this.videoScreenShot.addEventListener("canplay", () => {
                this.canvas.getContext('2d')
                    .drawImage(this.videoScreenShot, 0, 0, this.canvas.width, this.canvas.height);
                this.setState({picture: this.canvas.toDataURL()})

            })
        }
        let half = this.video.clientWidth * 0.1 + 10;
        let left = x > half ? x : half;
        if (left + half > div.clientWidth) {
            left = div.clientWidth - half;
        }
        this.setState({pictureLeft: `${left}px`, pictureTime: this.t(position)});
        this.videoScreenShot.currentTime = position;
    }

    bind(ele: HTMLVideoElement) {
        this.video = ele;
        let refresh = () => {
            let buffered = ele.buffered.end(0);
            let current = ele.currentTime;
            if (ele.buffered.length > 1) {
                for (let i = 0; i < ele.buffered.length; i++) {
                    if (ele.buffered.end(i) < current
                        || ele.buffered.start(i) > current) {
                        continue
                    }
                    if (ele.buffered.end(i) > buffered) {
                        buffered = ele.buffered.end(i);
                    }
                }
            } else {

            }
            this.setState({
                paused: ele.paused,
                current: current,
                buffer: buffered
            });
        };
        ele.addEventListener("playing", refresh);
        ele.addEventListener("pause", refresh);
        ele.addEventListener("timeupdate", refresh);
        ele.addEventListener("durationchange", () => {
            this.setState({duration: ele.duration})
        })
    }

    toggle() {
        if (!this.video) return;
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }

    }

    toggleFullScreen() {
        if (this.state.full) {
            document.exitFullscreen().then(() => {
                this.setState({full: false})
            })
        } else if (this.div) {
            this.div.requestFullscreen().then(() => {
                this.setState({full: true})
            })
        }

    }

    goto(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        let div = e.currentTarget;
        let x = e.clientX - div.getBoundingClientRect().left;
        let y = e.clientY - div.getBoundingClientRect().top;
        this.video.currentTime = (x / div.clientWidth) * this.video.duration;
    }

    enter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!this.state.showController) {
            this.setState({showController: true})
        }

    }

    leave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!this.video.paused && this.state.showController) {
            this.setState({showController: false})
        }
    }

    render() {
        // <!-- 创建一个播放器 -->
        let p = (this.state.current / this.state.duration) * 100;
        let b = (this.state.buffer / this.state.duration) * 100;
        let screenshot = this.state.screenshot ?
            <div className="screenshot"
                 style={{left: this.state.pictureLeft}}>
                <img src={this.state.picture}/>
                <time>{this.state.pictureTime}</time>
            </div> : null;

        return (<div ref={div => this.div = div} className="yee-player"
                     onMouseEnter={e => this.enter(e)}
                     onMouseLeave={e => this.leave(e)}
            >
                {this.videoBox}
                <div className={this.state.showController ? "controller-mask" : "controller-mask hidden"}>
                    <div className="progress" style={{backgroundColor: "#165017", height: "20px"}}
                         onClick={(e) => this.goto(e)}
                         onMouseEnter={() => this.setState({screenshot: true})}
                         onMouseLeave={() => this.setState({screenshot: false})}
                         onMouseMove={e => this.getScreenshot(e)}
                    >
                        <div style={{backgroundColor: "#737373", height: "10px", width: `${b}%`}}></div>
                        <div style={{
                            transition: "width 0.3s",
                            backgroundColor: "#ff000d",
                            height: "10px",
                            width: `${p}%`
                        }}></div>
                        {screenshot}
                    </div>
                    <div className="panel">
                        <div className="left">
                            <div className="play" onClick={() => this.toggle()}>
                                {this.state.paused ? "播放" : "暂停"}
                            </div>
                        </div>
                        <div className="right">
                            <div className="full"
                                 onClick={() => this.toggleFullScreen()}>{this.state.full ? ">-<" : "<->"}</div>
                            <div className="time">{this.t(this.state.current)}/{this.t(this.state.duration)}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    t(time: number): string {
        if (!time || time == 0) {
            return "00:00";
        }
        time = Math.floor(time)
        let s = time % 60,
            i = Math.floor(time / 60) % 60,
            h = Math.floor(Math.floor(time / 60) / 60);
        let ss = s.toString();
        let ii = i.toString();
        let hh = h.toString();
        if (s < 10) {
            ss = '0' + ss;
        }

        if (i < 10) {
            ii = '0' + ii;
        }
        if (h < 10) {
            hh = '0' + hh;
        }
        if (time < 3600) {
            return ii + ":" + ss;
        }
        return hh + ":" + ii + ":" + ss;
    }
}