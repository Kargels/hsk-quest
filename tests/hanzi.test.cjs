const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {harness,complete}=require('./harness.cjs');
async function start(mode='learn'){
 const h=harness();await h.run(`act('hz-${mode}')`);h.run('hzReady=true');return h;
}
async function event(h,kind){h.run('hzReady=true');await h.run(`hzEvent('${kind}',hzTraining().current.stroke)`)}
async function finish(h){while(!h.run('hzTraining().current.endedAt'))await event(h,'correct')}
function check(h){assert.doesNotThrow(()=>h.run('validateState(state)'));assert.equal(h.snapshot(),JSON.stringify(h.db.value))}
test('hanzi data: all 18 local characters valid and match manifest',()=>{
 const h=harness();const chars=h.run('[...new Set(VOCAB.flatMap(w=>[...w.hanzi]))]');assert.equal(chars.length,18);
 for(const c of chars){const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../hanzi-data',c+'.json')));assert.equal(d.strokes.length,h.run(`HANZI_COUNTS['${c}']`));assert.equal(d.medians.length,d.strokes.length);assert.ok(d.strokes.every(s=>s.startsWith('M')));assert.ok(d.medians.every(m=>m.length>1&&m.every(p=>p.length===2&&p.every(Number.isFinite))))}
});
test('hanzi starts blank: no word spelling, pinyin, outline or automatic hints; ten shuffled words',async()=>{
 const h=await start();const a=h.run('hzTraining().current'),html=h.run('hzExercise()');assert.ok(!html.includes(a.character));assert.equal(h.run('hzTraining().order.length'),10);assert.equal(h.run('new Set(hzTraining().order).size'),10);assert.equal(a.stroke,0);assert.equal(a.errors,0);assert.equal(a.restarts,0);assert.equal(a.hints.length,0);check(h);
 const frame=fs.readFileSync(path.join(__dirname,'../hanzi-frame.js'),'utf8');assert.match(frame,/showCharacter:false,showOutline:false/);assert.match(frame,/showHintAfterMisses:false,markStrokeCorrectAfterMisses:false,acceptBackwardsStrokes:false/);
});
test('hanzi accepts correct stroke, rejects wrong movement and suggests but does not apply hint after two misses',async()=>{
 const h=await start();await event(h,'mistake');await event(h,'mistake');assert.equal(h.run('hzTraining().current.stroke'),0);assert.equal(h.run('hzTraining().current.errors'),2);assert.equal(h.run('hzTraining().current.hints.length'),0);assert.match(h.run('hzMessage'),/попросить подсказку/);await event(h,'correct');assert.equal(h.run('hzTraining().current.stroke'),1);assert.equal(h.run('hzTraining().current.consecutive'),0);check(h);
});
test('hanzi repeated restart retains all errors and hints in same attempt',async()=>{
 const h=await start();const id=h.run('hzTraining().current.id');await event(h,'mistake');await event(h,'mistake');await h.run("act('hz-hint')");h.run('hzReady=true');await h.run("act('hz-restart')");await event(h,'mistake');h.run('hzReady=true');await h.run("act('hz-restart')");assert.equal(h.run('hzTraining().current.id'),id);assert.equal(h.run('hzTraining().current.errors'),3);assert.equal(h.run('hzTraining().current.restarts'),2);assert.equal(h.run('hzTraining().current.hints.length'),1);await finish(h);assert.equal(h.run('hzTraining().current.status'),'assisted');check(h);
});
test('hanzi check restart creates no extra control attempt and cannot enable hints',async()=>{
 const h=await start('test'),id=h.run('hzTraining().current.id');await h.run("act('hz-hint');act('hz-motion')");await event(h,'mistake');await h.run("act('hz-restart')");assert.equal(h.run('hzTraining().current.id'),id);assert.equal(h.run('hzTraining().current.hints.length'),0);assert.equal(h.run('hzTraining().records.length'),0);await finish(h);assert.equal(h.run('hzTraining().records.length'),1);assert.equal(h.run('hzTraining().current.status'),'corrected');assert.doesNotMatch(h.run('hzExercise()'),/data-action="hz-hint"/);check(h);
});
test('hanzi clean status requires completion with no mistakes, restarts or assistance',async()=>{
 const h=await start();await finish(h);assert.equal(h.run('hzTraining().current.status'),'clean');const snapshot=h.snapshot();await event(h,'correct');assert.equal(h.snapshot(),snapshot);check(h);
});
test('hanzi giveup saves incomplete, sample requires action, learning practice preserves first test result',async()=>{
 const h=await start('test');await event(h,'mistake');await h.run("act('hz-giveup')");assert.equal(h.run('hzTraining().current.status'),'incomplete');assert.equal(h.run('hzTraining().records[0].modelViews.length'),0);const first=h.run('JSON.stringify(hzTraining().records[0].first)');await h.run("act('hz-practice')");assert.equal(h.run('hzTraining().current.mode'),'test');await h.run("act('hz-model')");await h.run("act('hz-practice')");assert.equal(h.run('hzTraining().current.mode'),'learn');assert.equal(h.run('hzTraining().current.fullModel'),true);await finish(h);assert.equal(h.run('hzTraining().records[0].practice.length'),1);assert.equal(h.run('JSON.stringify(hzTraining().records[0].first)'),first);assert.equal(h.run('hzTraining().current.status'),'assisted');check(h);
});
test('hanzi full training saves each character and word aggregate; daily counter unaffected',async()=>{
 const h=await start();let n=0;
 while(h.run('!!hzTraining()')){await h.run("act('hz-giveup')");await h.run("act('hz-next')");n++;check(h)}
 assert.equal(n,19);assert.equal(h.run('state.hanzi.trainings[0].records.length'),19);assert.equal(h.run('state.hanzi.trainings[0].words.length'),10);assert.equal(h.run('state.hanzi.trainings[0].words.every(w=>w.status==="incomplete")'),true);assert.equal(h.run('uniqueLessons()'),0);
});
test('hanzi failed save freezes input and navigation, then retries the same error exactly once',async()=>{
 const h=await start();const before=h.snapshot();h.db.fail=true;await event(h,'mistake');assert.equal(h.snapshot(),before);assert.ok(h.run('hzPending'));await h.run("navigate('home');act('hz-restart');act('hz-giveup')");assert.equal(h.run('page'),'hanzi');assert.equal(h.snapshot(),before);h.db.fail=false;await h.run("act('hz-save')");await h.run("act('hz-save')");assert.equal(h.run('hzTraining().current.errors'),1);assert.equal(h.run('hzPending'),null);check(h);
});
test('hanzi failed completion and giveup never publish saved result',async()=>{
 const h=await start();h.db.fail=true;await h.run("act('hz-giveup')");assert.equal(h.run('hzTraining().records.length'),0);assert.equal(h.run('hzTraining().current.endedAt'),null);h.db.fail=false;await h.run("act('hz-save')");assert.equal(h.run('hzTraining().records.length'),1);check(h);
 const other=await start();while(other.run('hzTraining().current.stroke < HANZI_COUNTS[hzTraining().current.character]-1'))await event(other,'correct');other.db.fail=true;await event(other,'correct');assert.equal(other.run('hzTraining().records.length'),0);other.db.fail=false;await other.run("act('hz-save')");assert.equal(other.run('hzTraining().records.length'),1);check(other);
});
test('hanzi pending transaction ignores duplicate callbacks and quick restart',async()=>{
 const h=await start();h.db.hold=true;const p=h.run("hzEvent('mistake',0)");await new Promise(setImmediate);await h.run("hzEvent('mistake',0);act('hz-restart')");h.db.pending();await p;assert.equal(h.run('hzTraining().current.errors'),1);assert.equal(h.run('hzTraining().current.restarts'),0);check(h);
});
test('hanzi reload restores accumulated counters and accepted stroke without a new attempt',async()=>{
 const h=await start();await event(h,'mistake');await h.run("act('hz-motion')");h.run('hzReady=true');await h.run("act('hz-restart')");await event(h,'correct');const saved=h.snapshot();const restored=harness(h.db.value);await restored.run("act('hz-resume')");assert.equal(restored.snapshot(),saved);assert.equal(restored.run('hzTraining().current.stroke'),1);assert.equal(restored.run('hzTraining().current.errors'),1);assert.equal(restored.run('hzTraining().current.restarts'),1);assert.equal(restored.run('hzTraining().current.hints.length'),1);check(restored);
});
test('hanzi keeps old daily and pinyin results intact and uses tab conflict protection',async()=>{
 const h=harness();await h.run("act('start')");await complete(h);await h.run("act('py-learn')");const old=h.run('JSON.stringify([state.sessions,state.session,state.wordProgress,state.pinyin])');await h.run("act('hz-test')");await event(h,'mistake');assert.equal(h.run('JSON.stringify([state.sessions,state.session,state.wordProgress,state.pinyin])'),old);h.db.value.external='other tab';await event(h,'mistake');assert.equal(h.run('hzTraining().current.errors'),1);assert.equal(h.db.value.external,'other tab');assert.match(h.elements.get('#storage-message').textContent,/другой вкладке/);
});
test('hanzi validates persisted state and rejects corrupt or future data',async()=>{
 const h=await start();await finish(h);for(const mutate of [s=>s.hanzi.version=2,s=>s.hanzi.trainings[0].current.errors=-1,s=>s.hanzi.trainings[0].records[0].first.status='incomplete',s=>s.hanzi.trainings[0].order[0]='missing',s=>s.hanzi.trainings[0].records[0].first.hints=[{type:'auto',stroke:99,at:'bad'}]]){const bad=JSON.parse(h.snapshot());mutate(bad);h.context.bad=bad;assert.throws(()=>h.run('validateState(bad)'))}
});
test('hanzi reset still requires confirmation and successful transaction',async()=>{
 const h=await start();await event(h,'mistake');const before=h.snapshot();await h.run("act('reset')");assert.equal(h.snapshot(),before);h.run('window.confirm=()=>true');h.db.fail=true;await h.run("act('reset')");assert.equal(h.snapshot(),before);h.db.fail=false;await h.run("act('reset')");assert.equal(h.run('state.hanzi'),undefined);
});
test('hanzi failed start, hint and result transition each expose retry without losing first result',async()=>{
 const h=harness();h.run("page='hanzi-menu'");h.db.fail=true;await h.run("act('hz-learn')");assert.equal(h.run('state.hanzi'),undefined);assert.equal(h.elements.get('[data-action="hz-save"]').hidden,false);h.db.fail=false;await h.run("act('hz-save')");h.run('hzReady=true');h.db.fail=true;await h.run("act('hz-hint')");assert.equal(h.run('hzTraining().current.hints.length'),0);h.db.fail=false;await h.run("act('hz-save')");assert.equal(h.run('hzTraining().current.hints.length'),1);await finish(h);const first=h.run('JSON.stringify(hzTraining().records[0].first)');h.db.fail=true;await h.run("act('hz-next')");assert.ok(h.run('hzTraining().current.endedAt'));assert.equal(h.elements.get('[data-action="hz-save"]').hidden,false);h.db.fail=false;await h.run("act('hz-save')");assert.equal(h.run('JSON.stringify(hzTraining().records[0].first)'),first);check(h);
});
test('hanzi cannot resume impossible cursor or practice for another character',async()=>{
 const h=await start();await h.run("act('hz-giveup')");await h.run("act('hz-model')");await h.run("act('hz-practice')");const bad=JSON.parse(h.snapshot());bad.hanzi.trainings[0].current.stroke=100;h.context.bad=bad;assert.throws(()=>h.run('validateState(bad)'));check(h);
});
test('hanzi word meaning is heading and progress contains no Chinese or pinyin',async()=>{
 const h=await start(),a=h.run('hzTraining().current'),html=h.run('hzExercise()');assert.match(html,/Напиши иероглиф для слова/);assert.match(html,/Слово 1 из 10<\/span><span>Иероглиф 1 из [12]/);assert.ok(!html.includes(a.character));assert.match(html,/<h1 class="title hz-word">[^<]+<\/h1>/);assert.doesNotMatch(html,/<h1 class="title">Напиши иероглиф/);
});
test('hanzi sample confirmation can be cancelled without changing attempt or counters',async()=>{
 const h=await start();await event(h,'mistake');const before=h.snapshot();await h.run("act('hz-ask-model')");assert.match(h.run('hzExercise()'),/Текущая попытка завершится/);assert.doesNotMatch(h.run('hzExercise()'),/Образец написания иероглифа/);await h.run("act('hz-cancel-model')");assert.equal(h.snapshot(),before);assert.equal(h.run('hzConfirm'),null);check(h);
});
test('hanzi sample waits for transaction completion, retains history, then creates linked practice',async()=>{
 const h=await start();await event(h,'mistake');await h.run("act('hz-hint')");h.run('hzReady=true');await h.run("act('hz-restart')");await h.run("act('hz-ask-model')");h.db.hold=true;const pending=h.run("act('hz-confirm-model')");await new Promise(setImmediate);assert.equal(h.run('hzTraining().records.length'),0);assert.equal(h.run('hzReveal'),false);h.db.pending();await pending;h.db.hold=false;const first=h.run('JSON.stringify(hzTraining().records[0].first)');assert.equal(h.run('hzTraining().current.status'),'incomplete');assert.equal(h.run('hzTraining().current.errors'),1);assert.equal(h.run('hzTraining().current.restarts'),1);assert.equal(h.run('hzTraining().current.hints.length'),1);assert.equal(h.run('hzTraining().records[0].modelViews.length'),1);assert.match(h.run('hzExercise()'),/Анимация полного написания/);assert.match(h.run('hzExercise()'),/Потренироваться по образцу/);await h.run("act('hz-practice')");assert.equal(h.run('hzTraining().current.sourceId'),JSON.parse(first).id);assert.equal(h.run('hzTraining().current.fullModel'),true);await finish(h);assert.equal(h.run('JSON.stringify(hzTraining().records[0].first)'),first);check(h);
});
test('hanzi failed sample save reveals nothing until retry and preserves original attempt',async()=>{
 const h=await start();await event(h,'mistake');const before=h.snapshot();await h.run("act('hz-ask-model')");h.db.fail=true;await h.run("act('hz-confirm-model')");assert.equal(h.snapshot(),before);assert.equal(h.run('hzReveal'),false);assert.doesNotMatch(h.run('hzExercise()'),/Образец написания иероглифа/);await h.run("act('hz-practice');act('hz-model')");assert.equal(h.snapshot(),before);h.db.fail=false;await h.run("act('hz-save')");assert.equal(h.run('hzReveal'),true);assert.equal(h.run('hzTraining().records.length'),1);check(h);
});
test('hanzi test mode cannot request sample before giveup, even via direct action',async()=>{
 const h=await start('test');const before=h.snapshot();assert.doesNotMatch(h.run('hzExercise()'),/hz-ask-model|hz-confirm-model/);await h.run("act('hz-ask-model')");await h.run("act('hz-confirm-model')");await h.run("act('hz-model')");assert.equal(h.snapshot(),before);assert.equal(h.run('hzConfirm'),null);await h.run("act('hz-giveup')");await h.run("act('hz-model')");assert.equal(h.run('hzReveal'),true);check(h);
});
