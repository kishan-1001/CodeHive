import React from 'react';
import ProblemForm from './ProblemForm';
import { useNavigate } from 'react-router-dom';

const ProblemCreate: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/problems', {
                method: 'POST',
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
                alert('Error creating problem: ' + err.error);
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('Failed to create problem');
        }
    };

    return <ProblemForm onSubmit={handleCreate} />;
};

export default ProblemCreate;
