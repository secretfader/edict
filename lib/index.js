var path     = require('path')
,   mailer   = require('nodemailer')
,   convert  = require('nodemailer-html-to-text')
,   assign   = require('lodash.assign')
,   Promise  = require('bluebird')
,   engines  = require('consolidate');

class Edict {
  static configure (options) {
    options        = options || {};
    options.ext    = options.ext || 'html';
    options.engine = options.engine || 'nunjucks';

    if ('function' !== typeof engines[options.engine]) {
      throw new Error('Please choose another template engine.');
    }

    this.render = engines[options.engine];

    if (Object.keys(options).length) this.options = options;

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
        this.transport = service;
      }
    }

    this.transport.use('compile',
      convert.htmlToText(options.text || {})
    );

    return this;
  }

  static send (template, options, done) {
    template = [template, this.options.ext].join('.');
    template = [this.options.views, template].join('/');
    options  = options || {};

    let self    = this
    ,   context = assign({}, options);

    return new Promise(function (resolve, reject) {
      self.render(template, context, function (err, html) {
        if (err) return reject(err);

        context.html = html;

        self.transport.sendMail(context, function (err, response) {
          if (err) return reject(err);
          resolve(response);
        });
      });
    }).nodeify(done);
  };
};

Edict.options = {
  views: path.join(process.cwd(), 'views')
};

module.exports = Edict;
