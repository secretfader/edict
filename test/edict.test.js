var path      = require('path')
,   expect    = require('chai').expect
,   transport = require('nodemailer-mock-transport')()
,   edict     = require('../');

edict.configure({
  views: path.join(__dirname, 'support'),
  from: 'SaaS App <app@example.com>'
}).connect(transport);

describe('Edict', function () {
  describe('#configure', function () {
    it('should allow configuration of views path', function () {
      expect(edict.options.views).to.equal(path.join(__dirname, 'support'));
    });

    it('should allow configuration of sender name', function () {
      expect(edict.options.from).to.equal('SaaS App <app@example.com>');
    });
  });

  describe('#connect', function () {
    it('should accept a transport', function () {
      expect(edict.connect).to.be.a('function');
    });
  });

  describe('#send', function () {
    it('should send email', function (done) {
      var outgoing = edict.transport.transporter.sentMail;

      edict.send('hello', {
        to: 'Nicholas Young <nicholas@example.com>',
        name: 'Nicholas'
      }).then(function (response) {
        expect(outgoing.length).to.equal(1);
        expect(outgoing[0].data.to).to.equal('Nicholas Young <nicholas@example.com>');
        expect(outgoing[0].data.html).to.equal('Hi, Nicholas!\n');
        expect(outgoing[0].data.text).to.equal('Hi, Nicholas!');
        done();
      }).catch(done);
    });
  });
});
