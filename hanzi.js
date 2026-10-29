'use strict';
// Optional state section: legacy daily and pinyin results are never rewritten.
let hzPending=null,hzFrameToken=null,hzReady=false,hzMessage='',hzReveal=false,hzLastEvent=0,hzConfirm=null;
const HZ_LABELS={clean:'Без ошибок',corrected:'С исправлениями',assisted:'С помощью',incomplete:'Не завершено'};
const hzNow=()=>new Date().toISOString();
const hzId=()=>window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
function hzTraining(s=state){return s.hanzi?.trainings.find(t=>t.id===s.hanzi.active)}
function hzStatus(a){return !a.completed?'incomplete':a.hints.length||a.fullModel?'assisted':a.errors||a.restarts?'corrected':'clean'}
function hzAttempt(t,sourceId=null,fullModel=false){const word=VOCAB.find(w=>w.id===t.order[t.wordIndex]);return {id:hzId(),trainingId:t.id,wordId:word.id,character:[...word.hanzi][t.charIndex],position:t.charIndex,mode:sourceId?'learn':t.mode,sourceId,startedAt:hzNow(),endedAt:null,completed:false,stroke:0,errors:0,problemStrokes:[],restarts:0,hints:[],fullModel,consecutive:0,status:null}}
function hzFinish(t,completed){const a=t.current;if(a.endedAt)return;a.completed=completed;a.endedAt=hzNow();a.status=hzStatus(a);if(a.sourceId)t.records.find(r=>r.id===a.sourceId).practice.push(structuredClone(a));else t.records.push({id:a.id,first:structuredClone(a),practice:[],modelViews:[]})}
function hzRecord(t){return t.records.find(r=>r.id===(t.current.sourceId||t.current.id))}
function hzAggregate(results){return ['incomplete','assisted','corrected','clean'].find(status=>results.some(a=>a.status===status))}
function hzStop(){hzFrameToken=null;hzReady=false;const frame=document.querySelector('#hanzi-frame');if(frame)frame.remove?.()}
function hzPost(data){document.querySelector('#hanzi-frame')?.contentWindow?.postMessage({...data,token:hzFrameToken},location.origin)}
function hzMount(){
 if(page!=='hanzi')return;
 const frame=document.querySelector('#hanzi-frame');if(!frame)return;
 hzReady=false;hzLastEvent=0;hzFrameToken=hzId();const token=hzFrameToken;
 frame.onload=()=>{if(token!==hzFrameToken)return;hzPost({kind:'init',attempt:hzTraining().current,strokeCount:HANZI_COUNTS[hzTraining().current.character],model:!!hzTraining().current.endedAt})};
}
function hzResult(a,hideCharacter=false){return `<p><strong>${HZ_LABELS[a.status]}</strong> · ${hideCharacter?'':safe(a.character)}</p><p class="muted">Ошибок: ${a.errors} · перезапусков: ${a.restarts} · подсказок: ${a.hints.length}${a.fullModel?' · после полного образца':''}</p>${a.problemStrokes.length?`<p class="mini">Проблемные черты: ${a.problemStrokes.join(', ')}</p>`:''}${a.hints.length?`<p class="mini">${a.hints.map(h=>`Черта ${h.stroke}: ${h.type==='stroke'?'подсветка':'движение'}`).join('; ')}</p>`:''}`}
function hzMenu(){
 const all=state.hanzi?.trainings||[],active=hzTraining();
 const stats=['learn','test'].map(mode=>{const first=all.flatMap(t=>t.records.map(r=>r.first)).filter(a=>a.mode===mode);return `<section class="card"><h2>${mode==='learn'?'Обучение':'Проверка'} · первые результаты</h2><p>Проверено иероглифов (попыток): ${first.length}</p>${Object.entries(HZ_LABELS).map(([k,v])=>`<p>${v}: ${first.filter(a=>a.status===k).length}</p>`).join('')}<p class="muted">Чаще ошибаемся: ${Object.entries(first.reduce((out,a)=>{out[a.character]=(out[a.character]||0)+a.errors;return out},{})).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${safe(c)} — ${n}`).join(', ')||'пока нет ошибок'}</p></section>`}).join('');
 return `<button class="back" data-page="home">← Сегодня</button><h1 class="title">Напиши иероглиф</h1><p class="muted">10 слов в случайном порядке. Сначала попробуй написать по памяти.</p><button class="secondary" data-action="hz-save" ${hzPending?'':'hidden'}>Повторить сохранение</button><section class="card">${active?'<button class="primary" data-action="hz-resume">Продолжить упражнение</button>':'<button class="primary" data-action="hz-learn">Обучение</button><button class="secondary hz-gap" data-action="hz-test">Проверка</button>'}</section><p class="notice">Проверяются движения по известным чертам с обратной связью. Даже результат без ошибок не доказывает полноценное владение рукописным письмом.</p>${stats}<h2 class="section">История</h2>${all.slice().reverse().map(t=>`<details class="card"><summary>${t.mode==='learn'?'Обучение':'Проверка'} · ${safe(t.startedAt.slice(0,10))} · ${t.completedAt?'завершено':'в процессе'}</summary>${t.records.map(r=>`<div class="history"><strong>Первый результат · ${r.first.mode==='learn'?'обучение':'проверка'}</strong>${hzResult(r.first)}${r.modelViews.length?'<p class="mini">Полный образец просмотрен после первого результата.</p>':''}${r.practice.map(a=>`<details><summary>Отдельная учебная практика</summary>${hzResult(a)}</details>`).join('')}</div>`).join('')}${t.words.map(w=>`<p>Слово ${safe(VOCAB.find(v=>v.id===w.wordId).hanzi)}: ${HZ_LABELS[w.status]}</p>`).join('')}</details>`).join('')}<p class="mini">Черты: Hanzi Writer Data / Arphic. <a href="hanzi-data/ARPHICPL.TXT">Лицензия данных</a>; <a href="vendor/hanzi-writer/LICENSE">лицензия библиотеки</a>.</p>`;
}
function hzExercise(){
 const t=hzTraining();if(!t)return hzMenu();const a=t.current,w=VOCAB.find(w=>w.id===a.wordId),r=hzRecord(t);
 const header=`<div class="row hz-top"><button class="back" data-page="hanzi-menu">← Иероглифы</button><span class="pill">${a.mode==='learn'?'Обучение':'Проверка'}</span></div><p class="muted hz-instruction">Напиши иероглиф для слова</p><h1 class="title hz-word">${safe(w.ru[0].toUpperCase()+w.ru.slice(1))}</h1><div class="hz-progress"><span>Слово ${t.wordIndex+1} из 10</span><span>Иероглиф ${a.position+1} из ${[...w.hanzi].length}</span></div>`;
 if(hzConfirm===a.id&&!a.endedAt)return header+`<section class="card" role="dialog" aria-modal="true" aria-labelledby="hz-confirm-title"><p id="hz-confirm-title">Показать правильное написание? Текущая попытка завершится, но ты сможешь потренироваться по образцу</p><button class="secondary" data-action="hz-cancel-model">Продолжить самому</button><button class="primary hz-gap" data-action="hz-confirm-model">Показать образец</button><button class="secondary hz-gap" data-action="hz-save" ${hzPending?'':'hidden'}>Повторить сохранение</button></section>`;
 if(a.endedAt)return header+`<section class="card"><button class="secondary" data-action="hz-save" ${hzPending?'':'hidden'}>Повторить сохранение</button>${hzResult(a,!a.completed&&!hzReveal)}${a.completed||hzReveal?`<iframe id="hanzi-frame" src="hanzi-frame.html" title="Образец написания иероглифа" class="hz-board"></iframe><p id="hz-message" role="status" aria-live="polite">Загружаем образец…</p><button class="secondary hz-gap" data-action="hz-animate">Анимация полного написания</button><button class="textbutton" data-action="hz-load">Повторить загрузку образца</button>`:'<button class="secondary" data-action="hz-model">Посмотреть правильное написание</button>'}${a.completed||hzReveal?'<button class="secondary hz-gap" data-action="hz-practice">Потренироваться по образцу</button>':''}<button class="primary hz-gap" data-action="hz-next">${a.position+1<[...w.hanzi].length?'Следующий иероглиф':t.wordIndex<9?'Следующее слово':'Завершить тренировку'}</button>${r?.practice.length?'<p class="mini">Первый результат сохранён отдельно.</p>':''}</section>`;
 return header+`<section class="card hz-card"><iframe id="hanzi-frame" src="hanzi-frame.html" title="Поле для написания иероглифа" class="hz-board"></iframe><p id="hz-message" role="status" aria-live="polite">${safe(hzMessage||'Загружаем поле…')}</p><p id="hz-counts" class="mini">Ошибок: ${a.errors} · заново: ${a.restarts} · подсказок: ${a.hints.length}</p><button class="secondary" data-action="hz-restart">Заново</button>${a.mode==='learn'?'<button class="textbutton" data-action="hz-hint">Подсказка: следующая черта</button><button class="textbutton" data-action="hz-motion">Подсказка: показать движение</button><button class="secondary hz-gap" data-action="hz-ask-model">Посмотреть образец</button>':''}<button class="secondary hz-gap" data-action="hz-giveup">Не могу написать</button><button class="secondary hz-gap" data-action="hz-save" ${hzPending?'':'hidden'}>Повторить сохранение</button><button class="textbutton" data-action="hz-load">Повторить загрузку поля</button></section>`;
}
function hzUpdate(){const a=hzTraining()?.current;if(!a)return;const counts=document.querySelector('#hz-counts');if(counts)counts.textContent=`Ошибок: ${a.errors} · заново: ${a.restarts} · подсказок: ${a.hints.length}`;const message=document.querySelector('#hz-message');if(message)message.textContent=hzMessage;}
async function hzCommit(candidate,after){
 setBusy(true);hzPost({kind:'lock'});storageMessage('Сохраняем…');
 try{await commit(candidate);hzPending=null;storageMessage('');after();return true}
 catch(error){hzPending={candidate,after};storageMessage(error.message+' Написание приостановлено. Повтори сохранение.');const button=document.querySelector('[data-action="hz-save"]');if(button)button.hidden=false;return false}
 finally{setBusy(false)}
}
async function hzEvent(kind,stroke){
 if(busy||readOnly||hzPending||hzConfirm||!hzReady||page!=='hanzi')return;
 const t=hzTraining(),a=t?.current;if(!a||a.endedAt||stroke!==a.stroke)return;
 const candidate=structuredClone(state),next=hzTraining(candidate),d=next.current;
 if(kind==='mistake'){d.errors++;d.problemStrokes.push(stroke+1);d.consecutive++}
 else if(kind==='correct'){d.stroke++;d.consecutive=0;if(d.stroke===HANZI_COUNTS[d.character])hzFinish(next,true)}else return;
 await hzCommit(candidate,()=>{hzMessage=kind==='mistake'?'Попробуй ещё раз'+(d.mode==='learn'&&d.consecutive>=2?'. Можно попросить подсказку.':''):'Черта принята';if(d.endedAt){hzReveal=true;render()}else{hzUpdate();hzPost({kind:'resume',attempt:d})}});
}
async function hzAction(action){
 if(action==='hz-save'){if(hzPending){const p=hzPending;await hzCommit(p.candidate,p.after)}return}
 if(hzPending||busy||readOnly)return;
 if(action==='hz-resume'){hzConfirm=null;hzMessage='';hzReveal=false;navigate('hanzi');return}
 if(action==='hz-load'){hzMessage='';render();return}
 if(action==='hz-ask-model'){const a=hzTraining()?.current;if(!a||a.endedAt||a.mode!=='learn')return;hzConfirm=a.id;render();document.querySelector('[data-action="hz-cancel-model"]')?.focus?.();return}
 if(action==='hz-cancel-model'){hzConfirm=null;render();document.querySelector('[data-action="hz-ask-model"]')?.focus?.();return}
 if(action==='hz-animate'){if(hzTraining()?.current.endedAt&&hzReady){hzReady=false;hzPost({kind:'animate-model'})}return}
 const candidate=structuredClone(state);candidate.hanzi??={version:1,active:null,trainings:[]};let t=hzTraining(candidate),effect=null;
 if(action==='hz-learn'||action==='hz-test'){
  if(t){navigate('hanzi');return}
  t={id:hzId(),mode:action==='hz-learn'?'learn':'test',order:shuffle(VOCAB.map(w=>w.id)),wordIndex:0,charIndex:0,startedAt:hzNow(),completedAt:null,records:[],words:[],current:null};t.current=hzAttempt(t);candidate.hanzi.active=t.id;candidate.hanzi.trainings.push(t);
 }else{
  if(!t)return;const a=t.current;
  if(action==='hz-restart'){if(a.endedAt||!hzReady)return;a.stroke=0;a.consecutive=0;a.restarts++}
  else if(action==='hz-hint'||action==='hz-motion'){if(a.endedAt||a.mode!=='learn'||!hzReady)return;const type=action==='hz-hint'?'stroke':'motion';a.hints.push({type,stroke:a.stroke+1,at:hzNow()});effect=type}
  else if(action==='hz-giveup'){if(a.endedAt)return;hzFinish(t,false)}
  else if(action==='hz-confirm-model'){if(a.endedAt||a.mode!=='learn'||hzConfirm!==a.id)return;hzFinish(t,false);hzRecord(t).modelViews.push({at:hzNow(),attemptId:a.id});effect='model'}
  else if(action==='hz-model'){if(!a.endedAt)return;hzRecord(t).modelViews.push({at:hzNow(),attemptId:a.id});effect='model'}
  else if(action==='hz-practice'){if(!a.endedAt||(!a.completed&&!hzReveal))return;const id=hzRecord(t).id;t.current=hzAttempt(t,id,true)}
  else if(action==='hz-next'){
   if(!a.endedAt)return;const w=VOCAB.find(w=>w.id===a.wordId);
   if(t.charIndex+1<[...w.hanzi].length)t.charIndex++;
   else{const results=t.records.filter(r=>r.first.wordId===w.id).map(r=>r.first);t.words.push({wordId:w.id,resultIds:results.map(r=>r.id),completed:results.every(r=>r.completed),status:hzAggregate(results)});t.wordIndex++;t.charIndex=0}
   if(t.wordIndex===10){t.completedAt=hzNow();candidate.hanzi.active=null}else t.current=hzAttempt(t);
  }else return;
 }
 await hzCommit(candidate,()=>{
  if(effect==='stroke'||effect==='motion'){hzReady=false;hzUpdate();hzPost({kind:'hint',type:effect,attempt:t.current});return}
  hzConfirm=null;hzReveal=effect==='model';hzMessage='';page=candidate.hanzi.active?'hanzi':'hanzi-menu';render();
 });
}
window.addEventListener('message',event=>{
 const frame=document.querySelector('#hanzi-frame'),m=event.data;
 if(event.origin!==location.origin||event.source!==frame?.contentWindow||!m||m.token!==hzFrameToken)return;
 if(m.kind==='ready'){hzReady=true;hzMessage=hzTraining()?.current.endedAt?'Образец написания':'Напиши по памяти';hzUpdate()}
 else if(m.kind==='load-error'){hzReady=false;hzMessage=hzTraining()?.current.endedAt?'Не удалось загрузить образец. Результат сохранён. Повтори загрузку.':'Не удалось загрузить данные иероглифа. Результат не засчитан. Повтори загрузку.';hzUpdate()}
 else if(m.kind==='mistake'||m.kind==='correct'){if(!Number.isSafeInteger(m.seq)||m.seq<=hzLastEvent)return;hzLastEvent=m.seq;void hzEvent(m.kind,m.stroke);}
});
window.addEventListener('beforeunload',event=>{if(hzPending||busy){event.preventDefault();event.returnValue=''}});
window.addEventListener('pagehide',hzStop);
window.addEventListener('pageshow',event=>{if(event.persisted&&page==='hanzi'&&!hzPending)render()});
function validateHanzi(data,fail){
 if(data===undefined)return;if(!isObject(data)||data.version!==1||!Array.isArray(data.trainings))fail();
 const ids=new Set(),mode=m=>['learn','test'].includes(m),date=d=>typeof d==='string'&&Number.isFinite(Date.parse(d));
 function attempt(a,t,finished){
  const w=VOCAB.find(w=>w.id===a?.wordId);
  if(!w||!isObject(a)||typeof a.id!=='string'||a.trainingId!==t.id||!isCount(a.position)||[...w.hanzi][a.position]!==a.character||!mode(a.mode)||!date(a.startedAt)||!isCount(a.stroke)||a.stroke>HANZI_COUNTS[a.character]||!isCount(a.errors)||!isCount(a.restarts)||!isCount(a.consecutive)||a.consecutive>a.errors||typeof a.fullModel!=='boolean'||typeof a.completed!=='boolean'||!Array.isArray(a.problemStrokes)||a.problemStrokes.length!==a.errors||a.problemStrokes.some(n=>!Number.isInteger(n)||n<1||n>HANZI_COUNTS[a.character])||!Array.isArray(a.hints)||a.hints.some(h=>!['stroke','motion'].includes(h.type)||!Number.isInteger(h.stroke)||h.stroke<1||h.stroke>HANZI_COUNTS[a.character]||!date(h.at)))fail();
  if(a.mode==='test'&&(a.hints.length||a.fullModel||a.sourceId))fail();
  if(finished){if(!date(a.endedAt)||a.status!==hzStatus(a)||a.completed&&a.stroke!==HANZI_COUNTS[a.character])fail()}else if(a.endedAt!==null||a.completed||a.status!==null||a.stroke>=HANZI_COUNTS[a.character])fail();
 }
 for(const t of data.trainings){
  if(!isObject(t)||typeof t.id!=='string'||ids.has(t.id)||!mode(t.mode)||!date(t.startedAt)||!Array.isArray(t.order)||t.order.length!==VOCAB.length||new Set(t.order).size!==VOCAB.length||t.order.some(id=>!VOCAB.some(w=>w.id===id))||!isCount(t.wordIndex)||t.wordIndex>10||!isCount(t.charIndex)||!Array.isArray(t.records)||!Array.isArray(t.words))fail();ids.add(t.id);
  const recordIds=new Set(),positions=new Set();
  for(const r of t.records){if(!isObject(r)||r.id!==r.first?.id||recordIds.has(r.id)||r.first.sourceId!==null||r.first.mode!==t.mode||!Array.isArray(r.practice)||!Array.isArray(r.modelViews))fail();recordIds.add(r.id);attempt(r.first,t,true);const position=r.first.wordId+':'+r.first.position;if(positions.has(position))fail();positions.add(position);const practiceIds=new Set();for(const a of r.practice){attempt(a,t,true);if(a.mode!=='learn'||a.sourceId!==r.id||a.character!==r.first.character||a.wordId!==r.first.wordId||a.position!==r.first.position||!a.fullModel||practiceIds.has(a.id))fail();practiceIds.add(a.id)}if(r.modelViews.some(v=>!date(v.at)||![r.id,...practiceIds].includes(v.attemptId)))fail()}
  attempt(t.current,t,!!t.current?.endedAt);
  if(t.current.sourceId){const original=t.records.find(r=>r.id===t.current.sourceId)?.first;if(!original||t.current.mode!=='learn'||!t.current.fullModel||original.wordId!==t.current.wordId||original.position!==t.current.position)fail()}else if(t.current.mode!==t.mode)fail();
  if(t.current.endedAt){const r=t.records.find(r=>r.id===(t.current.sourceId||t.current.id));const saved=t.current.sourceId?r?.practice.find(a=>a.id===t.current.id):r?.first;if(JSON.stringify(saved)!==JSON.stringify(t.current))fail()}
  const completedPositions=t.order.flatMap((id,wordIndex)=>[...VOCAB.find(w=>w.id===id).hanzi].map((_,position)=>({id,wordIndex,position}))).filter(p=>p.wordIndex<t.wordIndex||p.wordIndex===t.wordIndex&&(p.position<t.charIndex||p.position===t.charIndex&&(t.current.endedAt||t.current.sourceId)));if(completedPositions.length!==positions.size||completedPositions.some(p=>!positions.has(p.id+':'+p.position)))fail();
  const expected=t.order.slice(0,t.wordIndex);if(t.words.length!==expected.length)fail();
  t.words.forEach((w,i)=>{const results=t.records.filter(r=>r.first.wordId===expected[i]).map(r=>r.first);if(w.wordId!==expected[i]||results.length!==[...VOCAB.find(v=>v.id===w.wordId).hanzi].length||w.status!==hzAggregate(results)||w.completed!==results.every(a=>a.completed)||JSON.stringify(w.resultIds)!==JSON.stringify(results.map(a=>a.id)))fail()});
  if(t.completedAt!==null){if(!date(t.completedAt)||t.wordIndex!==10)fail()}else if(t.wordIndex>=10||data.active!==t.id||t.current.wordId!==t.order[t.wordIndex]||t.current.position!==t.charIndex)fail();
 }
 if(data.active!==null&&!ids.has(data.active))fail();
}
