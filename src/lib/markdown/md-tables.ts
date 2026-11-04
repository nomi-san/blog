import { marked, Renderer } from 'marked'

marked.use({
  renderer: {
    table(token) {
      return `<div class="table-scroll">${Renderer.prototype.table.call(this, token)}</div>\n`
    },
  },
})
