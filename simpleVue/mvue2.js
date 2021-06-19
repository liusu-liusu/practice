class MVue{
    constructor(options) {
        this.$options = options;
        this.ele = document.querySelector(options.el);
        this._data = options.data;
        this.observe(this._data);
        this.complie(this.ele);
    }
    observe(data){
        let temp = {};
        this._data = new Proxy(this._data, {
            get(target,key){
                // console.log(key,"触发get了")
                if(!temp[key]){
                    temp[key] = new DependOn();
                }
                if(DependOn.target){
                    temp[key].addSub(DependOn.target);
                    // 置空,非watcher触发的get事件,不执行addSub
                    DependOn.target = null;
                    console.log(key,temp[key])
                }
                return Reflect.get(target, key);
            },
            set(target, key,newValue){
                console.log(key,"触发set了")
                temp[key].notify(newValue);
                return Reflect.set(target,key,newValue);
            }
        })

    }
    complie(ele){
        let nodeChilds = ele.childNodes;
        nodeChilds.forEach((node)=>{
            if(node.nodeType === 1){  // 元素节点
                if(node.childNodes.length > 0){
                    this.complie(node);
                }
                // v-model
                let attrs = node.attributes;
                [...attrs].forEach((attr)=>{
                    let name = attr.name
                    let param = attr.value
                    switch (name){
                        case 'v-model':
                            node.value = this._data[param];
                            node.addEventListener("input",(e)=>{
                                let newValue = e.target.value;
                                this._data[param] = newValue;
                            })
                            // 增加监听 其他地方数据变化导致的
                            new watcher(this._data,param,(newValue)=>{
                                node.value = newValue;
                            })
                            break;
                        case 'v-html':
                            node.innerHTML = this._data[param];
                            new watcher(this._data,param,(newValue)=>{
                                node.innerHTML = newValue;
                            })
                            break;
                        case 'v-text':
                            node.textContent = this._data[param];
                            new watcher(this._data,param,(newValue)=>{
                                node.textContent = newValue;
                            })
                            break;
                    }
                })
            }else if(node.nodeType === 3){  // 文本节点
                let txt = node.textContent;
                let reg = /\{\{\s*([^{}\s]+)\s*\}\}/g
                let temp = {};

                if(reg.test(txt)){
                    node.textContent = txt.replace(reg, (match,param)=>{
                        /*
                       * 在同一个文本节点,相同的param只增加一次事件，减少执行的次数且避免新旧数据类似时，数据只替换第一次遇到的数据.
                       * 这样还是不安全，如果文本里其他地方（非大胡子语法中的内容）还有相同的数据 也会一起替换
                       * vue 是用虚拟DOM标记{{}}解决的？
                       * */
                        if(!temp[param]){
                            temp[param] = this._data[param];
                        }
                        // 首次渲染替换
                        return this._data[param];
                    });
                }

                //监听事件
                for(let key in temp){
                    new watcher(this._data,key,(newValue)=>{
                        let oldValue = this._data[key];
                        let reg2 = new RegExp(oldValue, 'g');
                        node.textContent = node.textContent.replace(reg2,newValue)
                    })
                }
            }
        })
    }
}

// 收集依赖
class DependOn{
    constructor() {
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub)
    }
    notify(newValue){
        this.subs.forEach((sub)=>{
            sub.update(newValue);
        })
    }
}
class watcher{
    constructor(data, key,callback) {
        DependOn.target = this;
        data[key]; //触发get
        this.callback = callback;
    }
    update(newValue){
        this.callback(newValue);
    }
}
