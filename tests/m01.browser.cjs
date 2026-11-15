// Isolated browser profiles only: never touches the user's IndexedDB.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const url=process.env.HSK_TEST_URL||'http://127.0.0.1:8766/';const out=require('node:path').join(require('node:os').tmpdir(),'hsk-m01-screenshots');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});let checks=0;
 try{for(const width of [320,390]){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const p=await context.newPage(),errors=[],requests=[];p.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});p.on('request',r=>requests.push(r.url()));p.on('dialog',d=>d.accept());
 const click=async action=>{await p.locator(`[data-action="m01-${action}"]`).first().click();await p.waitForFunction(()=>!busy)};
 await p.goto(url);await p.locator('[data-page="m01-menu"]').click();assert.equal(await p.locator('[data-action="m01-start-L05"]').isDisabled(),true);assert.equal(requests.some(x=>x.includes('/control/')),false);
 // Seed a real legacy training, then verify it survives all M01 operations unchanged.
 await p.evaluate(()=>act('start'));const legacy=await p.evaluate(()=>JSON.stringify({session:state.session,sessions:state.sessions,wordProgress:state.wordProgress}));await p.evaluate(()=>navigate('m01-menu'));
 async function listen(id){await click('play-'+id);await p.waitForFunction(()=>activeAudio&&activeAudio.readyState>=2);await p.waitForFunction(()=>!activeAudio&&!busy);}
 const frame=()=>p.frames().find(f=>f.url().includes('/hanzi-frame.html'));
 async function stroke(points,cancel=false){await p.locator('#m01-hanzi-frame').scrollIntoViewIfNeeded();const box=await p.locator('#m01-hanzi-frame').boundingBox(),cdp=await context.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+1+points[0][0],y:box.y+1+points[0][1]}]});for(const [x,y] of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+1+x,y:box.y+1+y}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await cdp.detach();await p.waitForFunction(()=>!busy&&m01Ready);await p.waitForTimeout(60)}
 let touched=false,pyChecked=false;
 for(const lesson of ['L01','L02','L03','L04','L05']){
  await click('start-'+lesson);assert.equal((await p.locator('#content').innerText()).includes('你好'),false);await p.screenshot({path:`${out}/${lesson}-first-${width}.png`,fullPage:true});
  while(await p.evaluate(()=>!!m01Active())){
   const s=await p.evaluate(()=>m01Step(m01Active()));console.log(width,s.id);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
   if(s.audio&&['listen','choice','pinyin'].includes(s.kind))await listen(s.audio);
   if(s.kind==='choice'){await p.locator(`[data-m01-choice="${s.answer}"]`).click();await click('check')}
   if(s.kind==='word')if(await p.locator('[data-action^="m01-play-"]').count())await listen(await p.evaluate(()=>M01_DATA.words[m01Step(m01Active()).word].audio));
   if(s.kind==='pinyin'){
    const w=await p.evaluate(()=>M01_DATA.words[m01Step(m01Active()).word]);assert.equal(await p.locator('#m01-input').count(),1);
    if(!pyChecked){await p.locator('#m01-input').fill('xxx');await click('hint');await click('continue');assert.equal(await p.locator('[aria-pressed="true"]').count(),0);assert.match(await p.locator('fieldset legend').first().innerText(),/Слог 1/);await click('edit');assert.equal(await p.locator('#m01-input').inputValue(),'xxx');await click('continue');for(let i=0;i<w.tones.length;i++){await p.locator(`[data-m01-tone="1"][data-m01-syllable="${i}"]`).click();await p.waitForFunction(()=>!busy)}await click('check');assert.match(await p.locator('#content').innerText(),/Написание: ошибка/);const first=await p.evaluate(()=>JSON.stringify(m01Record(m01Active(),m01Step(m01Active())).first));await click('practice');await p.locator('#m01-input').fill(w.syllables.join(''));await click('continue');for(let i=0;i<w.tones.length;i++){await p.locator(`[data-m01-tone="${w.tones[i]}"][data-m01-syllable="${i}"]`).click();await p.waitForFunction(()=>!busy)}await click('check');assert.equal(await p.evaluate(()=>JSON.stringify(m01Record(m01Active(),m01Step(m01Active())).first)),first);pyChecked=true}
    else {await p.locator('#m01-input').fill(w.syllables.join(''));await click('continue');await p.screenshot({path:`${out}/tones-${width}.png`,fullPage:true});for(let i=0;i<w.tones.length;i++){await p.locator(`[data-m01-tone="${w.tones[i]}"][data-m01-syllable="${i}"]`).click();await p.waitForFunction(()=>!busy)}await click('check')}
   }
   if(s.kind==='model'){await p.waitForFunction(()=>m01Ready);await click('animate');}
   if(s.kind==='hanzi'){
    await p.waitForFunction(()=>m01Ready);
    if(!touched){
     const before=await p.evaluate(()=>JSON.stringify(m01Active().draft));await stroke([[20,20],[70,30]],true);assert.equal(await p.evaluate(()=>JSON.stringify(m01Active().draft)),before);
     await stroke([[18,18],[60,18],[60,70],[18,70],[18,18]]);assert.equal(await p.evaluate(()=>m01Active().draft.errors),1);
     await click('restart-strokes');await p.waitForFunction(()=>m01Ready);assert.equal(await p.evaluate(()=>m01Active().draft.errors),1);
     await click('stroke-hint');await p.waitForFunction(()=>m01Ready);assert.equal(await p.evaluate(()=>m01Active().draft.hints.length),1);
     await p.reload();await p.locator('[data-page="m01-menu"]').click();await click('start-'+lesson);await p.waitForFunction(()=>m01Ready);assert.equal(await p.evaluate(()=>m01Active().draft.errors),1);
     while(!await p.evaluate(()=>!!m01Active().draft.endedAt)){const points=await frame().evaluate(()=>{const t=HanziWriter.getScalingTransform(innerWidth,innerWidth,12);return charData.medians[attempt.stroke].map(([x,y])=>[t.x+x*t.scale,innerWidth-t.y-y*t.scale])});await stroke(points)}touched=true;
    }else if(lesson!=='L05'&&s.mode!=='test'){
     await p.evaluate(()=>{window.realWrite=write;write=async()=>{throw Error('Test storage failure')}});await click('sample');assert.equal(await p.evaluate(()=>m01Active().draft.endedAt),null);assert.equal(await frame().evaluate(()=>model),false);
     await p.evaluate(()=>{write=window.realWrite});await click('save');await p.waitForFunction(()=>m01Ready);const first=await p.evaluate(()=>JSON.stringify(m01Record(m01Active(),m01Step(m01Active())).first));await click('practice');await p.waitForFunction(()=>m01Ready);await click('giveup');assert.equal(await p.evaluate(()=>JSON.stringify(m01Record(m01Active(),m01Step(m01Active())).first)),first);
    }else{assert.equal(await p.locator('[data-action="m01-sample"]').count(),0);await click('giveup')}
    await p.screenshot({path:`${out}/writing-${width}.png`,fullPage:true});
   }
   await click('next');await p.evaluate(()=>validateState(state));
  }
  await p.screenshot({path:`${out}/${lesson}-result-${width}.png`,fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);await click('menu');checks++;
 }
 assert.equal(await p.evaluate(()=>JSON.stringify({session:state.session,sessions:state.sessions,wordProgress:state.wordProgress})),legacy);
 await p.reload();await p.evaluate(()=>validateState(state));assert.equal(await p.evaluate(()=>state.m01.attempts.filter(a=>a.endedAt).length),5);assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${width}px: five complete lessons, MP3, pinyin, real Hanzi touch, failure recovery, legacy preservation`);
 }console.log(`PASS ${checks} full lesson runs. Screenshots: ${out}`)}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
