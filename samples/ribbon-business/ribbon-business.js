const Page = require('../../lib/page');
const pug = require('pug');
const fs = require('fs');

const header = fs.readFileSync('./header.html', 'utf-8');
const strip = pug.render(fs.readFileSync('./strip.pug', 'utf-8'), {});
const contentHome = pug.render(fs.readFileSync('./content-home.pug', 'utf-8'), {});
const contentPage1 = fs.readFileSync('./content-page1.pug', 'utf-8');

const myRibbonPage = new Page('ribbon', 'business', 'Sample Page', {
  gen: function() {
    return Promise.resolve(contentHome);
  }
});

myRibbonPage.setHeader(header);

myRibbonPage.setStrip(strip);

myRibbonPage.addPage({
  path: '/page1',
  gen: async function() {
    return Promise.resolve(pug.render(contentPage1, {name: 'Justin'}));
  },
  title: 'Page 1'
});

myRibbonPage.start();
