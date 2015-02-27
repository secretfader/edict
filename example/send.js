var path  = require('path')
,   edict = require('../');

edict.configure({
  views: path.join(__dirname, 'views')
});

edict.connect('Mandrill', {
  auth: {
    user: 'xxxxxx',
    pass: 'xxxxxx'
  }
});

edict.send('user/welcome.html', {
  to: 'Nicholas Young <nicholas@example.com>',
  from: 'Mixdown <support@example.com>',
  name: 'Nicholas',
  subject: 'Go Go Go'
}).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.error(err);
});
