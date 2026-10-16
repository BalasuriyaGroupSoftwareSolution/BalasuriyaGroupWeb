/**
 * Pluggable payment provider layer.
 *
 * BANK_DEPOSIT and KOKO are "manual" methods: the customer pays outside the
 * app (bank transfer, Koko wallet) and submits a reference, then staff
 * approve the payment in the finance dashboard once they've confirmed it
 * arrived — no external API needed for those two.
 *
 * CARD and GOOGLE_PAY need a real payment gateway account (e.g. a card
 * processor that supports Sri Lanka, such as PayHere or Stripe, plus a
 * Google Pay merchant ID). Until those credentials exist, these two return a
 * clear "not configured" error instead of silently pretending to charge a
 * card — replace the body of each function once the provider is chosen.
 */
export class PaymentProviderNotConfiguredError extends Error {
    constructor(method) {
        super(`${method} payments aren't configured yet. Add the provider's API keys ` +
            `to the backend .env and implement createPaymentIntent for this method ` +
            `in src/services/paymentProviders.ts.`);
    }
}
export async function createCardPaymentIntent(_amountLkr) {
    // TODO: integrate a card processor (e.g. PayHere or Stripe) once the
    // merchant account exists. Example shape for Stripe:
    //   const intent = await stripe.paymentIntents.create({ amount, currency });
    //   return { clientPayload: { clientSecret: intent.client_secret } };
    throw new PaymentProviderNotConfiguredError("Card");
}
export async function createGooglePayPaymentIntent(_amountLkr) {
    // TODO: integrate Google Pay via the chosen card processor's Google Pay
    // support once a Google Pay merchant ID is available.
    throw new PaymentProviderNotConfiguredError("Google Pay");
}
//# sourceMappingURL=paymentProviders.js.map