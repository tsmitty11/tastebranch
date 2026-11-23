import { chromium } from '@playwright/test';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage();
const failures=[];
page.on('pageerror',e=>failures.push(e.message));
page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`)});
for(const width of [1440,768,390,320]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:1313/');await page.evaluate(()=>document.fonts.ready);
 const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,mona:document.fonts.check('700 24px Mona'),inter:document.fonts.check('16px Inter')}));
 if(metrics.scroll>width)failures.push(`overflow at ${width}: ${metrics.scroll}`);
 await page.locator('summary').first().click();if(!await page.locator('details').first().getAttribute('open').then(x=>x!==null))failures.push('FAQ failed');
 await page.locator('summary').first().click();
 await page.screenshot({path:`/private/tmp/tastebranch-${width}.png`,fullPage:true});console.log(JSON.stringify(metrics));
}
await browser.close();if(failures.length){console.error(failures);process.exit(1);}console.log('Desktop/mobile, fonts, FAQ and response checks passed.');
