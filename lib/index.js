var path     = require('path')
,   mailer   = require('nodemailer')
,   convert  = require('nodemailer-html-to-text')
,   nunjucks = require('nunjucks')
,   assign   = require('lodash.assign')
,   Promise  = require('bluebird');

class Edict {
  static configure (options) {
    options     = options || {};
    options.ext = options.ext || 'html';

    if (Object.keys(options).length) this.options = options;

    nunjucks.configure(this.options.views, {});

    return this;
  }

  static connect (service, options) {
    options = options || {};

    if ('string' === typeof service) {
      this.transport = mailer.createTransport({
        service: service,
        auth: options.auth
      });
    }

    if ('object' === typeof service) {
      if ('undefined' === typeof service.sendMail) {
        this.transport = mailer.createTransport(service);
      } else {
        this.transport = transport;
      }
    }

    this.transport.use('compile',
      convert.htmlToText(options.text || {})
    );

    return this;
  }

  static send (template, options, done) {
    template = [template, this.options.ext].join('.');
    options  = options || {};

    let self    = this
    ,   context = assign({}, options);

    return new Promise(function (resolve, reject) {
      context.html = nunjucks.render(template, context);

      self.transport.sendMail(context, function (err, response) {
        if (err) return reject(err);
        resolve(response);
      })
    }).nodeify(done);
  };
};

Edict.options = {
  views: path.join(process.cwd(), 'views')
};

module.exports = Edict;
