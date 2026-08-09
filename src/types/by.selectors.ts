/**
 * By Selector Types
 * Extracted from WebElement as part of T-013: Extract locator responsibilities behind a compatibility facade.
 */

export enum By {
    getByAltText = 'getByAltText',
    getByLabel = 'getByLabel',
    getByPlaceholder = 'getByPlaceholder',
    getByRole = 'getByRole',
    getByTestId = 'getByTestId',
    getByText = 'getByText',
    getByTitle = 'getByTitle'
}

export type ByOptions = {
    exact?: boolean
};

export type Role = 'alert' | 'alertdialog'| 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' |
    'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'complementary' | 'contentinfo' | 'definition' |
    'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' |
    'gridcell' | 'group' | 'heading' | 'img' | 'insertion' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' |
    'marquee' | 'math' | 'meter' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' |
    'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' |
    'region' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'separator' | 'slider' |
    'spinbutton' | 'status' | 'strong' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' |
    'tabpanel'| 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem';

export type ByRoleOptions = {
    checked?: boolean,
    disabled?: boolean,
    exact?: boolean,
    expanded?: boolean,
    includeHidden?: boolean,
    level?: number,
    name?: string | RegExp,
    pressed?: boolean,
    selected?: boolean
};
