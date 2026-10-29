const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../hanzi-data/manifest.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../hanzi.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../pinyin.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nstartup\(\);\s*$/,'');
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

module.exports={harness,complete};
