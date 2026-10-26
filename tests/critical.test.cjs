const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nstartup\(\);\s*$/,'');
const clone=x=>x===undefined?undefined:structuredClone(x);
// Explicit transaction lifecycle: request success is separate from commit/abort.
function database(initial){
 const db={value:clone(initial),fail:false,hold:false,pending:null,puts:0};
 db.transaction=()=>{
  let pending,hasPut=false;
  const tx={error:null,abort(){queueMicrotask(()=>tx.onabort?.())},objectStore(){return {
   get(){const req={};queueMicrotask(()=>{req.result=clone(db.value);req.onsuccess?.()});return req},
   put(value){db.puts++;pending=clone(value);hasPut=true;const req={};queueMicrotask(()=>{
    req.onsuccess?.();const finish=()=>{db.pending=null;if(db.fail){tx.error=new Error('QuotaExceededError');tx.onabort?.()}else{if(hasPut)db.value=pending;tx.oncomplete?.()}};
    if(db.hold)db.pending=finish;else queueMicrotask(finish);
   });return req}
  }}};return tx;
 };return db;
}
function harness(initial){
 const listeners=[],elements=new Map(),audio=[];
 function element(){return {innerHTML:'',textContent:'',dataset:{},disabled:false,classList:{add(){},remove(){},toggle(){}}}}
 const document={querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return []},addEventListener(type,fn){listeners.push({type,fn})},createElement(){return {click(){}}}};
 class Audio{constructor(url){this.url=url;this.currentTime=0;this.preservesPitch=true;audio.push(this)}play(){return new Promise((res,rej)=>{this.resolve=res;this.reject=rej})}pause(){this.paused=true}}
 const db=database(initial),context=vm.createContext({document,Audio,structuredClone,Date,Math,Blob,URL,setTimeout,console:{error(){}},window:{addEventListener(){},confirm:()=>false,crypto:{randomUUID:require('node:crypto').randomUUID}},location:{reload(){}},testDB:db,testSaved:clone(initial)});
 const run=code=>vm.runInContext(code,context);
 run(source);run('db=testDB;rawSaved=testSaved;savedSnapshot=JSON.stringify(rawSaved);state=validateState(rawSaved)');
 return {run,db,audio,listeners,elements,context,snapshot:()=>run('JSON.stringify(state)')};
}
async function complete(h){
 for(let i=0;i<15;i++){
  h.run("selection=optionsFor(state.session,state.session.items[state.session.cursor],VOCAB.find(w=>w.id===state.session.items[state.session.cursor].replace(/^listen:/,''))).indexOf(VOCAB.find(w=>w.id===state.session.items[state.session.cursor].replace(/^listen:/,'')).ru)");
  await h.run("act('check')");await h.run("act('next')");
 }
}
test('navigation has one delegated subscription after repeated renders',()=>{
 const h=harness();h.run('bind();bind();for(let i=0;i<50;i++)render()');assert.equal(h.listeners.length,1);
 h.listeners[0].fn({target:{closest:()=>({dataset:{page:'vocab'},disabled:false})}});assert.equal(h.run('page'),'vocab');assert.equal(h.listeners.length,1);
});
test('request success does not publish state until transaction completion',async()=>{
 const h=harness();h.db.hold=true;const p=h.run("act('start')");await new Promise(setImmediate);
 assert.equal(h.run('state.session'),null);assert.equal(h.run('busy'),true);assert.equal(h.db.value,undefined);
 h.db.pending();await p;assert.ok(h.run('state.session'));assert.equal(h.run('busy'),false);
});
test('abort after put success preserves state; retry saves answer exactly once',async()=>{
 const h=harness();await h.run("act('start')");const before=h.snapshot();h.db.fail=true;h.run('selection=0');await h.run("act('check')");
 assert.equal(h.snapshot(),before);assert.equal(JSON.stringify(h.db.value),before);assert.equal(h.run('selection'),0);assert.match(h.elements.get('#storage-message').textContent,/Не удалось/);
 h.db.fail=false;await h.run("act('check')");await h.run("act('check')");assert.equal(h.run('state.session.answers.length'),1);assert.equal(h.run('state.wordProgress.ai.seen'),1);
});
test('double clicks and navigation are ignored while saving',async()=>{
 const h=harness();h.db.hold=true;const p=h.run("act('start')");await new Promise(setImmediate);await h.run("act('start');navigate('vocab')");assert.equal(h.run('page'),'home');assert.equal(h.db.puts,1);h.db.pending();await p;
});
test('repeat attempts have separate IDs and one unique lesson; latest result shown',async()=>{
 const h=harness();await h.run("act('start')");await complete(h);const id=h.run('state.sessions[0].id');await h.run("act('retry')");await complete(h);
 assert.equal(h.run('state.sessions.length'),2);assert.equal(h.run('uniqueLessons()'),1);assert.notEqual(h.run('state.sessions[1].id'),id);assert.equal(h.run('state.sessions[1].correct'),15);
 assert.doesNotThrow(()=>h.run('validateState(state)'));assert.match(h.run('progress()'),/История попыток · 2/);
 h.run('state.sessions[1].correct=7');assert.match(h.run('result()'),/resultNumber">7/);
});
test('legacy completed and active sessions remain readable without rewriting',async()=>{
 const h=harness();await h.run("act('start')");await complete(h);
 const saved=JSON.parse(h.snapshot());delete saved.sessions[0].lessonKey;delete saved.sessions[0].completedDay;
 const s=saved.sessions[0];s.items=s.items.slice(0,10);s.answers=s.answers.slice(0,10);s.cursor=9;s.total=10;s.correct=10;
 for(const a of s.answers){delete a.questionKey;delete a.mode}
 const restored=harness(saved);assert.equal(restored.db.puts,0);assert.deepEqual(restored.db.value,saved);assert.equal(restored.run('uniqueLessons()'),1);
 await restored.run("act('retry')");assert.equal(restored.run('lessonKey(state.session)'),`daily:${s.day}`);
});
test('checked answer, cursor and shuffled options survive reload',async()=>{
 const h=harness();await h.run("act('start')");h.run('selection=1');await h.run("act('check')");const restored=harness(h.db.value);restored.run("navigate('quiz')");
 assert.match(restored.run('quiz()'),/data-action="next"/);assert.equal(restored.run('state.session.answers[0].choice'),1);assert.deepEqual(restored.db.value,h.db.value);
 await restored.run("act('next')");assert.equal(restored.run('state.session.cursor'),1);
});
test('invalid or future state fails closed and recovery never writes',async()=>{
 const h=harness();await h.run("act('start')");
 const invalid=[null,[],{version:2},...[
  s=>s.version=99,s=>s.session.cursor=99,s=>s.session.items[0]='missing-word',s=>s.session.optionSets.ai=['x'],s=>s.wordProgress.ai={seen:1,correct:2},s=>s.session.answers=[{wordId:'ai',choice:-1,correct:true}],s=>s.session.cursor=1,s=>s.session.day='2026-02-31'
 ].map(change=>{const s=JSON.parse(h.snapshot());change(s);return s})];
 for(const value of invalid){h.context.bad=value;assert.throws(()=>h.run('validateState(bad)'))}
 const before=clone(h.db.value),puts=h.db.puts;h.run("recovery(new Error('invalid'))");await h.run("act('start');act('reset')");assert.equal(h.db.puts,puts);assert.deepEqual(h.db.value,before);assert.match(h.elements.get('#content').innerHTML,/Скачать исходные данные/);
});
test('failed next and completion preserve resumable training',async()=>{
 const h=harness();await h.run("act('start')");h.run('selection=0');await h.run("act('check')");h.db.fail=true;const before=h.snapshot();await h.run("act('next')");assert.equal(h.snapshot(),before);h.db.fail=false;await h.run("act('next')");
 for(let i=1;i<15;i++){h.run('selection=0');await h.run("act('check')");if(i<14)await h.run("act('next')")}
 const last=h.snapshot();h.db.fail=true;await h.run("act('next')");assert.equal(h.snapshot(),last);h.db.fail=false;await h.run("act('next')");assert.equal(h.run('state.sessions.length'),1);
});
test('reset needs confirmation and failure preserves all data',async()=>{
 const h=harness();await h.run("act('start')");h.run('selection=0');await h.run("act('check')");const before=h.snapshot();await h.run("act('reset')");assert.equal(h.snapshot(),before);
 h.run('window.confirm=()=>true');h.db.fail=true;await h.run("act('reset')");assert.equal(h.snapshot(),before);assert.equal(JSON.stringify(h.db.value),before);
 h.db.fail=false;await h.run("act('reset')");assert.equal(h.run('state.session'),null);assert.equal(h.run('state.sessions.length'),0);assert.equal(h.run('Object.keys(state.wordProgress).length'),0);assert.equal(JSON.stringify(h.db.value),h.snapshot());
});
test('conflicting tab cannot overwrite newer progress',async()=>{
 const h=harness();await h.run("act('start')");const before=h.snapshot();h.db.value.externalUpdate=true;h.run('selection=0');await h.run("act('check')");
 assert.equal(h.snapshot(),before);assert.equal(h.db.value.externalUpdate,true);assert.match(h.elements.get('#storage-message').textContent,/другой вкладке/);
});
test('completion after midnight counts today and retains original unique lesson',async()=>{
 const h=harness();await h.run("act('start')");h.run("state.session.day='2020-01-01';state.session.lessonKey='daily:2020-01-01'");await complete(h);
 assert.equal(h.run('todays().completedDay'),h.run('day()'));assert.equal(h.run('lessonKey(todays())'),'daily:2020-01-01');
});
test('audio stops on navigation and question change; old rejection is ignored',async()=>{
 const h=harness();h.run("playWord('ai',true)");assert.equal(h.audio[0].playbackRate,0.78);h.run("navigate('vocab')");assert.equal(h.audio[0].paused,true);h.audio[0].reject(new Error('old playback'));await new Promise(setImmediate);assert.equal(h.elements.get('#audio-message').textContent,'');
 await h.run("act('start')");h.run("selection=0;playWord('ai')");await h.run("act('check')");assert.equal(h.audio[1].paused,undefined);await h.run("act('next')");assert.equal(h.audio[1].paused,true);
});
test('all vocabulary MP3 files exist and have ID3 headers',()=>{
 const h=harness();for(const id of h.run('VOCAB.map(w=>w.id)')){const bytes=fs.readFileSync(path.join(__dirname,'../audio',id+'.mp3'));assert.equal(bytes.subarray(0,3).toString(),'ID3')}
});
