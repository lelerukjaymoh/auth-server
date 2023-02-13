/** @format */

import nodemailer from "nodemailer";
import {config} from "../config";
// const smtpTransport = require("nodemailer-smtp-transport");
const hbs = require("nodemailer-express-handlebars");

interface messageOption {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  template: string;
  dynamic_template_data: any;
}
//https://github.com/googleapis/google-api-nodejs-client/issues/2418
const transporter = nodemailer.createTransport({
  host: "mail.kodeace.com",
  port: 26,
  secure: false,
  auth: {
    user: config.MAIL.USER,
    pass: config.MAIL.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const hbsOptions = {
  viewEngine: {
    extname: ".hbs", // handlebars extension
    layoutsDir: __dirname + "/../emails/layouts",
    partialsDir: __dirname + "/../emails/partials",
    defaultLayout: __dirname + "/../emails/layouts/index",
  },
  viewPath: __dirname + "/../emails",
};

const sendMail = async (msgOptions: messageOption) => {
  console.log(await transporter.verify());
  transporter.use("compile", hbs(hbsOptions));
  let mail = {
    from: "support@boom.dev",
    to: msgOptions.to,
    subject: msgOptions.subject,
    template: msgOptions.template,
    context: msgOptions.dynamic_template_data,
  };

  return await transporter.sendMail(mail);
};

export { sendMail };
