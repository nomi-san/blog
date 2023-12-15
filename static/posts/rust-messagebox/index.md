---
title: Hộp thoại Rust
description: Cách tạo hộp thoại thông báo trên Windows bằng Rust.
date: 2017-11-11
image: https://www.vectorlogo.zone/logos/rust-lang/rust-lang-ar21.png
tags: [rust, win32]
---

Debug bằng hộp thoại thông báo là phương pháp phổ biến trong trình giao diện
desktop. Khi hộp thoại thông báo xuất hiện, điều đập vào mắt đầu tiên là hộp
thoại khá đẹp và sáng sủa, không như console đen xì kia. Và chương trình sẽ dừng
cho đến khi ta đóng hộp thoại, giống như đặt _break point_ vậy.

Trong bài này, mình sẽ hướng dẫn tạo một hộp thoại thông báo đơn giản trên
Windows bằng **Rust**.

Đầu tiên là tạo một project mới bằng cách sử dụng
[Cargo](http://doc.crates.io/guide.html).

```terminal
cargo new --bin hello_world
```

- Dòng lệnh trên sẽ tạo một thư mục mới có tên là `hello_world` trong thư mục
  làm việc hiện tại
- `--bin` cho phép Cargo biên dịch ra chương trình có thể thực thi được
  (executable)

Để tạo hộp thoại thông báo thì ta có lệnh `MessageBox` và gọi nó thông qua file
`user32.dll`. Tương ứng trong Rust, mình sẽ sử dụng create `winapi` đi kèm với
`user32-sys`.

```ini cargo.toml sau khóa {dependencies}
[dependencies]
+winapi = "0.2.7"
+user32-sys = "0.2.0"
```

- Tại thời điểm viết bài này, thì `winapi v0.2.7` và `user32-sys v0.2.0` là ổn
  định nhất
- Cargo sẽ tự động download và build các crate được thêm vào

Sau khi thiết lập xong project, hãy mở file `src/main.rs` bằng một editor bất
kỳ.

```rust main.rs mẫu hello huyền thoại
fn main() {
    println!("Hello, world!");
}
```

Để sử dụng hai crate trên, ta khai báo như sau:

```rust main.rs trên hàm {main}
+extern crate user32;
+extern crate winapi;

fn main() {
```

Tiếp tục với hàm tạo hộp thoại thông báo, mẫu code C/C++ trên
[MSDN](https://msdn.microsoft.com/en-us/library/windows/desktop/ms645505(v=vs.85).aspx)
như sau:

```cpp
int WINAPI MessageBox(
    _In_opt_  HWND     hWnd,
    _In_opt_  LPCTSTR  lpText,
    _In_opt_  LPCTSTR  lpCaption,
    _In_      UINT     uType
);
```

Nếu bạn không biết gì về lập trình Windows thì chắc hẳn sẽ thấy rất lạ lẫm. Để
đơn giản hơn, hãy nghĩ `WINAPI`, `_In_opt_` và `_In_` chỉ là các thuộc tính mô
tả cách sử dụng hàm. Bỏ qua hết, ta được kiểu khai báo hàm đơn giản trong
**C/C++**:

```cpp
int MessageBox(
    HWND     hWnd,
    LPCTSTR  lpText,
    LPCTSTR  lpCaption,
    UINT     uType
);
```

- `HWND` là một con trỏ (pointer) đến một cửa sổ (thường gọi là handle của một
  window).
- `LPCTSTR` là pointer đến chuỗi `const`.
- `UINT` tất nhiên là một số nguyên không dấu.

Một câu hỏi đặt ra, "Chuỗi `LPCTSTR` thuộc loại gì? ASCII hay Unicode?” Và câu
trả lời hơi phức tạp.

Trong lập trình Windows C/C++, có một tiền xử lý được gọi là `UNICODE` xác định
xem một `LPCTSTR` thuộc chuỗi Unicode hay ASCII. Tiền xử lý này cũng chịu trách
nhiệm xác định hàm `MessageBox` nào được gọi (bạn có thể tìm hiểu thêm
[tại đây](https://msdn.microsoft.com/en-us/library/windows/desktop/ff381407(v=vs.85).aspx)).

Lăn xuống cuối trang
[MSDN](https://msdn.microsoft.com/en-us/library/windows/desktop/ms645505(v=vs.85).aspx),
ta thấy rằng tên Unicode và ASCII cho hàm này tương ứng là `MessageBoxW` và
`MessageBoxA`. Điều này quan trọng bởi vì ta cần phải gọi chính xác để hộp thoại
mới có thể hiển thị đúng với nội dung cho trước. Trong bài viết này, mình sẽ
chọn ASCII (`MessageBoxA`).

Trong một ví dụ trên MSDN, param thứ nhất nếu không có một cửa sổ nào thì ta sẽ
truyền vào giá trị `NULL` (đơn giản vì `_In_opt_`). Param thứ hai và ba sẽ là
chuỗi ASCII lần lượt cho nội dung và tiêu đề của hộp thoại. Param cuối cùng sẽ
là flag bit để kiểm soát các nút lệnh của hộp thoại. Theo ví dụ này thì ta chọn
`MB_OK` để có một nút OK và `MB_ICONINFORMATION` để hiển thị một biểu tượng
thông báo trên hộp thoại. Ta sẽ kết hợp chúng lại bằng toán tử
[biwise OR](https://vi.wikipedia.org/wiki/Ph%C3%A9p_to%C3%A1n_thao_t%C3%A1c_bit#OR)
để đưa ra một giá trị đơn.

```cpp
MessageBoxA(
    NULL,
    "Hello, world!",
    "MessageBox Example",
    MB_OK | MB_ICONINFORMATION
);
```

Đến đây, cần phải tìm ra cách để chuyển code trên sang **Rust**, ta có một số
câu hỏi như sau:

1. `MessageBoxA`, `MB_OK` và `MB_ICONINFORMATION` có ở đâu?
2. Tương tự với `NULL` cái gì? Trong Rust chỉ có `None`, nhưng ta cần một con
   trỏ.
3. Làm cách nào để truyền chuỗi trong **Rust** vào **C**?

Để tìm câu trả lời cho #1, mình mở
[docs winapi](https://retep998.github.io/doc/winapi/index.html) và sử dụng thanh
tìm kiếm ở trên cùng. Tìm thấy chúng trong
[`user32`](https://retep998.github.io/doc/user32/index.html) và
[`winapi::winuser`](https://retep998.github.io/doc/winapi/winuser/index.html).

```rust main.rs dưới {crate winapi}
extern crate winapi;

+use user32::MessageBoxA;
+use winapi::winuser::{MB_OK, MB_ICONINFORMATION};
```

- Sử dụng trực tiếp hàm `MessageBoxA`, hai constant cũng tương tự

Đến #2, mình tìm trên **Google** thì thấy một hướng dẫn lấy `NULL` bằng module
`std::ptr`, ta sử dụng hàm
[`std::ptr::null_mut()`](https://doc.rust-lang.org/std/ptr/fn.null_mut.html).
Bạn cũng có thể tham khảo cách sử dụng `NULL` trong
[bài này](https://thefullsnack.com/posts/rust-has-no-null.html?t=1524943801604).

```rust main.rs dưới phần khai báo {MB_ICONINFORMATION}
use winapi::winuser::{MB_OK, MB_ICONINFORMATION};
+use std::ptr::null_mut;
```

Và cuối cùng là #3, module `ffi` trong standard library có
[`CString`](https://doc.rust-lang.org/std/ffi/struct.CString.html) giúp tạo ra
chuỗi. Chúng ta chỉ cần tạo một giá trị mới của kiểu này và sử dụng
[`.as_ptr()`](https://doc.rust-lang.org/std/ffi/struct.CString.html#method.as_ptr)
để tạo được một raw pointer và chuyển đến CAPI.

```rust main.rs sau khai báo {null_mut}
use std::ptr::null_mut;
+use std::ffi::CString;
```

Tạo hai chuỗi cho hộp thoại:

```rust main.rs trong hàm {main}
fn main() {
+    let text = CString::new("Hello, world!").unwrap();
+    let caption = CString::new("MessageBox Example").unwrap();
}
```

Gọi hàm `MessageBoxA` và bỏ tất cả vào.

```rust main.rs dưới khai báo caption
    let caption = CString::new("MessageBox Example").unwrap();
+    MessageBoxA(
+        null_mut(),
+        text.as_ptr(),
+        caption.as_ptr(),
+        MB_OK | MB_ICONINFORMATION
+    );
}
```

Khi build sẽ có một warning khó chịu xuất hiện, do hàm trên là foreign function
nên phải thêm nó vào block `unsafe`.

```rust main.rstrên {MessageBoxA}
    let caption = ...
+    unsafe {
        MessageBoxA(
            ...
        );
+    }
```

Xong, chỉ cần build và run rồi tận hưởng thành quả!

```rust
extern crate user32;
extern crate winapi;

use user32::MessageBoxA;
use winapi::winuser::{MB_OK, MB_ICONINFORMATION};
use std::ptr::null_mut;
use std::ffi::CString;

fn main() {
    let text = CString::new("Hello, world!").unwrap();
    let caption = CString::new("MessageBox Example").unwrap();
    unsafe {
        MessageBoxA(
            null_mut(),
            text.as_ptr(),
            caption.as_ptr(),
            MB_OK | MB_ICONINFORMATION
        );
    }
}
```
