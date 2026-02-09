import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Smartphone, CheckCircle, Info, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Version {
    id: number;
    platform: string;
    version_name: string;
    version_code: number;
    update_info: string;
    created_at: string;
    is_force_update: boolean;
}

interface ParsedMeta {
    tempPath: string;
    platform: string;
    versionName: string;
    versionCode: number;
    packageName?: string;
}

interface MessageData {
    type: 'success' | 'error';
    text: string;
}

const VersionSection: React.FC = () => {
    const [versions, setVersions] = useState<Version[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [parsedMeta, setParsedMeta] = useState<ParsedMeta | null>(null);
    const [updateInfo, setUpdateInfo] = useState('');
    const [isForce, setIsForce] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [msg, setMsg] = useState<MessageData | null>(null);

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        const res = await axios.get('/api/admin/versions');
        setVersions(res.data);
    };

    const deleteVersion = async (id: number) => {
        if (!window.confirm('Are you sure you want to take down this version?')) return;
        try {
            await axios.delete(`/api/admin/versions/${id}`);
            fetchVersions();
        } catch (err: any) {
            alert('Failed to delete version: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleParse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMsg(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/admin/versions/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setParsedMeta(res.data.meta);
        } catch (err: any) {
            setMsg({ type: 'error', text: 'Parse failed: ' + (err.response?.data?.error || err.message) });
        } finally {
            setUploading(false);
        }
    };

    const handlePublish = async () => {
        if (!parsedMeta) return;

        setPublishing(true);
        try {
            await axios.post('/api/admin/versions/publish', {
                tempPath: parsedMeta.tempPath,
                meta: parsedMeta,
                updateInfo,
                isForceUpdate: isForce
            });
            setMsg({ type: 'success', text: 'Published successfully!' });
            setFile(null);
            setParsedMeta(null);
            setUpdateInfo('');
            fetchVersions();
        } catch (err: any) {
            setMsg({ type: 'error', text: 'Publish failed: ' + (err.response?.data?.error || err.message) });
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            <div className="card glass">
                <h3>Version History</h3>
                <table style={{ marginTop: '1.5rem' }}>
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Version</th>
                            <th>Update Notes</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.map(v => (
                            <tr key={v.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Smartphone size={16} />
                                        <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{v.platform}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{v.version_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Code: {v.version_code}</div>
                                </td>
                                <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.update_info}>
                                        {v.update_info || 'No notes'}
                                    </div>
                                </td>
                                <td>{format(new Date(v.created_at), 'yyyy-MM-dd')}</td>
                                <td>
                                    {v.is_force_update ?
                                        <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>Force Update</span> :
                                        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Optional</span>
                                    }
                                </td>
                                <td>
                                    <button
                                        onClick={() => deleteVersion(v.id)}
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--error)',
                                            cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center'
                                        }}
                                        title="Take Down"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card glass">
                <h3>Publish New Update</h3>
                {!parsedMeta ? (
                    <form onSubmit={handleParse} style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label>Application File (APK/IPA/EXE/DMG)</label>
                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: '0.5rem',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: file ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                }}
                                onClick={() => {
                                    const input = document.getElementById('fileInput') as HTMLInputElement;
                                    if (input) input.click();
                                }}
                            >
                                <Upload size={32} color={file ? 'var(--primary)' : 'var(--text-dim)'} style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.9rem' }}>{file ? file.name : 'Click to select or drag file'}</p>
                            </div>
                            <input
                                id="fileInput"
                                type="file"
                                hidden
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFile(e.target.files[0]);
                                        setMsg(null);
                                    }
                                }}
                            />
                        </div>

                        {msg && <Message msg={msg} />}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={uploading || !file}
                        >
                            {uploading ? 'Uploading & Parsing...' : 'Next: Review Metadata'}
                        </button>
                    </form>
                ) : (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Smartphone size={16} /> Metadata Detected
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-dim)' }}>Platform:</span>
                                    <div style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{parsedMeta.platform}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-dim)' }}>Version:</span>
                                    <div style={{ fontWeight: 'bold' }}>{parsedMeta.versionName} ({parsedMeta.versionCode})</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>Package:</span>
                                    <div style={{ fontFamily: 'monospace' }}>{parsedMeta.packageName || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Update Notes</label>
                            <textarea
                                rows={4}
                                placeholder="What's new in this version..."
                                value={updateInfo}
                                onChange={(e) => setUpdateInfo(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                style={{ width: 'auto' }}
                                checked={isForce}
                                onChange={(e) => setIsForce(e.target.checked)}
                            />
                            <label style={{ marginBottom: 0 }}>Force Update</label>
                        </div>

                        {msg && <Message msg={msg} />}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => setParsedMeta(null)}
                            >
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, justifyContent: 'center' }}
                                onClick={handlePublish}
                                disabled={publishing}
                            >
                                {publishing ? 'Publishing...' : 'Confirm & Release'}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Info size={14} /> Automation
                    </h4>
                    <ul style={{ fontSize: '0.8rem', color: 'var(--text-dim)', paddingLeft: '1.2rem' }}>
                        <li>Auto-detect OS & Metadata</li>
                        <li>Signature Hash verification</li>
                        <li>SCP Server deployment</li>
                        <li>`app-last` mirror creation</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

interface MessageProps {
    msg: MessageData;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
    return (
        <div style={{
            padding: '0.8rem',
            borderRadius: '0.5rem',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: msg.type === 'success' ? 'var(--success)' : 'var(--error)',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {msg.text}
        </div>
    );
}

export default VersionSection;
