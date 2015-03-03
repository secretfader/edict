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
      convert.htmlToText(this.options.text || {})
    );

    return this;
  }

  static prepare (template, options) {
    options = options || {};

    let self    = this
    ,   context = assign({}, options)
    ,   src;

    src = [
      path.join(this.options.views, template),
      this.options.ext
    ].join('.');

    return new Promise(function (resolve, reject) {
      engines[self.options.engine](src, context, function (err, data) {
        if (err) return reject(err);
        resolve([context, data, self.transport]);
      });
    });
  }

  static transmit (context, rendered, transport) {
    context.html = rendered;
    return new Promise(function (resolve, reject) {
      transport.sendMail(context, function (err, response) {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  static send (template, options, done) {
    return this.prepare(template, options)
           .spread(this.transmit).nodeify(done);
  };
};

Edict.options = {
  views: path.join(process.cwd(), 'views')
};

module.exports = Edict;
