---
title: Học Lua trong 30 phút
description: Bạn nghĩ Lua khó học ư? Không đâu, nó còn dễ hơn cả JavaScript và Python!
date: 2018-07-01
image: ./lua-code.jpg
tags: [lua, learning]
---

# Lua là gì?
Ngôn ngữ lập trình kịch bản bậc cao với các đặc điểm: kiểu động, nhẹ, nhanh, đa hình, đa tính năng và mã nguồn mở.

### Nhẹ chỗ nào?
- Lua được viết bằng **C** với hơn hai chục nghìn dòng code!
- Trình thông dịch Lua chỉ có kích thước vài trăm KB.
- Bộ nhớ mà Lua sử dụng khi chạy cũng rất ít.

### Nhanh hơn Python không?
- Bộ xử lý Lua bao gồm trình biên dịch, dịch code thành bytecode và máy ảo để thực thi code đó
- Kiến trúc máy ảo của Lua từ v5.x trở đi sử dụng mô hình **thanh ghi** theo kiến trúc **x86** (trước đó là sử dụng mô hình **ngăn xếp**)
- Tất nhiên là nhanh hơn Python nhiều (có thể nói là nhanh nhất trong các họ ngôn ngữ kịch bản phổ biến). Lua có một phiên bản tên là **LuaJIT**, thay vì dịch ra bytecode thì nó dịch ra mã máy.

> Không so sánh với **CPython**, **PyPy**... mà có gán mác JIT vào cũng thua **LuaJIT**, chấp **V8** luôn.

> Ngôn ngữ kịch bản luôn gắn liền với từ **thông dịch**, ở đây Lua cho code vào và chạy luôn.

> Xuất hiện thêm từ **biên dịch** là do Lua dịch code sang bytecode rước khi cho vào máy ảo.

### Đa hình ra sao?
- Lua hỗ trợ lập trình hàm và cả hướng đối tượng.
- OOP chủ yếu thông qua prototype, tựa tựa JS vậy.

