/**
 * InputSourceManagerMonitor.js
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

import GObject from "gi://GObject";
import { InputSourceManager } from "resource:///org/gnome/shell/ui/status/keyboard.js";

import InputSourceIndicatorController, { InputSourceIndicatorControllerJSDocClass } from "./InputSourceIndicatorController.js";

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
   * Initializes a new instance of the InputSourceManagerMonitor class, subscribing it to the signals and setting the current input source label to uppercase.
   * @param {InputSourceManager} inputSourceManager The input source manager.
   * @public
   */
  constructor(inputSourceManager) {
    super();

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
     * Contains the input source indicator controller.
     * @type {InputSourceIndicatorControllerJSDocClass}
     */
    this._inputSourceIndicatorController = new InputSourceIndicatorController(inputSourceManager);
    /**
     * Contains the subscription to the 'current-source-changed' signal of the input source manager.
     */
    this._currentInputSourceChangedSignalSubscription = new InputSourceManagerSignalSubscription(
      inputSourceManager,
      this._CURRENT_INPUT_SOURCE_CHANGED_SIGNAL_NAME,
      this._changeCurrentInputSourceLabelTextCase.bind(this)
    );

    const changeSuccessful = this._tryChangeCurrentInputSourceLabelTextCase();
    if (!changeSuccessful) {
      console.error("Stopping the input source manager monitor as non-functional, most likely because of a GNOME Shell major change.");
      this.stop();
    }
  }

  /**
   * Stops the input source manager monitor, unsubscribing it from signals and restoring the original input source labels.
   * @public
   */
  stop() {
    if (this._active == false) {
      return;
    }

    this._active = false;
    this._currentInputSourceChangedSignalSubscription.cancel();
    this._restoreInputSourceLabelTexts();
  }

  /**
   * Changes the case of the input source indicator label for the current input source to uppercase.
   * @private
   */
  _changeCurrentInputSourceLabelTextCase() {
    this._inputSourceIndicatorController.changeCurrentInputSourceLabelTextCase(true);
  }

  /**
   * Attempts to change the case of the input source indicator label for the current input source to uppercase and returns a boolean value indicating whether the change attempt was successful.
   * @returns {boolean} The boolean value indicating whether the change attempt was successful.
   * @private
   */
  _tryChangeCurrentInputSourceLabelTextCase() {
    return this._inputSourceIndicatorController.tryChangeCurrentInputSourceLabelTextCase(true);
  }

  /**
   * Restores input source indicator labels to their original values.
   * @private
   */
  _restoreInputSourceLabelTexts() {
    this._inputSourceIndicatorController.restoreInputSourceLabelTexts();
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
