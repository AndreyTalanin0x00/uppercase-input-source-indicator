/**
 * InputSourceManagerMonitor.js
 *
 * Copyright (c) 2026 Andrey Talanin
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

import GObject from "gi://GObject";
import { InputSourceManager } from "resource:///org/gnome/shell/ui/status/keyboard.js";

import InputSourceIndicatorLabelService, { InputSourceIndicatorLabelServiceJSDocClass } from "./InputSourceIndicatorLabelService.js";

/**
 * Represents an input source manager signal subscription.
 */
class InputSourceManagerSignalSubscription {
  /**
   * Initializes a new instance of the InputSourceManagerSignalSubscription class.
   * @param {InputSourceManager} inputSourceManager The input source manager.
   * @param {string} signalName The signal name.
   * @param {(inputSourceManager: InputSourceManager) => void} signalCallback The signal callback.
   * @public
   */
  constructor(inputSourceManager, signalName, signalCallback) {
    /**
     * Contains the input source manager.
     * @type {InputSourceManager}
     */
    this._inputSourceManager = inputSourceManager;

    /**
     * Contains a boolean value indicating whether the input source manager signal subscription is active.
     * @type {boolean}
     */
    this._active = true;
    /**
     * Contains the input source manager signal handler ID.
     * @type {number}
     */
    this._inputSourceManagerSignalHandlerId = inputSourceManager.connect(signalName, (inputSourceManager) => signalCallback(inputSourceManager));
  }

  /**
   * Cancels the subscription.
   * @public
   */
  cancel() {
    if (this._active == false) {
      return;
    }
    this._active = false;
    this._inputSourceManager.disconnect(this._inputSourceManagerSignalHandlerId);
  }
}

/**
 * Represents an input source manager monitor.
 */
class InputSourceManagerMonitor extends GObject.Object {
  /**
   * Initializes a new instance of the InputSourceManagerMonitor class, subscribing it to the signals and updating the initial current input sources, setting their short names to uppercase.
   * @param {InputSourceManager} inputSourceManager The input source manager.
   * @public
   */
  constructor(inputSourceManager) {
    super();

    /** Defines the 'sources-changed' signal name. */
    this._INPUT_SOURCES_CHANGED_SIGNAL_NAME = "sources-changed";

    /** Defines the 'current-source-changed' signal name. */
    this._CURRENT_INPUT_SOURCE_CHANGED_SIGNAL_NAME = "current-source-changed";

    /**
     * Contains the input source manager.
     * @type {InputSourceManager}
     */
    this._inputSourceManager = inputSourceManager;

    /**
     * Contains a boolean value indicating whether the input source manager monitor is active.
     * @type {boolean}
     */
    this._active = true;
    /**
     * Contains the input source indicator label service.
     * @type {InputSourceIndicatorLabelServiceJSDocClass}
     */
    this._inputSourceIndicatorLabelService = new InputSourceIndicatorLabelService(inputSourceManager);
    /**
     * Contains the subscription to the 'sources-changed' signal of the input source manager.
     */
    this._inputSourcesChangedSignalSubscription = new InputSourceManagerSignalSubscription(
      inputSourceManager,
      this._INPUT_SOURCES_CHANGED_SIGNAL_NAME,
      this._updateInitialInputSourceShortNames.bind(this)
    );
    /**
     * Contains the subscription to the 'current-source-changed' signal of the input source manager.
     */
    this._currentInputSourceChangedSignalSubscription = new InputSourceManagerSignalSubscription(
      inputSourceManager,
      this._CURRENT_INPUT_SOURCE_CHANGED_SIGNAL_NAME,
      this._updateCurrentInputSourceShortName.bind(this)
    );

    this._inputSourceIndicatorLabelService.updateInitialInputSourceShortNames();
  }

  /**
   * Stops the input source manager monitor, unsubscribing it from signals and restoring the original input sources, setting their short names to the original values.
   * @public
   */
  stop() {
    if (this._active == false) {
      return;
    }

    this._active = false;
    this._inputSourcesChangedSignalSubscription.cancel();
    this._currentInputSourceChangedSignalSubscription.cancel();
    this._restoreInputSourceShortNames();
  }

  /**
   * Updates the current input source and sets its short name to uppercase.
   * @private
   */
  _updateCurrentInputSourceShortName() {
    this._inputSourceIndicatorLabelService.updateCurrentInputSourceShortName();
  }

  /**
   * Updates the initial input sources and sets their short names to uppercase.
   * @private
   */
  _updateInitialInputSourceShortNames() {
    this._inputSourceIndicatorLabelService.updateInitialInputSourceShortNames();
  }

  /**
   * Restores all input sources and sets their short names to the original values.
   * @private
   */
  _restoreInputSourceShortNames() {
    this._inputSourceIndicatorLabelService.restoreInputSourceShortNames();
  }
}

/**
 * Represents an input source manager monitor. This class provides a JSDoc class type.
 * @exports
 */
export class InputSourceManagerMonitorJSDocClass extends InputSourceManagerMonitor {}

/**
 * Represents an input source manager monitor. This class is GObject-registered.
 * @type {typeof InputSourceManagerMonitorJSDocClass}
 * @exports
 */
const InputSourceManagerMonitorGObjectRegistered = GObject.registerClass(InputSourceManagerMonitor);

export default InputSourceManagerMonitorGObjectRegistered;