### Làm được gì mà đa tính năng?
- Lua có thể dùng để viết ứng dụng, game, web (backend) và cả hệ thống.
- Lua xuất hiện nhiều trong cả lập trình nhúng, đi kèm với các ngôn ngữ nhanh như **C/C++**, **Rust** để dễ dàng triển khai, tái sử dụng các API.
- Có thể tham khảo các project về Lua [tại đây](https://github.com/LewisJEllis/awesome-lua), [ở đây](https://github.com/uhub/awesome-lua) và cả [đây nữa](https://github.com/forhappy/awesome-lua).

> Nhúng ở đây không phải là lập trình mạch mà là Lua hỗ trợ **CAPI** để nhúng vào các ngôn ngữ khác.

> Một số game engine hay tools hack game hỗ trợ script Lua cũng là một hình thức nhúng.

# Cài đặt Lua

Lua không kén thằng C compiler nào cả, hỗ trợ trên nhiều kiến trúc khác nhau nữa. Phiên bản release mới nhất là 5.3.5, nhưng ổn định nhất và được sử dụng nhiều vẫn là 5.1.5.

```bash
$ curl https://www.lua.org/ftp/lua-5.1.5.tar.gz -o lua.tar.gz
$ tar -xvf lua.tar.gz
$ cd lua-5.1.5
$ make && make install
```

### Chọn editor

Muốn đa nền tảng thì cứ quất **Sublime Text**, có một số package hỗ trợ autocomplete và cả just-in-time syntax checker. **VS Code** cũng ngon (có nhiều extension hỗ trợ Lua và cả debug).

Ngoài ra còn có một IDE được viết hoàn toàn bằng Lua (sử dụng **wxWidget UI**) vô cùng nhanh và nhẹ, đó là [ZeroBrane Studio](https://studio.zerobrane.com/), nó hỗ trợ chủ yếu là code Lua và các game engine có Lua built-in, có live-coding khá ngon.

Trên Windows, ta có thể sử dụng [Lua Studio](https://github.com/rjpcomputing/luaforwindows/releases), trọn gói cài đặt chỉ bằng giao diện.

Lua có một package manager tên là [LuaRocks](https://luarocks.org/), tựa tựa như **vcpkg**, **conan**... hỗ trợ cài đặt các thư viện ngoài nhanh chóng.

# Hello Lua

```bash terminal
$ echo print("Hello, world!") > test.lua
```

Hoặc tạo một file và gõ code sau vào:

```lua test.lua
print("Hello, world!")
```

Trên một số code editor/IDE chỉ cần nhấn <kbd>Ctrl + B</kbd> hoặc chạy lệnh sau:
```bash
$ lua ./test.lua
```

## 1. Chú pháp và biến 

Note: Các hướng dẫn được viết trong code block, bạn có thể copy chúng và chạy. Hãy cẩn thận vì có tiếng Việt, không nên set file test với encoding là **UTF8 with BOM**.

```lua
-- Hai dấu trừ đánh dấu comment trên một dòng.
--[[
Thêm hai cặp ngoặc vuông vào
để comment
trên nhiều dòng.
--]]

local a
-- local là từ khóa.
-- Khai báo biến a, nếu không gán gì thì nó là nil.
-- nil có thể hiểu là chưa định nghĩa, không mang giá trị nào.

a = 4
-- Gán giá trị cho biến.
-- Số trong Lua đều là số thực double,
--   nhưng biến a vẫn được hiểu là số nguyên.

A = 4.0
-- Số thực.
-- Trong Lua phân biệt giữa chữ in hoa và chữ thường.
-- Không dùng local thì A sẽ là biến toàn cục.

print(a, b)
-- print để in giá trị ra console.
-- Biến b chưa được khai báo sẽ là nil, không lỗi đâu
--   vì nó được hiểu là biến global.

a = 5 b = 6 
-- Viết trên một dòng, cách nhau bằng khoảng trắng.
-- Lua không cần chấm phẩy, nhưng phải đúng biểu thức.

b = 11; print(b) 
-- Có chấm phẩy.

local x, y, z = 1, 2, 3, 4
-- Khai báo & gán giá trị lần lượt cho nhiều biến.
-- Tất nhiên 4 sẽ thừa.

-- Khai báo một chuỗi.
s = 'dấu nháy đơn'
n = "dấu nháy kép cũng được"
u = [[
chuỗi trên 
nhiều dòng bằng 
hai hai cặp ngoặc vuông]]

-- Nối hai chuỗi bằng hai dấu chấm ..
x = 'abc'..'def'
print(x..'789')

p = print   -- Tuy print là một hàm, nhưng cũng là kiểu dữ liệu.
print = 20  -- Tất cả các biến đều thay đổi giá trị được.
p(print)    -- In ra 20.
print = p   -- Trả lại như cũ.

```

## 2. Rẻ nhánh và câu điều kiện

```lua
b = true -- Kiểu đúng/sai boolean.

if b then
    print('yes')
else
    print('no')
end
-- In ra yes.
-- Kết thúc một statement luôn là end.

x = 123
if x == 456 then
    print('false')
elseif x ~= 789 then    -- Dấu khác.
    print('true')
else
    print('otherwise')
end
-- In ra true

-- Trong Lua, 0 và false khác nhau.
-- Nếu cho vào if, 0 vẫn đúng,
--   còn false và nil đều sai.

-- Logic or, and.
print(false and nil)    -- > false
print(0 and nil)        -- > nil
print(true and nil)     -- > nil
print(false and 0)      -- > false
print(true and false)   -- > false
print(1 and 0)          -- > 1

-- if trên một dòng.
print(1 > 6 and 4 or 3)
-- > In ra 3
print(0 and 'true' or 'false')
-- > In ra true, vì 0 là đúng mà.

```

## 3. Vòng lặp

```lua
for i = 1, 10 do -- Từ 1 đến <= 10, i sẽ tăng 1.
    print(i)
end

for i = 20, 10, -1 do   -- i giảm 1.
    print(i)
end

n = 0
while (n < 5) do
    n = n + 1
end
-- Do -- dùng cho comment nên sẽ không có ++.

repeat
    n = n + 1
until n > 5
-- Có thằng này là không kết thúc bằng end.

```

## 4. Hàm

```lua
-- Khai báo hàm.
function foo()
    print('Hello World!')
end

-- Gọi hàm.
foo()   -- In ra Hello World!

-- Khai báo kiểu lambda.
fib = function(n)
    if n < 2 then
        return 1
    end
    return fib(n - 2) + fib(n - 1)
end

-- Hàm trả về nhiều kết quả.
function mulret(a, b, c)
    print(a, b, c)
    return 4, 5, 6, 7, 8
end

x, y, z = mulret(5)
-- > 5 nil nil ; tham số b, c sẽ là nil.

-- Hàm trả về chỉ gán 4, 5, 6 vào x, y, z; 7 và 8 thừa.
print(x, y, z)  -- Kiểm tra, chỉ in ra 4 5 6.

-- Thêm local vào trước thì là hàm cục bộ.
local function g(x) print(x) end
local g; g = function (x) print(x) end
-- Hai thằng như nhau.

g((((((1))))))
g 'qwerty'      -- In ra qwerty.
-- Trường hợp gọi hàm không cần cặp ngoặc tròn khi
--   tham số được cách tên hàm bằng các kí tự cú pháp
--   như: ngoặc nhọn { (table), dấu nháy " hoặc ' (chuỗi).

-- Lua còn hỗ trợ cả ...
function vargs(...)
    print(...)
end

vargs(11, 'a', 4+5) -- > In ra 11  a   9.

```

## 5. Bảng (table)

```lua
-- Đây là kiểu cấu trúc phức hợp của Lua,
--   tương tự như array trong PHP hay object trong JS.

t = {key1 = 'value1', key2 = false}

-- Sử dụng dấu chấm để tham chiếu đến phần tử con.
print(t.key1)   -- In ra value1
t.newKey = {}   -- Thêm newKey, giá trị là một table. 
t.key2 = nil    -- Xóa key2

-- Sử dụng giá trị để đánh dấu phần tử con.
u = {['@!#'] = 'qbert', [{}] = 1729, [6.0 + 0.28] = 'concho'}
-- Sử dụng cặp ngoặc [ ] và cho biểu thức vào trong.
print(u[6.28])  -- In ra concho.

a = u['@!#']    -- a = 'qbert'
b = u[{}]       -- b = nil, không phải 1729 nhé.
-- Vì key này là table rỗng,
--   cần phải sử dụng hai table giống nhau.

-- Sử dụng table cho tham số của hàm.
function h(x) print(x.key1) end 
h {key1 = 'AK-47'}  -- In ra AK-47.

-- Mảng (list / arrays):
v = {'value1', 'value2', 1.21, 'gigawatts'} 
for i = 1, #v do  -- #v để lấy độ dài, dùng được cho cả chuỗi.  
    print(v[i]) -- Array trong Lua "start at 1" nhé! =))
end

local a = {11, 22, 55, 77}
local b = {x = 10, y = 15, pi = 3.14}

-- foreach index.
for i,v in ipairs(a) do
    print(i,v)
end
-- foreach với key.
for k,v in pairs(b) do
    print(k,v)
end

```

## 6 Metatable, metamethod (prototype)

```lua
-- Một table có thể có metatable, 
--   nó sẽ nhận nạp chồng một table khác.

f1 = {x = 1, y = 2}
f2 = {x = 5, y = 6}

-- Sẽ sinh lỗi nếu:  
-- s = f1 + f2
-- Vì không thể cộng hai table.

-- Tạo metatable.
my_meta = {} 
function my_meta.__add(a, b) 
    local ret = {}
    ret.x = a.x + b.y 
    ret.y = a.x - b.y
    return ret
end

-- Set protptype cho cả hai.
setmetatable(f1, my_meta)
setmetatable(f2, my_meta)

r1 = f1 + f2 -- Gọi .__add(f1, f2) trong metatable của f1.
r2 = f2 + f1 -- Tương tự luôn, metatable của f2.
print(r1.x, r1.y)   -- > 7   -5
print(r2.x, r2.y)   -- > 7   3

-- Hiểu đơn giản hơn thì một table bình thường,
--   chỉ để chứa dữ liệu mà thôi,
--   metatable thêm vào sẽ là bộ tiền xử lý cho nó.

-- Thêm table vào table thông qua key __index.
defaultFavs = {animal = 'dog', food = 'donuts'} 
myFavs = {food = 'pizza'} 
setmetatable(myFavs, {__index = defaultFavs}) 
eatenBy = myFavs.animal     -- > 'dog'

-- Giá trị của __index, __add, .. được gọi là metamethod.
-- Full list, a là một table với một metamethod.
--[[
    __add(a, b)            cho a + b
    __sub(a, b)            cho a - b
    __mul(a, b)            cho a * b
    __div(a, b)            cho a / b
    __mod(a, b)            cho a % b
    __pow(a, b)            cho a ^ b
    __unm(a)               cho -a
    __concat(a, b)         cho a .. b
    __len(a)               cho #a
    __eq(a, b)             cho a == b
    __lt(a, b)             cho a < b
    __le(a, b)             cho a <= b
    __index(a, b)          <hàm hoặc một table> cho a.b
    __newindex(a, b, c)    cho a.b = c
    __call(a, ...)         cho a(...)
--]]

```

## 7 Lớp và kế thừa

```lua
-- class không được tích hợp sẵn (không như C++, Java...) 
-- Có nhiều cách khác nhau để tạo thông qua
--   việc sử dụng table và metatable.

Dog = {}                                -- 1.
function Dog:new()                      -- 2.
    newObj = {sound = 'woof'}           -- 3.
    self.__index = self                 -- 4.
    return setmetatable(newObj, self)   -- 5.
end

function Dog:makeSound()                -- 6.
    print('I say ' .. self.sound)
end

mrDog = Dog:new()                       -- 7.
mrDog:makeSound() -- > 'I say woof'     -- 8.

-- 1. Dog giống như một class, nhưng thực chất là table.

-- 2. Hàm tablename:func(...) được hiểu như
--   hàm tablename.func(self, ...)
--   dấu hai chấm : thêm self vào
--   thành tham số thứ nhất.
--   Đọc 7 & 8 bên dưới để hiểu nó thêm như nào.

-- 3. newObj sẽ là instance mới cho class Dog.

-- 4. self = class mới tạo ra. Thông thường
--   self = Dog, nhưng phần kế thừa sẽ thay đổi nó.
--   newObj get các hàm từ chính nó nhưng set
--   metatable của newObj và __index của nó
--   vào chính nó (Dog).

-- 5. Nên nhớ: setmetatable sẽ return tham số đầu.

-- 6. Dấu hai chấm : như trong mục 2, nhưng self này
--   có thể sử dụng cho lớp con kế thừa thông qua Dog.new().

-- 7. Giống như Dog.new(Dog), self = Dog trong new().
-- 8. Giống như mrDog.makeSound(mrDog); self = mrDog.

----------------
-- Ví dụ kế thừa.
----------------

LoudDog = Dog:new()                     -- 1.

function LoudDog:makeSound()
    s = self.sound .. ' '               -- 2.
    print(s .. s)
end

seymour = LoudDog:new()                 -- 3.
seymour:makeSound() -- > 'woof woof'    -- 4.

-- 1. LoudDog lấy method & property từ Dog.

-- 2. Bản thân nó có key 'sound' từ hàm new().

-- 3. Giống như LoudDog.new(LoudDog),
--   và được chuyển thành Dog.new(LoudDog),
--   LoudDog không có key 'new', nhưng nó có
--   __index = Dog trong metatable của nó (LoudDog).
--   Kết quả: metatable của seymour là LoudDog, và
--   LoudDog.__index = LoudDog. Nên seymour.key sẽ
--   = seymour.key, LoudDog.key, Dog.key, bất kỳ
--   table nào cũng là cái đầu tiên với key nhận được.

-- 4. Key 'makeSound' có sẵn trong LoudDog, seymour kế thừa,
--   nó giống như LoudDog.makeSound(seymour).

--   Nếu cần tạo thêm class con mới, cấu trúc sẽ như sau:

function LoudDog:new()
    newObj = {} -- tạo newObj
    self.__index = self
    return setmetatable(newObj, self)
end

```

## 8. Tạo module

Module giống như một thư viện riêng, và người dùng có thể sử dụng nó thông qua:

```lua
local mod = require('module_name')
```

Có 2 loại module bao gồm: 
- **Lua module**: viết bằng Lua, được xem như một hàm.
- **C module**: thường được viết bằng C hoặc bất kỳ ngôn ngữ nào, được biên dịch dưới dạng thư viện liên kết động.

Đầu tiên, tạo một file mới làm module:

```lua module.lua tạo file mới
-- Khởi tạo table M.
-- Đây là biến cục bộ, chỉ sử dụng được trong file này.
local M = {}
```

Thêm mộ số giá trị vào table **M**:

```lua module.lua dưới khai báo biến M
local M = {}

+M.a = 1
+M.b = true
+M.c = 'Hello'
+
+M.foo = function(self)
+    print(self.c)
+end
```

Và trả về **M** ngay cuối file:
```lua module.lua thêm vào dưới M.foo
    print(self.c)
end

+return M
```

Tiếp tục tạo một file mới để chạy code:

```lua main.lua
local mod = require('module')
-- Load module ở trên, lưu ý tên file.
-- Nếu file module.lua nằm trong thư mục con thì
--   require('folder.module')
--   có thể thay '.' thành '/' hoặc '\\'

print(mod.a)    -- > 1
print(mod.b)    -- > true
mod:foo()       -- > 'Hello'
-- Hoặc mod.foo(mod).
```

Nên nhớ, biến `local` trong __main.lua__ sẽ không dùng được trong __module.lua__.
Nếu quy về hàm hoặc sử dụng cho cùng một file thì sẽ như này:
```lua
local function module()
    local M = {}
    -- ...
    return M
end

mod = module()
```

Ngoài ra có thể chạy file Lua khác ngay trong chương trình.
```lua
dofile('abc.lua')
-- Chạy abc.lua, 
--   tất nhiên là không lưu các biến từ file đó,
--   không giống như require đâu.

local f = loadfile('abc.lua')  
-- loadfile sẽ load một file nhưng không chạy ngay mà lưu vào hàm.
-- Sử dụng f() để chạy file.
```

### Các module chuẩn

Lua cung cấp một số module chuẩn dành cho các nhu cầu cơ bản, tất nhiên là không cần dùng `require` đâu, trừ khi biến của thư viện được bạn gán cho một giá trị nào đó.

- [io](http://lua-users.org/wiki/IoLibraryTutorial)
- [math](http://lua-users.org/wiki/MathLibraryTutorial)
- [os](http://lua-users.org/wiki/OsLibraryTutorial)
- [string](http://lua-users.org/wiki/StringLibraryTutorial)
- [table](http://lua-users.org/wiki/TableLibraryTutorial)

```lua
io.write("Hello\n") -- Tương tự print().
os.exit()           -- Thoát nhanh.
```

## 9. Lập trình coroutines

Một coroutine mang nghĩa một luồng (thread), lập trình coroutines cũng mang nghĩa lập trình đồng thời (concurrency, nhưng chỉ là nghĩa bóng). Khác nhau ở đây là nghĩa đen, là sự hợp tác (chứ không phải đồng thời) giữa các coroutine, và một lúc chỉ chạy được một coroutine, chúng có thể được yêu cầu dừng để coroutine khác chạy xen vào.

```@ concurrency @ là điểm bắt đầu
main  +----+-+--------------- >
           | |
thread     @----------------- >
           |
thread     @----------------- >
```

```@ coroutines o là điểm dừng
main  +----+     +--+
           |     |  |
coroutine  o  @--o  +  @----- >
           |  |     |  |
coroutine  @--o     @--o
```

> Coroutines chỉ khác đơn luồng ở chỗ là có thể dừng hàm ở bất kỳ đâu để xen hàm khác tại vị trí đó.

![Chào các cô chú 🐶 h=256](./cute-dogs.jpg)

Cho dễ hiểu hơn, hãy xem ảnh trên (biễu diễn cho concurrency). Khi gọi thì cả ba con cún đều xuất hiện cùng lúc, nhưng bạn chỉ có thể nựng một con một lúc. Khi đơn luồng, bạn sẽ nựng mỗi con một lúc, **hết con này mới đến con khác**. Còn coroutines thì nếu **trong lúc nựng con này mà chán, bạn có thể sang nựng con khác, chán nữa thì quay lại con này cho đến khi xong**.


Tạo một coroutine đơn giản như sau:
```lua coro.lua tạo file mới
co = coroutine.create(function ()
    print("hi")
end)

print(co)
```
- In ra `thread: 0x64....`, địa chỉ của coroutine.

Một coroutine sẽ có 3 trạng thái: **suspended**, **running** và **dead**.

```lua coro.lua thêm vào cuối file
print(co)
+print(coroutine.status(co))
```
- In ra `suspended`, nó đang ở trạng thái dừng vì chưa chạm gì vào.

Chạy và check trạng thái cuối cùng:
```lua coro.lua thêm vào cuối
print(coroutine.status(co))
+coroutine.resume(co)
+print(coroutine.status(co))
```
- In ra `dead`, và tất nhiên sẽ không thễ resume được nữa.

Để dừng một coroutine đang chạy, ta có hàm `coroutine.yield`:

```lua coro.lua xóa hết và thay bằng đoạn này
+co = coroutine.create(function ()
+    for i=1,10 do
+        print("co", i)
+        coroutine.yield()
+    end
+end)
```

Test thử:
```lua coro.lua thêm vào cuối file
end)

+coroutine.resume(co)        -- > co   1
+print(coroutine.status(co)) -- > suspended
+coroutine.resume(co)        -- > co   2
+coroutine.resume(co)        -- > co   3
```
- Nếu quá 10 lần resume thì nó `dead`.

Truyền tham số vào hàm trong coroutine:
```lua
co = coroutine.create(function(a,b,c)
    print("co", a, b, c)
end)

coroutine.resume(co, 1, 2, 3)   -- > In ra co  1  2  3
```

### Tính hợp tác

Ta có 2 coroutine sau:

```lua coro.lua xóa hết rồi chèn vào
+co1 = coroutine.create(function()
+    for i=1,3 do print("co1_"..i) end
+end)
+
+co2 = coroutine.create(function()
+    for i=1,3 do print("co2_"..i) end
+end)
```

Chạy thử:
```lua coro.lua dưới đoạn gán co2
end)

+coroutine.resume(co1)
+coroutine.resume(co2)
```

Ta sẽ thấy, nó chạy xong **co1** rồi mới đến **co2**:
```
co1_1
co1_2
co1_3
co2_1
...
```

Tiếp tục thêm `yield` vào, **co1** dừng **co2** và ngược lại:
```lua coro.lua thay 1 dòng chỗ hàm co1
co1 = coroutine.create(function()
+    for i=1,3 do print("co1_"..i) coroutine.yield(co2) end
end)
```

```lua coro.lua thay 1 dòng chỗ hàm co2
co2 = coroutine.create(function()
+    for i=1,3 do print("co2_"..i) coroutine.yield(co1) end
end)
```

Sửa luôn chỗ test:
```lua coro.lua thay 2 dòng cuối file
end)

+for i=1,3 do
+    coroutine.resume(co1)
+    coroutine.resume(co2)
+end
```

Và đây là kết quả, hai coroutine chạy xen nhau theo thứ tự.

```
co1_1
co2_1
co1_2
co2_2
...
```

**Đến đây là kết thúc rồi, có thể là hơn 30 phải không?**

> Lua rất dễ và thú vị, xứng đáng là ngôn ngữ cho người mới bắt đầu.

> Khoảng 10 năm trước thì Lua bắt đầu nổi lên trong mảng lập trình game, đến nay nó vẫn đứng top!
