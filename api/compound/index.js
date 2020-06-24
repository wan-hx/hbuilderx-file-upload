var fs = require('fs');
var path = require('path');

var hx = require('hbuilderx');
var mix = require('../mix/mix.js');

function compound() {
    let activeEditor = hx.window.getActiveTextEditor();
    activeEditor.then(function(editor) {
        let selection = editor.selection;
        let word = editor.document.getText(selection);
        let key = mix.MixE(word);
        editor.edit(editBuilder => {
            editBuilder.replace(selection, key);
        });
    })
};

module.exports = {
    compound
}
