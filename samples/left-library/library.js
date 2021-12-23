const LeftPage = require('../..//lib/left-page');

const myLeftPage = new LeftPage('library', 'Sample Page', {
  pugFile: './content-home.pug',
  gen: function() {
    return Promise.resolve({});
  }
});

myLeftPage.setHeader('./header.pug');

myLeftPage.addPage({
  path: '/page1',
  pugFile: './content-page1.pug',
  gen: async function() {
    return Promise.resolve({name: 'Justin'});
  },
  title: 'Page 1'
});

myLeftPage.addLink({
  url: '/page1',
  text: 'Page 1'
});

myLeftPage.start();
