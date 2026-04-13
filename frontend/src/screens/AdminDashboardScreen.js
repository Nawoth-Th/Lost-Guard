import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, ShieldCheck, CheckCircle, XCircle, User, Package, Plus, Trash2, Edit2, MapPin, Tag } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import api from '../api/api';
import { showGlassAlert } from '../utils/alertHelper';

const AdminDashboardScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Claims');
    const [claims, setClaims] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showUserItemsModal, setShowUserItemsModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'category', 'location', 'hub'
    const [editItem, setEditItem] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showClaimDetailModal, setShowClaimDetailModal] = useState(false);
    const [selectedUserItems, setSelectedUserItems] = useState([]);

    // Form states
    const [fName, setFName] = useState('');
    const [fDesc, setFDesc] = useState('');
    const [fIcon, setFIcon] = useState('');
    const [fBlock, setFBlock] = useState('');
    const [fType, setFType] = useState('Academic'); // For location category
    const [fLoc, setFLoc] = useState(''); // For hub exact location
    const [editUserForm, setEditUserForm] = useState({ name: '', email: '', isAdmin: false });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'Claims') {
                const { data } = await api.get('/claims?type=all');
                setClaims(data);
            } else if (activeTab === 'Categories') {
                const { data } = await api.get('/categories');
                setCategories(data);
            } else if (activeTab === 'Locations') {
                const { data } = await api.get('/locations');
                setLocations(data);
            } else if (activeTab === 'Hubs') {
                const { data } = await api.get('/hubs');
                setHubs(data);
            } else if (activeTab === 'Users') {
                const { data } = await api.get('/users');
                setUsers(data);
            }
        } catch (error) {
            console.error(`Fetch ${activeTab} Error:`, error.message);
            showGlassAlert('Error', `Failed to load ${activeTab}.`, [], { type: 'error' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        DeviceEventEmitter.emit('MODERATION_TAB_CHANGE', { tab: activeTab });
    }, [activeTab]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('MODERATION_ADD', () => {
            if (activeTab === 'Categories' || activeTab === 'Locations' || activeTab === 'Hubs') {
                setModalType(activeTab === 'Categories' ? 'category' : activeTab === 'Locations' ? 'location' : 'hub');
                setEditItem(null);
                setFName('');
                setFDesc('');
                setFIcon('');
                setFBlock('');
                setFType('Academic');
                setFLoc('');
                setShowModal(true);
            }
        });
        return () => sub.remove();
    }, [activeTab]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [activeTab]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/claims/${id}`, { status });
            showGlassAlert('Success', `Claim ${status} successfully.`, [], { type: 'success' });
            fetchData();
        } catch (error) {
            showGlassAlert('Error', 'Failed to update claim status.', [], { type: 'error' });
        }
    };

    const handleSaveMetadata = async () => {
        try {
            const endpoint = modalType === 'category' ? '/categories' : modalType === 'location' ? '/locations' : '/hubs';
            
            let payload;
            if (modalType === 'category') {
                payload = { name: fName, description: fDesc, icon: fIcon };
            } else if (modalType === 'location') {
                payload = { name: fName, block: fBlock, category: fType };
            } else {
                payload = { name: fName, location: fLoc, description: fDesc };
            }
            
            if (editItem) {
                await api.put(`${endpoint}/${editItem._id}`, payload);
            } else {
                await api.post(endpoint, payload);
            }
            
            setShowModal(false);
            setEditItem(null);
            setFName('');
            setFDesc('');
            setFIcon('');
            setFBlock('');
            setFLoc('');
            fetchData();
            showGlassAlert('Success', `${modalType} saved successfully.`, [], { type: 'success' });
        } catch (error) {
            showGlassAlert('Error', error.response?.data?.message || 'Failed to save.', [], { type: 'error' });
        }
    };

    const handleDeleteMetadata = async (id, type) => {
        showGlassAlert(
            "Confirm Delete",
            `Are you sure you want to remove this ${type}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const endpoint = type === 'category' ? `/categories/${id}` : type === 'location' ? `/locations/${id}` : `/hubs/${id}`;
                        await api.delete(endpoint);
                        fetchData();
                        showGlassAlert('Success', `${type} removed.`, [], { type: 'success' });
                    } catch (error) {
                        showGlassAlert('Error', 'Failed to delete.', [], { type: 'error' });
                    }
                }}
            ],
            { type: 'warning' }
        );
    };

    const handleDeleteUser = async (id) => {
        showGlassAlert(
            "Confirm Delete",
            "Are you sure you want to delete this user and all their listings? This action is irreversible.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/users/${id}`);
                        fetchData();
                        showGlassAlert('Success', 'User deleted.', [], { type: 'success' });
                    } catch (error) {
                        showGlassAlert('Error', 'Failed to delete user.', [], { type: 'error' });
                    }
                }}
            ],
            { type: 'warning' }
        );
    };

    const handleSaveUser = async () => {
        try {
            await api.put(`/users/${editItem._id}`, editUserForm);
            setShowUserEditModal(false);
            fetchData();
            showGlassAlert('Success', 'User updated successfully.', [], { type: 'success' });
        } catch (error) {
            showGlassAlert('Error', 'Failed to update user.', [], { type: 'error' });
        }
    };

    const handleViewUserItems = async (userId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/items/user/${userId}`);
            setSelectedUserItems(data);
            setShowUserItemsModal(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user items.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUserItem = async (itemId) => {
        console.log(`[Admin Dashboard] Requesting deletion of item: ${itemId}`);
        showGlassAlert(
            "Confirm Delete",
            "Are you sure you want to delete this listing permanently?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const { data } = await api.delete(`/items/${itemId}`);
                        setSelectedUserItems(prev => prev.filter(i => i._id !== itemId));
                        showGlassAlert('Deleted', data.message || 'Listing has been removed.', [], { type: 'success' });
                    } catch (error) {
                        const errorMsg = error.response?.data?.message || error.message;
                        console.error('[Admin Dashboard] Delete Item Error:', errorMsg);
                        showGlassAlert('Error', `Failed to delete listing: ${errorMsg}`, [], { type: 'error' });
                    }
                }}
            ],
            { type: 'warning' }
        );
    };

    const openEditModal = (item, type) => {
        setModalType(type);
        setEditItem(item);
        if (type === 'category') {
            setFName(item.name);
            setFDesc(item.description || '');
            setFIcon(item.icon || '');
        } else if (type === 'location') {
            setFName(item.name);
            setFBlock(item.block);
            setFType(item.category || 'Academic');
        } else if (type === 'hub') {
            setFName(item.name);
            setFLoc(item.location);
            setFDesc(item.description || '');
        }
        setShowModal(true);
    };

    const renderClaim = ({ item: claim }) => {
        return (
            <GlassCard style={styles.claimCard}>
                <View style={styles.claimHeader}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatarMini}>
                                <User size={12} color={Theme.colors.primary} />
                            </View>
                            <Text style={styles.userName} numberOfLines={1}>{claim.requester.name}</Text>
                        </View>
                        <Text style={styles.metaSub} numberOfLines={1}>{claim.requester.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: claim.status === 'Pending' ? 'rgba(251, 191, 36, 0.1)' : 
                                       claim.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                       'rgba(239, 68, 68, 0.1)',
                        borderColor: claim.status === 'Pending' ? '#FBBF24' : 
                                   claim.status === 'Approved' ? '#10B981' : 
                                   '#EF4444'
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: claim.status === 'Pending' ? '#FBBF24' : 
                                   claim.status === 'Approved' ? '#10B981' : 
                                   '#EF4444'
                        }]}>{claim.status}</Text>
                    </View>
                </View>

                <View style={styles.itemRef}>
                    <Package size={14} color={Theme.colors.textMuted} />
                    <Text style={styles.itemTitle} numberOfLines={1}>Item: {claim.item?.title || 'Unknown'}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <TouchableOpacity 
                        style={styles.detailsBtn}
                        onPress={() => {
                            setSelectedClaim(claim);
                            setShowClaimDetailModal(true);
                        }}
                    >
                        <Search size={14} color={Theme.colors.primary} />
                        <Text style={styles.detailsBtnText}>Review Details</Text>
                    </TouchableOpacity>

                    {claim.status === 'Pending' && (
                        <View style={styles.actionsSmall}>
                            <TouchableOpacity 
                                style={styles.actionIconBtn} 
                                onPress={() => handleUpdateStatus(claim._id, 'Rejected')}
                            >
                                <XCircle size={20} color="#ef4444" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionIconBtn} 
                                onPress={() => handleUpdateStatus(claim._id, 'Approved')}
                            >
                                <CheckCircle size={20} color="#10b981" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </GlassCard>
        );
    };

    const renderCategory = ({ item }) => (
        <GlassCard style={styles.metaCard}>
            <View style={styles.metaInfo}>
                <View style={styles.iconBox}>
                    <Tag size={18} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.metaTitle}>{item.name}</Text>
                    {item.description && <Text style={styles.metaSub} numberOfLines={1}>{item.description}</Text>}
                </View>
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={() => openEditModal(item, 'category')}>
                    <Edit2 size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMetadata(item._id, 'category')}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    const renderLocation = ({ item }) => (
        <GlassCard style={styles.metaCard}>
            <View style={styles.metaInfo}>
                <View style={styles.iconBox}>
                    <MapPin size={18} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.metaTitle}>{item.name}</Text>
                    <Text style={styles.metaSub}>{item.block} • {item.category}</Text>
                </View>
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={() => openEditModal(item, 'location')}>
                    <Edit2 size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMetadata(item._id, 'location')}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    const renderHub = ({ item }) => (
        <GlassCard style={styles.metaCard}>
            <View style={styles.metaInfo}>
                <View style={styles.iconBox}>
                    <ShieldCheck size={18} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.metaTitle}>{item.name}</Text>
                    <Text style={styles.metaSub} numberOfLines={1}>{item.location}</Text>
                </View>
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={() => openEditModal(item, 'hub')}>
                    <Edit2 size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMetadata(item._id, 'hub')}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    const renderUser = ({ item: user }) => (
        <GlassCard style={styles.metaCard}>
            <View style={styles.metaInfo}>
                <View style={styles.avatarMini}>
                    <User size={16} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.metaTitle} numberOfLines={1}>{user.name} {user.isAdmin ? '(Admin)' : ''}</Text>
                    <Text style={styles.metaSub} numberOfLines={1}>{user.email}</Text>
                </View>
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={() => handleViewUserItems(user._id)} style={styles.actionBtnIcon}>
                    <Package size={18} color={Theme.colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setEditItem(user);
                    setEditUserForm({ name: user.name, email: user.email, isAdmin: user.isAdmin });
                    setShowUserEditModal(true);
                }} style={styles.actionBtnIcon}>
                    <Edit2 size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(user._id)} style={styles.actionBtnIcon}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    const renderUserItem = ({ item }) => (
        <View style={styles.userItemRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.userItemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.metaText}>{item.type} • {item.status}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteUserItem(item._id)} style={{ padding: 4 }}>
                <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100 }} /> {/* Spacer for global FloatingHeader */}

                <View style={styles.tabsWrap}>
                    <FlatList
                        horizontal
                        data={['Claims', 'Categories', 'Locations', 'Hubs', 'Users']}
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabs}
                        renderItem={({ item: tab }) => (
                            <TouchableOpacity 
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Theme.colors.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={
                            activeTab === 'Claims' ? claims : 
                            activeTab === 'Categories' ? categories : 
                            activeTab === 'Locations' ? locations : 
                            activeTab === 'Hubs' ? hubs : 
                            users
                        }
                        renderItem={
                            activeTab === 'Claims' ? renderClaim : 
                            activeTab === 'Categories' ? renderCategory : 
                            activeTab === 'Locations' ? renderLocation : 
                            activeTab === 'Hubs' ? renderHub : 
                            renderUser
                        }
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ShieldCheck color={Theme.colors.textMuted} size={48} />
                                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
                            </View>
                        }
                    />
                )}

                {/* CRUD Modal */}
                {showModal && (
                    <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                        <GlassCard style={[styles.modalContent, { backgroundColor: Theme.colors.modalBg }]}>
                            <Text style={styles.modalTitle}>
                                {editItem ? 'Edit' : 'Add'} {modalType === 'category' ? 'Category' : modalType === 'location' ? 'Location' : 'Verified Hub'}
                            </Text>
                            
                            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                                {modalType === 'category' ? (
                                    <>
                                        <GlassInput
                                            placeholder="Category Name (e.g. Electronics)"
                                            value={fName}
                                            onChangeText={setFName}
                                        />
                                        <GlassInput
                                            placeholder="Description (Optional)"
                                            value={fDesc}
                                            onChangeText={setFDesc}
                                        />
                                        <GlassInput
                                            placeholder="Icon Name (e.g. smartphone)"
                                            value={fIcon}
                                            onChangeText={setFIcon}
                                        />
                                    </>
                                ) : modalType === 'location' ? (
                                    <>
                                        <GlassInput
                                            placeholder="Location Name (e.g. Room 201)"
                                            value={fName}
                                            onChangeText={setFName}
                                        />
                                        <GlassInput
                                            placeholder="Block (e.g. NAB, Computing)"
                                            value={fBlock}
                                            onChangeText={setFBlock}
                                        />
                                        <View style={styles.pickerWrap}>
                                            <Text style={styles.pickerLabel}>Location Type</Text>
                                            <View style={styles.typeRow}>
                                                {['Academic', 'Social', 'Facilities', 'Admin'].map(t => (
                                                    <TouchableOpacity 
                                                        key={t}
                                                        style={[styles.typeBtn, fType === t && styles.typeBtnActive]}
                                                        onPress={() => setFType(t)}
                                                    >
                                                        <Text style={[styles.typeBtnText, fType === t && styles.typeBtnTextActive]}>{t}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <GlassInput
                                            placeholder="Hub Name (e.g. Student Center)"
                                            value={fName}
                                            onChangeText={setFName}
                                        />
                                        <GlassInput
                                            placeholder="Exact Location"
                                            value={fLoc}
                                            onChangeText={setFLoc}
                                        />
                                        <GlassInput
                                            placeholder="Description (Optional)"
                                            value={fDesc}
                                            onChangeText={setFDesc}
                                        />
                                    </>
                                )}
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.cancelBtn]} 
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.saveBtn]} 
                                    onPress={handleSaveMetadata}
                                >
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </GlassCard>
                    </BlurView>
                )}

                {/* Edit User Modal */}
                {showUserEditModal && (
                    <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                        <GlassCard style={[styles.modalContent, { backgroundColor: Theme.colors.modalBg }]}>
                            <Text style={styles.modalTitle}>Edit User</Text>
                            
                            <GlassInput
                                placeholder="User Name"
                                value={editUserForm.name}
                                onChangeText={(val) => setEditUserForm({ ...editUserForm, name: val })}
                            />
                            <GlassInput
                                placeholder="Email Address"
                                value={editUserForm.email}
                                onChangeText={(val) => setEditUserForm({ ...editUserForm, email: val })}
                                keyboardType="email-address"
                            />

                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Is Admin?</Text>
                                <TouchableOpacity 
                                    style={[styles.switchBtn, editUserForm.isAdmin && styles.switchBtnActive]}
                                    onPress={() => setEditUserForm({ ...editUserForm, isAdmin: !editUserForm.isAdmin })}
                                >
                                    <View style={[styles.switchKnob, editUserForm.isAdmin && styles.switchKnobActive]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.cancelBtn]} 
                                    onPress={() => setShowUserEditModal(false)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.saveBtn]} 
                                    onPress={handleSaveUser}
                                >
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </GlassCard>
                    </BlurView>
                )}

                {/* User Items Modal */}
                {showUserItemsModal && (
                    <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                        <GlassCard style={[styles.modalContent, { maxHeight: '80%', backgroundColor: Theme.colors.modalBg }]}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitle}>User Listings</Text>
                                <TouchableOpacity onPress={() => setShowUserItemsModal(false)}>
                                    <XCircle size={24} color={Theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={selectedUserItems}
                                renderItem={renderUserItem}
                                keyExtractor={i => i._id}
                                style={{ marginTop: 10 }}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Text style={styles.emptySubText}>This user has no active listings.</Text>
                                }
                            />
                        </GlassCard>
                    </BlurView>
                )}

                {/* Claim Detail Modal */}
                {showClaimDetailModal && selectedClaim && (
                    <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                        <GlassCard style={[styles.modalContent, { maxHeight: '85%', backgroundColor: Theme.colors.modalBg }]}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitle}>Review Request</Text>
                                <TouchableOpacity onPress={() => setShowClaimDetailModal(false)}>
                                    <XCircle size={24} color={Theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionLabel}>Claimant Identity</Text>
                                    <View style={styles.detailCard}>
                                        <Text style={styles.detailMain}>{selectedClaim.requester.name}</Text>
                                        <Text style={styles.detailSub}>{selectedClaim.requester.email}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionLabel}>Referenced Item</Text>
                                    <View style={styles.detailCard}>
                                        <Text style={styles.detailMain}>{selectedClaim.item?.title}</Text>
                                        <Text style={styles.detailSub}>{selectedClaim.item?.category} • {selectedClaim.item?.type}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionLabel}>Verifying Message</Text>
                                    <GlassCard style={styles.messageBox}>
                                        <Text style={styles.messageTextLong}>{selectedClaim.message}</Text>
                                    </GlassCard>
                                </View>

                                {selectedClaim.proofImage && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.sectionLabel}>Visual Proof</Text>
                                        <Image 
                                            source={{ uri: selectedClaim.proofImage }} 
                                            style={styles.proofImageLarge}
                                            resizeMode="cover"
                                        />
                                    </View>
                                )}
                            </ScrollView>

                            {selectedClaim.status === 'Pending' && (
                                <View style={styles.modalActions}>
                                    <TouchableOpacity 
                                        style={[styles.modalBtn, styles.rejectBtnLarge]} 
                                        onPress={() => {
                                            handleUpdateStatus(selectedClaim._id, 'Rejected');
                                            setShowClaimDetailModal(false);
                                        }}
                                    >
                                        <XCircle size={20} color="#fff" />
                                        <Text style={styles.btnTextWhite}>Reject Request</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.modalBtn, styles.approveBtnLarge]} 
                                        onPress={() => {
                                            handleUpdateStatus(selectedClaim._id, 'Approved');
                                            setShowClaimDetailModal(false);
                                        }}
                                    >
                                        <CheckCircle size={20} color="#fff" />
                                        <Text style={styles.btnTextWhite}>Approve Request</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </GlassCard>
                    </BlurView>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.l,
        fontWeight: 'bold',
    },
    statsBar: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 12,
    },
    statsText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    listContent: {
        padding: Theme.spacing.l,
    },
    claimCard: {
        padding: 16,
        marginBottom: 16,
    },
    claimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 0.5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    itemRef: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    itemTitle: {
        color: Theme.colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    message: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.glassBorder,
        paddingTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 0.5,
    },
    rejectBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    approveBtn: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    rejectText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    approveText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        marginBottom: 12,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Theme.colors.glass,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    activeTab: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    tabText: {
        color: Theme.colors.textMuted,
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: Theme.colors.text,
    },
    addButton: {
        width: 44,
        height: 44,
        backgroundColor: Theme.colors.glass,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    metaCard: {
        padding: 12,
        marginBottom: 12,
    },
    metaInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    metaTitle: {
        color: Theme.colors.text,
        fontSize: 15,
        fontWeight: 'bold',
    },
    metaSub: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    metaActions: {
        flexDirection: 'row',
        gap: 16,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
        zIndex: 1000,
    },
    modalContent: {
        padding: 24,
    },
    modalTitle: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    saveBtn: {
        backgroundColor: Theme.colors.primary,
    },
    cancelText: {
        color: Theme.colors.textMuted,
        fontWeight: 'bold',
    },
    saveText: {
        color: Theme.colors.text,
        fontWeight: 'bold',
    },
    tabsWrap: {
        marginBottom: 12,
    },
    actionBtnIcon: {
        padding: 4,
    },
    userItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    userItemTitle: {
        color: Theme.colors.text,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    metaText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    switchLabel: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    switchBtn: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchBtnActive: {
        backgroundColor: Theme.colors.primary,
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    switchKnobActive: {
        transform: [{ translateX: 22 }],
    },
    pickerWrap: {
        marginTop: 10,
        marginBottom: 15,
    },
    pickerLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    typeBtnActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    typeBtnText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
    },
    typeBtnTextActive: {
        color: '#fff',
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    detailsBtnText: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionsSmall: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    detailSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    detailCard: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    detailMain: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailSub: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    messageBox: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    messageTextLong: {
        color: Theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    proofImageLarge: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    rejectBtnLarge: {
        backgroundColor: '#ef4444',
        flex: 1,
    },
    approveBtnLarge: {
        backgroundColor: '#10b981',
        flex: 1,
    },
    btnTextWhite: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default AdminDashboardScreen;
