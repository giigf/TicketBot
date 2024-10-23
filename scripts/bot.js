const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    defaultViewport: null, 
    args: ['--start-maximized'] 
  });
  const page = await browser.newPage();

  await page.goto('https://cgr.qoldau.kz/ru/custom-user', { timeout: 0 });

  async function checkForAvailableSlot() {
    try {
      while (true) {
        const isClicked = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('div.btn-outline-secondary'));
          
          // Временные интервалы, которые будем искать
          const timeSlots = [
            '00:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', 
            '04:00 - 05:00', '05:00 - 06:00', '06:00 - 07:00', '07:00 - 08:00', 
            '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
            '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', 
            '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', 
            '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00'
          ];

          // Ищем элемент, который содержит любой временной интервал
          const target = elements.find(el => timeSlots.includes(el.textContent.trim()));
          
          // Если элемент найден, кликаем по нему
          if (target) {
            console.log('Найден элемент с временным интервалом для клика');
            target.click();
            return true; 
          }
          return false; 
        });

        if (isClicked) {
          console.log('Клик выполнен по элементу с временным интервалом');
          
          // Ждем кнопку "Далее" и кликаем по ней
          await page.waitForSelector('#btnNext_formWizard', { timeout: 100 });
          await page.click('#btnNext_formWizard');
          console.log('Клик выполнен по кнопке "Далее"');

          // Ждем, пока страница загрузится
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
          console.log('Страница загружена, продолжаем поиск слотов...');
        } else {
          // Если не нашли элемент, ждем и проверяем снова
          console.log('Элемент с временным интервалом не найден, повторная проверка через 100 миллисекунд...');
          await new Promise(resolve => setTimeout(resolve, 100)); 
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
