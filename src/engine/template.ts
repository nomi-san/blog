// Replacer functions: page html may contain "$&" and other String.replace() patterns.
export function fillTemplate(template: string, head: string, html: string) {
  return template
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => html)
}
