class Jq{
    constructor(agr, root) {
        if(typeof root !== 'undefined'){
            this.prevObject = root;
        }else {
            this.prevObject = [document];
        }
        if(typeof agr === "string"){
            let eles = document.querySelectorAll(agr);
            this.#addEles(eles);
        }else if(typeof agr === "function"){
            // document.addEventListener("DOMContentLoaded", agr);
            window.onload = agr;
        }else{
            if(typeof agr.length === 'undefined'){
                this[0] = agr;
                this.length = 1;
            } else {
                this.#addEles(agr);
            }
        }
    }
    #addEles(eles){
        this.length = eles.length;
        for(let i =0; i<eles.length; i++){
            this[i] = eles[i];
        }
    }
    //鼠标点击
    click(callback){
        for (let i = 0, len = this.length; i < len; i++){
            this[i].addEventListener("click", callback);
        }
        return this;
    }
    // on
    on(eventNames, callback){
        let events = eventNames.split(' ');
        for(let i = 0, len = this.length; i<len; i++){
            for(let j=0, l=events.length; j < l; j++){
                this[i].addEventListener(events[j], callback);
            }
        }
        return this;
    }
    // 返回单个实列
    eq(index){
        return new Jq(this[index], this);
    }
    // 回滚
    end(){
        return this.prevObject;
    }
    get(index){
        return this[index];
    }
    // css
    css(...args){
        if(args.length > 1){
            for(let i = 0; i < this.length; i++){
                this.#setStyle(this[i], args[0], args[1]);
            }
        }else{
            let option = args[0];
            if(typeof option === 'object'){
                //多个元素设置多个样式
                for(let i = 0; i<this.length; i++){
                    for(let j in option){
                        this.#setStyle(this[i], j, option[j]);
                    }
                }
            }else {
                return this.#getStyle(this[0], option);
            }
        }
        return this;
    }
    #getStyle(ele, name){
        if(name in $.cssHooks){
            return $.cssHooks[name].get(ele);
        }
        return getComputedStyle(ele)[name];
    }
    #setStyle(ele, name, value){
        if(typeof value === "number" && !$.cssNumber[name]){
            value = value + "px";
        }
        if(name in $.cssHooks){
            $.cssHooks[name].set(ele,value);
        }
        ele.style[name] = value;
    }
    /*
    *  参数顺序  styles,speed,easing,callback
    *  styles为必选。speed,easing,callback为可选
    *  styles {key: value, key: value}
    *  speed 为运动时间  可设置为数字（毫秒）或 "normal"  "fast" "slow"  默认为"noraml"
    *  easing 运动的方式  easeBoth 加速减速  linear 匀速 默认值
    *  callback 运动结束后的回调函数
    * */
    animate(...args){
        // 设置所传参数
        let sets = this.#setAnimateArgs(args);
        let time = sets.time;
        let easing = sets.easing;
        let callback = sets.callback;
        let styles = args[0];

        // 所有的元素都要加上运动
        for (let i=0; i<this.length; i++){
            let ele = this[i];
            ele.timer = null;

            // 存储一份初始值 用于计算速度
            let starts = {}
            for (let j in styles){
                starts[j]=parseFloat(this.#getStyle(ele, j));
            }
            console.log(starts)
            // 每次运动前清除定时器
            clearInterval(ele.timer);
            let now = new Date().getTime();
            ele.timer = setInterval(()=>{
                let change = new Date().getTime();
                let t = time-Math.max(0,now-change+time);
                for(let name in styles){
                    let current = parseFloat(this.#getStyle(ele, name));
                    let target = parseFloat(styles[name]);
                    // 调用tween算法
                    current = $.tween[easing](t,starts[name],target - starts[name],time);
                    if( t === time){
                        clearInterval(ele.timer);
                        this.#setStyle(ele, name , target);
                        //调用回调函数
                        callback();
                    }else{
                        this.#setStyle(ele, name , current);
                    }
                }
            },10)
        }
        return this;
    }
    #setAnimateArgs(args){
        let times = {
            normal: 500,
            fast: 100,
            slow: 1000
        }
        let time = 500;
        let easing = "linear";
        let callback = function (){}

        // 判断参数的值
        switch (args.length){
            case 2:
                let second = args[1];
                if(typeof second === 'string' && second!=="normal" && second!=="fast" && second !=="slow"){
                    easing = second;
                }else if(typeof second === "function"){
                    callback = second;
                }else {
                    time = typeof second === "number" ? second : times[second];
                }
                break;
            case 3:
                let sec = args[1];
                let third = args[2];
                if(typeof sec === 'string'  && sec!=="normal" && sec!=="fast" && sec!=="slow"){
                    easing = sec;
                    callback = typeof third === "function" ? third : callback;
                }else{
                    time = typeof sec === "number" ? sec : times[sec];
                    if(typeof third === "function"){
                        callback = third;
                    }else {
                        easing = third;
                    }
                }
                break;
            case 4:
                time = typeof args[1] === "number" ? args[1] : times[args[1]];
                easing = args[2];
                callback = args[3];
                break;
        }
        return {time,easing,callback};
    }
}

$.tween = {
    linear: function (t, b, c, d){  //匀速
        return c*t/d + b;
    },
    easeBoth: function(t, b, c, d){  //加速减速曲线
        if ((t/=d/2) < 1) {
            return c/2*t*t + b;
        }
        return -c/2 * ((--t)*(t-2) - 1) + b;
    }
}
$.cssNumber = {
    animationIterationCount: true,
    columnCount: true,
    fillOpacity: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    gridArea: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnStart: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowStart: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
}
$.cssHooks = {};

function $(agr){
    return new Jq(agr);
}
