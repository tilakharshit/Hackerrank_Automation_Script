let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let path = require("path");

let bldr = new swd.Builder();
let driver = bldr.forBrowser('chrome').build();

let cfile = process.argv[2];
let usertoadd = process.argv[3];

  (async function(){
      
    try{
        
          await driver.manage().setTimeouts({
              implicit : 10000,
              pageLoad : 30000

          });

          let contents = await fs.promises.readFile(cfile, 'utf-8');
          let obj = JSON.parse(contents);
          let user = obj.un;
          let pwd = obj.pwd;
         // let url  = obj.url;
           
          await driver.get(obj.url);

          let uel = await driver.findElement(swd.By.css('#input-1'));
          let pel = await driver.findElement(swd.By.css('#input-2'));

          await uel.sendKeys(user);
          await pel.sendKeys(pwd);
          
          let btnlogin = await driver.findElement(swd.By.css(".auth-button"));
          await btnlogin.click();


          let btnadmin = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
          let adminurl = await btnadmin.getAttribute('href');

          await driver.get(adminurl);
          let managetabs  = await driver.findElement(swd.By.css("ul.nav-tabs li a[href='/administration/challenges']"));
          let managetabeURL = managetabs.getAttribute("href");
          await driver.get(managetabeURL);

          let curl = await driver.getCurrentUrl();
          console.log(curl);

          let qidx =0;
          let questionelement = await getquestionelement(curl, qidx);
          console.log(qidx);
          while(questionelement !== undefined){
             await handlequestion(questionelement);
             qidx++;

             questionelement = await getquestionelement(curl, qidx);
          }


    }
    catch(err){
        console.log(err);
    }
    
  })(); 


async function  getquestionelement(curl, qidx){

  await driver.get(curl);

  let pidx = parseInt(qidx/10);
    
  qidx = qidx%10;
  console.log(pidx + " " + qidx);

  let paginationbtns = await driver.findElements(swd.By.css('.pagination li'));
  let nextpagebtn = paginationbtns[paginationbtns.length-2];
  let classonnextpagebtn = await nextpagebtn.getAttribute('class');

  for(let i=0; i<pidx; i++){
    if(classonnextpagebtn !== 'disabled'){
         await nextpagebtn.click();

        paginationbtns = await driver.findElements(swd.By.css('.pagination li'));
        nextpagebtn = paginationbtns[paginationbtns.length-2];
        classonnextpagebtn = await nextpagebtn.getAttribute('class');

    } else{
      return undefined;
    }

  }

 let questionelements = await driver.findElements(swd.By.css('.backbone.block-center'));
 if(qidx < questionelements.length){
   return questionelements[qidx];
 }
 else{
   return undefined;
 }

   
}

async function handlequestion(questionelement){
  let qurl = await questionelement.getAttribute('href');
  console.log(qurl);

  await questionelement.click();

 // sleepSync(2000); // solution 1 -> if the page is ready before 2 seconds, we are waiting purposelessly, if the page is not ready after 2 seconds, this will fail
    
    // solution 2 - part1 (jugaad approach)
    // let nametext = await driver.findElement(swd.By.css('#name'));
    // await nametext.sendKeys('kuchbhi'); // changing to reliably open the discard popup

    // solution 3 - waiting for tags to load
    await driver.wait(swd.until.elementLocated(swd.By.css('span.tag')));

   let moderatortab = await driver.findElement(swd.By.css('li[data-tab=moderators]'));
   await moderatortab.click();

    // solution 2 -> part2
    // let cancelBtn = await driver.wait(swd.until.elementLocated(swd.By.css('#cancelBtn')), 1000);
    // await cancelBtn.click();

   let moderatortextbox = await driver.findElement(swd.By.css('#moderator'));
   await moderatortextbox.sendKeys(usertoadd);
   await moderatortextbox.sendKeys(swd.Key.ENTER);

   let btnsave = await driver.findElement(swd.By.css('.save-challenge'));
   await btnsave.click();

   
}

async function waittillloaderdisappears(){
  let loader = await driver.findElement(swd.By.css('#ajax-msg'));
  await driver.wait(swd.until.elementIsNotVisible(loader));

}

function sleepSync(duration){
  let curr = Date.now();
  let limit  = curr + duration;
  while(curr < limit){
    curr = Date.now();
  }
}




     





  