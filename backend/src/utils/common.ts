/** @format */
import { promisify } from "util";
import crypto from "crypto";

export const randomInt = promisify(crypto.randomInt);

const validChars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.-{}+!\"#$%/()=?`;

const fn = (v: any) => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(v);
    }, 250);
  });
};

export const promisifyArray = (items: any) => {
  let actions = items.map(fn);
  return Promise.all(actions);
};

export const allowedFields = (obj: any, ...fields: any) => {
  let newObject: any = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

/**
 * Auto generate activation random 6 number
 */

export const randomCode = () => {
  const digits = 100000;
  return Math.floor(digits + Math.random() * 9000).toString();
};

export const randomChars = async (length = 12) => {
  let generatedText = "";
  for (let i = 0; i <= length; i++) {
    const randInt = parseInt((await randomInt(validChars.length)) as any);
    generatedText += validChars[randInt];
  }
  return generatedText;
};

export const accountNumber = () => {
  return Math.random().toString(35).substring(2, 7);
};

export const mpesaPhoneFormat = (phone: string) => {
  let phoneNumber = "";
  if (phone.startsWith("254")) {
    phoneNumber = phone;
  } else if (phone.startsWith("0")) {
    phoneNumber = phone.replace("0", "254");
  } else if (phone.startsWith("7")) {
    phoneNumber = "254" + phone;
  } else if (phone.startsWith("+")) {
    phoneNumber = phone.replace("+", "");
  } else if (phone.startsWith("+254")) {
    phoneNumber = phone.replace("+", "");
  }
  return phoneNumber;
};
