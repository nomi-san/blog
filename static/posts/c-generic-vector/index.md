---
title: Generic vector trong C
description: Liệu có xịn sò như std::vector trong C++ không?
date: 2020-12-06
image: ./cover.jpg
tags: [c, vector]
---

## Vector là khỉ gì?

Vector hay còn được gọi với cái tên thân thương - mảng động (dynamic array). Là
một kiểu dữ liệu đặc biệt có thể chứa nhiều giá trị liên tục trên một dãy bộ nhớ
của cùng một loại dữ liệu (đối với ngôn ngữ static typed).

Trong các ngôn ngữ bậc cao, vector gần như là một phần không thể thiếu được. Nó
có thể là `std::vector` trong C++, `Array` trong JavaScript hay `[]` trong
Python.

Đối với C, không hề có sự tồn tại của vector trong standard library. Mà buộc ta
phải tự viết dựa trên các hàm cấp phát bộ nhớ động có sẵn như `malloc` và
`realloc`.

## Generic programming

Generic programming hay lập trình tổng quát là phần không thể thiếu trong C++,
nó giúp ta code một cách "tổng quát" và triển khai trên nhiều kiểu dữ liệu.

Ví dụ:

```cpp
template<T>
T add(T a, T b) {
  return a + b;
}
```

Khi hàm `add()` được gọi, **T** nhận kiểu dữ liệu tương ứng với kiểu dữ liệu của
tham số truyền vào:

```cpp
add(1, 2); // add(int, int);
```

Hoặc ta có thể định kiểu cho nó bằng cách:

```cpp
add<float>(2.3f, 5); // add(float, float);
```

Trình biên dịch sẽ tự sinh code cho chúng ta, kết hợp với overloading.

Trái lại với trong C, chả có generic hay template nào ở đây cả. Nhưng ta có
macro - một loại preprocessor (tiền xử lý) giúp báo cho compiler hiểu và triển
khai code ngay lúc biên dịch.

```c
#define hi "hello, world!"
printf(hi);
```

## Triển khai

Để xem... mục tiêu của chúng ta là viết một mảng động cho C, có thể hỗ trợ được
nhiều kiểu dữ liệu. Đi cùng với nó là một số phương thức như sau:

- `init()`: khởi tạo vector
- `free()`: giải phóng bộ nhớ đã cấp phát
- `push(val)`: thêm một phần tử `val` vào cuối vector, không dùng `push_back`
  như C++ vì nó khá dài
- `pop()`: xóa phần tử cuối cùng ra khỏi vector
- `count()`: đếm số phần tử hiện có
- `operator [i]`: lấy trực tiếp giá trị bằng indexer

### Khai báo

Có nhiều cách khác nhau để thực hiện, nhưng hãy chú ý chỗ `operator [i]`, trong
C thì chỉ có `T *`, tức pointer của một data type `T` (trừ `void`) là có thể sử
dụng được indexer.

Vậy để khai báo một vector, ta có macro sau:

```c
#define vec(T) T *
```

Lúc này thì vector của chúng ta chẳng khác gì mảng thông thường trong C rồi.

```c
vec(int) arr;

// Có thể dùng trong struct
struct X { vec(void *) ptrs; };
```

Để giữ cho vector ở trạng thái an toàn và có thể truy xuất nhanh thông tin, phải
có 2 thành phần chủ chốt là **count** và **capacity**. Vậy là ta có chiến thuật
như sau:

> Cấp phát bộ nhớ cho vector sao cho thừa một tí để chứa phần thông tin.

Mình sẽ sử dụng cách mà `malloc` dùng, đó là lấy phần đầu tiên vùng nhớ - gọi là
header để chứa thông tin của vector. Có thể hình dung như sau:

```
[ count | capacity | [0] | [1] | ...
^                  ^
base               vec = base+sizeof(co)+sizeof(ca)
```

Count và capacity sẽ là kiểu `size_t`, nên có thể dễ dàng chuyển đổi địa chỉ khi
biết một trong hai. Việc còn lại là sử dụng `vec` làm địa chỉ của vector, ví dụ
`malloc` trả về địa chỉ là `0x1000F0` thì ta có địa chỉ mới là `0x100100` trên
CPU 64-bit.

Vậy ta có macro từ `base` suy ra `vec`:

```c
size_t *base = ...;
vec = (void *)&base[2];
```

- Index [2] đồng nghĩa với +2x`sizeof(size_t)`

Tương tự, từ `vec` suy ra `base`:

```c
base = (void *)&((size_t *)(vec))[-2];
```

### init() và push()

Sau khi khai báo `vec(T)`, muốn sử dụng được ta phải khởi tạo (initialize) nó.
Có hai hướng đi như sau:

- #1 - Cấp phát sẵn kích cỡ bộ nhớ ban đầu cho vector, sau đó `push()` sẽ tiện
  hơn.
- #2 - Hoặc bỏ luôn phần `init()` và gán thẳng vector bằng `NULL`, các hàm tương
  tác còn lại phải check null trước, với `push()` thì thêm phần khởi tạo.

