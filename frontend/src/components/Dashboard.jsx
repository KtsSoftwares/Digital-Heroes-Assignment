import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BS_Alert from './BS_Alert';

export default function Dashboard({ user, apiServerUrl, onLogout }) {
    const [leads, setLeads] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]); // List of users for admin assignment
    const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1, totalItems: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State for Notes & Activity Trail Modal ---
    const [selectedLead, setSelectedLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [activities, setActivities] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');
    const [loadingDetails, setLoadingDetails] = useState(false);

    const token = localStorage.getItem('token');

    // Fetch leads
    const fetchLeads = async (page = 1, status = statusFilter) => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiServerUrl}/api/leads?page=${page}&limit=${pagination.limit}&status=${status}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(res.data.leads);
            setPagination(res.data.pagination);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    // Fetch team members (ADMIN only)
    const fetchTeamMembers = async () => {
        if (user?.role !== 'ADMIN') return;
        setLoading(true);
        try {
            const res = await axios.get(`${apiServerUrl}/api/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamMembers(res.data);
        } catch (err) {
            console.error('Could not fetch team members', err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(1, statusFilter);
        fetchTeamMembers();
        console.log("UseEffect Called");
    }, [statusFilter]);

    // Handle Status Update
    const handleStatusChange = async (leadId, newStatus) => {
        setLoading(true);
        try {
            await axios.patch(
                `${apiServerUrl}/api/leads/${leadId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLeads(pagination.page, statusFilter);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
        finally {
            setLoading(false);
        }
    };

    // Handle Assign Lead (ADMIN ONLY)
    const handleAssignChange = async (leadId, newAssigneeId) => {
        setLoading(true);
        try {
            await axios.patch(
                `${apiServerUrl}/api/leads/${leadId}/assign`,
                { assignedTo: newAssigneeId || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLeads(pagination.page, statusFilter);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign lead');
        }
        finally {
            setLoading(false);
        }
    };

    // Fetch Notes & Activity Trail for a Lead
    const handleOpenLeadDetails = async (lead) => {
        setSelectedLead(lead);
        setLoadingDetails(true);
        try {
            const res = await axios.get(`${apiServerUrl}/api/leads/${lead._id}/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data.notes);
            setActivities(res.data.activities);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load lead activity trail');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Submit a New Note
    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNoteText.trim()) return;

        try {
            await axios.post(
                `${apiServerUrl}/api/leads/${selectedLead._id}/notes`,
                { text: newNoteText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewNoteText('');
            // Refresh details to show the new note and activity log
            handleOpenLeadDetails(selectedLead);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add note');
        }
    };

    const getBadgeClass = (status) => {
        switch (status) {
            case 'NEW': return 'bg-primary';
            case 'CONTACTED': return 'bg-info text-dark';
            case 'QUALIFIED': return 'bg-success';
            case 'LOST': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid py-4 px-4">

            {error && <BS_Alert type="danger" msg={error} onClose={() => setError('')} />}

            <div className="row mb-3 align-items-center">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="LOST">LOST</option>
                    </select>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Actions</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.length > 0 ? (
                                        leads.map((lead) => (
                                            <tr key={lead._id}>
                                                <td className="fw-semibold">{lead.name}</td>
                                                <td>{lead.email}</td>
                                                <td>{lead.company || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${getBadgeClass(lead.status)}`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {/* If ADMIN, show dropdown to reassign lead. If MEMBER, show text only */}
                                                    {user?.role === 'ADMIN' ? (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={lead.assignedTo?._id || ''}
                                                            onChange={(e) => handleAssignChange(lead._id, e.target.value)}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {teamMembers.map((member) => (
                                                                <option key={member._id} value={member._id}>
                                                                    {member.name} ({member.role})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        lead.assignedTo ? lead.assignedTo.name : 'Unassigned'
                                                    )}
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm d-inline-block w-auto"
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                                    >
                                                        <option value="NEW">NEW</option>
                                                        <option value="CONTACTED">CONTACTED</option>
                                                        <option value="QUALIFIED">QUALIFIED</option>
                                                        <option value="LOST">LOST</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleOpenLeadDetails(lead)} >
                                                        Notes & History
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">No leads found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <div>
                    <button
                        className="btn btn-outline-secondary btn-sm me-2"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchLeads(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchLeads(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
            {/* --- Notes & Activity Trail Modal --- */}
            {selectedLead && (
                <div className="modal show d-block tab-index-1 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(2px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Lead Details: <strong>{selectedLead.name}</strong> ({selectedLead.email})
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedLead(null)} >
                                </button>
                            </div>

                            <div className="modal-body">
                                {loadingDetails ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {/* Notes Column */}
                                        <div className="col-md-6 border-end">
                                            <h6 className="fw-bold mb-3">Notes</h6>
                                            <form onSubmit={handleAddNote} className="mb-3">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Add a note..."
                                                        value={newNoteText}
                                                        onChange={(e) => setNewNoteText(e.target.value)}
                                                    />
                                                    <button className="btn btn-sm btn-primary" type="submit">Add</button>
                                                </div>
                                            </form>

                                            <div className="vstack gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                {notes.length > 0 ? (
                                                    notes.map((note) => (
                                                        <div key={note._id} className="p-2 bg-light border rounded">
                                                            <p className="mb-1 small">{note.text}</p>
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                By <strong>{note.authorId?.name || 'User'}</strong> on {new Date(note.createdAt).toLocaleString({ day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                                            </small>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted small">No notes added yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Activity Trail Column */}
                                        <div className="col-md-6">
                                            <h6 className="fw-bold mb-3">Activity Trail</h6>
                                            <div className="vstack gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {activities.length > 0 ? (
                                                    activities.map((act) => (
                                                        <div key={act._id} className="p-2 border-start border-3 border-info bg-light rounded">
                                                            <div className="small fw-semibold">{act.action}</div>
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                {act.performedBy ? `By ${act.performedBy.name}` : 'Public Form'} | {new Date(act.createdAt).toLocaleString({ day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                                            </small>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted small">No activities logged.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSelectedLead(null)} >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}