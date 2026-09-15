import { betterAuth, APIError, type BetterAuthOptions } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { getDatabase } from "./database.ts";
import { readAccountConfig } from "./config.ts";
import { deliverAccountMail } from "./mail.ts";

export function accountAuthOptions() {
  const config = readAccountConfig();
  if (config.mode !== "local") throw new Error("Local accounts have not been configured.");
  return {
    appName: "Modlock",
    baseURL: config.origin,
    secret: config.secret,
    database: getDatabase(),
    trustedOrigins: [config.origin],
    telemetry: { enabled: false },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 1800,
      sendResetPassword: async ({ user, url }) =>
        deliverAccountMail({ to: user.email, purpose: "reset", url }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) =>
        deliverAccountMail({ to: user.email, purpose: "verify", url }),
    },
    session: {
      expiresIn: 60 * 60 * 12,
      updateAge: 60 * 60,
      freshAge: 60 * 5,
      deferSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    user: { deleteUser: { enabled: true } },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (
          context.path === "/delete-user" &&
          (typeof context.body?.password !== "string" || !context.body.password)
        )
          throw new APIError("BAD_REQUEST", {
            message: "Confirm your current password to delete your account.",
          });
      }),
    },
    account: { accountLinking: { enabled: false } },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 8 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
      },
    },
    advanced: {
      cookiePrefix: "modlock",
      useSecureCookies: config.origin.startsWith("https:"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name = user.name.trim();
            if (
              name.length < 2 ||
              name.length > 50 ||
              /[\u0000-\u001f\u007f]/.test(name)
            )
              throw new APIError("BAD_REQUEST", {
                message: "Choose a display name between 2 and 50 characters.",
              });
            return { data: { ...user, name, image: null } };
          },
        },
        update: {
          before: async (user) => {
            if (
              user.name !== undefined &&
              (user.name.trim().length < 2 ||
                user.name.trim().length > 50 ||
                /[\u0000-\u001f\u007f]/.test(user.name))
            )
              throw new APIError("BAD_REQUEST", {
                message: "Choose a display name between 2 and 50 characters.",
              });
            return {
              data: {
                ...user,
                ...(user.name ? { name: user.name.trim() } : {}),
                image: null,
              },
            };
          },
        },
      },
    },
    plugins: [
      twoFactor({
        issuer: "Modlock",
        twoFactorCookieMaxAge: 300,
        skipVerificationOnEnable: false,
      }),
      nextCookies(),
    ],
  } satisfies BetterAuthOptions;
}
const createAuth = () => betterAuth(accountAuthOptions());
let instance: ReturnType<typeof createAuth> | undefined;
export const getAuth = () => (instance ??= createAuth());
export type AuthSession = Awaited<
  ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>
>;
