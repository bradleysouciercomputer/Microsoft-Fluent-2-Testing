import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Button,
  Input,
  Textarea,
  Tooltip,
  Select,
  Option,
  Text,
  Badge,
  Toast,
  ToastTitle,
  tokens
} from '@fluentui/react-components';
import {
  DocumentRegular,
  StarRegular,
  StarFilled,
  ArchiveRegular,
  DeleteRegular,
  AddRegular,
  SearchRegular,
  PinRegular,
  TagRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  ArrowDownloadRegular,
  ArrowUploadRegular,
  ArrowLeftRegular,
  TextBoldRegular,
  TextItalicRegular,
  TextBulletListRegular,
  CheckboxCheckedRegular,
  DismissRegular,
  CheckmarkRegular,
  ClockRegular,
  CopyRegular,
  EyeRegular,
  EditRegular
} from '@fluentui/react-icons';
import './styles.css';

const STORAGE_KEY = 'fluent-notes-v1';
const THEME_KEY = 'fluent-notes-theme-v1';

const fluentDesignTokens = {
  '--accent': tokens.colorBrandForeground1,
  '--accent-background': tokens.colorBrandBackground,
  '--accent-hover': tokens.colorBrandBackgroundHover,
  '--text': tokens.colorNeutralForeground1,
  '--font-family-base': tokens.fontFamilyBase,
  '--font-size-base-300': tokens.fontSizeBase300,
  '--muted': tokens.colorNeutralForeground2,
  '--subtle': tokens.colorNeutralForeground3,
  '--line': tokens.colorNeutralStroke1,
  '--surface': tokens.colorNeutralBackground1,
  '--surface-soft': tokens.colorNeutralBackground2,
  '--surface-hover': tokens.colorNeutralBackground1Hover,
  '--surface-selected': tokens.colorNeutralBackground1Selected,
  '--surface-3': tokens.colorNeutralBackground3,
  '--brand-background-soft': tokens.colorBrandBackground2,
  '--brand-stroke': tokens.colorBrandStroke1,
  '--foreground-on-brand': tokens.colorNeutralForegroundOnBrand,
  '--status-success': tokens.colorStatusSuccessForeground1,
  '--status-danger': tokens.colorStatusDangerForeground1,
  '--yellow-foreground': tokens.colorPaletteYellowForeground2,
  '--neutral-background-inverted': tokens.colorNeutralBackgroundInverted,
  '--neutral-foreground-inverted': tokens.colorNeutralForegroundInverted,
  '--danger-background': tokens.colorPaletteRedBackground1,
  '--radius-medium': tokens.borderRadiusMedium,
  '--radius-small': tokens.borderRadiusSmall,
  '--shadow': tokens.shadow8,
  '--shadow-large': tokens.shadow16,
  '--note-blue': tokens.colorPaletteBlueBackground2,
  '--note-yellow': tokens.colorPaletteYellowBackground2,
  '--note-green': tokens.colorPaletteGreenBackground2,
  '--note-pink': tokens.colorPaletteBerryBackground2,
  '--note-purple': tokens.colorPalettePurpleBackground2
};

const iconMap = {
  notes: DocumentRegular,
  star: StarRegular,
  archive: ArchiveRegular,
  trash: DeleteRegular,
  add: AddRegular,
  search: SearchRegular,
  pin: PinRegular,
  tag: TagRegular,
  moon: WeatherMoonRegular,
  sun: WeatherSunnyRegular,
  download: ArrowDownloadRegular,
  upload: ArrowUploadRegular,
  back: ArrowLeftRegular,
  bold: TextBoldRegular,
  italic: TextItalicRegular,
  list: TextBulletListRegular,
  checklist: CheckboxCheckedRegular,
  more: DocumentRegular,
  close: DismissRegular,
  check: CheckmarkRegular,
  file: DocumentRegular,
  clock: ClockRegular,
  copy: CopyRegular,
  eye: EyeRegular,
  edit: EditRegular,
  clear: DeleteRegular
};

function Icon({ name, size = 18, filled = false }) {
  const IconComponent = name === 'star' && filled ? StarFilled : (iconMap[name] || DocumentRegular);
  return <IconComponent aria-hidden="true" fontSize={size} className="icon-svg" />;
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

function renderInlineMarkdown(text) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <Text as="strong" key={index} weight="semibold">{token.slice(2, -2)}</Text>;
    }
    if (token.startsWith('~~') && token.endsWith('~~') && token.length > 4) {
      return <Text as="del" key={index}>{token.slice(2, -2)}</Text>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <Text as="em" key={index}>{token.slice(1, -1)}</Text>;
    }
    return token;
  });
}

