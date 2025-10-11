/**
 * InputSourceIndicatorController.js
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
import St from "gi://St";
import { InputSourceManager } from "resource:///org/gnome/shell/ui/status/keyboard.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

/**
 * Represents an input source indicator controller.
 */
class InputSourceIndicatorController extends GObject.Object {
  /**
   * Initializes a new instance of the InputSourceIndicatorController class.
   * @param {InputSourceManager} inputSourceManager The input source manager.
   * @public
   */
  constructor(inputSourceManager) {
    super();

    /**
     * Defines the 'Gjs_status_keyboard_InputSourceIndicatorContainer' GType name.
     * @type {string}
     * */
    this._INPUT_SOURCE_INDICATOR_CONTAINER_GTYPE_NAME = "Gjs_status_keyboard_InputSourceIndicatorContainer";

    /**
     * Contains the input source manager.
     * @type {InputSourceManager}
     */
    this._inputSourceManager = inputSourceManager;

    /**
     * Contains an array of input source label text pairs to restore the input source indicator labels to their original values.
     * @type {{ originalLabelText: string, updatedLabelText: string, uppercase: boolean }[]}
     */
    this._inputSourceLabelTextPairs = [];
  }

  /**
   * Changes the case of the input source indicator label for the current input source.
   * @param {boolean} uppercase The boolean value indicating whether to use uppercase.
   * @public
   */
  changeCurrentInputSourceLabelTextCase(uppercase) {
    this.tryChangeCurrentInputSourceLabelTextCase(uppercase);
  }

  /**
   * Attempts to change the case of the input source indicator label for the current input source and returns a boolean value indicating whether the change attempt was successful.
   * @param {boolean} uppercase The boolean value indicating whether to use uppercase.
   * @returns {boolean} The boolean value indicating whether the change attempt was successful.
   * @public
   */
  tryChangeCurrentInputSourceLabelTextCase(uppercase) {
    const currentInputSourceLabelTextPair = this._getCurrentInputSourceLabelTextPair(uppercase);
    const inputSourceIndicatorContainer = this._getInputSourceIndicatorContainer();
    if (inputSourceIndicatorContainer == undefined) {
      return false;
    }
    const currentInputSourceIndicatorLabel = this._getCurrentInputSourceIndicatorLabel(currentInputSourceLabelTextPair, inputSourceIndicatorContainer);
    if (currentInputSourceIndicatorLabel == undefined) {
      return true;
    }

    currentInputSourceIndicatorLabel.set_text(currentInputSourceLabelTextPair.updatedLabelText);
    return true;
  }

  /**
   * Restores input source indicator labels to their original values.
   * @public
   */
  restoreInputSourceLabelTexts() {
    const inputSourceIndicatorContainer = this._getInputSourceIndicatorContainer();
    if (inputSourceIndicatorContainer == undefined) {
      return;
    }
    const inputSourceIndicatorLabels = inputSourceIndicatorContainer.get_children();
    for (const inputSourceIndicatorLabel of inputSourceIndicatorLabels) {
      const inputSourceIndicatorLabelText = inputSourceIndicatorLabel.get_text();
      const inputSourceLabelTextPair = this._inputSourceLabelTextPairs.find((inputSourceLabelTextPair) => {
        const { updatedLabelText } = inputSourceLabelTextPair;
        return updatedLabelText == inputSourceIndicatorLabelText;
      });
      if (inputSourceLabelTextPair == undefined) {
        continue;
      }

      inputSourceIndicatorLabel.set_text(inputSourceLabelTextPair.originalLabelText);
    }
  }

  /**
   * Gets the input source label text pair for the current input source.
   * @param {boolean} uppercase The boolean value indicating whether to use uppercase.
   * @returns {{ originalLabelText: string, updatedLabelText: string, uppercase: boolean }} The input source label text pair.
   * @private
   */
  _getCurrentInputSourceLabelTextPair(uppercase) {
    const currentInputSource = this._inputSourceManager.currentSource;
    const inputSourceLabelTextPair = this._inputSourceLabelTextPairs.find((inputSourceLabelTextPair) => {
      return inputSourceLabelTextPair.originalLabelText == currentInputSource.shortName && inputSourceLabelTextPair.uppercase == uppercase;
    });
    if (inputSourceLabelTextPair == undefined) {
      return this._saveCurrentInputSourceLabelTextPair(uppercase);
    } else {
      return inputSourceLabelTextPair;
    }
  }

