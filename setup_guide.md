# Production Integration Setup Guide

Follow these steps to obtain the necessary API keys and credentials for Google OAuth, Razorpay, and Resend.

---

## 1. Google OAuth (Sign-In)

1.  **Google Cloud Console**: Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create Project**: Create a new project named "Filora Luxe".
3.  **APIs & Services**: Go to "APIs & Services" > "OAuth consent screen".
    *   Choose **External**.
    *   Fill in App Name ("Filora Luxe") and User support email.
    *   Add the domain `supabase.co` (if using Supabase) to authorized domains.
4.  **Credentials**: Go to "Credentials" > "Create Credentials" > "OAuth client ID".
    *   Application type: **Web application**.
    *   **Authorized redirect URIs**: Copy the "Callback URL" from your Supabase Dashboard (**Authentication > Providers > Google**).
5.  **Save**: Copy the **Client ID** and **Client Secret**.
6.  **Supabase Console**:
    *   Go to **Authentication > Providers**.
    *   Enable **Google**.
    *   Paste the Client ID and Client Secret.

---

## 2. Razorpay (Payment Gateway)

1.  **Razorpay Dashboard**: Sign up or log in at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  **Test Mode**: Ensure you are in "Test Mode" for initial development.
3.  **Settings**: Go to **Settings > API Keys**.
4.  **Generate Key**: Click "Generate Key".
5.  **Save**: Download and save your **Key ID** and **Key Secret**.
    *   **Note**: Key ID usually starts with `rzp_test_`.

---

## 3. Resend (Email Notifications)

1.  **Resend Dashboard**: Sign up at [Resend.com](https://resend.com/).
2.  **API Keys**: Go to the **API Keys** section.
3.  **Create Key**: Click "Create API Key".
    *   Name it "Filora Luxe Production".
    *   Permission: "Full Access".
4.  **Save**: Copy your **API Key**.
5.  **Domains (Optional but Recommended)**: Add and verify your domain (e.g., `filoraluxe.com`) to avoid "via resend.com" in the sender address.

---

# Resend Email Delivery Setup (IMPORTANT)

To send emails from `orders@filoraluxe.in`, follow these steps:

1.  **Resend Dashboard**: Go to **Domains > Add New Domain**.
2.  **Enter Domain**: Input `filoraluxe.in` and select your region (e.g., US-East-1).
3.  **DNS Records**: Resend will provide 3 DNS records (DKIM and SPF). 
    *   Log in to your domain registrar (e.g., GoDaddy, Namecheap, or Vercel).
    *   Add these 3 **TXT** and **CNAME** records.
4.  **Verify**: Return to Resend and click **Verify**. 
5.  **Status**: Once verified, the status will change to "Verified" (Green).

> [!WARNING]
> If you do not verify the domain, Resend will only allow sending from `onboarding@resend.dev` to your own email. Production emails to customers will fail.

---

## Environment Variables (.env)

Add these to your Vercel Dashboard or local `.env` file:

```bash
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Resend Email
RESEND_API_KEY=re_...

# Google OAuth (Handled in Supabase Dashboard, but useful here if needed)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```
