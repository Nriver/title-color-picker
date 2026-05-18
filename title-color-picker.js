/*
  Author: Nriver (https://github.com/nriver/)
  Widget: Title Color Picker
  Description: 
  - Enables quick and convenient color selection for note titles.
  - Supports preset colors, custom colors, and color removal.
*/

class titleColorPickerWidget extends api.NoteContextAwareWidget {
    get position() { return 90; }
    get parentWidget() { return 'center-pane'; } 
    isEnabled() { return super.isEnabled(); }

    doRender() {
        this.$widget = $(
            `<style>
    .title-enhancements {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        left: -50px;
    }

    .color-picker-div {
        position: relative;
        top: -29px;
        right: -33px;
        margin-right: 39px;
    }

    .color-picker-button {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--primary-button-border-color);
        background-color: #000;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    }

    .color-picker-button:hover {
        transform: scale(1.15);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }

    .color-picker-popup {
        display: none;
        position: absolute;
        top: 28px;
        left: -60px;
        background: var(--main-background-color);
        border: 1px solid rgba(0, 0, 0, 0.05);
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 150px;
        backdrop-filter: blur(1px);
    }

    .preset-colors {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        justify-content: center;
        margin-bottom: 12px;
    }

    .preset-color {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid var(--button-border-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
        position: relative;
    }

    .preset-color:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .preset-color:active {
        transform: scale(0.95);
    }

    .color-picker-native {
        width: 100%;
        height: 34px;
        border: 2px solid var(--button-border-color);
        padding: 0;
        margin: 0 auto 12px;
        cursor: pointer;
        border-radius: 8px;
        display: block;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
    }
    
    .color-picker-native input {
        padding-inline-start: 0px;
    }

    .color-picker-native:hover {
        border-color: rgba(0, 0, 0, 0.2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .color-picker-native::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    .color-picker-native::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
    }

    .color-picker-native::-moz-color-swatch {
        border: none;
        border-radius: 6px;
    }

    .remove-color-button {
        width: 28px;
        height: 28px;
        padding: 0;
        background-color: #f8f8f8;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: all 0.2s ease;
    }

    .remove-color-button:hover {
        background-color: #ffffff;
        border-color: rgba(0, 0, 0, 0.2);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .remove-color-button svg {
        width: 18px;
        height: 18px;
        stroke: #666;
        transition: stroke 0.2s ease;
    }

    .remove-color-button:hover svg {
        stroke: #333;
    }
</style>`
        );
        return this.$widget;
    }

    async refreshWithNote(note) {
        $(document).ready(() => {
            const container = $("div.note-split:not(.hidden-ext) .note-title-widget");
            const presetColors = config.presetColors;

            if (!container.children().hasClass('title-enhancements')) {
                const enhancementsHtml = $(
                    `<div class="title-enhancements">
                        <div class="color-picker-div">
                            <div class="color-picker-button" id="color-picker-button"></div>
                            <div class="color-picker-popup" id="color-picker-popup">
                                <div class="preset-colors"></div>
                                <input type="color" class="color-picker-native">
                                <button class="remove-color-button">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>`);
                container.append(enhancementsHtml);

                const $presetContainer = container.find('.preset-colors');
                
                presetColors.forEach(color => {
                    const hexColor = namedColorToHex(color);
                    
                    $presetContainer.append(
                        `<div class="preset-color" style="background-color: ${hexColor}" data-color="${hexColor}"></div>`
                    );
                });
            }

            const noteId = note.noteId;
            const $colorPickerButton = container.find('.color-picker-button');
            const $colorPopup = container.find('.color-picker-popup');
            const $presetColors = container.find('.preset-color');
            const $nativeColorPicker = container.find('.color-picker-native');
            const $removeColorButton = container.find('.remove-color-button');

            // Set initial color
            let initialColor = "#cccccc";
            if (note.hasLabel("color")) {
                const existingColor = note.getLabel("color").value;
                if (existingColor) initialColor = existingColor;
            } else {
                const themeColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--input-text-color').trim();
                if (themeColor && themeColor !== "") initialColor = themeColor;
            }
            
            initialColor = normalizeShorthandColor(initialColor);
            $colorPickerButton.css('background-color', initialColor);
            $nativeColorPicker.val(initialColor);
            $("div.note-title-widget.component > input").each(function() {
                this.style.setProperty('color', initialColor, 'important');
            });

            // Show/hide popup on button click
            $colorPickerButton.off('click').on('click', function(e) {
                e.stopPropagation();
                $colorPopup.toggle();
            });

            // Click on preset colors
            $presetColors.off('click').on('click', function() {
                const selectedColor = $(this).data('color');
                applyColor(selectedColor);
            });

            // Native color picker
            $nativeColorPicker.off('input').on('input', function() {
                const selectedColor = $(this).val();
                applyColor(selectedColor);
            });

            // Remove color button
            $removeColorButton.off('click').on('click', function() {
                removeColor();
            });

            // Hide popup when clicking outside
            $(document).on('click', function(e) {
                if (!$colorPopup.is(e.target) && 
                    $colorPopup.has(e.target).length === 0 &&
                    !$colorPickerButton.is(e.target)) {
                    $colorPopup.hide();
                }
            });

            // Function to apply color
            function applyColor(color) {
                $("div.note-title-widget.component > input").each(function() {
                    this.style.setProperty('color', color, 'important');
                });
                $colorPickerButton.css('background-color', color);
                $nativeColorPicker.val(color);

                api.runAsyncOnBackendWithManualTransactionHandling(async (noteId, color) => {
                    const currentNote = await api.getNote(noteId);
                    currentNote.setAttribute("label", "color", color);
                    currentNote.save();
                }, [noteId, color]);
            }

            // Function to remove color
            function removeColor() {
                const defaultColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--input-text-color').trim() || "#cccccc";

                $("div.note-title-widget.component > input").each(function() {
                    this.style.setProperty('color', defaultColor, 'important');
                });
                $colorPickerButton.css('background-color', defaultColor);
                $nativeColorPicker.val(normalizeShorthandColor(defaultColor));

                api.runAsyncOnBackendWithManualTransactionHandling(async (noteId) => {
                    const currentNote = await api.getNote(noteId);
                    currentNote.removeAttribute("label", "color");
                    currentNote.save();
                }, [noteId]);
                api.refreshIncludedNote(noteId);
                api.reloadNotes(noteId);
            }
        });
    }
}

// Function to normalize shorthand colors like #ccc to #cccccc
function normalizeShorthandColor(color) {
    // Regular expression to check for Hex shorthand (e.g., #abc)
    const hexShorthandRegex = /^#[0-9a-fA-F]{3}$/;

    // If the color matches the Hex shorthand format
    if (hexShorthandRegex.test(color)) {
        // Expand the shorthand format to a full 6-character hex (e.g., #abc -> #aabbcc)
        return "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }

    // For other colors (like full hex or named colors), return the color as is
    return color;
}

// Function to convert named colors like `green` to hex values
// Native color picker needs this
function namedColorToHex(color) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    return ctx.fillStyle; // Returns the color in the proper hex format
}

module.exports = new titleColorPickerWidget();