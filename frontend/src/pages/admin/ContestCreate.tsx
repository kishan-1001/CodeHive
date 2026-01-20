import React from 'react';
import ContestForm from './ContestForm';
import { useNavigate } from 'react-router-dom';

const ContestCreate: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/contests', {
                method: 'POST',
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
                alert('Error creating contest: ' + err.error);
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('Failed to create contest');
        }
    };

    return <ContestForm onSubmit={handleCreate} />;
};

export default ContestCreate;
