const Page = require('../../lib/page');
const pug = require('pug');
const fs = require('fs');
const path = require('path');

const header = fs.readFileSync(path.join(__dirname, 'header.html'), 'utf-8');
const contentHome = pug.render(fs.readFileSync(path.join(__dirname, 'content-home.pug'), 'utf-8'), {});
const contentPage1 = fs.readFileSync(path.join(__dirname, 'content-page1.pug'), 'utf-8');

const myLeftPage = new Page('leftpane', 'news', 'Sample Page', {
  gen: function() {
    return Promise.resolve(contentHome);
  }
}, true, [
  {
    webPath: '/content/images',
    filePath: path.join(__dirname, 'images')
  }
]);

myLeftPage.setHeader(header);

myLeftPage.addPage({
  path: '/page1',
  gen: async function() {
    return Promise.resolve(pug.render(contentPage1, {name: 'Justin'}));
  },
  title: 'Page 1'
});

myLeftPage.addLink({
  url: '/page1',
  text: 'Page 1'
});

myLeftPage.start();
