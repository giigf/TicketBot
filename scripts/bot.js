const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Открываем браузер с интерфейсом
    defaultViewport: null, 
    args: ['--start-maximized'] // Открыть браузер на полный экран
  });
  const page = await browser.newPage();

  // Переход на страницу
  await page.goto('https://cgr.qoldau.kz/ru/checkpoint/list', { timeout: 0 });

  // Функция для поиска первого элемента с классом 'btn-outline-secondary'
  async function checkForAvailableSlot() {
    try {
      // Бесконечный цикл для поиска элемента с классом 'btn-outline-secondary'
      while (true) {
        const isClicked = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('div.btn-outline-secondary'));
          const target = elements[0]; // Клик по первому найденному элементу
          if (target) {
            console.log('Найден элемент для клика');
            target.click();
            return true; // Клик был выполнен
          }
          return false; // Элементов нет
        });

        if (!isClicked) {
          // Если элемента нет, проверяем снова через 100 миллисекунд
          console.log('Элемент не найден, повторная проверка через 100 миллисекунд...');
          await new Promise(resolve => setTimeout(resolve, 100)); // Ждем 100 мс перед повторной проверкой
        } else {
          console.log('Клик выполнен по первому элементу с классом "btn-outline-secondary"');

          // После клика по элементу кликаем по кнопке "Далее"
          await page.waitForSelector('#btnNext_formWizard', { timeout: 100 });
          await page.click('#btnNext_formWizard');
          console.log('Клик выполнен по кнопке "Далее"');
          break; // Прерываем цикл после успешного клика
        }
      }
    } catch (err) {
      if (err.message.includes('Execution context was destroyed')) {
        console.log('Навигация произошла, перезагружаем страницу и продолжаем проверку...');
        await page.reload({ waitUntil: 'networkidle0' });
        setTimeout(checkForAvailableSlot, 100); // Перезапуск функции проверки после перезагрузки страницы
      } else {
        console.error('Ошибка при выполнении скрипта:', err.message);
      }
    }
  }

  // Запускаем проверку
  checkForAvailableSlot();

  // Закрытие браузера по желанию
  // await browser.close();
})();
