import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { createDodoWebhookHandler } from "@dodopayments/convex";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onSubscriptionActive: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionActive, {
        clerkUserId: (payload.data as any).metadata?.clerkUserId,
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        productId: payload.data.product_id ?? undefined,
        status: payload.data.status,
        currentPeriodEnd: payload.data.next_billing_date
          ? new Date(payload.data.next_billing_date).toISOString()
          : undefined,
      });
    },

    onSubscriptionRenewed: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        productId: payload.data.product_id ?? undefined,
        status: payload.data.status,
        currentPeriodEnd: payload.data.next_billing_date
          ? new Date(payload.data.next_billing_date).toISOString()
          : undefined,
      });
    },

    onSubscriptionPlanChanged: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        productId: payload.data.product_id ?? undefined,
        status: payload.data.status,
        currentPeriodEnd: payload.data.next_billing_date
          ? new Date(payload.data.next_billing_date).toISOString()
          : undefined,
      });
    },

    onSubscriptionCancelled: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        status: payload.data.status,
        currentPeriodEnd: payload.data.next_billing_date
          ? new Date(payload.data.next_billing_date).toISOString()
          : undefined,
      });
    },

    onSubscriptionOnHold: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        status: payload.data.status,
      });
    },

    onSubscriptionFailed: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        status: payload.data.status,
      });
    },

    onSubscriptionExpired: async (ctx, payload) => {
      await ctx.runMutation(internal.webhooks.onSubscriptionUpdated, {
        dodoCustomerId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        status: payload.data.status,
      });
    },
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
