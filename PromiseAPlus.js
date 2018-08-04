"use strict"
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

const isFunction = variable => typeof variable === 'function'
const asyncProcess = (self, data, status) => {
    //status is immutable, when not PENDING, directly return.
    if (self._status != PENDING) return
    //change status to resolved or fulfilled
    self._status = status
    self._data = data
    // FIX IT
    //it's time to find out whether there were waiting functions in lists!
    if (self._whenFulfilledCallback == null && self._whenRejectedCallback == null) {
        //the then method has not been called yet.
        
        return
    }
    let cb = status == FULFILLED ? self._whenFulfilledCallback : self._whenRejectedCallback

    if (data instanceof PromiseAPlus) {
        //if data is a proms object, the object should be judgeted.
        data.then(cb, cb)
    } else {
        cb(data)
    }


}

/**
 *
 *
 * @class PromiseAPlus
 */
class PromiseAPlus {

    /**
     *Creates an instance of PromiseAPlus.
     * @param {*} handle handle is a async function.
     * @memberof PromiseAPlus
     */
    constructor(handle) {

        let self = this
        //handle should be a function.
        if (!isFunction(handle)) {
            throw new TypeError("PromiseAPlus require a function to construct.")
        }
        //set up the default status.
        this._status = PENDING

        //set up the inner data.
        this._data = null

        //set up the inner function.
        this._handle = handle
        
        //set up the waiting callback
        this._whenFulfilledCallback = null
        this._whenRejectedCallback = null
        
        //run handle function.
        setTimeout(()=>{
            try {
                self._handle(self._resolve.bind(self), self._reject.bind(self))
            } catch (err) {
                self._reject.call(self, new Error("function type error"))
            }
        })
    }
    /**
     *
     * resolve and reject will change the status and then call the callback function
     * @param {*} variable variable is the value that returned from handle.
     * @returns
     * @memberof PromiseAPlus
     */
    _resolve(variable) {
        console.log(this)
        setTimeout(asyncProcess.bind(null, this, variable, FULFILLED))
    }
    _reject(variable) {
        setTimeout(asyncProcess.bind(null, this, variable, REJECTED))
    }
    then(onFulfilledFn, onRejectedFn) {
        console.log("then!")

        //a then method must return a proms element
        let proms = new PromiseAPlus(function (resolve, reject) {
            //if rejected,do:
            var rejected = reason => {
                //if a ondefined funtion was provided, then resolve the reason by 
                //  using this funtion.
                //if not
                //  pass the reason to next promise(if existed)
                if (isFunction(onRejectedFn)) {
                    resolve(onRejectedFn(reason))
                } else {
                    reject(reason)
                }
            }
            var resolved = value => {

                isFunction(onFulfilledFn) && resolve(onFulfilledFn(value))
            }

            console.log(this._status)
            switch (this._status) {
                case PENDING:
                    {
                        this._whenFulfilledCallback = resolved
                        this._whenRejectedCallback = rejected
                        console.log(this)
                        break
                    }
                case FULFILLED:
                    {
                        onFulfilledFn.call(this, this._data)
                    }
                case REJECTED:
                    {
                        onRejectedFn.call(this, this._data)
                    }
            }
        })
        return proms
    }
}


//TEST
var proms = new PromiseAPlus(function (res, rej) {
    res(1)
})

proms.then(function (data) {
    console.log("data" + data)
})

