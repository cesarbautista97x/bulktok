'use client'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-neutral max-w-none">
                        <p className="text-sm text-neutral-500 mb-8">Last Updated: December 8, 2024</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Information We Collect</h2>
                            <p className="text-neutral-700 mb-4">We collect the following information:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li><strong>Account Information:</strong> Email address, password (encrypted)</li>
                                <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store credit card details)</li>
                                <li><strong>API Keys:</strong> Your Hedra API key (encrypted in our database)</li>
                                <li><strong>Usage Data:</strong> Number of videos generated, subscription tier</li>
                                <li><strong>Security Data:</strong> IP addresses for security monitoring (API key changes)</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-neutral-700 mb-4">We use your information to:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li>Provide and maintain the Service</li>
                                <li>Process your subscription payments</li>
                                <li>Generate videos using your Hedra API key</li>
                                <li>Monitor for security issues and account sharing</li>
                                <li>Send important service updates</li>
                                <li>Improve our Service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Data Storage and Security</h2>
                            <p className="text-neutral-700 mb-4">
                                Your data is stored securely using Supabase (PostgreSQL database). API keys and passwords are encrypted.
                                We implement industry-standard security measures to protect your information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Third-Party Services</h2>
                            <p className="text-neutral-700 mb-4">We use the following third-party services:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li><strong>Stripe:</strong> Payment processing</li>
                                <li><strong>Supabase:</strong> Database and authentication</li>
                                <li><strong>Hedra:</strong> Video generation (using your API key)</li>
                                <li><strong>Vercel:</strong> Hosting</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Cookies and Tracking</h2>
                            <p className="text-neutral-700 mb-4">
                                We use essential cookies for authentication and session management. We do not use tracking cookies or sell your data to third parties.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Your Rights</h2>
                            <p className="text-neutral-700 mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside text-neutral-700 space-y-2 mb-4">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Export your data</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Data Retention</h2>
                            <p className="text-neutral-700 mb-4">
                                We retain your data for as long as your account is active. If you cancel your account, we will delete your data within 30 days,
                                except where required by law to retain it longer.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Children's Privacy</h2>
                            <p className="text-neutral-700 mb-4">
                                Our Service is not intended for users under 18 years of age. We do not knowingly collect information from children.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Changes to Privacy Policy</h2>
                            <p className="text-neutral-700 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
                                and updating the "Last Updated" date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Contact Us</h2>
                            <p className="text-neutral-700">
                                If you have questions about this Privacy Policy, please contact us at: <a href="mailto:cesarbautista97x@gmail.com" className="text-primary-600 hover:underline">cesarbautista97x@gmail.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