Tại đây mình sẽ chọn #1 cho dễ thực hiện, việc khởi tạo ngay từ đầu cũng giúp
vector đạt hiệu suất cao nhất có thể.

Ta có macro `init` như sau:

```c
#define vec_init(v) \
  do {                                      \
    size_t *base = (void *)malloc(          \
      sizeof(size_t)*2 + sizeof(*(v))*4);   \
    base[0] = 0; base[1] = 4;               \
    (v) = (void *)&base[2];                 \
  } while (0)
```

- 4 là kích thước khởi tạo cho vector, ta có thể sử dụng 8, hoặc
  `sizeof(size_t)` là thích hợp nhất
- Cho tất cả vào `do while(0)` để biến nó thành một statement, nếu dùng cặp
  `{ }` thì vẫn được, nhưng nó sẽ thành một block.

Đối với push, ta chỉ cần thêm vào vị trí count và tăng count lên.

```
(3/4) [1, 2, 3].push(4)
(4/4) [1, 2, 3, 4]
```

Đạt đến ngưỡng, thì phải gia tăng sức chứa.

```
(4/4) [1, 2, 3, 4].push(5)
(5/8) [1, 2, 3, 4, 5]
```

- Khi vector "đủ lớn", việc nhân đôi có vẻ khá thừa, ta có thể sử dụng hệ số

Macro push như sau:

```c
#define vec_push(v, val)                    \
  do {                                      \
    size_t *base = &((size_t *)(v))[-2];    \
    if (base[0] >= base[1])  {              \
      base = (void *)realloc(base,          \
        sizeof(size_t)*2 +                  \
        sizeof(*(v))*(base[1] *= 2));       \
      (v) = (void *)&base[2];               \
    }                                       \
    (v)[base[0]++] = val;                   \
  } while (0)
```

- Dùng `sizeof(*(v))` để lấy độ dài của kiểu dữ liệu của vector
- Điều kiện đạt ngưỡng có thể khác, 3/4 sức chứa (`base[1]` x 0.75) chẳng hạn

### free() và pop()

Dể giải phóng bộ nhớ đã cấp phát cho vector, ta chỉ cần `free()` phần bộ nhớ đã
cấp phát ban đầu, chính là `base`:

```c
size_t *base = &((size_t *)(vec))[-2];
free(base);
```

Vậy ta có macro sau:

```c
#define vec_free(v) free(&((size_t *)(v))[-2])
```

Pop thì ngược với push, trả về hẳn giá trị phần tử cuối và giảm count đi một đơn
vị.

```
[ 2 | 4 | 5 | 7 | - | - ].pop()
[ 1 | 4 | 5 | 7 | - | - ] => 7
```

```c
#define vec_pop(v) (0, ((v)[--((size_t *)(v))[-2]]))
```

- Rõ ràng là không cần thiết phải xóa phần tử cuối đi, vì đây không phải kiểu
  động và không có `undefined` như JavaScript.

### count()

Ta có macro sau để đếm số phần tử của vector:

```c
#define vec_count(v) ((size_t *)(v))[-2]
```

Nhưng sẽ có vấn đề phát sinh ở đây:

```c
vec_count(my_vec) = 100; // no error
```

Vì `vec_count` đang là index -2 của một mảng `size_t` nên có thể bị gán một cách
dễ dàng, ta có thể biến nó thành **rvalue** như sau:

```c
#define vec_count(v) (0, ((size_t *)(v))[-2])
```

- Trong C, dấu bằng ngăn cách hai vế, tạo thành **lvalue** và **rvalue**, chỉ có
  rvalue là không thể chuyển sang bên trái, nên không thể gán được giá trị.

### Thử nghiệm

Mảng số nguyên `int`:

```c
vec(int) arr = NULL;
vec_init(arr);

vec_push(arr, 10);
vec_push(arr, 20);

printf("%d\n", arr[0]);
printf("%d\n", vec_pop(arr));
printf("%zu\n", vec_count(arr));

vec_free(arr);
```

```bash
10
20
1
```

Ta có thể sử dụng cho mọi kiểu:

```c
vec(double) numbers;
vec(void *) pointers;

typedef struct { int n; } myType;
vec(myType) test;
```

## Thử thách

Hãy thử implement một số phương thức sau:

- `capacity()`: lấy sức chứa của vector
- `foreach()`: iterator cho vector

  ```c
  vec_foreach(arr, int i) {
    printf("%d\n", i);
  }
  ```

- `clone()`: clone một vector mới

  ```c
  newArr = vec_clone(arr)
  ```

<br/>

[spoiler] Bạn có thể xem mã nguồn đầy đủ
[tại đây](https://github.com/nomi-san/vec.h), các macro được sử dụng có liên
quan đến [obj.h](https://github.com/small-c/obj.h) - một thư việc hỗ trợ lập
trình hướng đối tượng thuần ngôn ngữ C.
