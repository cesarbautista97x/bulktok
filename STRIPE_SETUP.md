# BulkTok - Stripe Setup Guide

## Prerequisites
- Stripe account (https://stripe.com)
- Supabase configured and running

---

## Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a Stripe account
3. Complete verification (may take a few days for production)
4. For now, use **Test Mode** (toggle in top right)

---

## Step 2: Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the following (Test mode):
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

3. Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

---

## Step 3: Create Product and Price

### 3.1 Create Product

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name**: BulkTok Pro
   - **Description**: Generate up to 300 videos per month
   - **Pricing model**: Standard pricing
   - **Price**: $29.00
   - **Billing period**: Monthly
   - **Currency**: USD

3. Click **Save product**

### 3.2 Get Price ID

1. After creating, click on the product
2. In the **Pricing** section, you'll see a Price ID like `price_1Abc123...`
3. Copy this Price ID

4. Add to `.env.local`:
```env
STRIPE_PRICE_ID_PRO=price_your_price_id_here
```

---

## Step 4: Set Up Webhook

### 4.1 Install Stripe CLI (for local testing)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login
```

### 4.2 Forward Webhooks Locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret like `whsec_...`

Add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4.3 Production Webhook Setup

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to production environment variables

---

## Step 5: Test Payment Flow

### 5.1 Start Development Server

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5.2 Test Checkout

1. Go to `http://localhost:3000/account`
2. Click "Upgrade Now - $29/month"
3. You'll be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. You should be redirected back to `/account?success=true`
7. Verify subscription tier changed to "paid" in Supabase

### 5.3 Verify Webhook

Check Terminal 2 (Stripe CLI) for webhook events:
```
✔ Received event: checkout.session.completed
✔ Received event: customer.subscription.created
```

---

## Step 6: Test Subscription Management

### 6.1 View Subscription in Stripe

1. Go to Stripe Dashboard → **Customers**
2. Find your test customer
3. View subscription details

### 6.2 Cancel Subscription

1. In Stripe Dashboard, cancel the subscription
2. Webhook should fire: `customer.subscription.deleted`
3. Check Supabase - subscription_tier should change back to "free"

---

## Production Setup

### 1. Activate Live Mode

1. Complete Stripe verification
2. Switch to **Live mode** in Stripe Dashboard
3. Get live API keys from **Developers** → **API keys**
4. Create live product and price
5. Set up production webhook endpoint

### 2. Update Environment Variables

Production `.env`:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_PRICE_ID_PRO=price_your_live_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

---

## Troubleshooting

### Checkout session not creating
- Check API keys are correct
- Verify Price ID exists
- Check browser console for errors

### Webhook not receiving events
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Look for webhook errors in Stripe Dashboard → **Developers** → **Webhooks** → **Logs**

### Subscription not updating in Supabase
- Check webhook handler logs in your server
- Verify Supabase connection
- Check that customer ID matches in both systems

---

## Testing Checklist

- [ ] Can create checkout session
- [ ] Can complete test payment
- [ ] Webhook receives `checkout.session.completed`
- [ ] Subscription tier updates to "paid" in Supabase
- [ ] Can cancel subscription
- [ ] Subscription tier reverts to "free"
- [ ] Usage limits respect subscription tier

---

## Test Cards

Stripe provides test cards for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Full list: https://stripe.com/docs/testing
