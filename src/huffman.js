let arg = process.argv;
let fs = require('fs');
let freq2Strs = {};

function read(inFile) {
    try {
        return fs.readFileSync(inFile, "utf-8");
    }
    catch (e) {
        return undefined;
    }
}

function HuffmanObject(letter, freq, code = "") {
    this.letter = letter;
    this.freq = freq;
    this.code = code;
    this.child1 = undefined;
    this.child2 = undefined;
}

function makeFreq2Strs(text) {
    // Сортировка подсчетом по частоте за O(n + k), где k - максимальная частота
    let str2freq = {};
    let max_freq = 0;
    for (let i = 0; i < text.length; i++) {
        if (str2freq[text.charAt(i)] != undefined) {
            str2freq[text.charAt(i)]++;
        } else {
            str2freq[text.charAt(i)] = 1;
        }
        if (str2freq[text.charAt(i)] > max_freq){
            max_freq = str2freq[text.charAt(i)];
        }
    }

    let freq2str = Array(max_freq+1);
    for (str in str2freq) {
        if (freq2str[str2freq[str]] == undefined)
            freq2str[str2freq[str]] = Array();
        freq2str[str2freq[str]].push(str)
    }
    return [freq2str, str2freq]
}

function makeCodeForTreeElements(parent) {
    // Проход по дереву O(n).
    if (parent.child1 != undefined) {
        parent.child1.code = parent.code + "0";
        makeCodeForTreeElements(parent.child1)
    }
    if (parent.child2 != undefined) {
        parent.child2.code = parent.code + "1";
        makeCodeForTreeElements(parent.child2)
    }
}

function makeLetter2CodeTable(tree, tree_length) {
    var str = "";
    for (let i = 0; i < tree_length; i++) {
        str += tree[i].letter + ":" + tree[i].code + "\n";
    }
    return str.substring(0, str.length-1);
}

function makeDictionary(str, mode) {
    var pairs = str.split('\n');
    var pairsLen = pairs.length;
    var dict = {};
    for (let i = 0; i < pairsLen; i++) {
        var letter = pairs[i].split(':')[0];
        var code = pairs[i].split(':')[1];
        if (mode == "code")
            dict[letter] = code;
        else if (mode == "decode")
            dict[code] = letter;
    }
    return dict;
}

function getFreq(huffman_obj){
    if (huffman_obj == undefined)
        return Infinity
    return huffman_obj.freq
}

function get2Min(a, b, c, d) {
    let freq2obj = {};
    let objs = [a, b, c, d];
    for (let i = 0; i < objs.length; i++){
        let obj = objs[i]
        if (freq2obj[getFreq(obj)] == undefined)
            freq2obj[getFreq(obj)] = [];
        freq2obj[getFreq(obj)].push(obj);
    }
    let keys = Object.keys(freq2obj)
    let minFreq = Math.min(...keys)
    if (freq2obj[minFreq].length > 1) {
        return [freq2obj[minFreq][0], freq2obj[minFreq][1]]
    }
    else {
        let other_freq = [];
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] != minFreq)
                other_freq.push(keys[i]);
        }
        let minFreq2 = Math.min(...other_freq)
        return [freq2obj[minFreq][0], freq2obj[minFreq2][0]]
    }
    

}

function makeTree(leaves_count, min_freq, tree) {
    // Получает отсортированное дерево из листьев и выстраивает по ним полноценное дерево за O(n).
    let tree2 = Array(leaves_count);
    let j = 0;
    let z = 0;
    let i = 0;
    while (i < leaves_count) {
        let result = get2Min(tree[i], tree[i+1], tree2[j], tree2[j+1]);
        let a = result[0];
        let b = result[1];
        if (a.letter.length == 1 && b.letter.length == 1){
            i += 2;
        }
        else if (a.letter.length == 1 || b.letter.length == 1){
            i++;
            j++;
        }
        else {
            j += 2;
        }
        tree2[z] = new HuffmanObject(a.letter + b.letter, a.freq + b.freq);
        tree2[z].child1 = a;
        tree2[z].child2 = b;
        z++;
    }
    tree2.pop()
    return [...tree, ...tree2];
}

function code(text_file, table_file) {
    let text = read(text_file);
    if (text == undefined || text == "")
        return undefined;

    let freq2Strs_and_reverse = makeFreq2Strs(text);
    let freq2Strs = freq2Strs_and_reverse[0];
    let str2freq = freq2Strs_and_reverse[1];
    let tree = Array(str2freq.length);
    let i = 0;
    for (freq in freq2Strs) {
        freq = parseInt(freq);
        let len = freq2Strs[freq].length
        for (let j = 0; j < len; j++){
            let str = freq2Strs[freq][j]
            let new_instance = new HuffmanObject(str, freq, "");
            tree[i] = new_instance;
            i++;
        }
    }

    let text_len = text.length;
    let letters_count = tree.length;

    tree = makeTree(tree.length, text_len, tree);
    makeCodeForTreeElements(tree[tree.length - 1]);
    let table_as_str = makeLetter2CodeTable(tree, letters_count);
    fs.writeFileSync(table_file, table_as_str);
    let result = "";
    let dictionary = makeDictionary(table_as_str, "code");
    for (let i = 0; i < text_len; i++) {
        result += dictionary[text.charAt(i)];
    }

    return result;
}

function decode(text_file, table_file) {
    let text = read(text_file);
    let str = read(table_file);
    if (text == undefined || str == undefined ||
        text == "" || str == "")
        return undefined;
    let dictionary = makeDictionary(str, "decode");
    let max_key_length = -1;
    for (key in dictionary) {
        if (key.length > max_key_length)
            max_key_length = key.length
    }
    let text_len = text.length;
    let result = "";
    let code = "";
    for (let i = 0; i < text_len; i++) {
        code += text.charAt(i);
        if (code.length > max_key_length) {
            console.log("It is impossible to decode your file.");
            break;
        }
        if (dictionary.hasOwnProperty(code)) {
            result += dictionary[code];
            code = "";
        }
    }
    return result;
}

function getNeededFunction(mode) {
    if (mode == "code") {
        return code;
    }
    else if (mode == "decode") {
        return decode;
    }
    else
        console.log("You need to choose code or decode mode");
    return undefined;
}

var fun = getNeededFunction(arg[2]);
if (fun != undefined) {
    let result = fun(arg[3], arg[4]);
    if (result != undefined)
        fs.writeFileSync(arg[5], result);
    else
        console.log("file is empty or doesn't exist");
}
else
    console.log("File is empty or not exist");
