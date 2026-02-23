import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // @ts-expect-error - CLERK_JWT_ISSUER_DOMAIN is set at runtime
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
