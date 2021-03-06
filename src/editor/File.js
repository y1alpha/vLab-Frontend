import { defaultCode_language } from './DefaultCodes.js';
import { addNewEditor, getCode } from './Editor.js';
import * as webapi from '../assets/js/api';
import { MonacoAppSingleton } from './app.js';

const ext2lang = new Map([
    ['js', 'javascript'],
    ['ts', 'typescript'],
    ['json', 'json'],
    ['c', 'c'],
    ['cpp', 'cpp'],
    ['h', 'c'],
    ['hpp', 'cpp'],
    ['py', 'python'],
    ['txt', 'plaintext']
]);

export function filePath2lang(filePath) {
    let index = filePath.lastIndexOf(".");
    var lang;
    if (index !== -1) {
        let ext = filePath.substr(index + 1);
        lang = ext2lang.get(ext);
        if (typeof lang == "undefined") {
            lang = 'plaintext';
        }
    } else {
        lang = 'plaintext';
    }
    return lang;
}

export async function openFile(project_id, filePath, fileDir, wsUrl, defaultCode = true, elmentId, readOnly) {
    let language = filePath2lang(filePath);

    if (defaultCode == true) {
        var editor = addNewEditor(defaultCode_language(language, MonacoAppSingleton.authorName), language, filePath, fileDir, wsUrl, elmentId, readOnly);
        saveFile(project_id, editor, filePath);
        return editor;
    } else {
        let file_content = await new Promise((resolve) => {
            // console.log("getting file content @ ", project_id, filePath);
            webapi.default.file_content(project_id, filePath, (obj) => {
                // console.log("file_content: ", obj);
                resolve(obj);
            });
        });
        var editor = addNewEditor(file_content.data['content'], language, filePath, fileDir, wsUrl, elmentId, readOnly);
        return editor;
    }
}

export async function saveFile(project_id, editor, filePath) {
    let content = getCode(editor);

    let file_update = await new Promise((resolve) => {
        webapi.default.file_update(project_id, filePath, content, (obj) => {
            // console.log("file_update: ", obj);
            resolve(obj);
        });
    });
}