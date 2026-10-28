'use strict';
// Explicit syllables and lexical tones; independent of the old daily quiz.
const PINYIN_WORDS={
 ai:{syllables:['ai'],tones:[4]},xuexiao:{syllables:['xue','xiao'],tones:[2,4]},
 pengyou:{syllables:['peng','you'],tones:[2,0]},jintian:{syllables:['jin','tian'],tones:[1,1]},
 laoshi:{syllables:['lao','shi'],tones:[3,1]},shuiguo:{syllables:['shui','guo'],tones:[3,3]},
 mingtian:{syllables:['ming','tian'],tones:[2,1]},xihuan:{syllables:['xi','huan'],tones:[3,0]},
 dianhua:{syllables:['dian','hua'],tones:[4,4]},zhunbei:{syllables:['zhun','bei'],tones:[3,4]}
};
// Conservative segmentation vocabulary. Unknown/ambiguous spellings use neutral labels.
// It is deliberately independent of the target word: never slice at reference lengths.
const PINYIN_SYLLABLES=new Set(('a ai an ang ao e ei en eng er o ou ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu fa fan fang fei fen feng fo fou fu da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nü nuan nüe nuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu long lou lu lü luan lüe lun luo ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo ran rang rao re ren reng ri rong rou ru ruan rui run ruo za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo sa sai san sang sao se sen seng si song sou su suan sui sun suo ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun wa wai wan wang wei wen weng wo wu').split(' '));
let pinyinDraft=null;
function normalizePinyin(input){return input.trim().toLowerCase().normalize('NFC').replace(/u:/g,'ü').replace(/v/g,'ü').replace(/[\s'’]+/g,'')}
function pinyinLabels(input,count){
 const neutral=()=>Array.from({length:count},(_,i)=>`Слог ${i+1}`);
 const parts=input.trim().toLowerCase().normalize('NFC').replace(/u:/g,'ü').replace(/v/g,'ü').split(/[\s'’]+/);
 if(parts.length>1)return parts.length===count&&parts.every(x=>PINYIN_SYLLABLES.has(x))?parts:neutral();
 const text=normalizePinyin(input);if(!/^[a-zü]+$/.test(text)||text.length>40)return neutral();
 const solutions=[];
 function split(offset,path){
  if(solutions.length>1)return;
  if(offset===text.length){if(path.length===count)solutions.push(path);return}
  if(path.length>=count)return;
  for(let end=offset+1;end<=Math.min(offset+6,text.length);end++){
   const syllable=text.slice(offset,end);if(PINYIN_SYLLABLES.has(syllable))split(end,[...path,syllable]);
  }
 }
 split(0,[]);
 return solutions.length===1&&solutions[0].length===count?solutions[0]:neutral();
}
function gradePinyin(wordId,input,tones){
 const ref=PINYIN_WORDS[wordId],spellingCorrect=normalizePinyin(input)===ref.syllables.join('');
 const toneCorrect=ref.tones.map((tone,i)=>tones[i]===tone);
 return {spellingCorrect,toneCorrect,correct:spellingCorrect&&toneCorrect.every(Boolean)};
}
function toneMarked(syllable,tone){
 if(tone===0)return syllable;
 const vowels={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù','ü':'ǖǘǚǜ'};
 let index=syllable.indexOf('a');if(index<0)index=syllable.indexOf('e');if(index<0&&syllable.includes('ou'))index=syllable.indexOf('o');
 if(index<0)for(let i=0;i<syllable.length;i++)if(vowels[syllable[i]])index=i;
 return syllable.slice(0,index)+vowels[syllable[index]][tone-1]+syllable.slice(index+1);
}
function markedPinyin(id){const r=PINYIN_WORDS[id];return r.syllables.map((s,i)=>toneMarked(s,r.tones[i])).join(' ')}
function pinyinId(){return window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`}
function newPinyinDraft(wordId,mode){return {id:pinyinId(),wordId,mode,stage:'input',input:'',tones:PINYIN_WORDS[wordId].tones.map(()=>null),hints:[]}}
function pinyinHistory(){return state.pinyin?.records||[]}
function hintSummary(hints){return hints.length?hints.map(h=>h.level===1?'первые буквы':'слоги без тонов').join(', '):'без подсказок'}
function pinyinStats(){
 const records=pinyinHistory(),first=records.map(r=>r.first),tones=first.flatMap(a=>a.toneCorrect),rate=(n,total)=>total?Math.round(n/total*100)+'%':'—';
 return `<section class="card"><strong>Первые ответы · ${first.length}</strong><p class="muted">Написание: ${rate(first.filter(a=>a.spellingCorrect).length,first.length)}<br>Тоны по слогам: ${rate(tones.filter(Boolean).length,tones.length)}<br>Полностью верно: ${first.filter(a=>a.correct).length} из ${first.length}<br>С подсказками: ${first.filter(a=>a.hints.length).length}<br>Исправлений в обучении: ${records.reduce((n,r)=>n+r.corrections.length,0)}</p><p class="mini">Отдельная статистика пиньиня. Исправления не заменяют первый ответ.</p></section>`;
}
function pinyinMenu(){
 const active=state.pinyin?.active;
 return `<button class="back" data-page="home">← Сегодня</button><h1 class="title">Напиши пиньинь</h1><p class="muted">Сначала напиши слово целиком, затем выбери тоны.</p><section class="card">${active?'<button class="primary" data-action="py-resume">Продолжить упражнение</button>':'<button class="primary" data-action="py-learn">Обучение</button><p class="muted">Можно воспользоваться подсказками.</p><button class="secondary" data-action="py-test">Проверка</button><p class="muted">Без подсказок. Первый ответ сохраняется отдельно.</p>'}</section>${pinyinStats()}<h2 class="section">История пиньиня</h2>${pinyinHistory().length?pinyinHistory().slice().reverse().map(r=>`<details class="card"><summary>${safe(VOCAB.find(w=>w.id===r.wordId).hanzi)} · ${r.first.correct?'Верно':'Есть ошибки'} · ${r.first.mode==='learn'?'Обучение':'Проверка'}</summary>${pinyinAnswerView(r.wordId,r.first,'Первый ответ')}${r.corrections.map((a,i)=>pinyinAnswerView(r.wordId,a,`Исправление ${i+1}`)).join('')}</details>`).join(''):'<p class="muted">Здесь появятся проверенные ответы.</p>'}`;
}
// Presentation only: use saved grading flags and reference syllables after checking.
function toneExplanation(id,answer){
 const ref=PINYIN_WORDS[id],word=VOCAB.find(w=>w.id===id);
 const names=['нейтральный','ровный','восходящий','третий — низкий, с возможным подъёмом','нисходящий'];
 const descriptions=['нейтральный тон (0), без тонового знака','первый, ровный тон','второй, восходящий тон','третий тон — низкий, с возможным подъёмом','четвёртый, нисходящий тон'];
 const label=t=>`${t===0?'тон 0':t+'-й тон'} (${names[t]})`;
 return answer.tones.map((selected,i)=>{
  const syllable=ref.syllables[i],correct=ref.tones[i],multi=ref.syllables.length>1;
  if(answer.toneCorrect[i])return `<div class="toneDetail">${multi?`Слог ${i+1} · ${safe(syllable)}: `:''}Тон верный ✓ — <strong>${safe(toneMarked(syllable,correct))}</strong></div>`;
  return `<div class="toneDetail toneMistake">${multi?`<strong>Слог ${i+1} · ${safe(syllable)}</strong>`:''}<p>Ты выбрал ${label(selected)} — <strong>${safe(toneMarked(syllable,selected))}</strong>.</p><p>Правильно: ${label(correct)} — <strong>${safe(toneMarked(syllable,correct))}</strong>.</p><p class="toneReason">В слове <span lang="zh-Hans">${safe(word.hanzi)}</span> (${safe(markedPinyin(id))}) ${multi?`у слога ${safe(syllable)} `:''}используется ${descriptions[correct]}.</p></div>`;
 }).join('');
}
function pinyinAnswerView(id,a,title){
 return `<div class="history"><strong>${title}</strong><p class="muted">Введено: ${safe(a.input)}</p><p>Правильно: <strong>${safe(markedPinyin(id))}</strong></p><div class="feedback ${a.spellingCorrect?'':'bad'}">Написание: ${a.spellingCorrect?'верно':'ошибка'}</div><div class="feedback ${a.toneCorrect.every(Boolean)?'':'bad'}">Тоны: ${a.toneCorrect.every(Boolean)?'верно':'есть ошибки'}${!a.spellingCorrect?'<p class="mini">Тоны ниже показаны на правильном написании слогов.</p>':''}<div class="toneResults">${toneExplanation(id,a)}</div></div><p><strong>Результат: ${a.correct?'верно ✓':'нужно повторить'}</strong></p><p class="mini">${safe(hintSummary(a.hints))}</p></div>`;
}
function pinyinExercise(){
 const d=pinyinDraft;if(!d)return pinyinMenu();const word=VOCAB.find(w=>w.id===d.wordId),ref=PINYIN_WORDS[d.wordId];
 const header=`<button class="back" data-page="pinyin-menu">← Пиньинь</button><span class="modeTag">${d.mode==='learn'?'Обучение':'Проверка'}</span><h1 class="title">Напиши пиньинь</h1><div class="hanzi" lang="zh-Hans">${safe(word.hanzi)}</div>`;
 if(d.stage==='result'){
  const r=pinyinHistory().find(r=>r.id===d.id),a=r.corrections.at(-1)||r.first;
  return `${header}<section class="card">${pinyinAnswerView(d.wordId,a,r.corrections.length?'Исправление':'Первый ответ')}${audioButtons(d.wordId)}${!a.correct?'<button class="primary" data-action="py-correct">Повторить в режиме обучения</button>':''}<button class="secondary" data-action="py-next">${VOCAB.at(-1).id===d.wordId?'Завершить упражнение':'Следующее слово →'}</button></section>`;
 }
 const hint=d.hints.at(-1),hintText=hint?(hint.level===1?ref.syllables.map(s=>s[0]+'…').join(' '):ref.syllables.join(' ')):'';
 const hints=d.mode==='learn'?`<p class="muted" aria-live="polite">${safe(hintText)}</p>${d.hints.length<2?`<button class="textbutton" data-action="py-hint">Подсказка ${d.hints.length+1}</button>`:''}`:'';
 if(d.stage==='input')return `${header}<section class="card"><label for="pinyin-input">Пиньинь всего слова без тонов</label><input id="pinyin-input" class="pinyinInput" type="text" lang="en" inputmode="text" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="next" maxlength="80" value="${safe(d.input)}">${hints?`<div class="pinyinInputHints">${hints}</div>`:''}<p class="mini">Напиши латинскими буквами. Тоны выберешь дальше.</p><p id="pinyin-error" role="alert" class="mini"></p><button class="primary pinyinContinue" data-action="py-continue">Продолжить</button></section>`;
 const labels=pinyinLabels(d.input,ref.syllables.length);
 return `${header}<section class="card"><p class="muted">Введено: ${safe(d.input)}</p><p>Выбери тон каждого слога.</p>${labels.map((label,i)=>`<fieldset class="toneGroup"><legend>${safe(label)}</legend><div class="toneOptions">${[{tone:1,sign:'ā',short:'Ровный',name:'ровный'},{tone:2,sign:'á',short:'Вверх',name:'восходящий'},{tone:3,sign:'ǎ',short:'Третий',name:'третий — низкий, с возможным подъёмом'},{tone:4,sign:'à',short:'Вниз',name:'нисходящий'},{tone:0,sign:'a',short:'Нейтр.',name:'нейтральный'}].map(({tone:t,sign,short,name})=>`<div class="toneOption"><button class="answer ${d.tones[i]===t?'selected':''}" aria-pressed="${d.tones[i]===t}" aria-label="Слог ${i+1}, тон ${t}, ${sign}, ${name}" data-py-syllable="${i}" data-py-tone="${t}"><span class="toneNumber">${t}</span><span class="toneSign" aria-hidden="true">${sign}</span></button><span class="toneName" aria-hidden="true">${short}</span></div>`).join('')}</div></fieldset>`).join('')}<p class="mini">Знаки на «a» — только иллюстрация тонов. Третий тон — низкий, с возможным подъёмом; 0 — нейтральный.</p>${hints}<button class="textbutton" data-action="py-edit">Изменить слово</button><button class="primary" data-action="py-check" ${d.tones.includes(null)?'disabled':''}>Проверить ответ</button></section>`;
}
async function pinyinSave(candidate,destination){
 setBusy(true);storageMessage('Сохраняем…');
 try{await commit(candidate);pinyinDraft=structuredClone(state.pinyin.active);stopAudio();page=destination;storageMessage('');render()}
 catch(error){console.error(error);storageMessage(error.message||'Не удалось сохранить. Повтори действие.')}
 finally{setBusy(false)}
}
async function pinyinAction(action){
 if(busy||readOnly)return;
 if(action==='py-resume'){pinyinDraft=structuredClone(state.pinyin.active);navigate('pinyin');return}
 const candidate=structuredClone(state);candidate.pinyin??={version:1,active:null,records:[]};
 let d=pinyinDraft?structuredClone(pinyinDraft):null;
 if(action==='py-learn'||action==='py-test'){
  if(candidate.pinyin.active){pinyinDraft=structuredClone(candidate.pinyin.active);navigate('pinyin');return}
  d=newPinyinDraft(VOCAB[0].id,action==='py-learn'?'learn':'test');
 }else{
  if(!d)return;
  if(action==='py-continue'){
   if(d.stage!=='input')return;
   if(!normalizePinyin(d.input)||! /^[a-zA-ZüÜvV\s'’:\u0308]+$/.test(d.input)){$('#pinyin-error').textContent='Введи слово латинскими буквами без цифр и знаков тонов.';return}
   d.stage='tones';
  }else if(action==='py-edit'){if(d.stage!=='tones')return;d.stage='input'}
  else if(action==='py-hint'){
   if(d.mode!=='learn'||d.stage==='result'||d.hints.length>=2)return;
   d.hints.push({level:d.hints.length+1,at:new Date().toISOString()});
  }else if(action==='py-check'){
   if(d.stage!=='tones'||d.tones.some(t=>!Number.isInteger(t)||t<0||t>4))return;
   const answer={input:d.input,tones:[...d.tones],mode:d.mode,hints:structuredClone(d.hints),at:new Date().toISOString(),...gradePinyin(d.wordId,d.input,d.tones)};
   const record=candidate.pinyin.records.find(r=>r.id===d.id);
   if(record)record.corrections.push(answer);else candidate.pinyin.records.push({id:d.id,wordId:d.wordId,...(d.sourceRecordId?{sourceRecordId:d.sourceRecordId}:{}),first:answer,corrections:[]});
   d.stage='result';
  }else if(action==='py-correct'){
   if(d.stage!=='result')return;
   d=d.mode==='test'?{...newPinyinDraft(d.wordId,'learn'),sourceRecordId:d.id}:{...d,mode:'learn',stage:'input',input:'',tones:d.tones.map(()=>null),hints:[]};
  }else if(action==='py-next'){
   if(d.stage!=='result')return;
   const next=VOCAB[VOCAB.findIndex(w=>w.id===d.wordId)+1];d=next?newPinyinDraft(next.id,d.mode):null;
  }else return;
 }
 candidate.pinyin.active=d;await pinyinSave(candidate,d?'pinyin':'pinyin-menu');
}
function validatePinyin(data,fail){
 if(data===undefined)return;
 const validMode=m=>m==='learn'||m==='test',validInput=s=>typeof s==='string'&&s.length<=80;
 const validHints=(h,mode)=>Array.isArray(h)&&h.length<=2&&(mode==='learn'||h.length===0)&&h.every((x,i)=>isObject(x)&&x.level===i+1&&typeof x.at==='string');
 const validTones=(t,id,nullable)=>Array.isArray(t)&&t.length===PINYIN_WORDS[id].tones.length&&t.every(x=>(nullable&&x===null)||(Number.isInteger(x)&&x>=0&&x<=4));
 function answer(a,id){
  if(!isObject(a)||!validInput(a.input)||!normalizePinyin(a.input)||!validMode(a.mode)||!validHints(a.hints,a.mode)||!validTones(a.tones,id,false)||typeof a.at!=='string')fail();
  const grade=gradePinyin(id,a.input,a.tones);
  if(a.correct!==grade.correct||a.spellingCorrect!==grade.spellingCorrect||JSON.stringify(a.toneCorrect)!==JSON.stringify(grade.toneCorrect))fail();
 }
 if(!isObject(data)||data.version!==1||!Array.isArray(data.records))fail();
 const ids=new Set();
 for(const r of data.records){
  if(!isObject(r)||typeof r.id!=='string'||!r.id||ids.has(r.id)||!Object.hasOwn(PINYIN_WORDS,r.wordId)||!Array.isArray(r.corrections))fail();
  ids.add(r.id);answer(r.first,r.wordId);if(r.first.mode==='test'&&r.corrections.length)fail();r.corrections.forEach(a=>{answer(a,r.wordId);if(a.mode!=='learn')fail()});
 }
 for(const r of data.records)if(r.sourceRecordId!==undefined&&(!ids.has(r.sourceRecordId)||r.sourceRecordId===r.id||r.first.mode!=='learn'))fail();
 const d=data.active;if(d===null)return;
 if(!isObject(d)||typeof d.id!=='string'||!d.id||!Object.hasOwn(PINYIN_WORDS,d.wordId)||!validMode(d.mode)||!['input','tones','result'].includes(d.stage)||!validInput(d.input)||!validTones(d.tones,d.wordId,true)||!validHints(d.hints,d.mode))fail();
 if(d.sourceRecordId!==undefined&&(!ids.has(d.sourceRecordId)||d.sourceRecordId===d.id||d.mode!=='learn'))fail();
 if(d.stage!=='input'&&!normalizePinyin(d.input))fail();
 const r=data.records.find(r=>r.id===d.id);if(r&&r.wordId!==d.wordId)fail();
 if(d.stage==='result'){
  if(!r)fail();const a=r.corrections.at(-1)||r.first;
  if(d.input!==a.input||d.mode!==a.mode||JSON.stringify(d.tones)!==JSON.stringify(a.tones)||JSON.stringify(d.hints)!==JSON.stringify(a.hints))fail();
 }else if(r&&d.mode!=='learn')fail();
}
