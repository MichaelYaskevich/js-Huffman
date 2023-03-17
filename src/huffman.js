let arg = process.argv;
let fs = require('fs');
let dict_of_frequency = {};

function read(inFile) {
    try {
        return fs.readFileSync(inFile, "utf-8");
    }
    catch (e) {
        return undefined;
    }
}

function HuffmanObject(letter, freq, code = "", parent = null, used = false) {
    this.letter = letter;
    this.freq = freq;
    this.code = code;
    this.parent = parent;
    this.used = used;
}

function makeDictOfFrequency(text) {
    let dict_of_frequency = {};
    for (let i = 0; i < text.length; i++) {
        if (dict_of_frequency[text.charAt(i)] != undefined) {
            dict_of_frequency[text.charAt(i)]++;
        } else {
            dict_of_frequency[text.charAt(i)] = 1;
        }
    }
    return dict_of_frequency
}

function makeCodeForTreeElements(parent_index, tree, tree_len) {
    var first = true;
    for (let j = 0; j < tree_len; j++) {
        if (tree[j].parent == parent_index) {
            if (first) {
                first = false;
                if (parent_index != null)
                    tree[j].code = tree[parent_index].code + "0";
                tree = makeCodeForTreeElements(j, tree, tree_len);
            }
            else {
                tree[j].code = tree[parent_index].code + "1";
                tree = makeCodeForTreeElements(j, tree, tree_len);
                break;
            }
        }
    }
    return tree;
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

function makeTree(leaves_count, min_freq, tree) {
    // Получает дерево из листьев и выстраивает по ним полноценное дерево.
    for (let i = 0; i < leaves_count - 1; i++) {
        let min_index1 = -1;
        let min_index2 = -1;
        let min_freq1 = min_freq;
        let min_freq2 = min_freq;
        for (let j = 0; j < tree.length; j++) {
            if (tree[j].used == false && tree[j].freq <= min_freq1) {
                min_index2 = min_index1;
                min_freq2 = min_freq1;
                min_index1 = j;
                min_freq1 = tree[j].freq;
            }
            else if (tree[j].used == false && tree[j].freq <= min_freq2) {
                min_index2 = j;
                min_freq2 = tree[j].freq;
            }
        }
        tree.push(new HuffmanObject(
            tree[min_index1].letter + tree[min_index2].letter, 
            tree[min_index1].freq + tree[min_index2].freq));
        tree[min_index1].used = true;
        tree[min_index2].used = true;
        tree[min_index1].parent = tree.length - 1;
        tree[min_index2].parent = tree.length - 1;
    }
    return tree;
}

function code(text_file, table_file) {
    let text = read(text_file);
    if (text == undefined || text == "")
        return undefined;

    dict_of_frequency = makeDictOfFrequency(text);
    let tree = Array()
    for (key in dict_of_frequency) {
        var new_instance = new HuffmanObject(key, dict_of_frequency[key], "");
        tree.push(new_instance);
    }

    let text_len = text.length;
    let letters_count = tree.length;

    tree = makeTree(tree.length, text_len, tree);
    tree = makeCodeForTreeElements(null, tree, tree.length);
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
