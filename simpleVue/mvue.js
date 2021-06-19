class MVue extends EventTarget{
    constructor(options) {
        super();
        this.$options = options;
        this.ele = document.querySelector(options.el);
        this._data = options.data;
        this.observe(this._data);
        this.complie(this.ele);
    }
    observe(data){
        let keys = Object.keys(data);
        let _this = this;
        keys.forEach((key)=>{
            let value = data[key];
            Object.defineProperty(data,key,{
                configurable: true,
                enumerable: true,
                get(){
                    console.log("触发了get")
                    return value;
                },
                set(newValue){
                    console.log("触发了set")
                    _this.dispatchEvent(new CustomEvent(key,{
                        detail: newValue
                    }));
                    value = newValue;
                }
            })
        })
    }
    complie(ele){
        let nodeChilds = ele.childNodes;
        nodeChilds.forEach((node)=>{
            if(node.nodeType === 1){  // 元素节点
                if(node.childNodes.length > 0){
                    this.complie(node);
                }
            }else if(node.nodeType === 3){  // 文本节点
                let txt = node.textContent;
                let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g
                if(reg.test(txt)){
                    node.textContent = txt.replace(reg, (match,param)=>{
                        return this._data[param];
                    });

                    //事件监听
                    txt.replace(reg, (match,param)=>{
                        this.addEventListener(param,(e)=>{
                            let oldValue = this._data[param];
                            let newValue = e.detail;
                            node.textContent = node.textContent.replace(oldValue, newValue);
                        })
                    })
                }
            }
        })
    }
}
