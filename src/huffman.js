let arg = process.argv;
let fs = require('fs');
let arrayOfFrequency = {};
let tree = new Array();

function read(inFile) {
    try {
        inText = fs.readFileSync(inFile, "utf-8");
        return inText;
    }
    catch (e) {
        return undefined;
    }
}

function HuffmanObject(letter, freq, code, parent = null, used = false) {
    this.letter = letter;
    this.freq = freq;
    this.code = code;
    this.parent = parent;
    this.used = used;
}

function MakeArrayOfFrequency(inText) {
    for (let i = 0; i < inText.length; i++) {
        if (arrayOfFrequency[inText.charAt(i)] != undefined) {
            arrayOfFrequency[inText.charAt(i)]++;
        } else {
            arrayOfFrequency[inText.charAt(i)] = 1;
        }
    }
    return arrayOfFrequency
}

function MakeCodeForTreeElements(parentIndex, tree, treeLen) {
    var first = true;
    for (let j = 0; j < treeLen; j++) {
        if (tree[j].parent == parentIndex) {
            if (first) {
                first = false;
                if (parentIndex != null)
                    tree[j].code = tree[parentIndex].code + "0";
                tree = MakeCodeForTreeElements(j, tree, treeLen);
            }
            else {
                tree[j].code = tree[parentIndex].code + "1";
                tree = MakeCodeForTreeElements(j, tree, treeLen);
                break;
            }
        }
    }
    return tree;
}

function MakeTable(tree, treeLength) {
    var str = "";
    for (let i = 0; i < treeLength; i++) {
        str += tree[i].letter + ":" + tree[i].code + "\n";
    }
    return str.substring(0, str.length-1);
}

function MakeDictionary(str, mode) {
    var pairs = str.split('\n');
    var pairsLen = pairs.length;
    var dict = {};
    for (let i = 0; i < pairsLen; i++) {
        var key = pairs[i].split(':')[0];
        var value = pairs[i].split(':')[1];
        if (mode == "code")
            dict[key] = value;
        else if (mode == "decode")
            dict[value] = key;
    }
    return dict;
}

function MakeTree(treeLen, inLen, tree) {
    for (let i = 0; i < treeLen - 1; i++) {
        minIndex1 = -1;
        minIndex2 = -1;
        minFreq1 = inLen;
        minFreq2 = inLen;
        for (let j = 0; j < tree.length; j++) {
            if (tree[j].used == false && tree[j].freq <= minFreq1) {
                minIndex2 = minIndex1;
                minFreq2 = minFreq1;
                minIndex1 = j;
                minFreq1 = tree[j].freq;
            }
            else if (tree[j].used == false && tree[j].freq <= minFreq2) {
                minIndex2 = j;
                minFreq2 = tree[j].freq;
            }
        }
        var newInstance = new HuffmanObject(
            tree[minIndex1].letter + tree[minIndex2].letter, tree[minIndex1].freq + tree[minIndex2].freq, "");
        tree.push(newInstance);
        tree[minIndex1].used = true;
        tree[minIndex2].used = true;
        tree[minIndex1].parent = tree.length - 1;
        tree[minIndex2].parent = tree.length - 1;
    }
    return tree;
}

function code(inFile, table) {
    let inText = read(inFile);
    if (inText == undefined || inText == "")
        return undefined;

    arrayOfFrequency = MakeArrayOfFrequency(inText);
    for (key in arrayOfFrequency) {
        var newInstance = new HuffmanObject(key, arrayOfFrequency[key], "");
        tree.push(newInstance);
    }

    let inLen = inText.length;
    let treeLen = tree.length;
    let oldTreeLen = treeLen;

    tree = MakeTree(treeLen, inLen, tree);
    treeLen = tree.length;
    tree = MakeCodeForTreeElements(null, tree, treeLen);
    let str = MakeTable(tree, oldTreeLen);
    fs.writeFileSync(table, str);
    let resultStr = "";
    let dictionary = MakeDictionary(str, "code");
    for (let i = 0; i < inLen; i++) {
        resultStr += dictionary[inText.charAt(i)];
    }

    return resultStr;
}

function decode(inFile, table) {
    let inText = read(inFile);
    let str = read(table);
    if (inText == undefined || str == undefined ||
        inText == "" || str == "")
        return undefined;
    let dictionary = MakeDictionary(str, "decode");
    let maxKeyLength = -1;
    for (key in dictionary) {
        if (key.length > maxKeyLength)
            maxKeyLength = key.length
    }
    let inLen = inText.length;
    let resultStr = "";
    let code = "";
    for (let i = 0; i < inLen; i++) {
        code += inText.charAt(i);
        if (code.length > maxKeyLength) {
            console.log("It is impossible to decode your file.");
            break;
        }
        if (dictionary.hasOwnProperty(code)) {
            resultStr += dictionary[code];
            code = "";
        }
    }
    return resultStr;
}

function GetNeededFunction(mode) {
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

var fun = GetNeededFunction(arg[2]);
if (fun != undefined) {
    let resultToWrite = fun(arg[3], arg[4]);
    if (resultToWrite != undefined)
        fs.writeFileSync(arg[5], resultToWrite);
    else
        console.log("file is empty or doesn't exist");
}
else
    console.log("File is empty or not exist");
