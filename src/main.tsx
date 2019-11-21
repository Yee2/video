import * as React from "react";
import * as ReactDOM from "react-dom";
import Video from "./Video"
let url = "https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4";

ReactDOM.render(<Video src={url} />, document.querySelector("#app"));

