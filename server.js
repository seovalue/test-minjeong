const express = require('express');
const cors = require('cors');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const app = express();
app.use(cors());

app.get('/api/auction-data', async (req, res) => {
  let driver;

  try {
    // Chrome 옵션 설정
    const options = new chrome.Options();
    options.addArguments('--headless'); // 헤드리스 모드
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    // WebDriver 초기화
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // 페이지 로드
    await driver.get('https://aceauction.kr/search/calendar_list.php?page=1&acourt=212&office=7&ipdate1=2025-03-20&ipdate2=2025-03-20');
    
    // 테이블이 로드될 때까지 대기
    await driver.wait(until.elementLocated(By.css('.table_list')), 10000);

    // 데이터 추출
    const rows = await driver.findElements(By.css('.table_list tbody tr'));
    const auctionData = [];

    for (const row of rows) {
      const tds = await row.findElements(By.css('td'));
      
      if (tds.length > 0) {
        const caseNumber = await tds[3]?.getText() || '';
        const location = await tds[4]?.getText() || '';
        const price = await tds[5]?.getText() || '';

        if (caseNumber || location || price) {
          auctionData.push({
            caseNumber: caseNumber.trim(),
            location: location.trim(),
            price: price.trim()
          });
        }
      }
    }

    console.log('Crawled data:', auctionData);
    res.json(auctionData);

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message
    });
  } finally {
    // 브라우저 종료
    if (driver) {
      await driver.quit();
    }
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 