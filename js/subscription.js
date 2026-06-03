// ============================================
// LexisAI — Subscription & Payment System
// Supports: bKash (BDT), Stripe (USD)
// ============================================

const Subscription = {
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      priceUSD: 0,
      priceBDT: 0,
      period: 'forever',
      features: {
        dailyExercises: 3,
        advancedAnalysis: false,
        allGames: false,
        voiceRecording: false,
        prioritySupport: false,
        personalizedCurriculum: false,
        exportReports: false
      }
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly',
      priceUSD: 9.99,
      priceBDT: 899,
      period: 'month',
      features: {
        dailyExercises: Infinity,
        advancedAnalysis: true,
        allGames: true,
        voiceRecording: true,
        prioritySupport: true,
        personalizedCurriculum: false,
        exportReports: false
      }
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly',
      priceUSD: 79.99,
      priceBDT: 7199,
      period: 'year',
      features: {
        dailyExercises: Infinity,
        advancedAnalysis: true,
        allGames: true,
        voiceRecording: true,
        prioritySupport: true,
        personalizedCurriculum: true,
        exportReports: true
      }
    }
  },

  currency: 'USD', // or 'BDT' for bKash

  setCurrency(currency) {
    this.currency = currency;
    localStorage.setItem('lexisai_currency', currency);
  },

  getCurrency() {
    return localStorage.getItem('lexisai_currency') || 'USD';
  },

  getPrice(planId) {
    const plan = this.plans[planId];
    if (!plan) return 0;
    return this.getCurrency() === 'BDT' ? plan.priceBDT : plan.priceUSD;
  },

  formatPrice(amount, currency) {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('bn-BD')}`;
    }
    return `$${amount.toFixed(2)}`;
  },

  getCurrentPlan() {
    const profile = Auth.userProfile;
    if (!profile) return this.plans.free;
    return this.plans[profile.subscription_status] || this.plans.free;
  },

  hasFeature(feature) {
    const plan = this.getCurrentPlan();
    return plan.features[feature] || false;
  },

  canDoExercise() {
    const plan = this.getCurrentPlan();
    if (plan.features.dailyExercises === Infinity) return true;
    
    const profile = Auth.userProfile;
    if (!profile) return false;

    const today = new Date().toISOString().split('T')[0];
    if (profile.last_exercise_date !== today) return true;

    return (profile.daily_exercises_used || 0) < plan.features.dailyExercises;
  },

  // bKash Payment Integration
  async initiateBkashPayment(planId) {
    const plan = this.plans[planId];
    if (!plan) return { error: 'Invalid plan' };

    // bKash payment requires a backend API to create payment
    // This is the frontend flow - you'll need a backend endpoint
    const paymentData = {
      amount: plan.priceBDT,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: `LEXIS-${Date.now()}`,
      planId: planId
    };

    try {
      // Call your backend API to create bKash payment
      // Replace with your actual backend endpoint
      const response = await fetch('/api/bkash/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.paymentID) {
        // Redirect to bKash payment page
        window.location.href = `https://checkout.pay.bka.sh/v1.2.0-beta/payment/pay?paymentID=${data.paymentID}`;
      }

      return data;
    } catch (e) {
      console.error('bKash payment error:', e);
      return { error: 'Payment initialization failed' };
    }
  },

  // Stripe Payment Integration (USD)
  async initiateStripePayment(planId) {
    const plan = this.plans[planId];
    if (!plan) return { error: 'Invalid plan' };

    try {
      // Call your backend to create Stripe checkout session
      const response = await fetch('/api/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId,
          amount: plan.priceUSD,
          currency: 'usd',
          userId: Auth.currentUser?.id
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }

      return data;
    } catch (e) {
      console.error('Stripe payment error:', e);
      return { error: 'Payment initialization failed' };
    }
  },

  // Developer mode: Activate premium for free
  activateDevPremium() {
    const profile = Auth.userProfile;
    if (!profile) return;

    // This is for development/testing only
    Auth.updateUserProfile({
      subscription_status: 'yearly'
    });
    
    alert('Developer premium activated! 🛠️');
    window.location.reload();
  },

  // Verify subscription after payment callback
  async verifySubscription(paymentId, planId) {
    const client = getSupabase();
    if (!client || !Auth.currentUser) return;

    const now = new Date();
    const expiresAt = planId === 'monthly'
      ? new Date(now.setMonth(now.getMonth() + 1))
      : new Date(now.setFullYear(now.getFullYear() + 1));

    try {
      // Update user subscription status
      await Auth.updateUserProfile({
        subscription_status: planId
      });

      // Create subscription record
      await client.from('subscriptions').insert({
        user_id: Auth.currentUser.id,
        plan: planId,
        payment_id: paymentId,
        amount: this.getPrice(planId),
        currency: this.getCurrency(),
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Check if subscription is still active
  async checkSubscriptionStatus() {
    const client = getSupabase();
    if (!client || !Auth.currentUser) return;

    try {
      const { data } = await client
        .from('subscriptions')
        .select('*')
        .eq('user_id', Auth.currentUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && new Date(data.expires_at) < new Date()) {
        // Subscription expired
        await Auth.updateUserProfile({ subscription_status: 'free' });
        await client.from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', data.id);
        return { active: false, expired: true };
      }

      return { active: !!data, subscription: data };
    } catch (e) {
      return { active: false, error: e.message };
    }
  }
};
