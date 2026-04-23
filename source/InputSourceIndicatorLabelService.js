/**
 * InputSourceIndicatorLabelService.js
 *
 * Copyright (c) 2025-2026 Andrey Talanin
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
import { InputSource, InputSourceManager } from "resource:///org/gnome/shell/ui/status/keyboard.js";

/**
 * Represents an input source indicator label service.
 */
class InputSourceIndicatorLabelService extends GObject.Object {
  /**
   * Initializes a new instance of the InputSourceIndicatorLabelService class.
   * @param {InputSourceManager} inputSourceManager The input source manager.
   * @public
   */
  constructor(inputSourceManager) {
    super();

    /**
     * Contains the input source manager.
     * @type {InputSourceManager}
     */
    this._inputSourceManager = inputSourceManager;

    /**
     * Contains an array of input source short name pairs to restore them to their original values.
     * @type {{ updatedKey: string, updatedShortName: string, originalKey: string, originalShortName: string }[]}
     */
    this._inputSourceShortNamePairs = [];
  }

  /**
   * Updates the current input source and sets its short name to uppercase.
   * @public
   */
  updateCurrentInputSourceShortName() {
    const inputSource = this._inputSourceManager.currentSource;
    this._updateInputSourceShortName(inputSource);
  }

  /**
   * Updates the initial input sources and sets their short names to uppercase.
   * @public
   */
  updateInitialInputSourceShortNames() {
    const inputSources = this._inputSourceManager.inputSources;

    for (const inputSourceObjectKey in inputSources) {
      const inputSource = inputSources[inputSourceObjectKey];

      this._updateInputSourceShortName(inputSource);
    }
  }

  /**
   * Restores all input sources and sets their short names to the original values.
   * @public
   */
  restoreInputSourceShortNames() {
    const inputSources = this._inputSourceManager.inputSources;

    for (const inputSourceObjectKey in inputSources) {
      const inputSource = inputSources[inputSourceObjectKey];

      const key = `${inputSource.type}:${inputSource.id}:${inputSource.shortName}`;

      const inputSourceShortNamePair = this._inputSourceShortNamePairs.find((inputSourceShortNamePair) => inputSourceShortNamePair.updatedKey == key);

      if (!inputSourceShortNamePair) {
        continue;
      }

      inputSource.shortName = inputSourceShortNamePair.originalShortName;
    }
  }

  /**
   * Updates a single input source and sets its short name to uppercase.
   * @param {InputSource} inputSource The input source.
   * @private
   */
  _updateInputSourceShortName(inputSource) {
    // The key is a joined string of multiple properties:
    // type:id:short-name
    const originalShortName = inputSource.shortName;
    const originalKey = `${inputSource.type}:${inputSource.id}:${originalShortName}`;
    const updatedShortName = originalShortName.toLocaleUpperCase();
    const updatedKey = `${inputSource.type}:${inputSource.id}:${updatedShortName}`;

    if (this._inputSourceShortNamePairs.find((inputSourceShortNamePair) => inputSourceShortNamePair.updatedKey == updatedKey) && inputSource.shortName == updatedShortName) {
      return;
    }

    inputSource.shortName = updatedShortName;

    const inputSourceShortNamePair = { updatedKey, updatedShortName, originalKey, originalShortName };

    this._inputSourceShortNamePairs = this._inputSourceShortNamePairs.filter((inputSourceShortNamePair) => inputSourceShortNamePair.updatedKey != updatedKey);

    this._inputSourceShortNamePairs.push(inputSourceShortNamePair);
  }
}

/**
 * Represents an input source indicator label service. This class provides a JSDoc class type.
 * @exports
 */
export class InputSourceIndicatorLabelServiceJSDocClass extends InputSourceIndicatorLabelService {}

/**
 * Represents an input source indicator label service. This class is GObject-registered.
 * @type {typeof InputSourceIndicatorLabelServiceJSDocClass}
 * @exports
 */
const InputSourceIndicatorLabelServiceGObjectRegistered = GObject.registerClass(InputSourceIndicatorLabelService);

export default InputSourceIndicatorLabelServiceGObjectRegistered;
