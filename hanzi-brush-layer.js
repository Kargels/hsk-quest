'use strict';
// Passive visual observers: Hanzi Writer receives the original input events.
function createBrushLayer(board,path,canDraw,onCancel){
 let points=[],active=false,touchId=null,raf=0,timer=0;
 function clear(){cancelAnimationFrame(raf);raf=0;clearTimeout(timer);path.setAttribute('d','');points=[];active=false;touchId=null}
 function paint(){raf=0;path.setAttribute('d',Brush.outline(points))}
 function sample(p,time){const r=board.getBoundingClientRect();Brush.add(points,p.clientX-r.left,p.clientY-r.top,time);if(!raf)raf=requestAnimationFrame(paint)}
 function start(e){if(!canDraw()||active)return;if(e.type==='mousedown'&&e.button!==0)return;clear();active=true;const p=e.touches?e.touches[0]:e;touchId=e.touches?p.identifier:null;sample(p,e.timeStamp)}
 function move(e){if(!active)return;const p=e.touches?[...e.touches].find(t=>t.identifier===touchId):touchId===null?e:null;if(p)sample(p,e.timeStamp)}
 function end(e){if(!active)return;if(e.touches&&[...e.touches].some(t=>t.identifier===touchId))return;active=false;cancelAnimationFrame(raf);paint();timer=setTimeout(clear,180)}
 function cancel(){if(!active)return;clear();onCancel()}
 for(const type of ['mousedown','touchstart'])board.addEventListener(type,start,{capture:true,passive:true});
 for(const type of ['mousemove','touchmove'])board.addEventListener(type,move,{capture:true,passive:true});
 for(const type of ['mouseup','touchend'])document.addEventListener(type,end,{capture:true,passive:true});
 document.addEventListener('touchcancel',cancel,{passive:true});window.addEventListener('blur',cancel);
 return {clear,cancel};
}
