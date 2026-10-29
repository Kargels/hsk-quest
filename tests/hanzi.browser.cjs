// Run against a local HTTP server. Uses fresh, isolated browser contexts only.
// PLAYWRIGHT_MODULE can point to an installed Playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const out=process.env.HSK_SCREENSHOTS||'/tmp/hsk-v050-screenshots';fs.mkdirSync(out,{recursive:true});
const url=process.env.HSK_TEST_URL||'http://127.0.0.1:8766/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 let checks=0;
 try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('[data-page="hanzi-menu"]').click();await page.locator('[data-action="hz-learn"]').click();await page.waitForFunction(()=>hzReady);
  const frame=()=>page.frames().find(f=>f.url().endsWith('hanzi-frame.html'));
  async function touch(points){
   await page.locator('#hanzi-frame').scrollIntoViewIfNeeded();const box=await page.locator('#hanzi-frame').boundingBox();const session=await context.newCDPSession(page);
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+1+points[0][0],y:box.y+1+points[0][1]}]});
   for(const p of points.slice(1))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+1+p[0],y:box.y+1+p[1]}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();await page.waitForFunction(()=>!busy);await page.waitForTimeout(80);
  }
  async function correct(){const points=await frame().evaluate(()=>{const t=HanziWriter.getScalingTransform(innerWidth,innerWidth,12);return charData.medians[attempt.stroke].map(([x,y])=>[t.x+x*t.scale,innerWidth-t.y-y*t.scale])});await touch(points)}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  assert.equal(await page.locator('.mark').isVisible(),false);
  assert.equal(await frame().evaluate(()=>getComputedStyle(board).touchAction),'none');
  assert.equal(await frame().evaluate(()=>writer._options.showCharacter),false);assert.equal(await frame().evaluate(()=>writer._options.showOutline),false);
  const char=await page.evaluate(()=>hzTraining().current.character);assert.ok(!(await page.locator('#content').innerText()).includes(char));checks++;
  await page.screenshot({path:`${out}/blank-${width}.png`,fullPage:true});
  for(let i=0;i<2;i++)await touch([[18,18],[60,18],[60,70],[18,70],[18,18]]);
  assert.equal(await page.evaluate(()=>hzTraining().current.errors),2);assert.equal(await page.evaluate(()=>hzTraining().current.hints.length),0);await page.locator('#hz-message').filter({hasText:'попросить подсказку'}).waitFor();checks++;
  await page.locator('[data-action="hz-hint"]').click();await page.waitForFunction(()=>hzReady&&!busy);assert.equal(await page.evaluate(()=>hzTraining().current.hints.length),1);
  await page.locator('[data-action="hz-motion"]').click();await page.waitForFunction(()=>hzReady&&!busy);assert.equal(await page.evaluate(()=>hzTraining().current.hints.length),2);checks++;
  await correct();assert.equal(await page.evaluate(()=>hzTraining().current.stroke),1);
  await page.locator('[data-action="hz-restart"]').click();await page.waitForFunction(()=>hzReady&&!busy);assert.equal(await page.evaluate(()=>hzTraining().current.stroke),0);assert.equal(await page.evaluate(()=>hzTraining().current.errors),2);assert.equal(await page.evaluate(()=>hzTraining().current.restarts),1);
  await page.reload();await page.locator('[data-page="hanzi-menu"]').click();await page.locator('[data-action="hz-resume"]').click();await page.waitForFunction(()=>hzReady);assert.equal(await page.evaluate(()=>hzTraining().current.errors),2);assert.equal(await page.evaluate(()=>hzTraining().current.hints.length),2);checks++;
  while(!await page.evaluate(()=>!!hzTraining().current.endedAt))await correct();assert.equal(await page.evaluate(()=>hzTraining().current.status),'assisted');assert.equal(await page.evaluate(()=>hzTraining().records.length),1);checks++;
  await page.screenshot({path:`${out}/result-${width}.png`,fullPage:true});
  await page.locator('[data-action="hz-next"]').click();await page.waitForFunction(()=>hzReady&&!busy);await page.locator('[data-action="hz-giveup"]').click();await page.waitForFunction(()=>!busy);assert.equal(await page.evaluate(()=>hzTraining().current.status),'incomplete');
  const first=await page.evaluate(()=>JSON.stringify(hzRecord(hzTraining()).first));await page.locator('[data-action="hz-model"]').click();await page.locator('[data-action="hz-practice"]').click();await page.waitForFunction(()=>hzReady&&!busy);while(!await page.evaluate(()=>!!hzTraining().current.endedAt))await correct();assert.equal(await page.evaluate(()=>JSON.stringify(hzRecord(hzTraining()).first)),first);assert.equal(await page.evaluate(()=>hzRecord(hzTraining()).practice.length),1);checks++;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${width}px: touch grading, hints, restart, reload, completion, separate practice`);
 }
 // Missing and corrupt data do not create results. Retry recovers in a clean context.
 for(const corrupt of [false,true]){
  const context=await browser.newContext();const p=await context.newPage();await p.route('**/hanzi-data/*.json',r=>r.fulfill({status:corrupt?200:404,contentType:'application/json',body:corrupt?'{}':'missing'}));await p.goto(url);await p.locator('[data-page="hanzi-menu"]').click();await p.locator('[data-action="hz-test"]').click();await p.locator('#hz-message').filter({hasText:'Не удалось загрузить'}).waitFor();assert.equal(await p.evaluate(()=>hzTraining().records.length),0);assert.equal(await p.locator('[data-action="hz-hint"]').count(),0);await p.unroute('**/hanzi-data/*.json');await p.locator('[data-action="hz-load"]').click();await p.waitForFunction(()=>hzReady);await context.close();checks++;
 }
 // Test mode, first result preservation, and retry UI after a simulated storage failure.
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844}});const p=await context.newPage();await p.goto(url);await p.locator('[data-page="hanzi-menu"]').click();await p.locator('[data-action="hz-test"]').click();await p.waitForFunction(()=>hzReady);
  assert.equal(await p.locator('[data-action="hz-hint"]').count(),0);
  const id=await p.evaluate(()=>hzTraining().current.id);await p.locator('[data-action="hz-restart"]').click();await p.waitForFunction(()=>hzReady&&!busy);assert.equal(await p.evaluate(()=>hzTraining().current.id),id);assert.equal(await p.evaluate(()=>hzTraining().current.restarts),1);
  await p.evaluate(()=>{window.originalWrite=write;write=async()=>{throw new Error('Тестовый отказ сохранения')}});
  await p.locator('[data-action="hz-giveup"]').click();await p.locator('[data-action="hz-save"]').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>hzTraining().records.length),0);await p.evaluate(()=>{write=window.originalWrite});await p.locator('[data-action="hz-save"]').click();await p.waitForFunction(()=>!busy&&!hzPending);
  const first=await p.evaluate(()=>JSON.stringify(hzRecord(hzTraining()).first));await p.locator('[data-action="hz-model"]').click();await p.locator('[data-action="hz-practice"]').click();await p.waitForFunction(()=>hzReady&&!busy);assert.equal(await p.evaluate(()=>hzTraining().current.mode),'learn');await p.locator('[data-action="hz-giveup"]').click();await p.waitForFunction(()=>!busy);assert.equal(await p.evaluate(()=>JSON.stringify(hzRecord(hzTraining()).first)),first);assert.equal(await p.evaluate(()=>hzRecord(hzTraining()).practice.length),1);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);await p.screenshot({path:`${out}/test-practice-${width}.png`,fullPage:true});await context.close();checks++;console.log(`PASS ${width}px: test mode, retry UI, immutable first result`);
 }
 console.log(`PASS ${checks} browser scenario checks; screenshots: ${out}`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
