/* eslint-disable @typescript-eslint/no-explicit-any */
import { SyncBank, User, Transaction } from "../models";

export const alphaNumericIncrementer = (str: any) => {
  if (str && str.length > 0) {
    let invNum = str.replace(/([^a-z0-9]+)/gi, "");
    invNum = invNum.toUpperCase();
    let index = invNum.length - 1;
    while (index >= 0) {
      if (invNum.substr(index, 1) === "9") {
        invNum = invNum.substr(0, index) + "0" + invNum.substr(index + 1);
      } else if (invNum.substr(index, 1) === "Z") {
        invNum = invNum.substr(0, index) + "A" + invNum.substr(index + 1);
      } else {
        const char = String.fromCharCode(invNum.charCodeAt(index) + 1);
        invNum = invNum.substr(0, index) + char + invNum.substr(index + 1);
        index = 0;
      }
      index--;
    }
    return invNum;
  } else {
    throw new Error("str cannot be empty");
  }
};

export const generateIncrementNumber = (preInvoiceNumber: any) => {
  if (!preInvoiceNumber) throw new Error("preInvoiceNumber cannot be empty");
  const array = preInvoiceNumber.split(/[_/:\-;\\]+/);
  const lastSegment = array.pop();
  const priorSegment = preInvoiceNumber.substr(
    0,
    preInvoiceNumber.indexOf(lastSegment)
  );
  const nextNumber = alphaNumericIncrementer(lastSegment);
  return priorSegment + nextNumber;
};

export const getNextTransaction = async (): Promise<string> => {
  //LVP-12/03/2022/00001
  const date = new Date();
  const initialTransactionId = `LVP-${date.getDay()}/${date.getMonth()}/${date.getFullYear()}/0000000`;
  let invoiceNumber;
  const transactions = await Transaction.find();
  if (transactions.length > 0) {
    invoiceNumber = transactions.at(-1)?.transaction_number;
  } else {
    invoiceNumber = initialTransactionId;
  }
  return generateIncrementNumber(invoiceNumber);
};

export const accountNumber = () => {
  return Math.random().toString(35).substring(2, 7);
};

export const syncBankTransfer = async (
  senderId: string,
  amount: number,
  recieverId: string
) => {
  const sender = await User.findById(senderId);

  const senderSyncBank: any = await SyncBank.findOne({
    user: sender?.id,
    async_bank_type: "user",
    is_active: true,
  });

  if (!senderSyncBank || !sender) {
    return {
      status_code: 404,
      message: `Account not available`,
    };
  }

  // receiver & check if found
  const receiver: any = await User.findById(recieverId);

  if (!receiver) {
    return {
      status_code: 404,
      message: `Account not available`,
    };
  }

  // receiver wallet check

  const receiverSyncBank: any = await SyncBank.findOne({
    user: receiver.id,
    async_bank_type: "user",
    is_active: true,
  });

  if (!receiverSyncBank || !receiver) {
    return {
      status_code: 404,
      message: `Receiver wallet is not active`,
    };
    // throw new BadRequestError(`Receiver wallet is not active`);
  }

  if (senderSyncBank?.amount_balance < amount) {
    return {
      status_code: 404,
      message: `You don't have enough balance to send ${amount}`,
    };
  }

  /**
   * SENDER
   * */
  // sender amount update

  await SyncBank.findByIdAndUpdate(
    senderSyncBank.id,
    {
      amount_out: senderSyncBank.amount_out - amount,
      amount_balance: senderSyncBank.amount_balance - amount,
    },
    { new: true }
  );

  const senderMsg = `Successfully transferred ${amount} to +${receiver.phone}`;
  await Transaction.create({
    user: sender.id,
    transactionId: await getNextTransaction(),
    amount: amount,
    transaction_type: "transfer",
    narations: senderMsg,
    phone: `+${receiver.phone}`,
    status: "success",
  });

  // receiver wallet  update
  await SyncBank.findByIdAndUpdate(
    receiverSyncBank.id,
    {
      amount_in: senderSyncBank?.amount_in + amount,
      amount_balance: senderSyncBank?.amount_balance + amount,
    },
    { new: true }
  );

  const receiverMsg = `Successfully recieved ${amount} from +${receiver.phone}`;
  // transfer transactions
  await Transaction.create({
    user: receiver.id,
    transactionId: await getNextTransaction(),
    amount: amount,
    transaction_type: "transfer",
    narations: receiverMsg,
    phone: `+${receiver.phone}`,
    status: "success",
  });

  return {
    status: "success",
    message: `Successfully transferred money to +${receiver.phone}`,
  };
};