function renderMarkdown(content) {
  return content.split('\n').map((line, index) => {
    const key = 'line-' + index;
    if (!line.trim()) return <div className="markdown-blank-line" key={key} aria-hidden="true" />;
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      return <Text as={level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'} size={level === 1 ? 500 : level === 2 ? 400 : 300} weight="semibold" className="markdown-heading" key={key}>{renderInlineMarkdown(heading[2])}</Text>;
    }
    const task = line.match(/^\s*-\s+\[([ xX])\]\s*(.*)$/);
    if (task) {
      const checked = task[1].toLowerCase() === 'x';
      return <div className="markdown-task" key={key}>
        <span className={'markdown-checkbox' + (checked ? ' checked' : '')} aria-label={checked ? 'Completed' : 'Not completed'}>{checked ? <Icon name="check" size={12} /> : null}</span>
        <Text as="span" className={checked ? 'markdown-task-done' : ''}>{renderInlineMarkdown(task[2])}</Text>
      </div>;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) return <div className="markdown-list-item" key={key}><Text as="span" aria-hidden="true">•</Text><Text as="span">{renderInlineMarkdown(bullet[1])}</Text></div>;
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) return <Text as="blockquote" className="markdown-quote" key={key}>{renderInlineMarkdown(quote[1])}</Text>;
    return <Text as="p" className="markdown-paragraph" key={key}>{renderInlineMarkdown(line)}</Text>;
  });
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
  const [editorMode, setEditorMode] = useState('write');
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
    setEditorMode('write');
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
    setEditorMode('write');
    setColorMenuOpen(false);
  }

  function duplicateCurrent() {
    if (!currentNote) return;
    const now = new Date().toISOString();
    const duplicate = {
      ...currentNote,
      id: createId(),
      title: currentNote.title.trim() ? currentNote.title.trim() + ' (copy)' : 'Untitled note (copy)',
      favorite: false,
      pinned: false,
      archived: false,
      deleted: false,
      createdAt: now,
      updatedAt: now
    };
    setNotes((previous) => [duplicate, ...previous]);
    setView('notes');
    setTagFilter('');
    setQuery('');
    setSelectedId(duplicate.id);
    setMobileShowEditor(true);
    setEditorMode('write');
    setStatus('Note duplicated');
  }

  function emptyTrash() {
    if (!counts.trash) return;
    if (!window.confirm('Permanently delete all ' + counts.trash + ' notes in the trash? This cannot be undone.')) return;
    setNotes((previous) => previous.filter((note) => !note.deleted));
    setSelectedId('');
    setMobileShowEditor(false);
    setStatus('Trash emptied');
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
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      const usedIds = new Set();
      const imported = incoming.filter((note) => note && typeof note === 'object').map((note) => {
        const now = new Date().toISOString();
        let id = typeof note.id === 'string' && note.id.trim() ? note.id : createId();
        while (usedIds.has(id)) id = createId();
        usedIds.add(id);
        const allowedColors = ['default', 'blue', 'yellow', 'green', 'pink', 'purple'];
        return {
          id,
          title: typeof note.title === 'string' ? note.title : '',
          content: typeof note.content === 'string' ? note.content : '',
          tags: Array.isArray(note.tags) ? Array.from(new Set(note.tags.filter((tag) => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean))).slice(0, 12) : [],
          color: allowedColors.includes(note.color) ? note.color : 'default',
          favorite: Boolean(note.favorite), pinned: Boolean(note.pinned),
          archived: Boolean(note.archived), deleted: Boolean(note.deleted),
          createdAt: note.createdAt || now, updatedAt: note.updatedAt || now
        };
      });
      setNotes(imported);
      setSelectedId(imported[0] ? imported[0].id : '');
      setTagDraft(imported[0] ? imported[0].tags.join(', ') : '');
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
      } else if (modifier && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setEditorMode((mode) => mode === 'write' ? 'preview' : 'write');
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
    { id: 'default', label: 'Default', swatch: tokens.colorNeutralBackground1 },
    { id: 'blue', label: 'Blue', swatch: tokens.colorPaletteBlueBackground2 },
    { id: 'yellow', label: 'Yellow', swatch: tokens.colorPaletteYellowBackground2 },
    { id: 'green', label: 'Green', swatch: tokens.colorPaletteGreenBackground2 },
    { id: 'pink', label: 'Pink', swatch: tokens.colorPaletteBerryBackground2 },
    { id: 'purple', label: 'Purple', swatch: tokens.colorPalettePurpleBackground2 }
  ];

  return (
    <FluentProvider theme={themeMode === 'dark' ? webDarkTheme : webLightTheme}>
      <div className={'app-root theme-' + themeMode} style={fluentDesignTokens}>
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
            <Badge appearance="outline" size="small" className="keyboard-badge">/</Badge>
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
              <div><Text as="strong" weight="semibold">Your workspace</Text><Text as="span">Personal notebook</Text></div>
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
                  <Text as="span" className="nav-count">{item.count || ''}</Text>
                </Button>
              ))}
            </nav>

            <div className="sidebar-divider" />
            <div className="sidebar-section-title tags-section-title">
              <span>YOUR TAGS</span><Badge appearance="outline" size="small" className="tag-total">{allTags.length}</Badge>
            </div>
            <div className="tag-list">
              {allTags.length ? allTags.map((tag) => (
                <Button
                  key={tag}
                  appearance="subtle"
                  className={'tag-nav-item' + (tagFilter === tag ? ' tag-nav-selected' : '')}
                  onClick={() => { setView('notes'); setTagFilter(tag); setSelectedId(''); setMobileShowEditor(false); }}
                >
                  <Icon name="tag" size={15} /><Text as="span">{tag}</Text>
                  <Text as="span" className="tag-count">{notes.filter((note) => !note.deleted && !note.archived && note.tags.includes(tag)).length}</Text>
                </Button>
              )) : <Text as="p" className="no-tags">Add tags inside a note to organize it here.</Text>}
            </div>

            <div className="sidebar-bottom">
              <div className="storage-card">
                <span className="storage-card-icon"><Icon name="file" size={18} /></span>
                <div><Text as="strong" weight="semibold">Private by design</Text><Text as="span">Your notes stay in this browser.</Text></div>
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
              <div className="keyboard-tip"><Badge appearance="outline" size="small" className="keyboard-badge">Ctrl</Badge><Text as="span">+</Text><Badge appearance="outline" size="small" className="keyboard-badge">N</Badge><Text as="span">New note</Text></div>
            </div>
          </aside>

          <section className="notes-panel" aria-label="Notes list">
            <div className="list-header">
              <div className="list-title-row">
                <div>
                  <div className="eyebrow">{tagFilter ? 'TAGGED NOTES' : 'YOUR NOTEBOOK'}</div>
                  <Text as="h1" size={500} weight="semibold" className="page-title">{pageTitle}</Text>
                </div>
                <Badge appearance="outline" size="small" className="list-total">{visibleNotes.length}</Badge>
              </div>
              <div className="list-tools">
                <span>{visibleNotes.length === 1 ? '1 note' : visibleNotes.length + ' notes'}</span>
                <Select className="sort-select" size="small" value={sortBy} onChange={(_, data) => setSortBy(data.value)} aria-label="Sort notes">
                  <Option value="updated">Recently edited</Option>
                  <Option value="created">Recently created</Option>
                  <Option value="title">Title A–Z</Option>
                </Select>
              </div>
              {view === 'trash' && counts.trash > 0 && (
                <div className="trash-clear-row">
                  <Button appearance="subtle" className="trash-clear-button" onClick={emptyTrash}>
                    <Icon name="clear" size={15} /> Empty trash
                  </Button>
                </div>
              )}
              {tagFilter && <Button appearance="subtle" size="small" className="active-filter" onClick={() => setTagFilter('')}><Icon name="tag" size={14} /> {tagFilter}<Icon name="close" size={13} /></Button>}
            </div>

            <div className="notes-scroll">
              {visibleNotes.length ? (
                <div className="note-list">
                  {visibleNotes.map((note) => (
                    <Button
                      type="button"
                      key={note.id}
                      appearance="subtle"
                      className={'note-item color-' + (note.color || 'default') + (selectedId === note.id ? ' note-item-selected' : '')}
                      onClick={() => selectNote(note.id)}
                      aria-current={selectedId === note.id ? 'true' : undefined}
                    >
                      <div className="note-item-heading">
                        <Text as="span" className="note-item-title" weight="semibold">{note.title.trim() || 'Untitled note'}</Text>
                        <span className="note-item-flags">
                          {note.pinned && <Icon name="pin" size={14} />}
                          {note.favorite && <Icon name="star" size={14} filled />}
                        </span>
                      </div>
                      <Text as="p" className="note-preview">{previewText(note.content) || 'No additional text'}</Text>
                      <div className="note-item-footer">
                        <span>{formatShortDate(note.updatedAt)}</span>
                        <span className="note-item-tags">
                          {note.tags.slice(0, 2).map((tag) => <Badge appearance="tint" color="subtle" size="small" className="mini-tag" key={tag}>{tag}</Badge>)}
                          {note.tags.length > 2 && <Badge appearance="tint" color="subtle" size="small" className="mini-tag">+{note.tags.length - 2}</Badge>}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="list-empty">
                  <div className="empty-icon"><Icon name={query || tagFilter ? 'search' : view === 'trash' ? 'trash' : 'notes'} size={25} /></div>
                  <Text as="strong" weight="semibold">{query || tagFilter ? 'No matching notes' : view === 'trash' ? 'Trash is empty' : view === 'archive' ? 'Nothing archived yet' : view === 'favorites' ? 'No favorites yet' : 'Your notebook starts here'}</Text>
                  <Text as="p">{query || tagFilter ? 'Try another search or clear your filter.' : view === 'trash' ? 'Deleted notes will appear here.' : view === 'archive' ? 'Archive notes you want to keep but do not need every day.' : view === 'favorites' ? 'Star a note to keep it close at hand.' : 'Capture a thought, a plan, or anything worth remembering.'}</Text>
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
                    <Tooltip content="Duplicate note" relationship="label">
                      <Button appearance="subtle" className="icon-button" onClick={duplicateCurrent} aria-label="Duplicate note">
                        <Icon name="copy" />
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
                        <Button appearance="subtle" className="format-button" disabled={editorMode === 'preview'} onClick={() => insertFormatting('**', '**')} aria-label="Insert bold markdown"><Icon name="bold" size={17} /></Button>
                      </Tooltip>
                      <Tooltip content="Italic (Markdown)" relationship="label">
                        <Button appearance="subtle" className="format-button" disabled={editorMode === 'preview'} onClick={() => insertFormatting('*', '*')} aria-label="Insert italic markdown"><Icon name="italic" size={17} /></Button>
                      </Tooltip>
                      <span className="format-divider" />
                      <Tooltip content="Bullet list" relationship="label">
                        <Button appearance="subtle" className="format-button" disabled={editorMode === 'preview'} onClick={() => insertFormatting('- ')} aria-label="Start a bullet list"><Icon name="list" size={17} /></Button>
                      </Tooltip>
                      <Tooltip content="Checklist" relationship="label">
                        <Button appearance="subtle" className="format-button" disabled={editorMode === 'preview'} onClick={() => insertFormatting('- [ ] ')} aria-label="Start a checklist"><Icon name="checklist" size={17} /></Button>
                      </Tooltip>
                      <Button
                        appearance="subtle"
                        className={'format-preview-button' + (editorMode === 'preview' ? ' preview-active' : '')}
                        onClick={() => setEditorMode((mode) => mode === 'write' ? 'preview' : 'write')}
                        aria-label={editorMode === 'preview' ? 'Switch to writing mode' : 'Preview formatted note'}
                        aria-pressed={editorMode === 'preview'}
                      >
                        <Icon name={editorMode === 'preview' ? 'edit' : 'eye'} size={16} />
                        <span>{editorMode === 'preview' ? 'Write' : 'Preview'}</span>
                      </Button>
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
                              <Button
                                type="button"
                                appearance="subtle"
                                className={'color-choice' + (currentNote.color === color.id ? ' color-choice-active' : '')}
                                style={{ '--swatch': color.swatch }}
                                onClick={() => { updateCurrent({ color: color.id }); setColorMenuOpen(false); }}
                                aria-label={color.label}
                                aria-pressed={currentNote.color === color.id}
                              >{currentNote.color === color.id ? <Icon name="check" size={15} /> : null}</Button>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {editorMode === 'write' ? (
                    <Textarea
                      ref={bodyRef}
                      className="body-input"
                      value={currentNote.content}
                      onChange={(_, data) => updateCurrent({ content: data.value })}
                      placeholder={'Start writing…\n\nA few shortcuts:\n• Use **bold** or *italic* Markdown\n• Add - [ ] for a checklist item\n• Add # at the start of a line for a heading'}
                      aria-label="Note content"
                      resize="none"
                    />
                  ) : (
                    <div className="markdown-preview" aria-label="Formatted note preview">
                      {currentNote.content.trim()
                        ? renderMarkdown(currentNote.content)
                        : <Text as="p" className="markdown-empty">Nothing to preview yet. Switch back to Write to add some text.</Text>}
                    </div>
                  )}

                  <div className="editor-footer">
                    <span>{noteWords} {noteWords === 1 ? 'word' : 'words'} <span className="footer-separator">·</span> {noteChars} characters</span>
                    <span>Stored only in this browser</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="editor-empty">
                <div className="editor-empty-art"><Icon name="notes" size={36} /></div>
                <Text as="h2" size={500} weight="semibold">{query ? 'Nothing to open' : 'Select a note to get started'}</Text>
                <Text as="p">{query ? 'Try a different search, or create a new note.' : 'Your notes are a quiet place to collect ideas, plans, and little reminders.'}</Text>
                <Button appearance="primary" onClick={createNote}><Icon name="add" size={17} /> New note</Button>
                <span className="editor-empty-hint">Your changes save automatically on this device.</span>
              </div>
            )}
          </main>
        </div>

        {status && <Toast intent="success" className="status-toast" role="status" aria-live="polite"><ToastTitle media={<Icon name="check" size={14} />}>{status}</ToastTitle></Toast>}
      </div>
    </FluentProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
