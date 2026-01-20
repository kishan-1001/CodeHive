import React, { useState } from 'react';
import ProblemForm from './ProblemForm';
import { useNavigate } from 'react-router-dom';
import TestCaseManager from './TestCaseManager';
import TemplateManager from './TemplateManager';
import SolutionManager from './SolutionManager';
import { CheckCircle } from 'lucide-react';

const ProblemCreate: React.FC = () => {
    const navigate = useNavigate();
    const [createdProblemId, setCreatedProblemId] = useState<string | null>(null);

    const handleCreateOrUpdate = async (data: any) => {
        const token = localStorage.getItem('token');

        try {
            if (createdProblemId) {
                // UPDATE existing problem
                const res = await fetch(`/api/admin/problems/${createdProblemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    alert('Problem updated successfully');
                } else {
                    const err = await res.json();
                    alert('Error updating problem: ' + err.error);
                }
            } else {
                // CREATE new problem
                const res = await fetch('/api/admin/problems', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    setCreatedProblemId(result.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    alert('Error creating problem: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Operation error:', error);
            alert('Failed to save problem');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {createdProblemId && (
                <div className="mb-8 bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Problem created! You can now add details below.</span>
                </div>
            )}

            <ProblemForm
                onSubmit={handleCreateOrUpdate}
                isEditing={!!createdProblemId}
            />

            {createdProblemId && (
                <div className="space-y-8 mt-8">
                    {/* Test Case Management */}
                    <div className="border-t border-gray-800 pt-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Manage Test Cases</h2>
                        <TestCaseManager problemId={createdProblemId} />
                    </div>

                    {/* Template Management */}
                    <div className="border-t border-gray-800 pt-8">
                        <TemplateManager problemId={createdProblemId} />
                    </div>

                    {/* Solution Management */}
                    <div className="border-t border-gray-800 pt-8">
                        <SolutionManager problemId={createdProblemId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemCreate;
