export default class MyPromise{
    constructor(handle) {
        this['[[PromiseState]]'] = 'pending';
        this['[[PromiseResult]]'] = undefined;
        this.resovleQueue = [];
        this.rejectQueue = [];
        handle(this.#resovled.bind(this),this.#rejected.bind(this));
    }
    #resovled(res){
        this['[[PromiseState]]'] = 'fulfilled';
        this['[[PromiseResult]]'] = res;
        const run = ()=>{
            let cb = null;
            while(cb = this.resovleQueue.shift()){
                cb && cb(res);
            }
        }
        let observer = new MutationObserver(run);
        observer.observe(document.body,{attributes: true});
        document.body.setAttribute('kkb','test');
    }
    #rejected(error){
        this['[[PromiseState]]'] = 'rejected';
        this['[[PromiseResult]]'] = error;
        const run = ()=>{
            let cb = null;
            while(cb = this.rejectQueue.shift()){
                cb && cb(error);
            }
        }
        let observer = new MutationObserver(run);
        observer.observe(document.body,{attributes: true});
        document.body.setAttribute('kkb','test');
    }
    then(onResolved,onRejected){
        return new MyPromise((resolve, reject)=>{
            let resolveFn = function (res){
                let result = onResolved && onResolved(res);
                if(result instanceof MyPromise){
                    let isReject = result['[[PromiseState]]'] === 'rejected';
                    if(isReject){
                        reject(result['[[PromiseResult]]'])
                    }else {
                        resolve(result['[[PromiseResult]]']);
                    }
                }else {
                    resolve(result);
                }
            }
            this.resovleQueue.push(resolveFn);

            let rejectFn = function (err){
                onRejected && onRejected(err);
                reject(err);
            }
            this.rejectQueue.push(rejectFn);
            // console.log(this);
        })
    }
    catch(onRejected){
        return this.then(undefined,onRejected)
    }
    finally(onHandle){
        // console.log(88,this)
        // console.log(this['[[PromiseState]]'])
        return this.then(onHandle,onHandle)
    }
    static resolve(res){
        return new MyPromise(resolve=>{
            resolve(res);
        })
    }
    static reject(rej){
        return new MyPromise((resolve,reject)=>{
            reject(rej);
        })
    }
    static race(lists){
        let isExcute = false;
        return new MyPromise((resolve,reject)=>{
            lists.forEach(item=>{
                item.then(res=>{
                    if(!isExcute){
                        resolve(res);
                        isExcute = true;
                    }
                },rej=>{
                    if(!isExcute){
                        reject(rej);
                        isExcute = true;
                    }
                })
            })
        })
    }
    static allSettled(lists){
        let results = new Array(lists.length);
        return new MyPromise((resolve,reject)=>{
            let num = 0;
            lists.forEach((item,key)=>{
                let obj = {}
                item.then(res=>{
                    obj.status='fulfilled';
                    obj.value = res;
                    results[key]=obj;
                    num++;
                    if(num >= lists.length){
                        resolve(results);
                    }
                },rej=>{
                    obj.status='rejected';
                    obj.reason = rej;
                    results[key]=obj;
                    num++;
                    if(num >= lists.length){
                        reject(results);
                    }
                })

            })
        })
    }
    static all(lists){
        return new MyPromise((resolve,reject)=>{
            let results = [];
            let num = 0;
            lists.forEach((item,key)=>{
                item.then(res=>{
                    results[key] = res;
                    num++;
                    if(num >= lists.length){
                        resolve(results);
                    }
                },rej=>{
                    throw new Error('rejected')
                })
            })
        })
    }
}
