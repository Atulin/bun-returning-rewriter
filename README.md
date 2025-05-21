# Bun Returning Rewriter

[![JSR Version](https://img.shields.io/jsr/v/%40angius/bun-returning-rewriter?style=for-the-badge&color=f7df1e)](https://jsr.io/@angius/bun-returning-rewriter)
[![NPM Version](https://img.shields.io/npm/v/%40angius%2Fbun-returning-rewriter?style=for-the-badge&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40angius%2Fbun-returning-rewriter)](https://www.npmjs.com/package/@angius/bun-returning-rewriter)
[![GitHub License](https://img.shields.io/github/license/atulin/bun-returning-rewriter?style=for-the-badge&color=darkgreen)](./LICENSE.txt)
![Bun Badge](https://img.shields.io/badge/Bun-fbf0df?style=for-the-badge&logo=bun&logoSize=auto&labelColor=333&color=fbf0df)

A thin wrapper over HtmlRewriter providing support for returning data

## Install

```sh
bunx jsr add @angius/bun-returning-rewriter
```

or

```sh
bun add @angius/bun-returning-rewriter
```

## Usage

```ts
const html = `
    <div data-foo="one"></div>
    <div data-foo="two"></div>
`;

const rewriter = new ReturningHtmlRewriter();
rewriter.on('div[data-foo]', {
    element(el, ctx) {
        ctx.add({
            name: el.tagName,
            foo: el.getAttribute('data-foo')
        })
    }
});
const data = rewriter.parse(html);
console.log(JSON.stringify(data, null, 4));
/*
[
    {
        "name": "div",
        "foo": "one"
    },
    {
        "name": "div",
        "foo": "two"
    }
]
*/
```
