import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET || "vendorbridge-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  },
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "VendorBridge <noreply@vendorbridge.in>",
  },
};

export const isProd = config.nodeEnv === "production";
export default config;
