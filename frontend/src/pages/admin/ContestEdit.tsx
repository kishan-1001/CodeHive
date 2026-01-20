import React, { useEffect, useState } from 'react';
import ContestForm from './ContestForm';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ContestEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContest();
    }, [id]);

    const fetchContest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/contests/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Formatting data for form
                setInitialData({
                    title: data.title,
                    description: data.description,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    problems: data.problems ? data.problems.map((p: any) => p.problem_id) : []
                });
            } else {
                alert('Contest not found');
                navigate('/admin/contests');
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
            const res = await fetch(`/api/admin/contests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                navigate('/admin/contests');
            } else {
                const err = await res.json();
                alert('Error updating contest: ' + err.error);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update contest');
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return <ContestForm initialData={initialData} onSubmit={handleUpdate} isEditing={true} />;
};

export default ContestEdit;
