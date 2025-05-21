# bun-returning-rewriter

## Usage

```ts
const html = `
    <div data-foo="one"></div>
    <div data-foo="two"></div>
`

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
