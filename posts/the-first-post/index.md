---
title: The first post
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiumod stempor incididunt ut labore et dolore magna aliqua.
date: 2017-05-04
image: https://www.ohsolovelyblog.com/wp-content/uploads/2023/09/November-2023-wallpapers-OhSoLovelyBlog.com-SundayStart1.jpg
tags: [example]
dev: true
author:
    name: nomi
    avatar: /images/no.png
---

> This post is used to test markdown systax.

# Header 1

## Header 2 `demo`

### Header 3

A paragraph...

[Lorem ipsum](https://en.wikipedia.org/wiki/Lorem_ipsum) dolor sit amet,
consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
dolore magna aliqua.

## Ordered list

1. Android
2. iOS

## Unordered list

- Mac OS :apple:
- Windows :windows:

## Check list

- [x] Done
- [ ] Todo

## Code

This is `inline` code.

```js
// this is a code block
function main() {
  console.log('hello')
}
```

## Quote

> Something magical...

## Table

|      | Apple | Banana | Be FA |
| :--- | :---: | :----: | :---: |
| John |  👍   |   👍   |       |
| Jame |  👎   |   👍   |  🏳️‍🌈  |

## Mermaid

Visit [Mermaid](https://mermaid-js.github.io/mermaid/#/flowchart) to learn more
about syntax.

```mermaid
flowchart LR
    A[Rental service] -. give account .-> User
```

# Image

![Markdown is awesome h=160](https://grafxflow.co.uk/storage/app/uploads/public/5ad/e5b/d9b/thumb_891_266_0_0_0_auto.png)

# What is Lorem Ipsum?

**Lorem Ipsum** is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
when an unknown printer took a galley of type and scrambled it to make a type
specimen book. It has survived not only five centuries, but also the leap into
electronic typesetting, remaining essentially unchanged. It was popularised in
the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
and more recently with desktop publishing software like Aldus PageMaker
including versions of Lorem Ipsum.

# Hello world

We start in `main()`.

```c !main.c @create a new file
#include <stdio.h>

int main() {
  /* code here */
}
```

Print out greetting.

```c !main.c @in main function
int main() {
-  /* code here */
+  printf("Hello, world!\n");
+  return 0;
}
```

Compile and run.

```terminal
gcc hello.c -o main
./main
___
Hello, world!
```
