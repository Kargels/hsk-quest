const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {harness,complete}=require('./harness.cjs');
const clone=x=>x===undefined?undefined:structuredClone(x);
test('navigation has one delegated subscription after repeated renders',()=>{
 const h=harness();h.run('bind();bind();for(let i=0;i<50;i++)render()');assert.equal(h.listeners.filter(x=>x.type==='click').length,1);
 h.listeners[0].fn({target:{closest:()=>({dataset:{page:'vocab'},disabled:false})}});assert.equal(h.run('page'),'vocab');assert.equal(h.listeners.filter(x=>x.type==='click').length,1);
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



async function pyStart(h,mode='learn',word='xuexiao'){
 await h.run(`act('py-${mode}')`);
 // Select reference word in the isolated fixture, retaining the production action path.
 h.run(`pinyinDraft=newPinyinDraft('${word}','${mode}');state.pinyin.active=structuredClone(pinyinDraft)`);
}
function pyInput(h,input){h.context.inputValue=input;h.run('pinyinDraft.input=inputValue')}
function pyTones(h,tones){h.context.inputTones=tones;h.run('pinyinDraft.tones=[...inputTones]')}
test('pinyin starts with one Latin field, no tones selected, no syllable count or reference spelling',async()=>{
 const h=harness();await pyStart(h);const html=h.run('pinyinExercise()');
 assert.equal((html.match(/<input /g)||[]).length,1);assert.match(html,/lang="en" inputmode="text"/);assert.match(html,/autocorrect="off"/);assert.match(html,/spellcheck="false"/);
 assert.doesNotMatch(html,/Слог [12]|xue|xiao|xué|слога|слогов|data-py-tone/);
 assert.equal(h.run('pinyinDraft.tones.every(t=>t===null)'),true);
});
test('single field input event and Enter use the existing draft, without autocorrection',async()=>{
 const h=harness();await pyStart(h);h.run('bind()');
 h.listeners.find(x=>x.type==='input').fn({target:{id:'pinyin-input',value:'Xuexao'}});
 assert.equal(h.run('pinyinDraft.input'),'Xuexao');let prevented=false;
 h.listeners.find(x=>x.type==='keydown').fn({target:{id:'pinyin-input'},key:'Enter',isComposing:false,preventDefault(){prevented=true}});
 await new Promise(setImmediate);assert.equal(prevented,true);assert.equal(h.run('pinyinDraft.stage'),'tones');assert.equal(h.run('pinyinDraft.input'),'Xuexao');
});
test('continue reveals tone choices, never the correct spelling or correctness',async()=>{
 const h=harness();await pyStart(h);pyInput(h,'wrong');await h.run("act('py-continue')");const html=h.run('pinyinExercise()');
 assert.match(html,/Введено: wrong/);assert.match(html,/Слог 1/);assert.match(html,/Слог 2/);assert.equal((html.match(/data-py-tone=/g)||[]).length,10);
 assert.doesNotMatch(html,/xue|xiao|xué|ошибка|Правильно:|Написание:/);assert.match(html,/data-action="py-check" disabled/);assert.equal(h.run('state.pinyin.records.length'),0);
});
test('segmentation is conservative and independent of reference boundaries',()=>{
 const h=harness();for(const [input,n,result] of [['pengyou',2,['peng','you']],['laoshi',2,['lao','shi']],['xianan',2,['Слог 1','Слог 2']],['xian',1,['xian']],['xxzz',2,['Слог 1','Слог 2']],['peng you',2,['peng','you']],['laoshu',2,['lao','shu']]]){
  h.context.segmentInput=input;h.context.segmentCount=n;assert.deepEqual(Array.from(h.run('pinyinLabels(segmentInput,segmentCount)')),result);
 }
});
test('editing preserves entire input and chosen tones before final checking',async()=>{
 const h=harness();await pyStart(h);pyInput(h,'xuexao');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-edit')");
 assert.equal(h.run('pinyinDraft.stage'),'input');assert.equal(h.run('pinyinDraft.input'),'xuexao');assert.equal(h.run('state.pinyin.records.length'),0);
 pyInput(h,'xuexiao');await h.run("act('py-continue')");await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records[0].first.correct'),true);
});
test('spelling and tones graded separately even with unsegmentable input',async()=>{
 const h=harness();await pyStart(h);pyInput(h,'zzzz');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");
 assert.equal(h.run('state.pinyin.records[0].first.spellingCorrect'),false);assert.equal(h.run('state.pinyin.records[0].first.toneCorrect.every(Boolean)'),true);assert.equal(h.run('state.pinyin.records[0].first.correct'),false);
 assert.match(h.run('pinyinExercise()'),/xué xiào/);assert.match(h.run('pinyinExercise()'),/data-speak="xuexiao"/);
});
test('neutral tone is explicit and a wrong tone is highlighted independently',async()=>{
 const h=harness();await pyStart(h,'learn','pengyou');pyInput(h,'pengyou');await h.run("act('py-continue')");pyTones(h,[2,null]);await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records.length'),0);
 pyTones(h,[2,3]);await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records[0].first.spellingCorrect'),true);assert.match(h.run('pinyinExercise()'),/Слог 2 · you/);assert.match(h.run('pinyinExercise()'),/Правильно: тон 0 \(нейтральный\) — <strong>you/);
 await h.run("act('py-correct')");pyInput(h,'pengyou');await h.run("act('py-continue')");pyTones(h,[2,0]);await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records[0].corrections[0].correct'),true);
});
test('learning hints are committed before display and stored on first answer',async()=>{
 const h=harness();await pyStart(h);h.db.fail=true;await h.run("act('py-hint')");assert.equal(h.run('pinyinDraft.hints.length'),0);assert.doesNotMatch(h.run('pinyinExercise()'),/x… x…/);
 h.db.fail=false;await h.run("act('py-hint')");assert.match(h.run('pinyinExercise()'),/x… x…/);await h.run("act('py-hint')");assert.match(h.run('pinyinExercise()'),/xue xiao/);
 pyInput(h,'xuexiao');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records[0].first.hints.length'),2);assert.match(h.run('pinyinStats()'),/С подсказками: 1/);
});
test('test mode blocks hints and correction creates a separate learning record',async()=>{
 const h=harness();await pyStart(h,'test');await h.run("act('py-hint')");assert.equal(h.run('pinyinDraft.hints.length'),0);assert.doesNotMatch(h.run('pinyinExercise()'),/data-action="py-hint"/);
 pyInput(h,'wrong');await h.run("act('py-continue')");pyTones(h,[1,1]);await h.run("act('py-check')");const first=h.run('JSON.stringify(state.pinyin.records[0])');const id=h.run('pinyinDraft.id');
 await h.run("act('py-correct')");assert.notEqual(h.run('pinyinDraft.id'),id);assert.equal(h.run('pinyinDraft.mode'),'learn');
 pyInput(h,'xuexiao');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records.length'),2);assert.equal(h.run('JSON.stringify(state.pinyin.records[0])'),first);assert.equal(h.run('state.pinyin.records[1].sourceRecordId'),id);assert.doesNotThrow(()=>h.run('validateState(state)'));
});
test('learning corrections append and never replace the first answer or hint history',async()=>{
 const h=harness();await pyStart(h);await h.run("act('py-hint')");pyInput(h,'wrong');await h.run("act('py-continue')");pyTones(h,[1,1]);await h.run("act('py-check')");const first=h.run('JSON.stringify(state.pinyin.records[0].first)');
 await h.run("act('py-correct')");pyInput(h,'xuexiao');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");
 assert.equal(h.run('JSON.stringify(state.pinyin.records[0].first)'),first);assert.equal(h.run('state.pinyin.records[0].corrections.length'),1);assert.match(h.run('pinyinStats()'),/Написание: 0%/);
});
test('save failure and duplicate check preserve draft and append once on retry',async()=>{
 const h=harness();await pyStart(h);pyInput(h,'xuexiao');await h.run("act('py-continue')");pyTones(h,[2,4]);const oldDB=JSON.stringify(h.db.value);h.db.fail=true;await h.run("act('py-check')");
 assert.equal(JSON.stringify(h.db.value),oldDB);assert.equal(h.run('pinyinDraft.stage'),'tones');assert.equal(h.run('pinyinDraft.input'),'xuexiao');assert.equal(h.run('state.pinyin.records.length'),0);
 h.db.fail=false;await h.run("act('py-check')");await h.run("act('py-check')");assert.equal(h.run('state.pinyin.records.length'),1);
});
test('pinyin never changes old attempts, daily statistics or the 15-question session',async()=>{
 const h=harness();await h.run("act('start')");await complete(h);await h.run("act('start')");
 const previous=h.run('JSON.stringify([state.sessions,state.session,state.wordProgress])');await pyStart(h);pyInput(h,'xuexiao');await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");
 assert.equal(h.run('JSON.stringify([state.sessions,state.session,state.wordProgress])'),previous);assert.equal(h.run('uniqueLessons()'),1);assert.equal(h.run('state.session.items.length'),15);
});
test('old answers missing mode/questionKey are preserved on new pinyin saves',async()=>{
 const h=harness();await h.run("act('start')");await complete(h);const saved=JSON.parse(h.snapshot());
 for(const a of saved.sessions[0].answers){if(a.mode==='visual'){delete a.mode;delete a.questionKey}}
 const restored=harness(saved);await restored.run("act('py-learn')");assert.deepEqual(restored.db.value.sessions,saved.sessions);
});
test('pinyin checked result and hints survive reload; invalid records fail closed',async()=>{
 const h=harness();await pyStart(h);pyInput(h,'xuexiao');await h.run("act('py-hint')");await h.run("act('py-continue')");pyTones(h,[2,4]);await h.run("act('py-check')");
 const restored=harness(h.db.value);await restored.run("act('py-resume')");assert.match(restored.run('pinyinExercise()'),/Первый ответ/);assert.match(restored.run('pinyinExercise()'),/первые буквы/);
 for(const change of [s=>s.pinyin.version=2,s=>s.pinyin.records[0].first.correct=false,s=>s.pinyin.active.tones=[2],s=>s.pinyin.records[0].wordId='__proto__']){const s=JSON.parse(h.snapshot());change(s);h.context.bad=s;assert.throws(()=>h.run('validateState(bad)'))}
});
test('empty and numbered input are blocked without revealing a reference',async()=>{
 const h=harness();await pyStart(h);for(const input of ['', '  ', 'xue2xiao4','学校']){pyInput(h,input);await h.run("act('py-continue')");assert.equal(h.run('pinyinDraft.stage'),'input');assert.equal(h.run('state.pinyin.records.length'),0)}
});
test('reset includes new pinyin records only after confirmation and commit',async()=>{
 const h=harness();await h.run("act('py-learn')");await h.run("act('reset')");assert.ok(h.run('state.pinyin'));
 h.run('window.confirm=()=>true');h.db.fail=true;await h.run("act('reset')");assert.ok(h.run('state.pinyin'));h.db.fail=false;await h.run("act('reset')");assert.equal(h.run('state.pinyin'),undefined);assert.equal(h.run('pinyinDraft'),null);
});

test('tone illustrations are available in both modes without hints or state changes',async()=>{
 for(const mode of ['learn','test']){
  const h=harness();await pyStart(h,mode);pyInput(h,'xuexiao');await h.run("act('py-continue')");
  const before=h.snapshot(),puts=h.db.puts,html=h.run('pinyinExercise()');
  for(const [tone,sign,name] of [[1,'ā','Ровный'],[2,'á','Вверх'],[3,'ǎ','Третий'],[4,'à','Вниз'],[0,'a','Нейтр.']]){
   assert.match(html,new RegExp(`class="toneNumber">${tone}</span><span class="toneSign" aria-hidden="true">${sign}</span>`));assert.ok(html.includes(`>${name}</span>`));
  }
  assert.equal((html.match(/class="toneOption"/g)||[]).length,10);assert.doesNotMatch(html,/aria-pressed="true"/);
  assert.equal(h.snapshot(),before);assert.equal(h.db.puts,puts);assert.equal(h.run('pinyinDraft.hints.length'),0);
  if(mode==='test')assert.doesNotMatch(html,/data-action="py-hint"/);
  h.run('pinyinDraft.tones[0]=2');const selected=h.run('pinyinExercise()');assert.equal((selected.match(/aria-pressed="true"/g)||[]).length,1);assert.match(selected,/class="answer selected"/);
 }
});


test('single-syllable tone mistake explains selected and correct tone without changing answer',()=>{
 const h=harness();h.run("testAnswer={input:'ai',tones:[1],toneCorrect:[false],spellingCorrect:true,correct:false}");
 const before=h.run('JSON.stringify(testAnswer)'),html=h.run("toneExplanation('ai',testAnswer)");
 assert.match(html,/Ты выбрал 1-й тон \(ровный\) — <strong>āi/);
 assert.match(html,/Правильно: 4-й тон \(нисходящий\) — <strong>ài/);
 assert.match(html,/используется четвёртый, нисходящий тон/);assert.doesNotMatch(html,/Слог 1|✕ →/);
 assert.equal(h.run('JSON.stringify(testAnswer)'),before);
});
test('multiple tone mistakes each identify reference syllable and both pronunciations',()=>{
 const h=harness();h.run("testAnswer={input:'wrong',tones:[1,3],toneCorrect:[false,false],spellingCorrect:false,correct:false,hints:[]}");
 const html=h.run("pinyinAnswerView('xuexiao',testAnswer,'Первый ответ')");
 assert.equal((html.match(/class="toneDetail toneMistake"/g)||[]).length,2);
 for(const text of ['Слог 1 · xue','Слог 2 · xiao','xuē','xué','xiǎo','xiào','восходящий','нисходящий','низкий, с возможным подъёмом','на правильном написании слогов'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/✕ →/);
});
test('neutral and correct syllables have separate clear feedback',()=>{
 const h=harness();h.run("testAnswer={tones:[2,4],toneCorrect:[true,false]}");
 const html=h.run("toneExplanation('pengyou',testAnswer)");assert.match(html,/Слог 1 · peng: Тон верный ✓/);
 assert.equal((html.match(/class="toneDetail toneMistake"/g)||[]).length,1);
 assert.match(html,/4-й тон \(нисходящий\) — <strong>yòu/);assert.match(html,/Правильно: тон 0 \(нейтральный\) — <strong>you/);assert.match(html,/без тонового знака/);
 h.run("testAnswer={tones:[0,0],toneCorrect:[false,false]}");const third=h.run("toneExplanation('shuiguo',testAnswer)");assert.match(third,/Правильно: 3-й тон/);assert.ok(third.includes('shuǐ'));assert.ok(third.includes('guǒ'));
});
