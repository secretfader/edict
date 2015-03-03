"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var path = require("path"),
    mailer = require("nodemailer"),
    convert = require("nodemailer-html-to-text"),
    nunjucks = require("nunjucks"),
    assign = require("lodash.assign"),
    Promise = require("bluebird");

var Edict = (function () {
  function Edict() {
    _classCallCheck(this, Edict);
  }

  _prototypeProperties(Edict, {
    configure: {
      value: function configure(options) {
        options = options || {};
        options.ext = options.ext || "html";

        if (Object.keys(options).length) this.options = options;

        nunjucks.configure(this.options.views, {});

        return this;
      },
      writable: true,
      configurable: true
    },
    connect: {
      value: function connect(service, options) {
        options = options || {};

        if ("string" === typeof service) {
          this.transport = mailer.createTransport({
            service: service,
            auth: options.auth
          });
        }

        if ("object" === typeof service) {
          if ("undefined" === typeof service.sendMail) {
            this.transport = mailer.createTransport(service);
          } else {
            this.transport = service;
          }
        }

        this.transport.use("compile", convert.htmlToText(options.text || {}));

        return this;
      },
      writable: true,
      configurable: true
    },
    send: {
      value: function send(template, options, done) {
        template = [template, this.options.ext].join(".");
        options = options || {};

        var self = this,
            context = assign({}, options);

        return new Promise(function (resolve, reject) {
          context.html = nunjucks.render(template, context);

          self.transport.sendMail(context, function (err, response) {
            if (err) return reject(err);
            resolve(response);
          });
        }).nodeify(done);
      },
      writable: true,
      configurable: true
    }
  });

  return Edict;
})();

;

Edict.options = {
  views: path.join(process.cwd(), "views")
};

module.exports = Edict;