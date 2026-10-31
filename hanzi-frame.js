'use strict';
// A disposable frame owns the library's document listeners and animation lifecycle.
let writer,token,attempt,charData,locked=true,seq=0,model=false;
const board=document.querySelector('#board');
const brush=createBrushLayer(board,document.querySelector('#ink path'),()=>!!writer&&!locked&&!model,()=>{
 if(locked||model)return;writer.cancelQuiz();resume(attempt).catch(()=>{lock();send('load-error')});
});
function send(kind,extra={}){parent.postMessage({kind,token,...extra},location.origin)}
function lock(){brush.clear();locked=true;board.classList.add('lock')}
function validData(d){return d&&Array.isArray(d.strokes)&&d.strokes.length>0&&d.strokes.every(s=>typeof s==='string'&&s.startsWith('M'))&&Array.isArray(d.medians)&&d.medians.length===d.strokes.length&&d.medians.every(points=>Array.isArray(points)&&points.length>1&&points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))}
async function resume(a){
 attempt=a;lock();
 await writer.quiz({quizStartStrokeNum:a.stroke,showHintAfterMisses:false,markStrokeCorrectAfterMisses:false,acceptBackwardsStrokes:false,highlightOnComplete:false,
  onMistake:data=>emitStroke('mistake',data),onCorrectStroke:data=>emitStroke('correct',data),onComplete:()=>lock()});
 locked=false;board.classList.remove('lock');
}
function emitStroke(kind,data){if(locked)return;lock();send(kind,{stroke:data.strokeNum,seq:++seq})}
window.addEventListener('message',async event=>{
 if(event.source!==parent||event.origin!==location.origin)return;const m=event.data;if(!m||typeof m.token!=='string')return;
 if(m.kind!=='init'&&m.token!==token)return;
 try{
  if(m.kind==='init'){
   if(writer)return;token=m.token;attempt=m.attempt;model=m.model===true&&!!attempt.endedAt;
   const response=await fetch('hanzi-data/'+encodeURIComponent(attempt.character)+'.json');if(!response.ok)throw Error('data');charData=await response.json();if(!validData(charData)||charData.strokes.length!==m.strokeCount)throw Error('data');
   writer=HanziWriter.create(board,attempt.character,{width:innerWidth,height:innerWidth,padding:12,drawingWidth:16,showCharacter:false,showOutline:false,strokeColor:'#195842',highlightColor:'#e65a45',strokeFadeDuration:0,charDataLoader:()=>charData});
   await writer.getCharacterData();if(model){lock();await writer.showCharacter({duration:0})}else await resume(attempt);send('ready');
  }else if(m.kind==='animate-model'&&model){lock();await writer.animateCharacter();send('ready')}
  else if(m.kind==='lock')lock();
  else if(m.kind==='resume')await resume(m.attempt);
  else if(m.kind==='hint'){
   lock();writer.cancelQuiz();attempt=m.attempt;
   if(m.type==='stroke'){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),g=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path');
    svg.setAttribute('width',innerWidth);svg.setAttribute('height',innerWidth);svg.style.cssText='position:absolute;inset:0;pointer-events:none';g.setAttribute('transform',HanziWriter.getScalingTransform(innerWidth,innerWidth,12).transform);path.setAttribute('d',charData.strokes[attempt.stroke]);path.setAttribute('fill','#e65a45');g.append(path);svg.append(g);board.append(svg);await new Promise(resolve=>setTimeout(resolve,1200));svg.remove();
   }else await writer.animateStroke(attempt.stroke);
   await resume(attempt);send('ready');
  }
 }catch(error){lock();send('load-error')}
});
window.addEventListener('resize',()=>{brush.cancel();brush.clear();writer?.updateDimensions({width:innerWidth,height:innerWidth,padding:12})});
