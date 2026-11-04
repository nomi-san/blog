// Solid writes the styles and preloads from the client manifest, so the ones Vite put in
// the built index.html would load twice. Only the entry script has to stay.
export function stripAssetLinks(template: string) {
  return template.replace(/^[ \t]*<link rel="(?:modulepreload|stylesheet)"[^>]*>\r?\n/gm, '')
}

// Replacer functions: page html may contain "$&" and other String.replace() patterns.
export function fillTemplate(template: string, head: string, html: string) {
  return template
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => html)
}
