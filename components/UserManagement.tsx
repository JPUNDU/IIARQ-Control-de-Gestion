
import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

const listUsers = httpsCallable(functions, 'listUsers');
const setUserRole = httpsCallable(functions, 'setUserRole');

interface UserRecord {
    uid: string;
    email: string;
    role: 'admin' | 'member' | 'none';
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [targetEmail, setTargetEmail] = useState('');
    const [targetRole, setTargetRole] = useState<'admin' | 'member'>('member');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listUsers();
            const userList = (result.data as any[]).map(u => ({
                uid: u.uid,
                email: u.email,
                role: u.customClaims?.admin ? 'admin' : u.customClaims?.member ? 'member' : 'none'
            }));
            setUsers(userList);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSetRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetEmail) {
            alert('Please enter a user email.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await setUserRole({ email: targetEmail, role: targetRole });
            setTargetEmail('');
            await fetchUsers(); // Refresh the user list
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getRoleBadge = (role: string) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (role) {
            case 'admin': return `${baseClasses} bg-green-500 text-white`;
            case 'member': return `${baseClasses} bg-blue-500 text-white`;
            default: return `${baseClasses} bg-gray-500 text-white`;
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">User Role Management</h2>

            <form onSubmit={handleSetRole} className="bg-brand-secondary p-6 rounded-lg shadow-lg space-y-4 mb-8">
                <h3 className="text-xl font-bold text-white">Assign Role to User</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300">User Email</label>
                        <input
                            type="email"
                            id="userEmail"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="userRole" className="block text-sm font-medium text-gray-300">Role</label>
                        <select
                            id="userRole"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value as 'admin' | 'member')}
                            className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign Role'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">Error: {error}</p>}
            </form>

            <div className="bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-brand-accent">
                        <tr>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">UID</th>
                            <th className="p-4 font-semibold">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={3} className="text-center p-8 text-gray-400">Loading users...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.uid} className="border-b border-brand-accent last:border-b-0">
                                <td className="p-4 text-white">{user.email}</td>
                                <td className="p-4 text-gray-400 font-mono">{user.uid}</td>
                                <td className="p-4"><span className={getRoleBadge(user.role)}>{user.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
