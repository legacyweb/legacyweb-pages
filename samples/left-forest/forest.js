const LeftPage = require('../../lib/left-page');
const pug = require('pug');
const fs = require('fs');

const header = fs.readFileSync('./header.html', 'utf-8');
const contentHome = pug.render(fs.readFileSync('./content-home.pug', 'utf-8'), {});
const contentPage1 = fs.readFileSync('./content-page1.pug', 'utf-8');

const myLeftPage = new LeftPage('forest', 'Sample Page', {
  gen: function() {
    return Promise.resolve(contentHome);
  }
});

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
