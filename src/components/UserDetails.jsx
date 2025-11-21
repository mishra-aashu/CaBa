import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { ArrowLeft, Phone, Video, MessageCircle, Image, Link as LinkIcon, FileText, Bell, BellOff, UserPlus, Share2, Download, Ban, Flag, Trash2, Edit } from 'lucide-react';
import DropdownMenu from './common/DropdownMenu';
import Modal from './common/Modal';
import './UserDetails.css';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { supabase } = useSupabase();

    // State
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isContact, setIsContact] = useState(false);
    const [mediaCount, setMediaCount] = useState({ images: 0, links: 0, docs: 0 });
    const [commonGroups, setCommonGroups] = useState([]);

    // Modals
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showEditContactModal, setShowEditContactModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [contactName, setContactName] = useState('');
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        if (!userId || userId === 'undefined') {
            navigate('/');
            return;
        }
        loadUserDetails();
    }, [userId]);

    const loadUserDetails = async () => {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const current = JSON.parse(userStr);
            setCurrentUser(current);

            // Load other user details
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setUser(userData);

            // Check if muted
            const mutedChats = JSON.parse(localStorage.getItem('mutedChats') || '{}');
            const chatId = [current.id, userId].sort().join('_');
            setIsMuted(!!mutedChats[chatId]);

            // Check if contact
            const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
            setIsContact(contacts.some(c => c.id === userId));

            // Load media count (placeholder)
            setMediaCount({ images: 0, links: 0, docs: 0 });

            setLoading(false);
        } catch (error) {
            console.error('Error loading user details:', error);
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const handleMessage = () => {
        // Find or create chat
        navigate(`/chat/new/${userId}`);
    };

    const handleVoiceCall = () => {
        // Set pending call in localStorage
        localStorage.setItem('pendingCall', JSON.stringify({
            contact: user,
            type: 'voice'
        }));
        navigate('/calls');
    };

    const handleVideoCall = () => {
        // Set pending call in localStorage
        localStorage.setItem('pendingCall', JSON.stringify({
            contact: user,
            type: 'video'
        }));
        navigate('/calls');
    };

    const handleMuteToggle = () => {
        const chatId = [currentUser.id, userId].sort().join('_');
        const mutedChats = JSON.parse(localStorage.getItem('mutedChats') || '{}');

        if (isMuted) {
            delete mutedChats[chatId];
        } else {
            mutedChats[chatId] = true;
        }

        localStorage.setItem('mutedChats', JSON.stringify(mutedChats));
        setIsMuted(!isMuted);
    };

    const handleAddToContacts = () => {
        if (isContact) {
            alert('User is already in your contacts');
            return;
        }

        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        contacts.push({
            id: user.id,
            name: user.name,
            phone: user.phone,
            addedAt: new Date().toISOString()
        });
        localStorage.setItem('contacts', JSON.stringify(contacts));
        setIsContact(true);
        alert('Contact added successfully!');
    };

    const handleShareContact = () => {
        const shareText = `Contact: ${user.name}\nPhone: ${user.phone}`;
        if (navigator.share) {
            navigator.share({
                title: 'Share Contact',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Contact details copied to clipboard!');
        }
    };

    const handleExportChat = async () => {
        try {
            if (!currentUser || !user) return;

            // Find chat between current user and this user
            const { data: chat, error: chatError } = await supabase
                .from('chats')
                .select('id')
                .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${user.id}),and(user1_id.eq.${user.id},user2_id.eq.${currentUser.id})`)
                .single();

            if (chatError || !chat) {
                alert('No chat history found with this user');
                return;
            }

            // Get all messages
            const { data: messages, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: true });

            if (messagesError) throw messagesError;

            if (!messages || messages.length === 0) {
                alert('No messages to export');
                return;
            }

            // Format messages for export
            const exportData = messages.map(msg => ({
                timestamp: new Date(msg.created_at).toLocaleString(),
                sender: msg.sender_id === currentUser.id ? 'You' : user.name,
                message: msg.content
            }));

            // Convert to CSV
            const csvContent = [
                ['Timestamp', 'Sender', 'Message'],
                ...exportData.map(row => [row.timestamp, row.sender, row.message])
            ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `chat_${user.name}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Chat exported successfully!');
        } catch (error) {
            console.error('Error exporting chat:', error);
            alert('Failed to export chat');
        }
    };

    const handleEditContact = () => {
        setContactName(user.name);
        setShowEditContactModal(true);
    };

    const saveContactEdit = () => {
        if (!contactName.trim()) {
            alert('Please enter a name');
            return;
        }

        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const index = contacts.findIndex(c => c.id === userId);
        if (index !== -1) {
            contacts[index].name = contactName.trim();
            localStorage.setItem('contacts', JSON.stringify(contacts));

            // Update local state
            setUser({ ...user, displayName: contactName.trim() });
            alert('Contact updated successfully!');
        }
        setShowEditContactModal(false);
    };

    const handleBlockUser = async () => {
        setShowBlockModal(true);
    };

    const confirmBlock = async () => {
        try {
            const { error } = await supabase
                .from('blocked_users')
                .insert([{
                    blocker_id: currentUser.id,
                    blocked_id: userId
                }]);

            if (error) throw error;

            alert('User blocked successfully');
            setShowBlockModal(false);
            navigate('/');
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('Failed to block user');
        }
    };

    const handleReportUser = () => {
        setShowReportModal(true);
    };

    const submitReport = () => {
        if (!reportReason.trim()) {
            alert('Please select a reason');
            return;
        }

        // In a real app, this would send to backend
        alert('Report submitted successfully. We will review it shortly.');
        setShowReportModal(false);
        setReportReason('');
    };

    const handleDeleteContact = async () => {
        const confirmed = window.confirm('Delete this contact? This will also delete the chat.');
        if (!confirmed) return;

        try {
            // Remove from contacts
            const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
            const updatedContacts = contacts.filter(c => c.id !== userId);
            localStorage.setItem('contacts', JSON.stringify(updatedContacts));

            // Delete chat if exists
            const { error } = await supabase
                .from('chats')
                .delete()
                .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

            if (error) console.error('Error deleting chat:', error);

            alert('Contact deleted successfully');
            navigate('/');
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Failed to delete contact');
        }
    };

    if (loading) {
        return (
            <div className="user-details-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-details-error">
                <p>User not found</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="user-details-screen">
            {/* Header */}
            <header className="user-details-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Contact Info</h1>
                <DropdownMenu
                    items={[
                        {
                            icon: <Edit size={16} />,
                            label: 'Edit Contact',
                            onClick: handleEditContact,
                            disabled: !isContact
                        }
                    ]}
                />
            </header>

            {/* User Profile Section */}
            <div className="user-profile-section">
                <div className="user-avatar-large">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                    ) : (
                        <div className="avatar-initials">{getInitials(user.name)}</div>
                    )}
                </div>
                <h2 className="user-name">{user.name}</h2>
                <p className="user-phone">{user.phone}</p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="action-btn" onClick={handleMessage}>
                    <MessageCircle size={24} />
                    <span>Message</span>
                </button>
                <button className="action-btn" onClick={handleVoiceCall}>
                    <Phone size={24} />
                    <span>Call</span>
                </button>
                <button className="action-btn" onClick={handleVideoCall}>
                    <Video size={24} />
                    <span>Video</span>
                </button>
            </div>

            {/* Media Section */}
            <div className="media-section">
                <div className="section-header">
                    <h3>Media, Links and Docs</h3>
                </div>
                <div className="media-counts">
                    <div className="media-count-item">
                        <Image size={20} />
                        <span>{mediaCount.images} Photos</span>
                    </div>
                    <div className="media-count-item">
                        <LinkIcon size={20} />
                        <span>{mediaCount.links} Links</span>
                    </div>
                    <div className="media-count-item">
                        <FileText size={20} />
                        <span>{mediaCount.docs} Docs</span>
                    </div>
                </div>
            </div>

            {/* Mute Notifications */}
            <div className="settings-section">
                <div className="setting-item" onClick={handleMuteToggle}>
                    <div className="setting-label">
                        {isMuted ? <Bell size={20} /> : <BellOff size={20} />}
                        <span>Mute Notifications</span>
                    </div>
                    <div className={`toggle ${isMuted ? 'active' : ''}`}>
                        <div className="toggle-thumb"></div>
                    </div>
                </div>
            </div>

            {/* Contact Actions */}
            <div className="contact-actions-section">
                {!isContact && (
                    <button className="contact-action-btn" onClick={handleAddToContacts}>
                        <UserPlus size={20} />
                        <span>Add to Contacts</span>
                    </button>
                )}
                <button className="contact-action-btn" onClick={handleShareContact}>
                    <Share2 size={20} />
                    <span>Share Contact</span>
                </button>
                <button className="contact-action-btn" onClick={handleExportChat}>
                    <Download size={20} />
                    <span>Export Chat</span>
                </button>
            </div>

            {/* Groups in Common */}
            {commonGroups.length > 0 && (
                <div className="groups-section">
                    <h3>Groups in Common</h3>
                    <div className="groups-list">
                        {commonGroups.map(group => (
                            <div key={group.id} className="group-item">
                                <div className="group-avatar">{getInitials(group.name)}</div>
                                <span>{group.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Danger Zone */}
            <div className="danger-zone">
                <button className="danger-btn" onClick={handleBlockUser}>
                    <Ban size={20} />
                    <span>Block Contact</span>
                </button>
                <button className="danger-btn" onClick={handleReportUser}>
                    <Flag size={20} />
                    <span>Report Contact</span>
                </button>
                <button className="danger-btn" onClick={handleDeleteContact}>
                    <Trash2 size={20} />
                    <span>Delete Contact</span>
                </button>
            </div>

            {/* Block Confirmation Modal */}
            <Modal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                title="Block Contact"
                size="small"
            >
                <div className="modal-content-text">
                    <p>Block {user.name}?</p>
                    <p className="warning-text">Blocked contacts will no longer be able to call you or send you messages.</p>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={() => setShowBlockModal(false)}>
                            Cancel
                        </button>
                        <button className="btn-danger" onClick={confirmBlock}>
                            Block
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Contact Modal */}
            <Modal
                isOpen={showEditContactModal}
                onClose={() => setShowEditContactModal(false)}
                title="Edit Contact"
                size="small"
            >
                <div className="edit-contact-form">
                    <div className="input-group">
                        <label>Contact Name</label>
                        <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Enter name"
                        />
                    </div>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={() => setShowEditContactModal(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={saveContactEdit}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Report Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                title="Report Contact"
                size="small"
            >
                <div className="report-form">
                    <p>Why are you reporting this contact?</p>
                    <div className="report-reasons">
                        <label className="report-reason-item">
                            <input
                                type="radio"
                                name="report"
                                value="spam"
                                checked={reportReason === 'spam'}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                            <span>Spam</span>
                        </label>
                        <label className="report-reason-item">
                            <input
                                type="radio"
                                name="report"
                                value="harassment"
                                checked={reportReason === 'harassment'}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                            <span>Harassment</span>
                        </label>
                        <label className="report-reason-item">
                            <input
                                type="radio"
                                name="report"
                                value="inappropriate"
                                checked={reportReason === 'inappropriate'}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                            <span>Inappropriate Content</span>
                        </label>
                        <label className="report-reason-item">
                            <input
                                type="radio"
                                name="report"
                                value="other"
                                checked={reportReason === 'other'}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                            <span>Other</span>
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={() => setShowReportModal(false)}>
                            Cancel
                        </button>
                        <button className="btn-danger" onClick={submitReport}>
                            Report
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserDetails;
