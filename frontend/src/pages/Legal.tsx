import React, { useState } from 'react';
import { Shield, Lock, Cookie, Scale, FileText, Mail, ChevronRight } from 'lucide-react';

const Section: React.FC<{ id: string; title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ id, title, icon, children }) => (
    <div id={id} className="mb-16 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="glass-card p-8 rounded-2xl border border-gray-800 text-gray-300 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const Legal = () => {
    const [activeSection, setActiveSection] = useState('terms');

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navItems = [
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <Lock className="w-4 h-4" /> },
        { id: 'cookies', label: 'Cookie Policy', icon: <Cookie className="w-4 h-4" /> },
        { id: 'conduct', label: 'Code of Conduct', icon: <Scale className="w-4 h-4" /> },
        { id: 'disclaimer', label: 'Disclaimer', icon: <Shield className="w-4 h-4" /> },
        { id: 'contact', label: 'Contact Us', icon: <Mail className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-950 pt-24 pb-20 relative">
            {/* Background decoration */}
            <div className="fixed top-20 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Navigation */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-28 space-y-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Legal Center</h3>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeSection === item.id
                                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    {item.label}
                                </div>
                                {activeSection === item.id && <ChevronRight className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* content Area */}
                <div className="lg:col-span-3">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Legal & Privacy</h1>
                        <p className="text-gray-400 text-lg">Transparency is key to our relationship with you.</p>
                    </div>

                    <Section id="terms" title="Terms & Conditions" icon={<FileText className="w-6 h-6" />}>
                        <p>Welcome to CodeHive. By accessing our platform, you agree to these terms.</p>
                        <h3 className="text-white font-semibold mt-4">1. Usage License</h3>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on CodeHive's website for personal, non-commercial transitory viewing only.</p>
                        <h3 className="text-white font-semibold mt-4">2. Disclaimer</h3>
                        <p>The materials on CodeHive's website are provided on an 'as is' basis. CodeHive makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </Section>

                    <Section id="privacy" title="Privacy Policy" icon={<Lock className="w-6 h-6" />}>
                        <p>Your privacy is important to us. It is CodeHive's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                        <h3 className="text-white font-semibold mt-4">Information We Collect</h3>
                        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
                    </Section>

                    <Section id="cookies" title="Cookie Policy" icon={<Cookie className="w-6 h-6" />}>
                        <p>We use cookies to help us improve, promote, and protect our services. By continuing to use the site, you agree to our use of cookies.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Essential Cookies:</strong> Required to enable core site functionality.</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how you use our site.</li>
                            <li><strong>Marketing Cookies:</strong> specific to your interests.</li>
                        </ul>
                    </Section>

                    <Section id="conduct" title="Code of Conduct" icon={<Scale className="w-6 h-6" />}>
                        <p>CodeHive is dedicated to providing a harassment-free experience for everyone, regardless of gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, age, or religion.</p>
                        <p>We do not tolerate harassment of participants in any form. Sexual language and imagery is not appropriate for any venue, including talks, workshops, parties, Twitter and other online media.</p>
                        <p>Participants violating these rules may be sanctioned or expelled from the platform at the discretion of the organizers.</p>
                    </Section>

                    <Section id="disclaimer" title="Disclaimer" icon={<Shield className="w-6 h-6" />}>
                        <p>The code and solutions provided on this platform are for educational purposes only. While we strive for accuracy, we cannot guarantee that all content is free from errors.</p>
                        <p>CodeHive is not responsible for any damages arising from the use of this website or the information contained herein.</p>
                    </Section>

                    <Section id="contact" title="Contact Us" icon={<Mail className="w-6 h-6" />}>
                        <p>If you have any questions about these Terms, please contact us for legal queries.</p>
                        <div className="mt-6 flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Legal Inquiries</p>
                                <a href="mailto:codehive.auth@gmail.com" className="text-white font-medium hover:text-amber-400 transition-colors">
                                    codehive.auth@gmail.com
                                </a>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default Legal;
