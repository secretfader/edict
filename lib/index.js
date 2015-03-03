var path     = require('path')
,   mailer   = require('nodemailer')
,   convert  = require('nodemailer-html-to-text')
,   assign   = require('lodash.assign')
,   Promise  = require('bluebird')
,   cons     = require('consolidate');

class Edict {
  static configure (options) {
    options     = options || {};
    options.ext = options.ext || 'html';
    options.templateEngine = options.templateEngine || 'nunjucks';

    if ("function" !== typeof cons[options.templateEngine]) {
      throw new Error("unsupported template engine");
    }

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
      cons[self.options.templateEngine](template, context, function (err, html) {
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
