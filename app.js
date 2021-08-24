const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');

const download = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    http.get(url, response => {
        response.pipe(file);
    
        file.on('finish', () => {
            file.close(resolve(true));
        });
    }).on('error', error => {
    fs.unlink(destination);

    reject(error.message);
    });
});

async function anjuke() {
    //创建一个Browser浏览器实例，并设置相关参数
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    //创建一个Page实例
    const page = await browser.newPage();
    /*打开安居客首页
    waitUntil:代表什么时候才认为导航加载成功
    networkidle0: 在 500ms 内没有网络连接时就算成功(全部的request结束),才认为导航结束
    networkidle2: 500ms 内有不超过 2 个网络连接时就算成功(还有两个以下的request),就认为导航完成。
*/
    await page.goto('http://wyant.optics.arizona.edu/psfMtfZernikes/psfMtfZernikes.htm', {
        waitUntil: 'networkidle2'
    });
    //找到页面所有的iframe并打印出iframe链接，frame.url()获取frame的url
    await page.frames().map(frame => {
        console.log(frame.url())
    });
    const targetFrameUrl = 'http://wyant.optics.arizona.edu/webMathematica/myprograms/psfMtfZernikes/psfMtfZernikesform.jsp';
    //找到要定位的iframe页面
    const frame = await page.frames().find(frame => frame.url().includes(targetFrameUrl));

    const picname = []
    //在定位的iframe页面内操作
    for (i = 0; i < 36; i++) { 
        const znclass = 'input[name="z'+i+'"]'
        const num = Math.random()
        // picname = picname + '_' + num.toString()
        picname.push(num.toFixed(1).toString())
        // const num = 0
        // let searchInput = await page.$('input[name="z'+i+'"]');
        // await searchInput.clear();
        await frame.click(znclass,{clickCount: 3});
        await frame.type(znclass,num.toFixed(1))
     }
    console.log(picname) 

    await frame.click('input[name="submit"]')
    await new Promise(r => setTimeout(r, 3000));
    const targetPicUrl = 'http://wyant.optics.arizona.edu/webMathematica/myprograms/psfMtfZernikes/psfMtfZernikesbottom.jsp';
    //找到要定位的iframe页面
    const Picframe = await page.frames().find(frame => frame.url().includes(targetPicUrl));

    const images = await Picframe.evaluate(() => Array.from(document.images, e => e.src));
    console.log(images)
    
    //const result = await download(images[3], `${picname}.png`);
    const result = await download(images[2], `${picname.toString()}.png`);
    if (result === true) {
    console.log('Success:', images[2], 'has been downloaded successfully.');
    } else {
    console.log('Error:', images[2], 'was not downloaded.');
    console.error(result);
    }

}


anjuke();