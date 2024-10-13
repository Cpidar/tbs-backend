/**
 * 
Step 1. Initiating Payment request

Step 2. Redirecting user to PhonePe Standard Checkout page

Step 3. Redirecting user to Merchant web page

Step 4. Status verification post redirection to merchant website

Step 5. Handling Payment Success, Pending and Failure

Step 6. Refund
 */

import {
  AbstractPaymentProcessor,
  Customer,
  isPaymentProcessorError,
  PaymentProcessorContext,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionStatus,
  Logger,
} from "@medusajs/medusa";

import { MedusaError } from "@medusajs/utils";
import MellatCheckout from 'mellat-checkout';

export type TransactionIdentifier = {
  merchantId: string;
  merchantTransactionId: string;
};

abstract class BehpardakhtPaymentService extends AbstractPaymentProcessor {
  static identifier = "behpardakht";

  protected readonly options_;
  protected behpardakht_;
  protected logger: Logger;
  static sequenceCount = 0;
  protected constructor(container: { logger: Logger }, options) {
    super(container as any, options);
    this.logger = container.logger;
    this.options_ = options;

    this.options_.callbackUrl = process.env.CALLBACKURL
    this.options_.apiUrl = process.env.BEHPARDAKHT_API_URL
    this.options_.terminalId = process.env.BEHPARDAKHT_TERMINALID
    this.options_.username = process.env.BEHPARDAKHT_USERNAME
    this.options_.password = process.env.BEHPARDAKHT_PASSWORD
    this.options_.timeout = process.env.BEHPARDAKHT_TIMEOUT

    // this.behpardakht_ = new MellatCheckout(this.options_);
    this.behpardakht_ = new MellatCheckout({
      terminalId: this.options_.terminalId || '7517617',
      username: this.options_.username || '7517617',
      password: this.options_.password || '32733567',
      timeout: +this.options_.timeout || 10000, // Optional, number in millisecond (defaults to 10 sec)
      apiUrl: this.options_.apiUrl || 'https://bpm.shaparak.ir/pgwchannel/services/pgw?wsdl', // Optional, exists (and may updated) in bank documentation (defaults to this)
    });
    this.init();
  }

  protected init(): void {

    this.behpardakht_.initialize().then(function () {
      console.log("Mellat client ready")
    })
      .catch(function (error) {
        // you can retry here
        console.log("Mellat client encountered error:", error)
      });
  }

  async verify({ orderId, saleOrderId, saleReferenceId }: {
    orderId: string
    saleOrderId: string
    saleReferenceId: string
  }) {
    this.behpardakht_.verifyPayment({
      orderId,
      saleOrderId,
      saleReferenceId
    }).then(function (response) {
      if (response.resCode === 0) {
        console.log("Verified, Call settlePayment");
        this.settlePayment({ orderId, saleOrderId, saleReferenceId })
      } else {
        console.warn('Gateway Error: ', response.resCode);
      }
    }).catch(function (error) {
      console.error(error);
    });
  }

  async settlePayment({ orderId, saleOrderId, saleReferenceId }: {
    orderId: number
    saleOrderId: number
    saleReferenceId: number
  }) {
    const { resCode } = await this.behpardakht_.settlePayment({
      orderId,
      saleOrderId,
      saleReferenceId,
    })

  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    console.log(paymentSessionData)
    const paymentId = paymentSessionData.id
    const resCode = paymentSessionData.resCode
    const status = paymentSessionData.status as PaymentSessionStatus
    if(resCode && resCode === 0) {
      return PaymentSessionStatus.AUTHORIZED
    } else {
      PaymentSessionStatus.PENDING
    }
    return status
  }

  async initiatePayment(
    context: PaymentProcessorContext
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    const {
      email,
      context: cart_context,
      currency_code,
      amount,
      resource_id,
      customer,
      paymentSessionData,
    } = context;

    console.log(resource_id)
    console.log(context.context)
    return {
      session_data: {
        status: PaymentSessionStatus.AUTHORIZED
      }
    }

    // try {
    //   // let response;
    //   this.logger.info(amount)
    //   this.logger.info(
    //     "payment session data: " + JSON.stringify(paymentSessionData)
    //   );
    //   // if (paymentSessionData.readyToPay) {
    //   const response = await this.behpardakht_.paymentRequest({
    //     amount: `${amount}`,
    //     orderId: Date.now(),
    //     callbackUrl: this.options_.callbackUrl || 'http://localhost:8000/callback',
    //   });

    //   if (this.options_.enabledDebugLogging) {
    //     this.logger.info(`response from behpardakht: ${JSON.stringify(response)}`);
    //   }
    //   if (response.resCode === 0) {

    //     const result: PaymentProcessorSessionResponse = {
    //       session_data: {
    //         ...response,
    //         customer,
    //       }
    //     }

    //     return result;
    //   } else {
    //     const result: PaymentProcessorSessionResponse = {
    //       session_data: {
    //         ...response,
    //         customer,
    //       }
    //     }

    //     this.logger.info(`response from behpardakht: ${response.resCode}`)
    //     return result;
    //   }
    //   // }
    // } catch (error) {
    //   this.logger.error(`error from behpardakht: ${JSON.stringify(error)}`);
    //   const e = error as Error;
    //   // return this.buildError("initialization error", e);
    // }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProcessorError
    | {
      status: PaymentSessionStatus;
      data: PaymentProcessorSessionResponse["session_data"];
    }
  > {
    const status = paymentSessionData.status as PaymentSessionStatus
    return { data: paymentSessionData, status }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
  > {

    return paymentSessionData
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
  > {
    return paymentSessionData;
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
  > {
    return await this.cancelPayment(paymentSessionData);
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
  > {
    return paymentSessionData;
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
  > {
    return paymentSessionData;
  }

  async updatePayment(
    context: PaymentProcessorContext
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse | void> {
    /** phonepe doesn't allow you to update an ongoing payment, you need to initiate new one */
    /* if (phonepeId !== (paymentSessionData.customer as Customer).id) {*/
    this.logger.info(
      `update request context from medusa: ${JSON.stringify(context)}`
    );
    console.log(context.paymentSessionData)
    console.log(context.context)
    const result = await this.initiatePayment(context);
    return result;
  }

  async updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<any> {
    console.log(data)
    if (data.amount) {
      return await this.initiatePayment(
        data as unknown as PaymentProcessorContext
      );
    } else {
      return data as any;
      /* return this.buildError(
    "unsupported by PhonePe",
    new Error("unable to update payment data")
  );*/
    }

  }


}

export default BehpardakhtPaymentService;