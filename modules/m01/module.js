'use strict';
// M01 owns its attempts; legacy training, pinyin and Hanzi histories are untouched.
const M01_COUNTS={'我':7,'你':7,'叫':5,'妈':6,'说':9};
const M01_SKILLS={listening:'Аудирование',recognition:'Узнавание',pinyin_syllable:'Написание пиньиня',pinyin_tone:'Тоны по слогам',writing:'Письмо',sentence_comprehension:'Понимание предложений'};
const M01_TONES=['нейтральный','ровный','восходящий','третий (низкий, с возможным подъёмом)','нисходящий'];
const M01_TRANSLATIONS={L01:'А: Привет!\nБ: Привет!\nА: Как дела?\nБ: У меня всё хорошо, спасибо!',L02:'А: Привет! Как тебя зовут?\nБ: Меня зовут Сяомин. А тебя?\nА: Меня зовут Сяохун.',L03:'А: Привет!\nБ: Привет!\nА: Это моя мама.\nБ: Это твой папа?\nА: Нет, это мой друг.',L04:'А: Привет! Ты говоришь по-китайски?\nБ: Я говорю по-китайски.\nА: Ты знаешь Сяомина?\nБ: Я с ним знаком.\nА: До свидания!\nБ: До свидания!'};
let m01View=null,m01Choice=null,m01Pending=null,m01Token=null,m01Ready=false,m01Sequence=0;
const m01Now=()=>new Date().toISOString();
const m01Id=()=>window.crypto.randomUUID();
const m01Active=()=>state.m01?.attempts.find(a=>a.id===state.m01.active);
const m01Current=()=>state.m01?.attempts.find(a=>a.id===m01View)||m01Active();
const m01Step=a=>M01_DATA.lessons[a.lesson].steps[a.cursor];
const m01Record=(a,s)=>a.answers.find(r=>r.step===s.id);
const m01Test=(a,s)=>a.lesson==='L05'||s.mode==='test';
const m01Pinyin=w=>w.syllables.map((s,i)=>toneMarked(s,w.tones[i])).join(' ');
function m01Grade(w,input,tones){return {spellingCorrect:normalizePinyin(input)===w.syllables.join(''),toneCorrect:w.tones.map((t,i)=>tones[i]===t)}}
function m01Draft(s,a,sourceId=null){
 if(s.kind==='pinyin')return {id:m01Id(),kind:'pinyin',input:'',stage:'input',tones:M01_DATA.words[s.word].tones.map(()=>null),hints:[],sourceId};
 if(s.kind==='hanzi')return {id:m01Id(),kind:'hanzi',character:s.character,stroke:0,errors:0,problemStrokes:[],hints:[],restarts:0,completed:false,endedAt:null,fullModel:!!s.afterModel||!!sourceId,sourceId};
 return null;
}
function m01Enter(a){a.draft=m01Draft(m01Step(a),a)}
function m01StoreAnswer(a,s,answer){const r=m01Record(a,s);if(r)r.corrections.push(answer);else a.answers.push({step:s.id,first:answer,corrections:[]})}
function m01WritingEnd(a,s,completed,model=false){let d=a.draft;d.completed=completed;d.endedAt=m01Now();d.fullModel=d.fullModel||model;d.sampleViewed=model;d.status=hzStatus(d);m01StoreAnswer(a,s,structuredClone(d))}
function m01Stats(a){
 const stats=Object.fromEntries(Object.keys(M01_SKILLS).map(k=>[k,{correct:0,total:0,assisted:0}]));
 function add(k,correct,assisted=false){stats[k].total++;if(correct)stats[k].correct++;if(assisted)stats[k].assisted++}
 for(const r of a.answers){const s=M01_DATA.lessons[a.lesson].steps.find(s=>s.id===r.step),f=r.first;if(!s.skill||s.diagnostic)continue;
  if(s.kind==='pinyin'){add('pinyin_syllable',f.spellingCorrect,f.hints.length>0);f.toneCorrect.forEach(x=>add('pinyin_tone',x,f.hints.length>0))}
  else if(s.kind==='hanzi')add('writing',f.completed,f.fullModel||f.hints.length>0);
  else add(s.skill,f.correct);
 }return stats;
}
function m01Summary(a){const stats=m01Stats(a);return `<h2 class="section">${a.endedAt?'Занятие завершено':'Результаты этой попытки'}</h2><p class="mini">Первый проверенный ответ по каждому заданию. Исправления его не заменяют. Единого балла знания языка нет.</p>${Object.entries(stats).map(([k,v])=>`<div class="history"><strong>${M01_SKILLS[k]}</strong><p>${v.total?`${v.correct} из ${v.total} · с помощью: ${v.assisted}`:'Нет проверенных заданий'}</p></div>`).join('')}<p class="mini">Письмо: завершённые иероглифы; помощь включает предварительный образец. Это не показатель письма по памяти. ${a.lesson==='L05'?'Контрольный диалог оценивается отдельно от учебных прослушиваний.':'Первый проход аудирования — диагностика без штрафа.'}</p>`}
function m01Menu(){const all=state.m01?.attempts||[],done=new Set(all.filter(a=>a.endedAt).map(a=>a.lesson));return `<button class="back" data-page="home">← Сегодня</button><h1 class="title">Знакомство и общение</h1><p class="muted">M01 · четыре учебных занятия и проверка. Завершено ${done.size} из 5 · попыток ${all.length}.</p><div class="notice">Аудио прошло технические проверки; произношение ещё требует выборочной проверки на слух.</div>${Object.values(M01_DATA.lessons).map(l=>{const active=m01Active(),locked=l.id==='L05'&&!['L01','L02','L03','L04'].every(id=>done.has(id));return `<section class="card"><span class="eyebrow">${l.id} · ${l.type==='test'?'Проверка':'Обучение'}</span><h2>${l.title}</h2><p class="muted">${locked?'Откроется после завершения L01–L04. Контрольная запись до этого недоступна.':l.id==='L05'?'Без подсказок. На диалог — первое прослушивание и до двух повторов.':'Сначала слушаем без текста, затем разбираем слова, пиньинь и письмо.'}</p><button class="primary" data-action="m01-start-${l.id}" ${locked||active&&active.lesson!==l.id?'disabled':''}>${active?.lesson===l.id?'Продолжить':done.has(l.id)?'Пройти ещё раз':'Начать'}</button>${all.filter(a=>a.lesson===l.id&&(a.endedAt||a.abandonedAt)).map((a,i)=>`<button class="textbutton" data-action="m01-review-${a.id}">${a.abandonedAt?'Прервана':'Результаты'} · попытка ${i+1}</button>`).join('')}</section>`}).join('')}${m01Active()?'<p class="mini">Сначала заверши текущую попытку или начни её заново.</p>':''}`}
const m01Button=(action,label,disabled=false,cls='primary')=>`<button class="${cls}" data-action="m01-${action}" ${disabled?'disabled':''}>${label}</button>`;
function m01Audio(id,a,s){const n=a.plays[id]?.started||0,disabled=a.lesson==='L05'&&id==='L05-A'&&n>=3;return `<div class="speakerRow">${m01Button('play-'+id,'▶ Слушать',disabled,'audioBtn')}</div>${a.lesson==='L05'?`<p class="mini">Прослушиваний: ${n} из 3 (первое и два повтора).</p>`:''}<p id="m01-audio-status" class="mini" role="status"></p>`}
function m01NeedsAudio(a,s){return s.audio&&['listen','choice','pinyin'].includes(s.kind)&&!a.heard.includes(s.id)}
function m01PinyinResult(s,f){const w=M01_DATA.words[s.word];return `<p>Введено: <strong>${safe(f.input)}</strong></p><p>Правильно: <strong>${m01Pinyin(w)}</strong></p><div class="feedback ${f.spellingCorrect?'':'bad'}">Написание: ${f.spellingCorrect?'верно':'ошибка'}</div><div class="feedback ${f.toneCorrect.every(Boolean)?'':'bad'}">Тоны: ${f.toneCorrect.every(Boolean)?'верно':'есть ошибки'}</div>${f.tones.map((t,i)=>f.toneCorrect[i]?'':`<div class="toneDetail toneMistake"><strong>${w.syllables.length>1?'Слог '+(i+1)+' · '+w.syllables[i]:w.hanzi}</strong><p>Ты выбрал ${t}-й тон (${M01_TONES[t]}) — ${toneMarked(w.syllables[i],t)}.</p><p>Правильно: ${w.tones[i]}-й тон (${M01_TONES[w.tones[i]]}) — ${toneMarked(w.syllables[i],w.tones[i])}.</p></div>`).join('')}<p class="mini">${hintSummary(f.hints)}</p>`}
function m01Screen(){
 const a=m01Current();if(!a)return m01Menu();const l=M01_DATA.lessons[a.lesson],s=m01Step(a),r=m01Record(a,s),d=a.draft;
 const header=`<button class="back" data-action="m01-menu">← Модуль M01</button><div class="row"><span class="eyebrow">${l.id} · ${l.title}</span><span class="pill">${m01Test(a,s)?'Проверка':'Обучение'}</span></div>`;
 if(a.endedAt||a.abandonedAt)return header+`<section class="card">${m01Summary(a)}</section>${m01Button('menu','К занятиям')}`;
 let body='';const answered=!!r&&(!d||d.stage==='result'||!!d.endedAt);
 if(s.kind==='listen')body=`<h1 class="title">Сначала послушай</h1><p>${safe(s.prompt)}</p><p class="muted">Текст и перевод пока скрыты.</p>${m01Audio(s.audio,a,s)}`;
 if(s.kind==='choice')body=`<h2>${safe(s.prompt)}</h2>${s.audio?m01Audio(s.audio,a,s):a.lesson==='L05'&&s.id.includes('-C')?m01Audio('L05-A',a,s):''}<div class="answers">${s.options.map((o,i)=>`<button class="answer ${m01Choice===i?'selected':''} ${r&&r.first.choice===i?'selected':''} ${r&&!s.diagnostic&&i===s.answer?'correct':''}" data-m01-choice="${i}" ${r||m01NeedsAudio(a,s)?'disabled':''}>${safe(o)}</button>`).join('')}</div>${r?`<p class="feedback">${s.diagnostic?'Спасибо! Это первая проба, без оценки.':r.first.correct?'Верно!':'Правильно: '+safe(s.options[s.answer])}</p>`:m01Button('check','Проверить ответ',m01Choice===null||m01NeedsAudio(a,s))}`;
 if(s.kind==='word'){const w=M01_DATA.words[s.word];body=`<span class="eyebrow">${w.role==='target'?'Целевое слово':'Контекстная опора — не новое целевое слово'}</span><div class="hanzi">${w.hanzi}</div><div class="pinyin">${m01Pinyin(w)}${w.hanzi==='谁'?' / shuí':''}</div><h2>${safe(w.ru)}</h2>${w.audio?m01Audio(w.audio,a,s):'<p class="mini">Отдельной записи нет. Слово встречается в диалоге.</p>'}<p class="mini">${w.hanzi==='你好'?'Словарные тоны: 3 + 3. В речи первый третий тон изменяется перед следующим третьим.':w.hanzi==='不'?'Словарный тон — четвёртый; перед 是 в речи звучит bú shì.':w.tones.includes(0)?'Второй слог произносится нейтральным тоном.':''}</p>`}
 if(s.kind==='pinyin'){
  const w=M01_DATA.words[s.word];body=`<p class="muted">Напиши пиньинь целого слова</p>${s.audio?m01Audio(s.audio,a,s):`<h1 class="hanzi">${w.hanzi}</h1>`}`;
  if(d.stage==='input')body+=`<label for="m01-input">Пиньинь</label><input id="m01-input" class="pinyinInput" type="text" inputmode="text" lang="en" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="80" value="${safe(d.input)}">${!m01Test(a,s)?m01Button('hint','Подсказка',d.hints.length>=2,'textbutton'):''}${d.hints.length?`<p class="notice">${d.hints.length===1?w.syllables.map(x=>x[0]+'…').join(' '):w.syllables.join(' ')}</p>`:''}${m01Button('continue','Продолжить',m01NeedsAudio(a,s))}`;
  if(d.stage==='tones')body+=`<p>Введено: ${safe(d.input)}</p>${pinyinLabels(d.input,w.tones.length).map((label,i)=>`<fieldset class="m01-tones"><legend>${safe(label)}</legend><div class="toneChoices">${[1,2,3,4,0].map(t=>`<div><button class="toneButton ${d.tones[i]===t?'selected':''}" data-m01-tone="${t}" data-m01-syllable="${i}" aria-pressed="${d.tones[i]===t}" aria-label="${t} — ${M01_TONES[t]}">${t} · ${toneMarked('a',t)}</button><small>${['нейтр.','ровный','вверх','третий','вниз'][t]}</small></div>`).join('')}</div></fieldset>`).join('')}${m01Button('edit','← Изменить написание',false,'textbutton')}${m01Button('check','Проверить ответ',d.tones.some(t=>t===null))}`;
  if(d.stage==='result'){const f=r.corrections.at(-1)||r.first;body+=m01PinyinResult(s,f)+(!m01Test(a,s)?m01Button('practice','Повторить в обучении',false,'secondary'):'')}
 }
 if(s.kind==='model')body=`<h1 class="title">Посмотри порядок черт</h1><p>${safe(s.meaning)} · ${s.character}</p><p class="mini">Затем образец будет скрыт: попробуй воспроизвести по памяти. Предварительный показ будет отмечен в результате.</p>${m01FrameHtml()}${m01Button('animate','Показать движение',false,'secondary')}`;
 if(s.kind==='hanzi'){
  body=`<p class="muted">Напиши иероглиф для слова</p><h1 class="title">${safe(s.meaning[0].toUpperCase()+s.meaning.slice(1))}</h1><p class="mini">Иероглиф 1 из 1</p>`;
  if(d.endedAt)body+=hzResult(d)+m01FrameHtml()+m01Button('animate','Анимация написания',false,'secondary')+(!m01Test(a,s)?m01Button('practice','Потренироваться по образцу',false,'secondary'):'');
  else body+=m01FrameHtml()+`<p class="mini">Ошибок: ${d.errors} · заново: ${d.restarts} · подсказок: ${d.hints.length}</p>`+m01Button('restart-strokes','Заново',false,'secondary')+(!m01Test(a,s)?m01Button('stroke-hint','Подсказка: следующая черта',false,'textbutton')+m01Button('motion-hint','Подсказка: движение',false,'textbutton')+m01Button('sample','Посмотреть образец',false,'secondary'):'')+m01Button('giveup','Не могу написать',false,'secondary');
 }
 if(s.kind==='transcript'){const asset=M01_DATA.assets[s.audio];body=`<h2>Разбор диалога</h2>${m01Audio(s.audio,a,s)}<p class="m01-lines" lang="zh-Hans">${safe(asset.text)}</p><p class="m01-lines">${safe(asset.pinyin)}</p><p class="m01-lines">${safe(M01_TRANSLATIONS[a.lesson])}</p><p class="mini">${a.lesson==='L01'?'你好吗？ — учебно-формальный вопрос, не универсальное повседневное приветствие.':''} Упражнение проверяет словарный пиньинь, а в речи возможны изменения тонов.</p>`}
 const canNext=['word','model','transcript'].includes(s.kind)||s.kind==='listen'&&!m01NeedsAudio(a,s)||answered;
 return header+`<p class="mini">Шаг ${a.cursor+1} из ${l.steps.length}</p><section class="card m01-card">${body}${canNext?m01Button('next',a.cursor===l.steps.length-1?'Завершить занятие':'Дальше →'):''}</section>${m01Pending?m01Button('save','Повторить сохранение'):''}<button class="textbutton" data-action="m01-restart">Начать занятие заново</button><p class="mini">Прежняя попытка сохранится отдельно.</p>`;
}
function m01FrameHtml(){return '<iframe id="m01-hanzi-frame" src="hanzi-frame.html?v=0.5.1-m01" class="hz-board" title="Поле для написания иероглифа"></iframe><p id="m01-frame-status" class="mini" role="status">Загружаем поле…</p>'+m01Button('load','Повторить загрузку поля',false,'textbutton')}
function m01Stop(){m01Token=null;m01Ready=false;document.querySelector('#m01-hanzi-frame')?.remove?.()}
function m01Post(m){document.querySelector('#m01-hanzi-frame')?.contentWindow?.postMessage({...m,token:m01Token},location.origin)}
function m01Mount(){
 const frame=document.querySelector('#m01-hanzi-frame'),a=m01Current();if(!frame||!a)return;
 const s=m01Step(a);if(!['model','hanzi'].includes(s.kind))return;m01Token=m01Id();m01Sequence=0;m01Ready=false;
 const attempt=s.kind==='model'?{character:s.character,stroke:0,endedAt:m01Now()}:a.draft;
 frame.onload=()=>m01Post({kind:'init',attempt,strokeCount:M01_COUNTS[s.character],model:s.kind==='model'||!!attempt.endedAt});
}
async function m01Save(candidate,effect=()=>{render();m01Mount()}){
 setBusy(true);storageMessage('Сохраняем…');m01Pending={candidate,effect};
 try{await commit(candidate);m01Pending=null;storageMessage('');effect();return true}
 catch(e){storageMessage(e.message+' Повтори сохранение.');const old=document.querySelector('[data-action="m01-save"]');if(!old){const content=document.querySelector('#content');content.insertAdjacentHTML?.('beforeend',m01Button('save','Повторить сохранение'))}return false}
 finally{setBusy(false)}
}
async function m01Play(id){
 const a=m01Current(),s=m01Step(a);const allowed=s.audio===id||a.lesson==='L05'&&s.kind==='choice'&&s.id.includes('-C')&&id==='L05-A'||s.kind==='word'&&M01_DATA.words[s.word].audio===id;if(!allowed||!M01_DATA.assets[id]||m01Pending)return;
 const used=a.plays[id]?.started||0;if(id==='L05-A'&&(a.lesson!=='L05'||used>=3||a.endedAt))return;
 stopAudio();const c=structuredClone(state),d=c.m01.attempts.find(x=>x.id===a.id);d.plays[id]={started:used+1,finished:d.plays[id]?.finished||0};
 await m01Save(c,()=>{
  render();const audio=new Audio(M01_DATA.assets[id].path);activeAudio=audio;
  audio.onended=async()=>{if(activeAudio!==audio)return;stopAudio();const next=structuredClone(state),attempt=next.m01.attempts.find(x=>x.id===a.id);attempt.plays[id].finished++;if(!attempt.heard.includes(s.id))attempt.heard.push(s.id);await m01Save(next)};
  audio.onerror=async()=>{if(activeAudio!==audio)return;stopAudio();const retry=structuredClone(state);retry.m01.attempts.find(x=>x.id===a.id).plays[id].started--;await m01Save(retry,()=>{render();const el=document.querySelector('#m01-audio-status');if(el)el.textContent='Не удалось воспроизвести запись. Попытка прослушивания не списана. Проверь соединение и повтори.'})};
  audio.play().catch(()=>audio.onerror?.());
 });
}
async function m01Action(action){
 const cmd=action.slice(4);if(m01Pending){if(cmd==='save')await m01Save(m01Pending.candidate,m01Pending.effect);return}
 if(cmd.startsWith('play-')){await m01Play(cmd.slice(5));return}
 stopAudio();
 if(cmd==='load'){render();m01Mount();return}
 if(cmd==='animate'){if(m01Ready)m01Post({kind:'animate-model'});return}
 if(cmd.startsWith('review-')){stopAudio();m01View=cmd.slice(7);page='m01';render();return}
 const c=structuredClone(state);c.m01??={version:1,active:null,attempts:[]};let a=c.m01.attempts.find(a=>a.id===c.m01.active),effect=null;
 if(cmd.startsWith('start-')){
  const lesson=cmd.slice(6);if(!M01_DATA.lessons[lesson])return;
  if(lesson==='L05'&&!['L01','L02','L03','L04'].every(id=>c.m01.attempts.some(x=>x.lesson===id&&x.endedAt)))return;
  if(a&&a.lesson!==lesson)return;
  if(!a){a={id:m01Id(),lesson,startedAt:m01Now(),endedAt:null,abandonedAt:null,cursor:0,answers:[],plays:{},heard:[],draft:null};m01Enter(a);c.m01.attempts.push(a);c.m01.active=a.id}
  effect=()=>{m01Choice=null;m01View=a.id;page='m01';render();m01Mount()};
 }else if(cmd==='menu'){
  if(a?.draft?.kind==='pinyin'&&a.draft.stage==='input')a.draft.input=document.querySelector('#m01-input')?.value??a.draft.input;
  effect=()=>{stopAudio();m01View=null;page='m01-menu';render()};
 }else{
  if(!a||a.endedAt)return;const s=m01Step(a),r=m01Record(a,s),d=a.draft;
  if(cmd==='restart'){
   if(!window.confirm('Начать занятие заново? Текущая попытка и её ответы сохранятся отдельно.'))return;
   a.abandonedAt=m01Now();c.m01.active=null;effect=()=>{stopAudio();m01View=null;page='m01-menu';render()};
  }else if(cmd==='next'){
   if(!(['word','model','transcript'].includes(s.kind)||s.kind==='listen'&&!m01NeedsAudio(a,s)||r&&(!d||d.stage==='result'||d.endedAt)))return;
   if(a.cursor===M01_DATA.lessons[a.lesson].steps.length-1){a.endedAt=m01Now();c.m01.active=null}else{a.cursor++;m01Enter(a)}
   effect=()=>{stopAudio();m01Choice=null;render();m01Mount()};
  }else if(cmd==='continue'&&d?.kind==='pinyin'){
   if(m01NeedsAudio(a,s))return;const input=document.querySelector('#m01-input')?.value??d.input;if(!input.trim())return;d.input=input;d.stage='tones';
  }else if(cmd==='edit'&&d?.stage==='tones'){d.stage='input'}
  else if(cmd.startsWith('tone-')&&d?.stage==='tones'){const [i,t]=cmd.slice(5).split('-').map(Number);if(i<0||i>=d.tones.length||![0,1,2,3,4].includes(t))return;d.tones[i]=t}
  else if(cmd==='hint'&&d?.kind==='pinyin'&&!m01Test(a,s)&&d.stage==='input'&&d.hints.length<2){d.input=document.querySelector('#m01-input')?.value??d.input;d.hints.push({level:d.hints.length+1,at:m01Now()})}
  else if(cmd==='check'){
   if(m01NeedsAudio(a,s))return;
   if(s.kind==='choice'){if(r||m01Choice===null)return;m01StoreAnswer(a,s,{choice:m01Choice,correct:m01Choice===s.answer,at:m01Now()})}
   else if(d?.kind==='pinyin'&&d.stage==='tones'&&d.tones.every(t=>t!==null)){const grade=m01Grade(M01_DATA.words[s.word],d.input,d.tones);m01StoreAnswer(a,s,{id:d.id,input:d.input,tones:d.tones,hints:d.hints,...grade,correct:grade.spellingCorrect&&grade.toneCorrect.every(Boolean),sourceId:d.sourceId,at:m01Now()});d.stage='result'}else return;
  }else if(cmd==='practice'&&r&&!m01Test(a,s)){a.draft=m01Draft(s,a,r.first.id)}
  else if(d?.kind==='hanzi'&&!d.endedAt){
   if(cmd==='restart-strokes'){d.stroke=0;d.restarts++}
   else if(cmd==='sample'&&!m01Test(a,s)){
    if(!window.confirm('Показать правильное написание? Текущая попытка завершится, но ты сможешь потренироваться по образцу'))return;m01WritingEnd(a,s,false,true);
   }else if(cmd==='giveup'){m01WritingEnd(a,s,false)}
   else if((cmd==='stroke-hint'||cmd==='motion-hint')&&!m01Test(a,s)&&m01Ready){const type=cmd==='stroke-hint'?'stroke':'motion';d.hints.push({type,stroke:d.stroke+1,at:m01Now()});effect=()=>{m01Ready=false;m01Post({kind:'hint',type,attempt:d})}}
   else return;
  }else return;
 }
 await m01Save(c,effect||undefined);
}
window.addEventListener('message',async event=>{
 const frame=document.querySelector('#m01-hanzi-frame'),m=event.data;
 if(!m||event.source!==frame?.contentWindow||event.origin!==location.origin||!m01Token||m.token!==m01Token)return;
 if(m.kind==='ready'){m01Ready=true;const el=document.querySelector('#m01-frame-status');if(el)el.textContent='Поле готово';return}
 if(m.kind==='load-error'){m01Ready=false;const el=document.querySelector('#m01-frame-status');if(el)el.textContent='Не удалось загрузить поле. Результат не засчитан. Повтори загрузку.';return}
 if(!['correct','mistake'].includes(m.kind)||busy||m01Pending||!m01Ready||!Number.isSafeInteger(m.seq)||m.seq<=m01Sequence)return;
 const c=structuredClone(state),a=c.m01.attempts.find(x=>x.id===c.m01.active);if(!a)return;const s=m01Step(a),d=a.draft;if(d?.kind!=='hanzi'||d.endedAt||m.stroke!==d.stroke)return;
 m01Sequence=m.seq;m01Ready=false;
 if(m.kind==='mistake'){d.errors++;d.problemStrokes.push(d.stroke+1)}else d.stroke++;
 if(d.stroke===M01_COUNTS[d.character])m01WritingEnd(a,s,true);
 await m01Save(c,()=>{if(d.endedAt){render();m01Mount()}else{m01Ready=true;m01Post({kind:'resume',attempt:d});const el=document.querySelector('#m01-frame-status');if(el)el.textContent=m.kind==='mistake'?`Попробуй ещё раз. Ошибок: ${d.errors}`:'Черта принята'}});
});
function validateM01(data,fail){
 if(data===undefined)return;
 const date=x=>typeof x==='string'&&!Number.isNaN(Date.parse(x)),obj=x=>x&&typeof x==='object'&&!Array.isArray(x),count=x=>Number.isSafeInteger(x)&&x>=0;
 if(!obj(data)||data.version!==1||!Array.isArray(data.attempts))return fail();
 const ids=new Set();
 for(const a of data.attempts){
  if(!obj(a)||typeof a.id!=='string'||ids.has(a.id)||!M01_DATA.lessons[a.lesson]||!date(a.startedAt)||a.endedAt!==null&&!date(a.endedAt)||a.abandonedAt!==null&&!date(a.abandonedAt)||!count(a.cursor)||a.cursor>=M01_DATA.lessons[a.lesson].steps.length||!Array.isArray(a.answers)||!obj(a.plays)||!Array.isArray(a.heard))return fail();ids.add(a.id);
  const steps=M01_DATA.lessons[a.lesson].steps,keys=new Set();
  for(const [id,p] of Object.entries(a.plays))if(!M01_DATA.assets[id]||!obj(p)||!count(p.started)||!count(p.finished)||p.finished>p.started||id==='L05-A'&&(a.lesson!=='L05'||p.started>3))return fail();
  if(new Set(a.heard).size!==a.heard.length||a.heard.some(id=>!steps.some(s=>s.id===id)))return fail();
  function writing(d,s){if(!obj(d)||typeof d.id!=='string'||d.character!==s.character||!count(d.stroke)||d.stroke>M01_COUNTS[s.character]||!count(d.errors)||!count(d.restarts)||!Array.isArray(d.problemStrokes)||d.problemStrokes.length!==d.errors||d.problemStrokes.some(i=>!Number.isInteger(i)||i<1||i>M01_COUNTS[s.character])||!Array.isArray(d.hints)||d.hints.some(h=>!['stroke','motion'].includes(h.type)||!date(h.at)||!Number.isInteger(h.stroke)||h.stroke<1||h.stroke>M01_COUNTS[s.character])||typeof d.fullModel!=='boolean'||typeof d.completed!=='boolean'||d.endedAt!==null&&!date(d.endedAt)||d.completed&&(d.stroke!==M01_COUNTS[s.character]||!d.endedAt)||m01Test(a,s)&&(d.hints.length||d.fullModel))fail()}
  function answer(f,s){
   if(!obj(f))return fail();
   if(s.kind==='choice'){if(!count(f.choice)||f.choice>=s.options.length||f.correct!==(f.choice===s.answer)||!date(f.at))fail()}
   else if(s.kind==='pinyin'){
    const w=M01_DATA.words[s.word];if(typeof f.input!=='string'||!Array.isArray(f.tones)||f.tones.length!==w.tones.length||f.tones.some(t=>![0,1,2,3,4].includes(t))||!Array.isArray(f.hints)||f.hints.length>2||f.hints.some((h,i)=>h.level!==i+1||!date(h.at))||m01Test(a,s)&&f.hints.length||!date(f.at))return fail();
    const g=m01Grade(w,f.input,f.tones);if(f.spellingCorrect!==g.spellingCorrect||JSON.stringify(f.toneCorrect)!==JSON.stringify(g.toneCorrect)||f.correct!==(g.spellingCorrect&&g.toneCorrect.every(Boolean)))fail();
   }else if(s.kind==='hanzi'){writing(f,s);if(!f.endedAt||f.status!==hzStatus(f))fail()}else fail();
  }
  for(const r of a.answers){const n=steps.findIndex(s=>s.id===r.step),s=steps[n];if(n<0||n>a.cursor||keys.has(r.step)||!Array.isArray(r.corrections))return fail();keys.add(r.step);answer(r.first,s);if(m01Test(a,s)&&r.corrections.length)return fail();r.corrections.forEach(f=>{answer(f,s);if(f.sourceId!==r.first.id)fail()})}
  for(const s of steps.slice(0,a.cursor+(a.endedAt?1:0))){if(['choice','pinyin','hanzi'].includes(s.kind)&&!keys.has(s.id))return fail();if(s.kind==='listen'&&!a.heard.includes(s.id))return fail()}
  if(a.endedAt&&a.cursor!==steps.length-1)return fail();
  const s=steps[a.cursor],d=a.draft;
  if(s.kind==='pinyin'){
   const w=M01_DATA.words[s.word];if(!obj(d)||d.kind!=='pinyin'||typeof d.id!=='string'||typeof d.input!=='string'||!['input','tones','result'].includes(d.stage)||!Array.isArray(d.tones)||d.tones.length!==w.tones.length||d.tones.some(t=>![null,0,1,2,3,4].includes(t))||!Array.isArray(d.hints)||d.hints.length>2||d.hints.some((h,i)=>h.level!==i+1||!date(h.at))||m01Test(a,s)&&d.hints.length||d.stage==='result'&&!keys.has(s.id))return fail();
  }else if(s.kind==='hanzi')writing(d,s);else if(d!==null)return fail();
 }
 const unfinished=data.attempts.filter(a=>!a.endedAt&&!a.abandonedAt);if(data.active===null?unfinished.length!==0:unfinished.length!==1||unfinished[0].id!==data.active)fail();
}
