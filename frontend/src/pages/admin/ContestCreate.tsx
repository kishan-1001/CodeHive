import React, { useState } from 'react';
import ContestForm from './ContestForm';
import { useNavigate } from 'react-router-dom';
import CreationFailureModal from '../../components/CreationFailureModal';

const ContestCreate: React.FC = () => {
    const navigate = useNavigate();
    const [failureModalOpen, setFailureModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                const errMsg = err.error || err.message || JSON.stringify(err);
                // alert('Error creating contest: ' + errMsg);
                setError(errMsg);
                setFailureModalOpen(true);
            }
        } catch (error) {
            console.error('Create error:', error);
            // alert('Failed to create contest');
            setError('Failed to create contest. Please check your connection and try again.');
            setFailureModalOpen(true);
        }
    };

    return (
        <>
            <ContestForm onSubmit={handleCreate} />
            {/* Failure Modal */}
            {failureModalOpen && error && (
                <CreationFailureModal
                    error={error}
                    onClose={() => setFailureModalOpen(false)}
                />
            )}
        </>
    );
};

export default ContestCreate;
