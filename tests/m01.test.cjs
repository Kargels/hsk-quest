const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const crypto=require('node:crypto');const {harness}=require('./harness.cjs');
const h=()=>harness(undefined,{m01:true});
async function start(x,l='L01'){await x.run(`act('m01-start-${l}')`)}
async function advance(x){await x.run("act('m01-next')")}
async function complete(x){
 while(x.run('!!m01Active()')){
  const kind=x.run('m01Step(m01Active()).kind');
  if(x.run('!!m01Step(m01Active()).audio'))x.run('m01Active().heard.push(m01Step(m01Active()).id)');
  if(kind==='choice'){x.run('m01Choice=m01Step(m01Active()).answer');await x.run("act('m01-check')")}
  if(kind==='pinyin'){
   x.run("{let md=m01Active().draft,mw=M01_DATA.words[m01Step(m01Active()).word];md.input=mw.syllables.join('');md.tones=[...mw.tones];md.stage='tones'}");await x.run("act('m01-check')");
  }
  if(kind==='hanzi')await x.run("act('m01-giveup')");
  // Fake persistence snapshot follows simulated media/input events in this unit harness.
  x.run('savedSnapshot=JSON.stringify(testDB.value)');await advance(x);
 }
}
test('M01 all 29 assets match source manifest, no control audio in study steps',()=>{
 const x=h(),assets=JSON.parse(x.run('JSON.stringify(M01_DATA.assets)'));assert.equal(Object.keys(assets).length,29);
 for(const a of Object.values(assets)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(a.path)).digest('hex'),a.sha256);assert.equal(a.approved,false);assert.equal(a.listening_checked,false)}
 assert.equal(x.run("Object.values(M01_DATA.lessons).filter(l=>l.id!=='L05').flatMap(l=>l.steps).some(s=>s.audio==='L05-A')"),false);
});
test('M01 old state is unchanged on validation; corrupt module is never repaired silently',()=>{
 const x=h();const old=x.snapshot();assert.equal(x.run('JSON.stringify(validateState(state))'),old);assert.equal(x.db.puts,0);
 assert.throws(()=>x.run('validateState({...state,m01:{version:99,attempts:[]}})'));
});
test('M01 start waits for transaction commit and abort keeps UI and database unchanged',async()=>{
 const x=h(),before=x.snapshot();x.db.fail=true;await start(x);assert.equal(x.snapshot(),before);assert.equal(x.run('page'),'home');assert.equal(x.run('!!m01Pending'),true);
 x.db.fail=false;await x.run("act('m01-save')");assert.equal(x.run('m01Active().lesson'),'L01');assert.equal(x.run('page'),'m01');assert.equal(x.run('JSON.stringify(validateState(state))'),x.snapshot());
});
test('M01 L05 locked until all four lessons complete and diagnostic listening unscored',async()=>{
 const x=h();await start(x,'L05');assert.equal(x.run('state.m01'),undefined);
 await start(x);assert.equal(x.run("M01_DATA.lessons.L01.steps.filter(s=>s.id.includes('-C')).every(s=>s.diagnostic)"),true);
 assert.equal(x.run("m01Screen().includes('你好')"),false);await advance(x);assert.equal(x.run('m01Active().cursor'),0);
});
test('M01 all five complete, reload validation, skill separation, repeats and legacy preservation',async()=>{
 const x=h();const baseline=x.run('JSON.stringify({sessions:state.sessions,wordProgress:state.wordProgress})');
 for(const l of ['L01','L02','L03','L04','L05']){await start(x,l);await complete(x);assert.equal(x.run('JSON.stringify(validateState(state))'),x.snapshot())}
 assert.equal(x.run('state.m01.attempts.filter(a=>a.endedAt).length'),5);assert.equal(x.run('uniqueLessons()'),0);
 assert.equal(x.run('JSON.stringify({sessions:state.sessions,wordProgress:state.wordProgress})'),baseline);
 assert.equal(x.run('m01Stats(state.m01.attempts[4]).pinyin_syllable.total'),4);assert.equal(x.run('m01Stats(state.m01.attempts[4]).pinyin_tone.total'),5);
 await start(x);await complete(x);assert.equal(x.run('new Set(state.m01.attempts.filter(a=>a.endedAt).map(a=>a.lesson)).size'),5);
});
test('M01 one input, no default tones, conservative labels and separate spelling/tone evaluation',()=>{
 const x=h();assert.equal(x.run("m01Draft({kind:'pinyin',word:'L03-W05'},{}).tones.every(x=>x===null)"),true);
 assert.equal(x.run("JSON.stringify(m01Grade(M01_DATA.words['L03-W05'],'pengyou',[2,0]))"),JSON.stringify({spellingCorrect:true,toneCorrect:[true,true]}));
 assert.equal(x.run("m01Grade(M01_DATA.words['L03-W05'],'wrong',[2,0]).spellingCorrect"),false);
 assert.equal(x.run("JSON.stringify(pinyinLabels('xxx',2))"),'["Слог 1","Слог 2"]');
});
test('M01 sample save failure does not reveal and restart retains errors',async()=>{
 const x=h();await start(x);x.run("let ma=m01Active();ma.cursor=M01_DATA.lessons.L01.steps.findIndex(s=>s.kind==='hanzi');m01Enter(ma);ma.draft.errors=2;ma.draft.problemStrokes=[1,1];window.confirm=()=>true;");
 await x.run("act('m01-restart-strokes')");assert.equal(x.run('m01Active().draft.errors'),2);assert.equal(x.run('m01Active().draft.restarts'),1);
 x.db.fail=true;await x.run("act('m01-sample')");assert.equal(x.run('m01Active().draft.endedAt'),null);assert.equal(x.run('m01Active().answers.length'),0);
 x.db.fail=false;await x.run("act('m01-save')");const first=x.run('JSON.stringify(m01Active().answers[0].first)');await x.run("act('m01-practice')");assert.equal(x.run('m01Active().draft.sourceId'),JSON.parse(first).id);await x.run("act('m01-giveup')");assert.equal(x.run('JSON.stringify(m01Active().answers[0].first)'),first);
});
test('M01 control: hints/sample/corrections are not accepted by action layer',async()=>{
 const x=h();await start(x);x.run("let ca=m01Active();ca.lesson='L05';ca.cursor=M01_DATA.lessons.L05.steps.findIndex(s=>s.kind==='hanzi');m01Enter(ca);window.confirm=()=>true");
 const before=x.snapshot();await x.run("act('m01-sample')");await x.run("act('m01-stroke-hint')");assert.equal(x.snapshot(),before);await x.run("act('m01-giveup')");const ended=x.snapshot();await x.run("act('m01-practice')");assert.equal(x.snapshot(),ended);
});
test('M01 control recording: three-play limit, technical error refund, no playback before commit',async()=>{
 const x=h();await start(x);x.run("m01Active().lesson='L05'");
 x.db.hold=true;const pending=x.run("m01Play('L05-A')");await new Promise(r=>setImmediate(r));assert.equal(x.audio.length,0);x.db.hold=false;x.db.pending();await pending;assert.equal(x.audio.length,1);
 await x.run("m01Play('L05-A')");await x.run("m01Play('L05-A')");await x.run("m01Play('L05-A')");assert.equal(x.audio.length,3);
 await x.audio[2].onerror();assert.equal(x.run("m01Active().plays['L05-A'].started"),2);assert.equal(x.run('m01Active().heard.length'),0);
 await x.run("m01Play('L05-A')");assert.equal(x.audio.length,4);
 await x.audio[3].onended();assert.equal(x.run("m01Active().heard.includes('L05-FIRST')"),true);
});
test('M01 study attempt cannot request control audio directly',async()=>{const x=h();await start(x);await x.run("m01Play('L05-A')");assert.equal(x.audio.length,0);assert.equal(x.run("m01Active().plays['L05-A']"),undefined)});
