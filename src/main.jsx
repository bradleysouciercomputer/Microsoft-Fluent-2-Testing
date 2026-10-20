import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Button,
  Input,
  Textarea,
  Tooltip
} from '@fluentui/react-components';
import './styles.css';

const STORAGE_KEY = 'fluent-notes-v1';
const THEME_KEY = 'fluent-notes-theme-v1';

const iconParts = {
  notes: <><rect x="4" y="3.5" width="15.5" height="17" rx="2" /><path d="M8 8h7.5M8 11.5h7.5M8 15h5" /></>,
  star: <path d="m12 3.4 2.65 5.37 5.93.86-4.29 4.18 1.01 5.91L12 16.93l-5.3 2.79 1.01-5.91-4.29-4.18 5.93-.86L12 3.4Z" />,
  archive: <><path d="M4 7.5h16v12H4z" /><path d="M3 3.5h18v4H3zM9 11.5h6" /></>,
  trash: <><path d="M4.5 6.5h15M9 6.5V4h6v2.5M7 6.5l1 13h8l1-13M10 10v6M14 10v6" /></>,
  add: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></>,
  pin: <><path d="m8 4 8 0-1.4 5 3 3v2h-5.1v6l-1 1-1-1v-6H5.5v-2l3-3L8 4Z" /></>,
  tag: <><path d="M3.5 12V5.5h6.7L20 15.3 15.3 20l-9.8-9.8Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  moon: <path d="M19.5 14A7.7 7.7 0 0 1 10 4.5 8.2 8.2 0 1 0 19.5 14Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.7 4.7l1.4 1.4m11.8 11.8 1.4 1.4M2.5 12h2m15 0h2M4.7 19.3l1.4-1.4M17.9 6.1l1.4-1.4" /></>,
  download: <><path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4 18.5v2h16v-2" /></>,
  upload: <><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 18.5v2h16v-2" /></>,
  back: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  bold: <><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z" /></>,
  italic: <><path d="M14 4h-5M15 20h-5M14 4 10 20" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  checklist: <><path d="m3.5 6 1.5 1.5L7.5 5M9.5 6h11M3.5 12l1.5 1.5 2.5-2.5M9.5 12h11M3.5 18l1.5 1.5 2.5-2.5M9.5 18h11" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  file: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>
};

function Icon({ name, size = 18, filled = false }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className="icon-svg">
      {name === 'star' && filled
        ? <path d="m12 3.4 2.65 5.37 5.93.86-4.29 4.18 1.01 5.91L12 16.93l-5.3 2.79 1.01-5.91-4.29-4.18 5.93-.86L12 3.4Z" fill="currentColor" />
        : iconParts[name] || iconParts.notes}
    </svg>
  );
}

function safeReadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((note) => note && typeof note.id === 'string').map((note) => ({
      id: note.id,
      title: typeof note.title === 'string' ? note.title : '',
      content: typeof note.content === 'string' ? note.content : '',
      tags: Array.isArray(note.tags) ? note.tags.filter((tag) => typeof tag === 'string') : [],
      color: typeof note.color === 'string' ? note.color : 'default',
      favorite: Boolean(note.favorite),
      pinned: Boolean(note.pinned),
      archived: Boolean(note.archived),
      deleted: Boolean(note.deleted),
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || note.createdAt || new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

function createId() {
  return window.crypto && typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : 'note-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function formatShortDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatUpdatedDate(value) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved locally';
  return 'Updated ' + new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
}

function previewText(content) {
  return (content || '')
    .replace(/^#{1,6}\s/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/- \[[ xX]\]\s/g, '')
    .replace(/^[*-]\s/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function App() {
  const [notes, setNotes] = useState(safeReadNotes);
  const [selectedId, setSelectedId] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY + '-selected') || ''; } catch { return ''; }
  });
  const [view, setView] = useState('notes');
  const [tagFilter, setTagFilter] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [tagDraft, setTagDraft] = useState('');
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const searchRef = useRef(null);
  const bodyRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY + '-selected', selectedId); } catch { /* storage may be disabled */ }
  }, [selectedId]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, themeMode); } catch { /* storage may be disabled */ }
  }, [themeMode]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(''), 2600);
    return () => window.clearTimeout(timer);
  }, [status]);

  const visibleNotes = useMemo(() => {
    const text = query.trim().toLocaleLowerCase();
    return notes.filter((note) => {
      if (view === 'trash') {
        if (!note.deleted) return false;
      } else if (view === 'archive') {
        if (!note.archived || note.deleted) return false;
      } else {
        if (note.deleted || note.archived) return false;
        if (view === 'favorites' && !note.favorite) return false;
      }
      if (tagFilter && !note.tags.includes(tagFilter)) return false;
      if (text) {
        const haystack = [note.title, note.content, ...note.tags].join(' ').toLocaleLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (view === 'notes' && a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, view, tagFilter, query, sortBy]);

  const currentNote = notes.find((note) => note.id === selectedId) || null;

  useEffect(() => {
    if (!visibleNotes.some((note) => note.id === selectedId)) {
      setSelectedId(visibleNotes[0] ? visibleNotes[0].id : '');
    }
  }, [visibleNotes, selectedId]);

  useEffect(() => {
    setTagDraft(currentNote ? currentNote.tags.join(', ') : '');
  }, [selectedId]);

  const counts = useMemo(() => ({
    notes: notes.filter((note) => !note.deleted && !note.archived).length,
    favorites: notes.filter((note) => !note.deleted && !note.archived && note.favorite).length,
    archive: notes.filter((note) => !note.deleted && note.archived).length,
    trash: notes.filter((note) => note.deleted).length
  }), [notes]);

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.filter((note) => !note.deleted && !note.archived).forEach((note) => {
      note.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const pageTitle = tagFilter || ({
    notes: 'All notes',
    favorites: 'Favorites',
    archive: 'Archive',
    trash: 'Trash'
  }[view] || 'All notes');

  function updateNote(id, patch) {
    setNotes((previous) => previous.map((note) => note.id === id
      ? { ...note, ...patch, updatedAt: new Date().toISOString() }
      : note));
  }

  function updateCurrent(patch) {
    if (currentNote) updateNote(currentNote.id, patch);
  }

  function createNote() {
    const now = new Date().toISOString();
    const note = {
      id: createId(), title: '', content: '', tags: [], color: 'default',
      favorite: false, pinned: false, archived: false, deleted: false,
      createdAt: now, updatedAt: now
    };
    setNotes((previous) => [note, ...previous]);
    setView('notes');
    setTagFilter('');
    setQuery('');
    setSelectedId(note.id);
    setMobileShowEditor(true);
    setColorMenuOpen(false);
    setStatus('New note created');
    window.setTimeout(() => {
      if (document.querySelector('.title-input input')) document.querySelector('.title-input input').focus();
    }, 40);
  }

  function changeView(nextView) {
    setView(nextView);
    setTagFilter('');
    setSelectedId('');
    setMobileShowEditor(false);
    setColorMenuOpen(false);
  }

  function selectNote(id) {
    setSelectedId(id);
    setMobileShowEditor(true);
    setColorMenuOpen(false);
  }

  function archiveCurrent() {
    if (!currentNote) return;
    updateNote(currentNote.id, { archived: true, deleted: false });
    setMobileShowEditor(false);
    setStatus('Note moved to archive');
  }

  function restoreCurrent() {
    if (!currentNote) return;
    updateNote(currentNote.id, { archived: false, deleted: false });
    setView('notes');
    setTagFilter('');
    setMobileShowEditor(true);
    setStatus('Note restored');
  }

  function sendToTrash() {
    if (!currentNote) return;
    updateNote(currentNote.id, { deleted: true, archived: false });
    setMobileShowEditor(false);
    setStatus('Note moved to trash');
  }

  function restoreFromTrash() {
    if (!currentNote) return;
    updateNote(currentNote.id, { deleted: false, archived: false });
    setView('notes');
    setTagFilter('');
    setMobileShowEditor(true);
    setStatus('Note restored');
  }

  function permanentlyDelete(id) {
    if (!window.confirm('Permanently delete this note? This cannot be undone.')) return;
    setNotes((previous) => previous.filter((note) => note.id !== id));
    setSelectedId('');
    setMobileShowEditor(false);
    setStatus('Note permanently deleted');
  }

  function commitTags() {
    if (!currentNote) return;
    const nextTags = Array.from(new Set(tagDraft.split(',').map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
    updateCurrent({ tags: nextTags });
    setTagDraft(nextTags.join(', '));
  }

  function insertFormatting(prefix, suffix = '') {
    if (!currentNote || !bodyRef.current) return;
    const field = bodyRef.current;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selection = currentNote.content.slice(start, end);
    const replacement = prefix + selection + suffix;
    const nextContent = currentNote.content.slice(0, start) + replacement + currentNote.content.slice(end);
    updateCurrent({ content: nextContent });
    window.requestAnimationFrame(() => {
      field.focus();
      const cursor = start + prefix.length + selection.length;
      field.setSelectionRange(cursor, cursor);
    });
  }

  function exportBackup() {
    const backup = {
      format: 'fluent-notes-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      notes
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'fluent-notes-backup.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus('Backup downloaded');
  }

  async function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.notes;
      if (!Array.isArray(incoming)) throw new Error('This file does not contain a notes list.');
      if (!window.confirm('Import this backup and replace the notes currently saved in this browser? Export a backup first if you want to keep a copy.')) return;
      const imported = incoming.filter((note) => note && typeof note === 'object').map((note) => {
        const now = new Date().toISOString();
        return {
          id: typeof note.id === 'string' ? note.id : createId(),
          title: typeof note.title === 'string' ? note.title : '',
          content: typeof note.content === 'string' ? note.content : '',
          tags: Array.isArray(note.tags) ? note.tags.filter((tag) => typeof tag === 'string').slice(0, 12) : [],
          color: typeof note.color === 'string' ? note.color : 'default',
          favorite: Boolean(note.favorite), pinned: Boolean(note.pinned),
          archived: Boolean(note.archived), deleted: Boolean(note.deleted),
          createdAt: note.createdAt || now, updatedAt: note.updatedAt || now
        };
      });
      setNotes(imported);
      setSelectedId(imported[0] ? imported[0].id : '');
      setView('notes');
      setTagFilter('');
      setQuery('');
      setMobileShowEditor(Boolean(imported.length));
      setStatus('Backup imported');
    } catch (error) {
      window.alert('Could not import this file. Choose a Fluent Notes JSON backup. ' + (error && error.message ? error.message : ''));
    } finally {
      event.target.value = '';
    }
  }

  useEffect(() => {
    function handleShortcut(event) {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        createNote();
      } else if (modifier && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setStatus(storageAvailable ? 'Your notes are saved on this device' : 'Browser storage is unavailable');
      } else if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !modifier) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === 'Escape') {
        setColorMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  });

  const noteWords = currentNote && currentNote.content.trim()
    ? currentNote.content.trim().split(/\s+/).length
    : 0;
  const noteChars = currentNote ? currentNote.content.length : 0;
  const colors = [
    { id: 'default', label: 'Default', swatch: 'var(--colorNeutralBackground1)' },
    { id: 'blue', label: 'Blue', swatch: '#dcebf8' },
    { id: 'yellow', label: 'Yellow', swatch: '#fff4ce' },
    { id: 'green', label: 'Green', swatch: '#dff6dd' },
    { id: 'pink', label: 'Pink', swatch: '#fde7e9' },
    { id: 'purple', label: 'Purple', swatch: '#efdefa' }
  ];

  return (
    <FluentProvider theme={themeMode === 'dark' ? webDarkTheme : webLightTheme}>
      <div className={'app-root theme-' + themeMode}>
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark"><Icon name="notes" size={22} /></span>
            <span className="brand-name">Fluent Notes</span>
          </div>
          <div className="topbar-search">
            <Icon name="search" size={18} />
            <Input
              ref={searchRef}
              className="search-input"
              appearance="outline"
              value={query}
              onChange={(_, data) => setQuery(data.value)}
              placeholder="Search notes"
              aria-label="Search notes"
            />
            <kbd>/</kbd>
          </div>
          <div className="topbar-actions">
            <span className={'save-indicator' + (storageAvailable ? '' : ' save-warning')}>
              <span className="save-dot" />
              {storageAvailable ? 'Saved on this device' : 'Storage unavailable'}
            </span>
            <Tooltip content={themeMode === 'dark' ? 'Use light theme' : 'Use dark theme'} relationship="label">
              <Button
                appearance="subtle"
                className="icon-button theme-toggle"
                aria-label={themeMode === 'dark' ? 'Use light theme' : 'Use dark theme'}
                onClick={() => setThemeMode((mode) => mode === 'dark' ? 'light' : 'dark')}
              ><Icon name={themeMode === 'dark' ? 'sun' : 'moon'} /></Button>
            </Tooltip>
            <Button appearance="primary" className="new-note-button" onClick={createNote}>
              <Icon name="add" size={18} /> <span>New note</span>
            </Button>
          </div>
        </header>

        <div className={'workspace' + (mobileShowEditor ? ' editor-open' : '')}>
          <aside className="sidebar">
            <div className="sidebar-brand">
              <span className="sidebar-brand-icon"><Icon name="notes" size={20} /></span>
              <div><strong>Your workspace</strong><span>Personal notebook</span></div>
            </div>
            <div className="sidebar-section-title">WORKSPACE</div>
            <nav className="nav-list" aria-label="Note views">
              {[
                { id: 'notes', label: 'All notes', icon: 'notes', count: counts.notes },
                { id: 'favorites', label: 'Favorites', icon: 'star', count: counts.favorites },
                { id: 'archive', label: 'Archive', icon: 'archive', count: counts.archive },
                { id: 'trash', label: 'Trash', icon: 'trash', count: counts.trash }
              ].map((item) => (
                <Button
                  key={item.id}
                  appearance="subtle"
                  className={'nav-button' + (view === item.id && !tagFilter ? ' nav-selected' : '')}
                  onClick={() => changeView(item.id)}
                >
                  <span className="nav-leading"><Icon name={item.icon} size={18} /></span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-count">{item.count || ''}</span>
                </Button>
              ))}
            </nav>

            <div className="sidebar-divider" />
            <div className="sidebar-section-title tags-section-title">
              <span>YOUR TAGS</span><span className="tag-total">{allTags.length}</span>
            </div>
            <div className="tag-list">
              {allTags.length ? allTags.map((tag) => (
                <button
                  key={tag}
                  className={'tag-nav-item' + (tagFilter === tag ? ' tag-nav-selected' : '')}
                  onClick={() => { setView('notes'); setTagFilter(tag); setSelectedId(''); setMobileShowEditor(false); }}
                >
                  <Icon name="tag" size={15} /><span>{tag}</span>
                  <span className="tag-count">{notes.filter((note) => !note.deleted && !note.archived && note.tags.includes(tag)).length}</span>
                </button>
              )) : <p className="no-tags">Add tags inside a note to organize it here.</p>}
            </div>

            <div className="sidebar-bottom">
              <div className="storage-card">
                <span className="storage-card-icon"><Icon name="file" size={18} /></span>
                <div><strong>Private by design</strong><span>Your notes stay in this browser.</span></div>
              </div>
              <div className="backup-actions">
                <Button appearance="subtle" className="backup-button" onClick={exportBackup}>
                  <Icon name="download" size={16} /> Export backup
                </Button>
                <Button appearance="subtle" className="backup-button" onClick={() => importRef.current?.click()}>
                  <Icon name="upload" size={16} /> Import backup
                </Button>
                <input ref={importRef} className="visually-hidden" type="file" accept=".json,application/json" onChange={importBackup} aria-label="Import Fluent Notes backup" />
              </div>
              <div className="keyboard-tip"><kbd>Ctrl</kbd> + <kbd>N</kbd> <span>New note</span></div>
            </div>
          </aside>

          <section className="notes-panel" aria-label="Notes list">
            <div className="list-header">
              <div className="list-title-row">
                <div>
                  <div className="eyebrow">{tagFilter ? 'TAGGED NOTES' : 'YOUR NOTEBOOK'}</div>
                  <h1>{pageTitle}</h1>
                </div>
                <span className="list-total">{visibleNotes.length}</span>
              </div>
              <div className="list-tools">
                <span>{visibleNotes.length === 1 ? '1 note' : visibleNotes.length + ' notes'}</span>
                <select className="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort notes">
                  <option value="updated">Recently edited</option>
                  <option value="created">Recently created</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
              {tagFilter && <button className="active-filter" onClick={() => setTagFilter('')}><Icon name="tag" size={14} /> {tagFilter}<Icon name="close" size={13} /></button>}
            </div>

            <div className="notes-scroll">
              {visibleNotes.length ? (
                <div className="note-list">
                  {visibleNotes.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className={'note-item color-' + (note.color || 'default') + (selectedId === note.id ? ' note-item-selected' : '')}
                      aria-current={selectedId === note.id ? 'true' : undefined}
                    >
                      <div className="note-item-heading">
                        <span className="note-item-title">{note.title.trim() || 'Untitled note'}</span>
                        <span className="note-item-flags">
                          {note.pinned && <Icon name="pin" size={14} />}
                          {note.favorite && <Icon name="star" size={14} filled />}
                        </span>
                      </div>
                      <p className="note-preview">{previewText(note.content) || 'No additional text'}</p>
                      <div className="note-item-footer">
                        <span>{formatShortDate(note.updatedAt)}</span>
                        <span className="note-item-tags">
                          {note.tags.slice(0, 2).map((tag) => <span className="mini-tag" key={tag}>{tag}</span>)}
                          {note.tags.length > 2 && <span className="mini-tag">+{note.tags.length - 2}</span>}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="list-empty">
                  <div className="empty-icon"><Icon name={query || tagFilter ? 'search' : view === 'trash' ? 'trash' : 'notes'} size={25} /></div>
                  <strong>{query || tagFilter ? 'No matching notes' : view === 'trash' ? 'Trash is empty' : view === 'archive' ? 'Nothing archived yet' : view === 'favorites' ? 'No favorites yet' : 'Your notebook starts here'}</strong>
                  <p>{query || tagFilter ? 'Try another search or clear your filter.' : view === 'trash' ? 'Deleted notes will appear here.' : view === 'archive' ? 'Archive notes you want to keep but do not need every day.' : view === 'favorites' ? 'Star a note to keep it close at hand.' : 'Capture a thought, a plan, or anything worth remembering.'}</p>
                  {view === 'notes' && !query && !tagFilter && <Button appearance="primary" onClick={createNote}><Icon name="add" size={17} /> Create your first note</Button>}
                </div>
              )}
            </div>
            <div className="list-footer"><span className="footer-sparkle">✦</span> A little space for your thoughts</div>
          </section>

          <main className="editor-panel" aria-label="Note editor">
            {currentNote && visibleNotes.some((note) => note.id === currentNote.id) ? (
              <>
                <div className="editor-toolbar">
                  <Button appearance="subtle" className="mobile-back icon-button" onClick={() => setMobileShowEditor(false)} aria-label="Back to notes list"><Icon name="back" /></Button>
                  <div className="editor-status"><span className="status-check"><Icon name="check" size={13} /></span><span>{storageAvailable ? 'Saved locally' : 'Local storage unavailable'}</span></div>
                  <div className="editor-actions">
                    <Tooltip content={currentNote.pinned ? 'Unpin note' : 'Pin note'} relationship="label">
                      <Button appearance="subtle" className={'icon-button' + (currentNote.pinned ? ' action-active' : '')} onClick={() => updateCurrent({ pinned: !currentNote.pinned })} aria-label={currentNote.pinned ? 'Unpin note' : 'Pin note'}>
                        <Icon name="pin" />
                      </Button>
                    </Tooltip>
                    <Tooltip content={currentNote.favorite ? 'Remove from favorites' : 'Add to favorites'} relationship="label">
                      <Button appearance="subtle" className={'icon-button' + (currentNote.favorite ? ' action-active' : '')} onClick={() => updateCurrent({ favorite: !currentNote.favorite })} aria-label={currentNote.favorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <Icon name="star" filled={currentNote.favorite} />
                      </Button>
                    </Tooltip>
                    {view === 'trash' ? (
                      <>
                        <Tooltip content="Restore note" relationship="label">
                          <Button appearance="subtle" className="icon-button" onClick={restoreFromTrash} aria-label="Restore note"><Icon name="check" /></Button>
                        </Tooltip>
                        <Tooltip content="Delete forever" relationship="label">
                          <Button appearance="subtle" className="icon-button danger-icon" onClick={() => permanentlyDelete(currentNote.id)} aria-label="Delete forever"><Icon name="trash" /></Button>
                        </Tooltip>
                      </>
                    ) : view === 'archive' ? (
                      <Tooltip content="Restore from archive" relationship="label">
                        <Button appearance="subtle" className="icon-button" onClick={restoreCurrent} aria-label="Restore from archive"><Icon name="file" /></Button>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip content="Archive note" relationship="label">
                          <Button appearance="subtle" className="icon-button" onClick={archiveCurrent} aria-label="Archive note"><Icon name="archive" /></Button>
                        </Tooltip>
                        <Tooltip content="Move to trash" relationship="label">
                          <Button appearance="subtle" className="icon-button danger-icon" onClick={sendToTrash} aria-label="Move to trash"><Icon name="trash" /></Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>

                <div className="editor-content">
                  <div className="editor-title-wrap">
                    <Input
                      className="title-input"
                      appearance="outline"
                      value={currentNote.title}
                      onChange={(_, data) => updateCurrent({ title: data.value })}
                      placeholder="Untitled note"
                      aria-label="Note title"
                    />
                    <div className="editor-date"><Icon name="clock" size={14} /> {formatUpdatedDate(currentNote.updatedAt)}</div>
                  </div>

                  <div className="editor-tags-row">
                    <Icon name="tag" size={16} />
                    <Input
                      className="tags-input"
                      appearance="outline"
                      value={tagDraft}
                      onChange={(_, data) => setTagDraft(data.value)}
                      onBlur={commitTags}
                      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commitTags(); } }}
                      placeholder="Add tags separated by commas"
                      aria-label="Note tags, separated by commas"
                    />
                  </div>

                  <div className="format-toolbar" role="toolbar" aria-label="Text formatting">
                    <div className="format-group">
                      <Tooltip content="Bold (Markdown)" relationship="label">
                        <Button appearance="subtle" className="format-button" onClick={() => insertFormatting('**', '**')} aria-label="Insert bold markdown"><Icon name="bold" size={17} /></Button>
                      </Tooltip>
                      <Tooltip content="Italic (Markdown)" relationship="label">
                        <Button appearance="subtle" className="format-button" onClick={() => insertFormatting('*', '*')} aria-label="Insert italic markdown"><Icon name="italic" size={17} /></Button>
                      </Tooltip>
                      <span className="format-divider" />
                      <Tooltip content="Bullet list" relationship="label">
                        <Button appearance="subtle" className="format-button" onClick={() => insertFormatting('- ')} aria-label="Start a bullet list"><Icon name="list" size={17} /></Button>
                      </Tooltip>
                      <Tooltip content="Checklist" relationship="label">
                        <Button appearance="subtle" className="format-button" onClick={() => insertFormatting('- [ ] ')} aria-label="Start a checklist"><Icon name="checklist" size={17} /></Button>
                      </Tooltip>
                    </div>
                    <div className="color-picker-wrap">
                      <Tooltip content="Note color" relationship="label">
                        <Button appearance="subtle" className="format-button color-trigger" onClick={() => setColorMenuOpen((open) => !open)} aria-label="Choose note color" aria-expanded={colorMenuOpen}>
                          <span className={'color-dot color-dot-' + (currentNote.color || 'default')} />
                        </Button>
                      </Tooltip>
                      {colorMenuOpen && (
                        <div className="color-menu" role="group" aria-label="Choose note color">
                          {colors.map((color) => (
                            <Tooltip key={color.id} content={color.label} relationship="label">
                              <button
                                type="button"
                                className={'color-choice' + (currentNote.color === color.id ? ' color-choice-active' : '')}
                                style={{ '--swatch': color.swatch }}
                                onClick={() => { updateCurrent({ color: color.id }); setColorMenuOpen(false); }}
                                aria-label={color.label}
                                aria-pressed={currentNote.color === color.id}
                              >{currentNote.color === color.id ? <Icon name="check" size={15} /> : null}</button>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Textarea
                    ref={bodyRef}
                    className="body-input"
                    value={currentNote.content}
                    onChange={(_, data) => updateCurrent({ content: data.value })}
                    placeholder={'Start writing…\n\nA few shortcuts:\n• Use **bold** or *italic* Markdown\n• Add - [ ] for a checklist item\n• Add # at the start of a line for a heading'}
                    aria-label="Note content"
                    resize="none"
                  />

                  <div className="editor-footer">
                    <span>{noteWords} {noteWords === 1 ? 'word' : 'words'} <span className="footer-separator">·</span> {noteChars} characters</span>
                    <span>Stored only in this browser</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="editor-empty">
                <div className="editor-empty-art"><Icon name="notes" size={36} /></div>
                <h2>{query ? 'Nothing to open' : 'Select a note to get started'}</h2>
                <p>{query ? 'Try a different search, or create a new note.' : 'Your notes are a quiet place to collect ideas, plans, and little reminders.'}</p>
                <Button appearance="primary" onClick={createNote}><Icon name="add" size={17} /> New note</Button>
                <span className="editor-empty-hint">Your changes save automatically on this device.</span>
              </div>
            )}
          </main>
        </div>

        {status && <div className="status-toast" role="status" aria-live="polite"><span className="toast-check"><Icon name="check" size={14} /></span>{status}</div>}
      </div>
    </FluentProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
