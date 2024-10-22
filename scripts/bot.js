const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    defaultViewport: null, 
    args: ['--start-maximized'] 
  });
  const page = await browser.newPage();

 
  await page.goto('https://cgr.qoldau.kz/ru/checkpoint/list', { timeout: 0 });


  async function checkForAvailableSlot() {
    try {
     
      while (true) {
        const isClicked = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('div.btn-outline-secondary'));
          const target = elements[0];
          if (target) {
            console.log('Найден элемент для клика');
            target.click();
            return true; 
          }
          return false; 
        });

        if (!isClicked) {

          console.log('Элемент не найден, повторная проверка через 100 миллисекунд...');
          await new Promise(resolve => setTimeout(resolve, 100)); 
          console.log('Клик выполнен по первому элементу с классом "btn-outline-secondary"');

        
          await page.waitForSelector('#btnNext_formWizard', { timeout: 100 });
          await page.click('#btnNext_formWizard');
          console.log('Клик выполнен по кнопке "Далее"');
          break; 
        }
      }
    } catch (err) {
      if (err.message.includes('Execution context was destroyed')) {
        console.log('Навигация произошла, перезагружаем страницу и продолжаем проверку...');
        await page.reload({ waitUntil: 'networkidle0' });
        setTimeout(checkForAvailableSlot, 100); 
      } else {
        console.error('Ошибка при выполнении скрипта:', err.message);
      }
    }
  }

 
  checkForAvailableSlot();

})();
