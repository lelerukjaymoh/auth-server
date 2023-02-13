import Mpesa from "mpesa-node";

// interfaces

export interface STKData {
  phone: string;
  amount: string;
  callbackURl: string;
  accountNumber: string;
}

export interface InitializeData {
  checkoutId: string;
  accountNumber: string;
  type: string;
  amount: number;
  phone: string;
}
// end of interfaces

export class MpesaWrapper {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  initiatorName: string;
  lipaNaMpesaShortCode: string;
  lipaNaMpesaShortPass: string;

  mpesa: Mpesa;

  constructor({
    consumerKey,
    consumerSecret,
    shortCode,
    initiatorName,
    lipaNaMpesaShortCode,
    lipaNaMpesaShortPass,
  }: {
    consumerKey: string;
    consumerSecret: string;
    shortCode: string;
    initiatorName: string;
    lipaNaMpesaShortCode: string;
    lipaNaMpesaShortPass: string;
  }) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.shortCode = shortCode;
    this.initiatorName = initiatorName;
    this.lipaNaMpesaShortCode = lipaNaMpesaShortCode;
    this.lipaNaMpesaShortPass = lipaNaMpesaShortPass;

    this.mpesa = new Mpesa({
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      shortCode: shortCode,
      initiatorName: initiatorName,
      lipaNaMpesaShortCode: lipaNaMpesaShortCode,
      lipaNaMpesaShortPass: lipaNaMpesaShortPass,
    });
  }
  /**
   * It enables user to be to initial mpesa STK push process with phone number and specified amount
   * @param stkData This is a request body composed of {
   * phone:  string;
   * amount: string;
   * callbackURl: string;
   * accountNumber: string;
   * }
   * @returns
   */
  async initiateStkPush(stkData: STKData) {
    const response = await this.mpesa
      .lipaNaMpesaOnline(
        stkData.phone,
        parseFloat(stkData.amount),
        stkData.callbackURl,
        stkData.accountNumber
      )
      .catch((e: any) => {
        console.log(e);
        return e["response"];
      });

    console.log(`STK PUSH: ${stkData.accountNumber}` + response.data);

    const data = {
      checkoutId: response.data.CheckoutRequestID,
      accountNumber: stkData.accountNumber,
      type: "income",
      amount: stkData.amount,
      phone: stkData.phone,
    };

    if (!data["checkoutId"]) {
      return {
        error: "Could not initiate payment. Try again!",
      };
    }
    return data; // save this response to database
  }
  /**
   * Receives a response from mpesa and returns a response object
   * @param stkPayload
   * @returns
   */
  receiveMpesaPayloadFromCallbackURL = async (
    stkPayload: any
  ): Promise<
    | {
        phone: string;
        amount: string;
        transactionId: string;
        moreData: any;
        checkoutId: string;
      }
    | { data: null }
  > => {
    const resultDesc =
      stkPayload["Body"]["stkCallback"]["ResultDesc"].toString();
    console.log(resultDesc);

    const status = resultDesc.search(/]/)
      ? resultDesc.substr(resultDesc.search(/]/) + 1)
      : resultDesc;

    const checkoutId = stkPayload["Body"]["stkCallback"]["CheckoutRequestID"];

    // [STK_CB - ]SMSC ACK timeout, [STK_CB - ]DS timeout, [STK_CB - ]Request cancelled by user
    // The service request is processed successfully.

    let message = null;

    switch (status) {
      case "DS timeout":
        message = `Request failed. MPesa didn't respond. Try again in 5 seconds.`;
        break;

      case "SMSC ACK timeout":
        message =
          "Request failed. You did not respond, may be your phone is not reachable.";
        break;

      case "Request cancelled by user":
        message = "Request cancelled. You cancelled request. Try again.";
        break;

      case "The balance is insufficient for the transaction":
        message = "The balance is insufficient for the transaction. Try again.";
        break;

      case "The service request is processed successfully.":
        message = "Request successful. Transaction has been processed.";
        break;
      default:
        break;
    }

    console.log(message);

    if (!status.includes("successful")) {
      /**
       *  delete referred transaction, using checkoutId
       *  send notification using MQTT
       *
       */
      return {
        data: null,
      };
    }

    const data = stkPayload["Body"]["stkCallback"]["CallbackMetadata"]["Item"];

    return {
      amount: data.find((a: any) => a.Name === "Amount").Value,
      phone: data.find((a: any) => a.Name === "PhoneNumber").Value,
      transactionId: data.find((a: any) => a.Name === "MpesaReceiptNumber")
        .Value,
      checkoutId,
      moreData: data,
    };
  };
}
