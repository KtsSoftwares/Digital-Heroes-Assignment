import React, { useState } from 'react';
import axios from 'axios';
import BS_Alert from './BS_Alert';

export default function PublicLeadForm({ apiServerUrl }) {
    const [formData, setFormData] = useState({ name: '', email: '', company: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Submitting...' });

        try {
            const res = await axios.post(`${apiServerUrl}/api/leads/public`, formData);
            setStatus({ type: 'success', msg: res.data.message });
            setFormData({ name: '', email: '', company: '' });
        } catch (err) {
            setStatus({
                type: 'danger',
                msg: err.response?.data?.message || 'Something went wrong'
            });
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <div className="card shadow-sm p-4">
                <h3 className="mb-3 text-primary text-center">Contact Us</h3>
                {status.msg && (
                    <BS_Alert type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            className="form-control"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Submit Lead</button>
                </form>
            </div>
        </div>
    );
}