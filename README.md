# js-Huffman
Алгоритм Хаффмана

**Примеры запуска:**

js-Huffman>node src/huffman.js code resources/in.txt resources/table.txt resources/out_code.txt

**code** - вариант запуска для кодирования, можно выбрать decode для декодирования\
**resources/in.txt** - исходная строка\
**resources/table.txt** - таблица символов\
**resources/out_code.txt** - результат кодирования или декодирования

После выполнения команды кодирования можно выполнить декодирование:

js-Huffman>node src/huffman.js decode resources/out_code.txt resources/table.txt resources/out_decode.txt

Тогда в файле **resources/out_decode.txt** будет лежать исходная строка
