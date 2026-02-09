import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Book, Search, ChevronRight, FileText, Trash2, Key, X } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
    id: number;
    username: string;
    created_at: string;
}

interface Bookmark {
    id: number;
    book_id: string;
    chapter: number;
    start_verse: number;
    end_verse: number;
}

interface Note {
    id: number;
    book_id: string;
    chapter: number;
    start_verse: number;
    end_verse: number;
    text: string;
}

interface UserDetail {
    bookmarks: Bookmark[];
    notes: Note[];
}

const UserSection: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const selectUser = async (user: UserData) => {
        setSelectedUser(user);
        try {
            const res = await axios.get(`/api/admin/users/${user.id}/content`);
            setUserDetail(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await axios.delete(`/api/admin/users/${id}`);
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !selectedUser) return;
        setActionLoading(true);
        try {
            await axios.post(`/api/admin/users/${selectedUser.id}/password`, { newPassword });
            setShowPasswordModal(false);
            setNewPassword('');
            alert('Password updated successfully');
        } catch (err: any) {
            alert('Failed to update password: ' + (err.response?.data?.error || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            <div className="card glass">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>User Directory</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input placeholder="Search users..." style={{ paddingLeft: '2rem', width: '200px' }} />
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Joined Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr
                                key={user.id}
                                className={selectedUser?.id === user.id ? 'active-row' : ''}
                                onClick={() => selectUser(user)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '50%' }}>
                                            <User size={16} />
                                        </div>
                                        <span>{user.username}</span>
                                    </div>
                                </td>
                                <td>{format(new Date(user.created_at), 'MMM dd, yyyy')}</td>
                                <td><ChevronRight size={16} color="var(--text-dim)" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && userDetail && (
                <div className="card glass">
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3>{selectedUser.username}'s Profile</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>User ID: #{selectedUser.id} • Joined: {format(new Date(selectedUser.created_at), 'PPP')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn" onClick={() => setShowPasswordModal(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }}>
                                <Key size={14} style={{ marginRight: '0.4rem' }} /> Reset Password
                            </button>
                            <button className="btn" onClick={() => deleteUser(selectedUser.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                                <Trash2 size={14} style={{ marginRight: '0.4rem' }} /> Delete
                            </button>
                        </div>
                    </div>

                    {showPasswordModal && (
                        <div style={{
                            position: 'absolute', top: '100px', right: '2rem', left: '2rem', zIndex: 10,
                            padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)',
                            borderRadius: '1rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0 }}>Reset Password</h4>
                                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowPasswordModal(false)} />
                            </div>
                            <form onSubmit={updatePassword}>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ flex: 1, justifyContent: 'center' }}>
                                        {actionLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                    <button type="button" className="btn" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Book size={18} color="var(--primary)" /> Bookmarks ({userDetail.bookmarks.length})
                            </h4>
                            <div className="scroll-area" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {userDetail.bookmarks.length > 0 ? (
                                    userDetail.bookmarks.map(b => (
                                        <div key={b.id} className="item-row" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                            {b.book_id} Ch {b.chapter}: {b.start_verse}-{b.end_verse}
                                        </div>
                                    ))
                                ) : <p style={{ color: 'var(--text-dim)' }}>No bookmarks found</p>}
                            </div>
                        </section>

                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <FileText size={18} color="var(--primary)" /> Notes ({userDetail.notes.length})
                            </h4>
                            <div className="scroll-area" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {userDetail.notes.length > 0 ? (
                                    userDetail.notes.map(n => (
                                        <div key={n.id} className="item-row" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                                {n.book_id} Ch {n.chapter}: {n.start_verse}-{n.end_verse}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{n.text}</p>
                                        </div>
                                    ))
                                ) : <p style={{ color: 'var(--text-dim)' }}>No notes found</p>}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserSection;
