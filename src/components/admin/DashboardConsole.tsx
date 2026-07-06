'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, FiTrash2, FiEdit2, FiCheck, FiFolder, FiAward, 
  FiMessageSquare, FiAlertTriangle, FiUsers, FiLogOut
} from 'react-icons/fi';
import { FaGamepad } from 'react-icons/fa';
import { 
  createGameAction, updateGameAction, deleteGameAction,
  createCategoryAction, updateCategoryAction, deleteCategoryAction,
  createPublisherAction, updatePublisherAction, deletePublisherAction,
  deleteCommentAction, resolveReportAction,
  addAdminAction, removeAdminAction, adminLogoutAction
} from '@/lib/actions';
import { Game, Category, Publisher, DownloadLink, Comment, Report, Admin, Mirror } from '@/lib/types';
import Image from 'next/image';

interface FlatMirror {
  id: string;
  version: string;
  label: string;
  url: string;
}

interface DashboardConsoleProps {
  initialGames: (Game & { publisher?: Publisher; categories?: Category[]; download_links?: DownloadLink[] })[];
  initialCategories: Category[];
  initialPublishers: Publisher[];
  initialComments: (Comment & { game_title?: string })[];
  initialReports: (Report & { game_title?: string })[];
  initialAdmins: Admin[];
  adminRole: string;
}

