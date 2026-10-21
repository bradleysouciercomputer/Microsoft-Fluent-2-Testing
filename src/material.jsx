import React, { Children, cloneElement, isValidElement } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/checkbox/checkbox.js';
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

if (typeof document !== 'undefined' && typescaleStyles?.styleSheet &&
    !document.adoptedStyleSheets.includes(typescaleStyles.styleSheet)) {
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, typescaleStyles.styleSheet];
}

const materialSymbols = {
  notes: 'description', star: 'star', archive: 'archive', trash: 'delete',
  add: 'add', search: 'search', pin: 'push_pin', tag: 'label',
  moon: 'dark_mode', sun: 'light_mode', download: 'download', upload: 'upload',
  back: 'arrow_back', bold: 'format_bold', italic: 'format_italic',
  list: 'format_list_bulleted', checklist: 'checklist', more: 'more_horiz',
  close: 'close', check: 'check', file: 'description', clock: 'schedule',
  copy: 'content_copy', eye: 'visibility', edit: 'edit', clear: 'delete_sweep'
};

export function Icon({ name, size = 18, filled = false, className = '' }) {
  return <md-icon aria-hidden="true" className={'m3-icon' + (filled ? ' m3-icon-filled' : '') + (className ? ' ' + className : '')} style={{ fontSize: size + 'px' }}>{materialSymbols[name] || 'description'}</md-icon>;
}

export function Button({ appearance = 'subtle', size = 'medium', className = '', children, ...props }) {
  const iconOnly = /(^|\s)(icon-button|format-button|color-choice)(\s|$)/.test(className);
  const tagName = iconOnly ? 'md-icon-button' : appearance === 'outline' ? 'md-outlined-button' : appearance === 'primary' ? 'md-filled-button' : 'md-text-button';
  return React.createElement(tagName, { ...props, className, 'data-size': size }, children);
}

export function NoteCard({ className = '', onClick, children, ...props }) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event);
    }
  }
  return <div {...props} role="button" tabIndex={0} className={'m3-card-button ' + className} onClick={onClick} onKeyDown={handleKeyDown}>{children}</div>;
}

export function Input({ value = '', onChange, onInput, className = '', ref, ...props }) {
  function handleInput(event) {
    onInput?.(event);
    onChange?.(event, { value: event.currentTarget.value });
  }
  return <md-outlined-text-field {...props} ref={ref} className={'m3-text-field ' + className} value={value} onInput={handleInput} />;
}

export function Textarea({ value = '', onChange, onInput, className = '', resize = 'vertical', ref, ...props }) {
  function handleInput(event) {
    onInput?.(event);
    onChange?.(event, { value: event.currentTarget.value });
  }
  return <md-outlined-text-field {...props} ref={ref} type="textarea" rows="12" className={'m3-text-field m3-textarea ' + className} style={{ resize, ...(props.style || {}) }} value={value} onInput={handleInput} />;
}

export function Select({ value = '', onChange, children, className = '', size = 'medium', ...props }) {
  function handleInput(event) {
    onChange?.(event, { value: event.currentTarget.value });
  }
  const options = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const optionValue = String(child.props.value ?? '');
    return <md-select-option key={child.key ?? optionValue ?? index} value={optionValue} selected={optionValue === String(value)}><div slot="headline">{child.props.children}</div></md-select-option>;
  });
  return <md-outlined-select {...props} className={'m3-select ' + className} value={value} data-size={size} onInput={handleInput}>{options}</md-outlined-select>;
}

export function Option({ value, children }) {
  return <md-select-option value={value}><div slot="headline">{children}</div></md-select-option>;
}

export function Text({ as = 'span', size = 300, weight = 'regular', className = '', children, ...props }) {
  const Tag = as;
  const sizeMap = { 100: 'body-small', 200: 'body-medium', 300: 'body-medium', 400: 'title-medium', 500: 'title-large', 600: 'headline-small', 700: 'headline-medium' };
  const typeScale = sizeMap[size] || sizeMap[300];
  return React.createElement(Tag, { ...props, className: 'm3-text md-typescale-' + typeScale + ' m3-weight-' + weight + (className ? ' ' + className : '') }, children);
}

export function Badge({ appearance = 'outline', color = 'subtle', size = 'small', className = '', children }) {
  return <span className={'m3-badge ' + className} data-appearance={appearance} data-color={color} data-size={size}>{children}</span>;
}

export function Tooltip({ content, children }) {
  if (!isValidElement(children)) return children;
  return cloneElement(children, { title: content });
}

export function Toast({ intent = 'info', className = '', children, ...props }) {
  return <div {...props} className={'m3-snackbar ' + className} data-intent={intent}>{children}</div>;
}

export function ToastTitle({ media, children }) {
  return <div className="m3-snackbar-content">{media && <span className="m3-snackbar-icon">{media}</span>}<span>{children}</span></div>;
}
