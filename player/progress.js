(function (w) {
    var html = '<div class="progress"><div class="all"></div><div class="buffer"></div><div class="current"></div></div>';
    function Progress(s) {
        let ele = document.querySelector(s);
        if(ele === null){
            return ;
        }
        ele.innerHTML = html;
        /*if(!ele.classList.contains('progress')){
            ele.classList.add('progress');
        }*/
        this.ele = ele.querySelector(".progress");
        this.MD = false;
        this.direction = "horizontal";
        this.onchange = function (v) {

        }
    }
    Progress.prototype = {
        listennr:{
            mousemove:function(e) {
                this.calc(e);
            },
            mouseup:function (e) {
                let p = this.calc(e);
                this.ele.removeEventListener("mouseup",this.mouseup);
                this.ele.removeEventListener("mouseleave",this.mouseup);
                this.ele.removeEventListener("mousemove",this.mousemove);
                this.ele.dispatchEvent(new CustomEvent('update',{detail:p}));
                this.MD = false;
            },
            mouseleave:null,
            mousedown:function (e) {
                this.calc(e);
                this.MD = true;
                this.ele.addEventListener("mousemove",this.mousemove);
                this.ele.addEventListener("mouseup",this.mouseup);
                this.ele.addEventListener("mouseleave",this.mouseup);
            }
        },
        calc:function (e) {
            if(this.direction === "horizontal"){
                let w  = e.pageX - this.ele.getBoundingClientRect().left - document.documentElement.scrollLeft;
                if(w >= this.ele.clientWidth){
                    this.ele.querySelector(".current").style.width = "100%";
                    return 1;
                }
                this.ele.querySelector(".current").style.width = w + "px";
                return w/this.ele.clientWidth;
            }else{
                let w  = this.ele.getBoundingClientRect().bottom - e.pageY + document.documentElement.scrollTop;
                if(w >= this.ele.clientHeight){
                    this.ele.querySelector(".current").style.height = "100%";
                    return 1;
                }
                if(w/this.ele.clientHeight < 0.05){
                    w = 0;
                }
                this.ele.querySelector(".current").style.height = w + "px";
                return w/this.ele.clientHeight;
            }
            // let w = e.clientX;
        },
        init:function () {
            for (let f in  this.listennr){
                if(typeof this.listennr[f] === 'function'){
                    this[f] = this.listennr[f].bind(this);
                }
            }
            this.ele.addEventListener("mousedown",this.mousedown);
            this.ele.addEventListener("update",(function (e) {
                this.onchange(e.detail);
            }).bind(this));
            if(this.direction === "horizontal"){
                this.ele.classList.add("progress-horizontal");
            }else{
                this.ele.classList.add("progress-vertical");
            }
            if(this.direction === "horizontal"){}else{
                // 慢慢调
                // this.ele.addEventListener("mousewheel",  (event) => {
                //     console.log(event.wheelDelta);
                //     // this.update(this.ele.querySelector(".current").clientHeight/this.ele.querySelector(".all").clientHeight - event.detail*0.05);
                // });
                this.ele.addEventListener("DOMMouseScroll",  (event) => {
                    let p = this.ele.querySelector(".current").clientHeight/this.ele.querySelector(".all").clientHeight - event.detail*0.05;
                    if(p <0){
                        p = 0;
                    }
                    this.update(p);
                    this.ele.dispatchEvent(new CustomEvent('update',{detail:p}));
                });
            }
        },
        update:function (v) {
            v = parseFloat(v);
            if(v > 1){
                v = 1;
            }else if(v < 0){
                v =0;
            }
            if(!this.MD){
                v *= 100;
                if(this.direction === "horizontal"){
                    this.ele.querySelector(".current").style.width = v + "%";
                }else{
                    this.ele.querySelector(".current").style.height = v + "%";
                }
            }
        },
        buffer:function (v) {
            v = parseFloat(v);
            if(v > 1){
                v = 1;
            }else if(v < 0){
                v =0;
            }
            if(!this.MD){
                v *= 100;
                if(this.direction === "horizontal"){
                    this.ele.querySelector(".buffer").style.width = v + "%";
                }else{
                    this.ele.querySelector(".buffer").style.height = v + "%";
                }
            }
        }
    };

    w.Progress = Progress;
})(window);