export default function DashboardConsole({
  initialGames,
  initialCategories,
  initialPublishers,
  initialComments,
  initialReports,
  initialAdmins,
  adminRole
}: DashboardConsoleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'games' | 'categories' | 'publishers' | 'comments' | 'reports' | 'admins'>('games');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  const [activeModal, setActiveModal] = useState<'game' | 'category' | 'publisher' | 'admin' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);



  const [gameTitle, setGameTitle] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [gameCover, setGameCover] = useState('');
  const [gameScreenshots, setGameScreenshots] = useState('');
  const [gameTrailer, setGameTrailer] = useState('');
  const [gameType, setGameType] = useState('NSP');
  const [gameTitleId, setGameTitleId] = useState('');
  const [gameLang, setGameLang] = useState('English');
  const [gameFirmware, setGameFirmware] = useState('');
  const [gameRelease, setGameRelease] = useState('');
  const [gameSize, setGameSize] = useState('');
  const [gameVersion, setGameVersion] = useState('1.0.0');
  const [gamePubId, setGamePubId] = useState('');
  const [gameCategoryIds, setGameCategoryIds] = useState<string[]>([]);

  const [gameDownloads, setGameDownloads] = useState<FlatMirror[]>([]);
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newMirrorLabel, setNewMirrorLabel] = useState('Google Drive');
  const [newMirrorUrl, setNewMirrorUrl] = useState('');


  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');


  const [pubName, setPubName] = useState('');
  const [pubSlug, setPubSlug] = useState('');
  const [pubLogo, setPubLogo] = useState('');
  const [pubDesc, setPubDesc] = useState('');


  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');


  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push('/admin/login');
    router.refresh();
  };


  const openGameModal = (game?: any) => {
    if (game) {
      setEditId(game.id);
      setGameTitle(game.title);
      setGameSlug(game.slug);
      setGameDesc(game.description);
      setGameCover(game.cover_image);
      setGameScreenshots(game.screenshots.join(', '));
      setGameTrailer(game.trailer_url);
      setGameType(game.type);
      setGameTitleId(game.title_id);
      setGameLang(game.languages);
      setGameFirmware(game.required_firmware);
      setGameRelease(game.release_date);
      setGameSize(game.game_size);
      setGameVersion(game.game_version);
      setGamePubId(game.publisher_id || '');
      setGameCategoryIds(game.categories?.map((c: any) => c.id) || []);
      const matchedGame = initialGames.find(g => g.id === game.id);
      const dbLinks = matchedGame?.download_links || [];
      const initialFlat: FlatMirror[] = [];
      dbLinks.forEach(link => {
        link.mirrors?.forEach(m => {
          initialFlat.push({
            id: Math.random().toString(36).substring(2, 9),
            version: link.version,
            label: m.label,
            url: m.url
          });
        });
      });
      setGameDownloads(initialFlat);
    } else {
      setEditId(null);
      setGameTitle('');
      setGameSlug('');
      setGameDesc('');
      setGameCover('');
      setGameScreenshots('');
      setGameTrailer('');
      setGameType('NSP');
      setGameTitleId('');
      setGameLang('English, Japanese');
      setGameFirmware('');
      setGameRelease('');
      setGameSize('');
      setGameVersion('1.0.0');
      setGamePubId('');
      setGameCategoryIds([]);
      setGameDownloads([]);
    }
    setActiveModal('game');
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const screenshotUrls = gameScreenshots.split(',').map(s => s.trim()).filter(Boolean);
    const gameData: Partial<Game> = {
      title: gameTitle,
      slug: gameSlug || gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: gameDesc,
      cover_image: gameCover,
      screenshots: screenshotUrls,
      trailer_url: gameTrailer,
      type: gameType,
      title_id: gameTitleId,
      languages: gameLang,
      required_firmware: gameFirmware,
      release_date: gameRelease,
      game_size: gameSize,
      game_version: gameVersion,
      publisher_id: gamePubId
    };
    const groupedByVersion: Record<string, Mirror[]> = {};
    gameDownloads.forEach(m => {
      if (!m.version.trim() || !m.url.trim()) return;
      if (!groupedByVersion[m.version]) {
        groupedByVersion[m.version] = [];
      }
      groupedByVersion[m.version].push({ label: m.label, url: m.url });
    });
    const downloadLinksToSend = Object.entries(groupedByVersion).map(([version, mirrors]) => ({
      version,
      mirrors
    }));
    try {
      if (editId) {
        await updateGameAction(editId, gameData, gameCategoryIds, downloadLinksToSend);
        showFeedback('Game updated successfully!');
      } else {
        await createGameAction(gameData, gameCategoryIds, downloadLinksToSend);
        showFeedback('Game created successfully!');
      }
      setActiveModal(null);
      router.refresh();
    } catch (e: any) {
      showFeedback(e.message || 'Error saving game', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game? This will remove all associated comments, downloads, and reports.')) return;
    try {
      await deleteGameAction(id);
      showFeedback('Game deleted.');
      router.refresh();
    } catch (e: any) {
      showFeedback('Error deleting game.', true);
    }
  };


  const addMirrorToDownloads = () => {
    if (!newVersionTitle || !newMirrorUrl) {
      alert('Please fill version title and mirror URL');
      return;
    }
    const newId = Math.random().toString(36).substring(2, 9);
    setGameDownloads([
      ...gameDownloads,
      {
        id: newId,
        version: newVersionTitle,
        label: newMirrorLabel,
        url: newMirrorUrl
      }
    ]);
    setNewMirrorUrl('');
  };


  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditId(cat.id);
      setCatName(cat.name);
      setCatSlug(cat.slug);
    } else {
      setEditId(null);
      setCatName('');
      setCatSlug('');
    }
    setActiveModal('category');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      if (editId) {
        await updateCategoryAction(editId, catName, slug);
        showFeedback('Category updated.');
      } else {
        await createCategoryAction(catName, slug);
        showFeedback('Category created.');
      }
      setActiveModal(null);
      router.refresh();
    } catch (e: any) {
      showFeedback('Error saving category.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category? Games in this category will remain, but the relation will be deleted.')) return;
    try {
      await deleteCategoryAction(id);
      showFeedback('Category deleted.');
      router.refresh();
    } catch (e: any) {
      showFeedback('Error deleting category.', true);
    }
  };


  const openPublisherModal = (pub?: Publisher) => {
    if (pub) {
      setEditId(pub.id);
      setPubName(pub.name);
      setPubSlug(pub.slug);
      setPubLogo(pub.logo);
      setPubDesc(pub.description);
    } else {
      setEditId(null);
      setPubName('');
      setPubSlug('');
      setPubLogo('');
      setPubDesc('');
    }
    setActiveModal('publisher');
  };

  const handleSavePublisher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = pubSlug || pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      if (editId) {
        await updatePublisherAction(editId, pubName, slug, pubLogo, pubDesc);
        showFeedback('Publisher updated.');
      } else {
        await createPublisherAction(pubName, slug, pubLogo, pubDesc);
        showFeedback('Publisher created.');
      }
      setActiveModal(null);
      router.refresh();
    } catch (e: any) {
      showFeedback('Error saving publisher.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePublisher = async (id: string) => {
    if (!confirm('Delete publisher? All associated games will lose their publisher connection.')) return;
    try {
      await deletePublisherAction(id);
      showFeedback('Publisher deleted.');
      router.refresh();
    } catch (e: any) {
      showFeedback('Error deleting publisher.', true);
    }
  };


  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteCommentAction(id);
      showFeedback('Comment deleted.');
      router.refresh();
    } catch (e) {
      showFeedback('Error deleting comment.', true);
    }
  };


  const handleResolveReport = async (id: string) => {
    try {
      await resolveReportAction(id);
      showFeedback('Report marked resolved.');
      router.refresh();
    } catch (e) {
      showFeedback('Error resolving report.', true);
    }
  };


  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setLoading(true);
    try {
      await addAdminAction(newAdminEmail, newAdminRole);
      setNewAdminEmail('');
      showFeedback('Admin user added successfully.');
      router.refresh();
    } catch (e) {
      showFeedback('Error adding admin.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (adminRole !== 'super_admin') {
      alert('Only Super Admins can manage admins.');
      return;
    }
    if (!confirm('Remove this administrator?')) return;
    try {
      await removeAdminAction(id);
      showFeedback('Admin removed.');
      router.refresh();
    } catch (e) {
      showFeedback('Error removing admin.', true);
    }
  };


  const tabs = [
    { id: 'games', label: 'Games', icon: FaGamepad },
    { id: 'categories', label: 'Categories', icon: FiFolder },
    { id: 'publishers', label: 'Publishers', icon: FiAward },
    { id: 'comments', label: 'Comments', icon: FiMessageSquare },
    { id: 'reports', label: 'Reports', icon: FiAlertTriangle },
    { id: 'admins', label: 'Admins', icon: FiUsers },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8 w-full flex-grow">
      
      {/* Sidebar Navigation */}
      <aside className="md:w-64 bg-bg-card border border-white/5 p-6 rounded-3xl shrink-0 flex flex-col gap-6 h-fit">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Control Panel</span>
          <h2 className="text-xl font-black text-text-primary mt-1 uppercase tracking-tight">SWC Console</h2>
          <span className="text-xs bg-brand-purple/15 text-brand-purple px-2 py-0.5 rounded-full mt-2 w-fit font-bold capitalize">
            Role: {adminRole.replace('_', ' ')}
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-red to-brand-purple text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 text-xs font-semibold text-text-secondary hover:text-brand-red px-4 py-3 rounded-xl hover:bg-white/5 transition-all w-full cursor-pointer text-left"
        >
          <FiLogOut className="w-4.5 h-4.5" />
          Logout Console
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Feedback Messages */}
        {error && (
          <div className="text-xs font-semibold bg-brand-red/10 border border-brand-red/20 text-brand-red p-3 rounded-xl animate-fade-in">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* Tab Panel Content */}
        {activeTab === 'games' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Manage Games</h3>
                <p className="text-xs text-text-secondary mt-0.5">Add, edit, or delete Nintendo Switch ROM files</p>
              </div>
              <button
                onClick={() => openGameModal()}
                className="flex items-center gap-1.5 bg-brand-red text-white hover:bg-brand-red/90 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <FiPlus /> Add Game
              </button>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                      <th className="p-4">Game info</th>
                      <th className="p-4">Format</th>
                      <th className="p-4">FW Required</th>
                      <th className="p-4">Publisher</th>
                      <th className="p-4">Likes</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialGames.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-secondary">No games in database. Click Add Game to create one.</td>
                      </tr>
                    ) : (
                      initialGames.map((game) => (
                        <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="relative w-10 h-13 rounded-lg overflow-hidden bg-bg-surface border border-white/10 shrink-0">
                              <img src={game.cover_image} alt="" className="object-cover w-full h-full" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary line-clamp-1">{game.title}</span>
                              <span className="text-[10px] text-text-secondary font-mono">{game.title_id}</span>
                            </div>
                          </td>
                          <td className="p-4"><span className="text-xs font-bold uppercase">{game.type}</span></td>
                          <td className="p-4"><span className="text-xs font-mono">v{game.required_firmware}</span></td>
                          <td className="p-4 text-xs font-semibold text-brand-purple">{game.publisher?.name || 'N/A'}</td>
                          <td className="p-4 text-xs font-semibold">{game.likes}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openGameModal(game)}
                                className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-purple rounded-lg transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGame(game.id)}
                                className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Manage Categories</h3>
                <p className="text-xs text-text-secondary mt-0.5">Create game categories and genres</p>
              </div>
              <button
                onClick={() => openCategoryModal()}
                className="flex items-center gap-1.5 bg-brand-red text-white hover:bg-brand-red/90 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <FiPlus /> Add Category
              </button>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                    <th className="p-4">Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-text-secondary">No categories setup.</td>
                    </tr>
                  ) : (
                    initialCategories.map((cat) => (
                      <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-text-primary">{cat.name}</td>
                        <td className="p-4 font-mono text-xs text-text-secondary">{cat.slug}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openCategoryModal(cat)}
                              className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-purple rounded-lg transition-colors cursor-pointer"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'publishers' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Manage Publishers</h3>
                <p className="text-xs text-text-secondary mt-0.5">Manage game development houses/publishers</p>
              </div>
              <button
                onClick={() => openPublisherModal()}
                className="flex items-center gap-1.5 bg-brand-red text-white hover:bg-brand-red/90 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <FiPlus /> Add Publisher
              </button>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                    <th className="p-4">Logo & Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialPublishers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-secondary">No publishers in database.</td>
                    </tr>
                  ) : (
                    initialPublishers.map((pub) => (
                      <tr key={pub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-bg-surface border border-white/10 shrink-0">
                            <img src={pub.logo} alt="" className="object-cover w-full h-full" />
                          </div>
                          <span className="font-bold text-text-primary">{pub.name}</span>
                        </td>
                        <td className="p-4 font-mono text-xs text-text-secondary">{pub.slug}</td>
                        <td className="p-4 text-xs text-text-secondary max-w-xs truncate">{pub.description}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPublisherModal(pub)}
                              className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-purple rounded-lg transition-colors cursor-pointer"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePublisher(pub.id)}
                              className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Manage Comments</h3>
              <p className="text-xs text-text-secondary mt-0.5">Delete comments or moderate discussion</p>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                    <th className="p-4">Game</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Comment Content</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialComments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-secondary">No comments left on the website.</td>
                    </tr>
                  ) : (
                    initialComments.map((comm) => (
                      <tr key={comm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-text-primary text-xs truncate max-w-[120px]">{comm.game_title}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-text-primary">{comm.username}</span>
                            <span className="text-[10px] text-text-secondary">{comm.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-text-secondary max-w-sm whitespace-pre-wrap">{comm.content}</td>
                        <td className="p-4 text-[10px] text-text-secondary">{new Date(comm.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteComment(comm.id)}
                            className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Manage Reports</h3>
              <p className="text-xs text-text-secondary mt-0.5">Review issues and resolve offline links</p>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                    <th className="p-4">Game</th>
                    <th className="p-4">Reporter</th>
                    <th className="p-4">Issue Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-secondary">No bug reports. Links are operating fine!</td>
                    </tr>
                  ) : (
                    initialReports.map((rep) => (
                      <tr key={rep.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-text-primary text-xs">{rep.game_title}</td>
                        <td className="p-4 text-xs text-text-secondary">{rep.email}</td>
                        <td className="p-4 text-xs text-text-secondary max-w-xs whitespace-pre-wrap">{rep.reason}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.resolved 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-brand-red/10 text-brand-red border border-brand-red/20'
                          }`}>
                            {rep.resolved ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {!rep.resolved && (
                            <button
                              onClick={() => handleResolveReport(rep.id)}
                              className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ml-auto"
                            >
                              <FiCheck className="w-3.5 h-3.5" /> Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Add Admin Form */}
              <div className="md:col-span-5 bg-bg-card border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                <h3 className="text-lg font-black uppercase text-text-primary tracking-tight">Create Administrator</h3>
                <p className="text-xs text-text-secondary">
                  Authorize additional email addresses for console management operations.
                </p>
                <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@swclibrary.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase">Role</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as any)}
                      className="input-field text-sm select-none"
                    >
                      <option value="admin">Administrator</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-2.5 rounded-xl transition-all duration-200 text-sm cursor-pointer"
                  >
                    Authorize Administrator
                  </button>
                </form>
              </div>

              {/* Admin List */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <h3 className="text-lg font-black uppercase text-text-primary tracking-tight">Authorized Admins</h3>
                <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                        <th className="p-4">User Email</th>
                        <th className="p-4">Permission Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialAdmins.map((adm) => (
                        <tr key={adm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-text-primary text-xs">{adm.user_id}</td>
                          <td className="p-4 text-xs font-semibold text-brand-purple">{adm.role.replace('_', ' ')}</td>
                          <td className="p-4 text-right">
                            {adm.user_id !== 'admin@swclibrary.com' && (
                              <button
                                onClick={() => handleRemoveAdmin(adm.id)}
                                disabled={adminRole !== 'super_admin'}
                                className="p-2 hover:bg-white/5 text-text-secondary hover:text-brand-red rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={adminRole !== 'super_admin' ? 'Super Admin role required' : ''}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* CRUD Modals */}
      {activeModal === 'game' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          
          <form onSubmit={handleSaveGame} className="relative w-full max-w-4xl bg-bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase text-text-primary border-b border-white/5 pb-2">
              {editId ? 'Edit Game File' : 'Register New Game File'}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Game Title</label>
                <input
                  type="text" required placeholder="e.g. Super Mario Odyssey"
                  value={gameTitle} onChange={(e) => setGameTitle(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Slug (URL Name)</label>
                <input
                  type="text" placeholder="e.g. super-mario-odyssey (auto-generated if empty)"
                  value={gameSlug} onChange={(e) => setGameSlug(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Game Description</label>
                <textarea
                  required rows={3} placeholder="Full game details and information..."
                  value={gameDesc} onChange={(e) => setGameDesc(e.target.value)}
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Cover Image (URL)</label>
                <input
                  type="url" required placeholder="e.g. https://domain.com/image.jpg"
                  value={gameCover} onChange={(e) => setGameCover(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Screenshots (Comma separated URLs)</label>
                <input
                  type="text" placeholder="e.g. url1.jpg, url2.jpg, url3.jpg"
                  value={gameScreenshots} onChange={(e) => setGameScreenshots(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">YouTube Trailer (Embed URL)</label>
                <input
                  type="url" placeholder="e.g. https://www.youtube.com/embed/code"
                  value={gameTrailer} onChange={(e) => setGameTrailer(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Format Type</label>
                <select
                  value={gameType} onChange={(e) => setGameType(e.target.value)}
                  className="input-field text-sm select-none"
                >
                  <option value="NSP">NSP (Nintendo Submission Package)</option>
                  <option value="XCI">XCI (Switch Game Card Image)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Title ID</label>
                <input
                  type="text" required placeholder="e.g. 0100000000010000"
                  value={gameTitleId} onChange={(e) => setGameTitleId(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Languages</label>
                <input
                  type="text" required placeholder="e.g. English, French, Japanese"
                  value={gameLang} onChange={(e) => setGameLang(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Required Firmware</label>
                <input
                  type="text" required placeholder="e.g. 15.0.1"
                  value={gameFirmware} onChange={(e) => setGameFirmware(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Release Date</label>
                <input
                  type="date" required
                  value={gameRelease} onChange={(e) => setGameRelease(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Game Size</label>
                <input
                  type="text" required placeholder="e.g. 5.6 GB"
                  value={gameSize} onChange={(e) => setGameSize(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Game Version</label>
                <input
                  type="text" required placeholder="e.g. 1.3.0"
                  value={gameVersion} onChange={(e) => setGameVersion(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Publisher</label>
                <select
                  value={gamePubId} required onChange={(e) => setGamePubId(e.target.value)}
                  className="input-field text-sm select-none"
                >
                  <option value="">Select Publisher...</option>
                  {initialPublishers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Categories / Genres</label>
                <div className="flex flex-wrap gap-2 bg-bg-card p-3 rounded-lg border border-white/10 max-h-32 overflow-y-auto">
                  {initialCategories.map(cat => {
                    const checked = gameCategoryIds.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setGameCategoryIds(gameCategoryIds.filter(id => id !== cat.id));
                            } else {
                              setGameCategoryIds([...gameCategoryIds, cat.id]);
                            }
                          }}
                        />
                        {cat.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Download Links Section */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-text-primary uppercase tracking-tight">Download Links</h4>
              
              <div className="bg-bg-card p-4 rounded-xl flex flex-col gap-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text" placeholder="Version (e.g. Base Game v1.0)"
                    value={newVersionTitle} onChange={(e) => setNewVersionTitle(e.target.value)}
                    className="input-field text-xs"
                  />
                  <select
                    value={newMirrorLabel} onChange={(e) => setNewMirrorLabel(e.target.value)}
                    className="input-field text-xs select-none"
                  >
                    <option value="Direct Download">Direct Download</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="Mega">Mega</option>
                    <option value="1Fichier">1Fichier</option>
                    <option value="MediaFire">MediaFire</option>
                    <option value="BayFiles">BayFiles</option>
                    <option value="FilePress">FilePress</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="url" placeholder="Mirror URL"
                      value={newMirrorUrl} onChange={(e) => setNewMirrorUrl(e.target.value)}
                      className="input-field text-xs flex-1"
                    />
                    <button
                      type="button" onClick={addMirrorToDownloads}
                      className="bg-brand-purple hover:bg-brand-purple/90 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto mt-2">
                  {gameDownloads.length === 0 ? (
                    <span className="text-xs text-text-secondary text-center py-4">No download links added yet.</span>
                  ) : (
                    Object.entries(
                      gameDownloads.reduce((acc, m) => {
                        if (!acc[m.label]) {
                          acc[m.label] = [];
                        }
                        acc[m.label].push(m);
                        return acc;
                      }, {} as Record<string, FlatMirror[]>)
                    ).map(([label, mirrors]) => (
                      <div key={label} className="flex flex-col gap-2 bg-bg-surface/50 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">{label}</span>
                        <div className="flex flex-col gap-2">
                          {mirrors.map((m) => (
                            <div key={m.id} className="flex flex-col sm:flex-row gap-2 items-center bg-bg-surface p-2 rounded-lg border border-white/5">
                              <input
                                type="text"
                                value={m.version}
                                onChange={(e) => setGameDownloads(gameDownloads.map(item => item.id === m.id ? { ...item, version: e.target.value } : item))}
                                className="input-field text-xs flex-1 w-full"
                                placeholder="Version"
                              />
                              <input
                                type="url"
                                value={m.url}
                                onChange={(e) => setGameDownloads(gameDownloads.map(item => item.id === m.id ? { ...item, url: e.target.value } : item))}
                                className="input-field text-xs flex-2 w-full"
                                placeholder="URL"
                              />
                              <select
                                value={m.label}
                                onChange={(e) => setGameDownloads(gameDownloads.map(item => item.id === m.id ? { ...item, label: e.target.value } : item))}
                                className="input-field text-xs select-none w-full sm:w-32"
                              >
                                <option value="Direct Download">Direct Download</option>
                                <option value="Google Drive">Google Drive</option>
                                <option value="Mega">Mega</option>
                                <option value="1Fichier">1Fichier</option>
                                <option value="MediaFire">MediaFire</option>
                                <option value="BayFiles">BayFiles</option>
                                <option value="FilePress">FilePress</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setGameDownloads(gameDownloads.filter(item => item.id !== m.id))}
                                className="text-brand-red hover:underline font-bold text-xs shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
              <button
                type="button" onClick={() => setActiveModal(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-text-primary font-bold px-4 py-2 rounded-xl text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-2 rounded-xl text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Game'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeModal === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          
          <form onSubmit={handleSaveCategory} className="relative w-full max-w-md bg-bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col gap-4">
            <h3 className="text-lg font-black uppercase text-text-primary border-b border-white/5 pb-2">
              {editId ? 'Edit Category' : 'Add Category'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Category Name</label>
              <input
                type="text" required placeholder="e.g. Fighting"
                value={catName} onChange={(e) => setCatName(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Slug</label>
              <input
                type="text" placeholder="e.g. fighting (auto-generated if empty)"
                value={catSlug} onChange={(e) => setCatSlug(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button" onClick={() => setActiveModal(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-text-primary font-bold px-4 py-2 rounded-xl text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-2 rounded-xl text-sm cursor-pointer disabled:opacity-50"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {activeModal === 'publisher' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          
          <form onSubmit={handleSavePublisher} className="relative w-full max-w-md bg-bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col gap-4">
            <h3 className="text-lg font-black uppercase text-text-primary border-b border-white/5 pb-2">
              {editId ? 'Edit Publisher' : 'Add Publisher'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Publisher Name</label>
              <input
                type="text" required placeholder="e.g. Ubisoft"
                value={pubName} onChange={(e) => setPubName(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Slug</label>
              <input
                type="text" placeholder="e.g. ubisoft (auto-generated if empty)"
                value={pubSlug} onChange={(e) => setPubSlug(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Logo Image URL</label>
              <input
                type="url" required placeholder="e.g. https://logo.com/logo.jpg"
                value={pubLogo} onChange={(e) => setPubLogo(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase">Description</label>
              <textarea
                required rows={3} placeholder="About the publisher..."
                value={pubDesc} onChange={(e) => setPubDesc(e.target.value)}
                className="input-field text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button" onClick={() => setActiveModal(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-text-primary font-bold px-4 py-2 rounded-xl text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-2 rounded-xl text-sm cursor-pointer disabled:opacity-50"
              >
                Save Publisher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
