import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription, updateSubscription } from "@lemonsqueezy/lemonsqueezy.js";

// Configure LemonSqueezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error("LemonSqueezy error:", error),
});

// Plan variant IDs (you'll set these after creating products in LemonSqueezy)
export const PLAN_VARIANTS = {
  starter: process.env.LEMONSQUEEZY_VARIANT_STARTER!,
  pro: process.env.LEMONSQUEEZY_VARIANT_PRO!,
  agency: process.env.LEMONSQUEEZY_VARIANT_AGENCY!,
};

// Map variant ID to plan name
export function getPlanFromVariant(variantId: string): string {
  for (const [plan, id] of Object.entries(PLAN_VARIANTS)) {
    if (id === variantId) return plan;
  }
  return "free";
}

// Create checkout session
export async function createCheckoutSession(
  variantId: string,
  userId: string,
  email: string,
  orgId: string
) {
  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutData: {
        email,
        custom: {
          user_id: userId,
          org_id: orgId,
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=success`,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for subscribing to Knight!",
      },
    }
  );

  return checkout.data?.data.attributes.url;
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId);
  return subscription.data?.data;
}

// Cancel subscription
export async function cancelUserSubscription(subscriptionId: string) {
  return cancelSubscription(subscriptionId);
}

// Update subscription (plan change)
export async function updateUserSubscription(
  subscriptionId: string,
  variantId: number
) {
  return updateSubscription(subscriptionId, {
    variantId,
  });
}

// Check if subscription is active
export function isSubscriptionActive(subscription: any): boolean {
  const status = subscription?.attributes?.status;
  return status === "active" || status === "on_trial";
}
