/**
 * extension.js
 *
 * Copyright (c) 2025 Andrey Talanin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import getDefaultInputSourceManager from "./getDefaultInputSourceManager.js";
import InputSourceManagerMonitor, { InputSourceManagerMonitorJSDocClass } from "./InputSourceManagerMonitor.js";

/**
 * Contains the singleton instance of the InputSourceManagerMonitor class.
 * @type {InputSourceManagerMonitorJSDocClass | null}
 * */
let _inputSourceManagerMonitor = null;

/**
 * Represents the extension, contains the entry point for GNOME Shell.
 * @exports
 */
export default class UppercaseInputSourceIndicatorExtension extends Extension {
  /**
   * Enables the extension.
   * @public
   */
  enable() {
    if (_inputSourceManagerMonitor != null) {
      return;
    }
    _inputSourceManagerMonitor = new InputSourceManagerMonitor(getDefaultInputSourceManager());
  }

  /**
   * Disables the extension.
   * @public
   */
  disable() {
    /**
     * A note for reviewers from extensions.gnome.org:
     * This extension uses the 'unlock-dialog' session mode because there is also an input source indicator on the lock screen.
     * It is also changed to make it consistent with the panel on the unlocked desktop.
     */
    if (_inputSourceManagerMonitor == null) {
      return;
    }
    _inputSourceManagerMonitor.stop();
    _inputSourceManagerMonitor = null;
  }
}
