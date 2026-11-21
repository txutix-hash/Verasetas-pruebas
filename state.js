import {events} from './eventBus.js';
const state={version:'4.0.0-beta.1',online:navigator.onLine,mapZoom:null,visible:!document.hidden,weatherUpdatedAt:null,weatherError:null};
export function getState(){return {...state}}
export function setState(patch){const changed={};for(const [key,value] of Object.entries(patch)){if(state[key]!==value){state[key]=value;changed[key]=value}}if(Object.keys(changed).length)events.emit('state:changed',{changed,state:getState()})}
