/** Bus de eventos tipado por convención; listeners aislados de fallos. */
export function createEventBus(){
 const listeners=new Map();
 return Object.freeze({
  on(type,callback){if(typeof callback!=="function")throw new TypeError("callback");const set=listeners.get(type)||new Set();set.add(callback);listeners.set(type,set);return ()=>{set.delete(callback);if(!set.size)listeners.delete(type)}},
  emit(type,payload){for(const callback of [...(listeners.get(type)||[])]){try{callback(payload)}catch(error){console.error("VeraSetas EventBus",type,error)}}},
  clear(){listeners.clear()}
 });
}
export const events=createEventBus();
