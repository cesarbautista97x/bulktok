'use client'

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-8">Refund Policy</h1>

                    <div className="prose prose-neutral max-w-none">
                        <p className="text-sm text-neutral-500 mb-8">Last Updated: December 8, 2024</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. General Policy</h2>
                            <p className="text-neutral-700 mb-4">
                                BulkTok operates on a subscription basis. Due to the nature of our service (automated video generation),
                                we generally do not offer refunds once a subscription period has begun.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Cancellation</h2>
                            <p className="text-neutral-700 mb-4">
                                You can cancel your subscription at any time from your Account page. Upon cancellation:
                            </p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li>You will retain access until the end of your current billing period</li>
                                <li>No further charges will be made</li>
                                <li>No refund will be issued for the current billing period</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Exceptions</h2>
                            <p className="text-neutral-700 mb-4">We may issue refunds in the following cases:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li><strong>Technical Issues:</strong> If the Service is unavailable for more than 48 consecutive hours due to our fault</li>
                                <li><strong>Billing Errors:</strong> If you were charged incorrectly or multiple times</li>
                                <li><strong>First-Time Subscribers:</strong> Within 7 days of first subscription if you've generated fewer than 10 videos</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. How to Request a Refund</h2>
                            <p className="text-neutral-700 mb-4">
                                To request a refund, please contact us at <a href="mailto:cesarbautista97x@gmail.com" className="text-primary-600 hover:underline">cesarbautista97x@gmail.com</a> with:
                            </p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li>Your account email</li>
                                <li>Reason for refund request</li>
                                <li>Date of charge</li>
                            </ul>
                            <p className="text-neutral-700 mb-4">
                                We will review your request and respond within 3-5 business days.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Refund Processing</h2>
                            <p className="text-neutral-700 mb-4">
                                If approved, refunds will be processed to the original payment method within 5-10 business days.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Chargebacks</h2>
                            <p className="text-neutral-700 mb-4">
                                If you file a chargeback with your bank instead of contacting us first, your account will be immediately suspended.
                                Please contact us first to resolve any billing issues.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Promotional Offers</h2>
                            <p className="text-neutral-700 mb-4">
                                Special promotional offers (such as the December 300 videos promotion) are subject to their own terms and may not be eligible for refunds.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Contact</h2>
                            <p className="text-neutral-700">
                                For refund requests or questions, contact: <a href="mailto:cesarbautista97x@gmail.com" className="text-primary-600 hover:underline">cesarbautista97x@gmail.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
