let fs = require("fs");
let puppeteer = require("puppeteer");

let cfile = process.argv[2];
let usertoadd = process.argv[3];


(async function(){
   
    const browser  = await puppeteer.launch({
     
        headless : false,
        defaultViewport : null,
        slowMo : 20,
        args :['--startmaximized', '--disable-notifications']
    });

    let contents = await fs.promises.readFile(cfile,'utf-8');

    let obj = JSON.parse(contents);
    let un = obj.un;
    let pwd = obj.pwd;

    let pages = await browser.pages();
    let page = pages[0];
    page.goto("https://www.hackerrank.com/auth/login",{waitUntil:'networkidle0'});

    await page.waitForSelector('.auth-button', {
        visible : true
    });

    await page.type('#input-1',un);
    await page.type('#input-2', pwd);
    await page.click(".auth-button");
    await page.waitForNavigation({waitUntil:'networkidle0'});

    await page.waitForSelector('.profile-menu .ui-icon-chevron-down.down-icon',{
        visible:true
    });

 await page.click((".profile-menu .ui-icon-chevron-down.down-icon"));   
 await page.click('[data-analytics=NavBarProfileDropDownAdministration]');
 await page.waitForNavigation({waitUntil:'networkidle0'});

 await page.waitForSelector('ul.nav-tabs', {
    visible: true })

    let managelis = await page.$$('ul.nav-tabs li');
    await managelis[1].click();
    await page.waitForSelector('ul.nav-tabs', {
        visible: true })
    
    let curl = page.url();

    let qidx=0;
    let questionelement = await getQuestionElement(curl, qidx, page);
    while(questionelement !== undefined){
        await handleQuestion(questionelement, page);
        qidx++;
        questionelement  = await getQuestionElement(curl, qidx, page);
    }
 
})();

async function getQuestionElement(curl, qidx, page){
    await page.goto(curl, {waitUntil: 'networkidle0'});
    await page.waitForSelector('ul.nav-tabs', {
        visible: true});

        let pidx = parseInt(qidx/10);
        qidx = qidx%10;
        console.log(pidx +"  " + qidx);

        let paginationbtns = await page.$$('.pagination li');
        let nextpagebtn = paginationbtns[paginationbtns.length-2];
        let classonnextpagebtn = await page.evaluate(function (el){
            return el.getAttribute("class");
        }, nextpagebtn);

        for(let i=0; i<pidx; i++){
            if(classonnextpagebtn !== 'disabled'){
                await nextpagebtn.click();
                await page.waitForSelector('.pagination li', {
                    visible: true})

                    paginationbtns  = await page.$$('.pagination li');
                    nextpagebtn  = paginationbtns[paginationbtns.length-2];
                    classonnextpagebtn   =  await nextpagebtn.evaluate(function(el){
                        return el.getAttribute("class");
                    }, nextpagebtn)
            }else{
                return undefined;
            }
        }
          
        let questionElements = await page.$$('.backbone.block-center');
        if(qidx < questionElements.length){
            return questionElements[qidx];
        }else{
            return undefined;
        }

}




async function handleQuestion(questionElement, page){
    await questionElement.click();
    await page.waitForNavigation({waitUntil : 'networkidle0'});
    await page.waitForSelector('span.tag', {
        visible: true})

        await page.click('li[data-tab=moderators]');
        await page.waitForSelector('#moderator', {
            visible: true})

            await page.type('#moderator',usertoadd);
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");

            await page.click('.save-challenge');
}