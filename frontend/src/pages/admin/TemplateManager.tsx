import React, { useEffect, useState } from 'react';
import { Save, Loader2, Code as CodeIcon } from 'lucide-react';

interface Template {
    id?: number;
    language: string;
    starter_code: string;
    wrapper_code: string;
}

interface TemplateManagerProps {
    problemId: string;
}

const LANGUAGES = ['c', 'cpp', 'java', 'python', 'javascript'];

const TemplateManager: React.FC<TemplateManagerProps> = ({ problemId }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
    const [template, setTemplate] = useState<Template>({ language: 'javascript', starter_code: '', wrapper_code: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplate(selectedLanguage);
    }, [problemId, selectedLanguage]);

    const fetchTemplate = async (lang: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/problems/${problemId}/templates/${lang}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplate({ ...data, language: lang });
            } else {
                // Reset if not found
                setTemplate({ language: lang, starter_code: '', wrapper_code: '' });
            }
        } catch (error) {
            console.error('Error fetching template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/${problemId}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(template)
            });

            if (res.ok) {
                alert('Template saved successfully!');
            } else {
                alert('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6 mt-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CodeIcon className="w-5 h-5 text-amber-500" />
                Code Templates
            </h2>

            {/* Language Selector */}
            <div className="flex gap-2 border-b border-gray-800 pb-4 overflow-x-auto">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLanguage === lang
                            ? 'bg-amber-500 text-black'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Starter Code (Visible to User)</label>
                        <textarea
                            value={template.starter_code}
                            onChange={(e) => setTemplate({ ...template, starter_code: e.target.value })}
                            className="w-full h-96 bg-gray-950 border border-gray-800 text-gray-300 font-mono text-sm p-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                            placeholder="// Write starter code here..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Wrapper Code (Hidden Execution Harness)</label>
                        <p className="text-xs text-gray-500 mb-2">Use <code>// {"<<< INSERT USER CODE HERE >>>"}</code> as the placeholder.</p>
                        <textarea
                            value={template.wrapper_code}
                            onChange={(e) => setTemplate({ ...template, wrapper_code: e.target.value })}
                            className="w-full h-96 bg-gray-950 border border-gray-800 text-gray-300 font-mono text-sm p-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                            placeholder="// Write wrapper code here..."
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save {selectedLanguage.toUpperCase()} Template
                </button>
            </div>
        </div>
    );
};

export default TemplateManager;
