const Page = require('../../lib/page');
const pug = require('pug');
const fs = require('fs');
const path = require('path');

const header = fs.readFileSync('./header.html', 'utf-8');
const contentHome = pug.render(fs.readFileSync('./content-home.pug', 'utf-8'), {});
const contentPage1 = fs.readFileSync('./content-page1.pug', 'utf-8');

const myLeftPage = new Page('leftpane', 'forest', 'Sample Page', {
  gen: function() {
    return Promise.resolve(contentHome);
  }
}, true, [{webPath: '/images', filePath: path.join(__dirname, 'images')}]);

myLeftPage.setBgImage('body', '/images/leaves.jpg');

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
