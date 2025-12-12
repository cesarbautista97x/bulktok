'use client'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-neutral max-w-none">
                        <p className="text-sm text-neutral-500 mb-8">Last Updated: December 8, 2024</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-neutral-700 mb-4">
                                By accessing and using BulkTok ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Description of Service</h2>
                            <p className="text-neutral-700 mb-4">
                                BulkTok provides automated video generation services using third-party APIs (Hedra). The Service allows users to upload audio and image files to generate videos in bulk.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. User Responsibilities</h2>
                            <p className="text-neutral-700 mb-4">You agree to:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li>Provide accurate account information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Use your own Hedra API key for video generation</li>
                                <li>Not share your account with others</li>
                                <li>Use the Service only for lawful purposes</li>
                                <li>Not upload content that infringes on intellectual property rights</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Subscription and Billing</h2>
                            <p className="text-neutral-700 mb-4">
                                Subscriptions are billed monthly. You can cancel at any time, and you'll retain access until the end of your billing period.
                                Video generation limits are based on your subscription tier and reset monthly.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. API Key Requirements</h2>
                            <p className="text-neutral-700 mb-4">
                                You must provide your own Hedra API key to use the video generation features. BulkTok is not responsible for costs incurred through your Hedra API usage.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Limitation of Liability</h2>
                            <p className="text-neutral-700 mb-4">
                                BulkTok is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use or inability to use the Service,
                                including but not limited to failed video generations, API errors, or data loss.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Termination</h2>
                            <p className="text-neutral-700 mb-4">
                                We reserve the right to terminate or suspend access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Changes to Terms</h2>
                            <p className="text-neutral-700 mb-4">
                                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Contact</h2>
                            <p className="text-neutral-700">
                                For questions about these Terms, please contact us at: <a href="mailto:nc.nowccom@gmail.com" className="text-primary-600 hover:underline">nc.nowccom@gmail.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div >
    )
}
