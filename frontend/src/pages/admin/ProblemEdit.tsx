import React, { useEffect, useState } from 'react';
import ProblemForm from './ProblemForm';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import TestCaseManager from './TestCaseManager';
import TemplateManager from './TemplateManager';

const ProblemEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        try {
            const res = await fetch(`/api/problems/${id}`);
            const data = await res.json();
            if (res.ok) {
                // Transform data to match form expectations
                setInitialData({
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    difficulty: data.difficulty,
                    topics: data.topics.map((t: any) => t.id),
                    companies: []
                });
            } else {
                alert('Problem not found');
                navigate('/admin/problems');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/problems/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                navigate('/admin/problems');
            } else {
                const err = await res.json();
                alert('Error updating problem: ' + err.error);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update problem');
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <ProblemForm initialData={initialData} onSubmit={handleUpdate} isEditing={true} />

            {/* Test Case Management */}
            <div className="border-t border-gray-800 my-8 pt-8">
                <h2 className="text-2xl font-bold text-white mb-4">Manage Test Cases</h2>
                <TestCaseManager problemId={id!} />
            </div>

            {/* Template Management */}
            <div className="border-t border-gray-800 my-8 pt-8">
                <TemplateManager problemId={id!} />
            </div>
        </div>
    );
};

export default ProblemEdit;