  /**
   * Saves and returns the input source label text pair the current input source when it is missing.
   * @param {boolean} uppercase The boolean value indicating whether to use uppercase.
   * @returns {{ originalLabelText: string, updatedLabelText: string, uppercase: boolean }} The input source label text pair.
   * @private
   */
  _saveCurrentInputSourceLabelTextPair(uppercase) {
    const currentInputSource = this._inputSourceManager.currentSource;
    const currentInputSourceLabelUpdatedText = uppercase ? currentInputSource.shortName.toLocaleUpperCase() : currentInputSource.shortName.toLocaleLowerCase();
    const inputSourceLabelTextPair = {
      originalLabelText: currentInputSource.shortName,
      updatedLabelText: currentInputSourceLabelUpdatedText,
      uppercase: uppercase,
    };
    this._inputSourceLabelTextPairs.push(inputSourceLabelTextPair);
    return inputSourceLabelTextPair;
  }

  /**
   * Gets the input source indicator container by its GType name.
   * This function uses non-public API to find the input source indicator container. It may break after a GNOME Shell update.
   * @returns {St.Widget | undefined} The input source indicator container.
   * @private
   */
  _getInputSourceIndicatorContainer() {
    const keyboard = Main.panel.statusArea.keyboard;
    const keyboardChildren = keyboard.get_children();
    const inputSourceIndicatorContainer = keyboardChildren.find((keyboardChild) => {
      const keyboardChildGTypeName = keyboardChild.constructor.$gtype.name;
      return keyboardChildGTypeName == this._INPUT_SOURCE_INDICATOR_CONTAINER_GTYPE_NAME;
    });
    if (inputSourceIndicatorContainer == undefined) {
      console.error("Can not find the input source indicator container, most likely because of a GNOME Shell major change.");
    }
    return inputSourceIndicatorContainer;
  }

  /**
   * Gets the input source indicator label for the current input source.
   * This function uses non-public API to find the input source indicator container. It may break after a GNOME Shell update.
   * @param {{ originalLabelText: string, updatedLabelText: string, uppercase: boolean }} currentInputSourceLabelTextPair The input source label text pair for the current input source.
   * @param {St.Widget} inputSourceIndicatorContainer The input source indicator container.
   * @returns {St.Label | undefined} The input source indicator label.
   * @private
   */
  _getCurrentInputSourceIndicatorLabel(currentInputSourceLabelTextPair, inputSourceIndicatorContainer) {
    const { originalLabelText, updatedLabelText } = currentInputSourceLabelTextPair;
    const inputSourceIndicatorLabels = inputSourceIndicatorContainer.get_children();
    const inputSourceIndicatorLabel = inputSourceIndicatorLabels.find((inputSourceIndicatorLabel) => {
      const inputSourceIndicatorLabelText = inputSourceIndicatorLabel.get_text();
      return inputSourceIndicatorLabelText == originalLabelText || inputSourceIndicatorLabelText == updatedLabelText;
    });
    if (inputSourceIndicatorLabel == undefined) {
      console.error("Can not find the input source indicator label, most likely because of a GNOME Shell major change.");
    }
    return inputSourceIndicatorLabel;
  }
}

/**
 * Represents an input source indicator controller. This class provides a JSDoc class type.
 * @exports
 */
export class InputSourceIndicatorControllerJSDocClass extends InputSourceIndicatorController {}

/**
 * Represents an input source indicator controller. This class is GObject-registered.
 * @type {typeof InputSourceIndicatorControllerJSDocClass}
 * @exports
 */
const InputSourceIndicatorControllerGObjectRegistered = GObject.registerClass(InputSourceIndicatorController);

export default InputSourceIndicatorControllerGObjectRegistered;
