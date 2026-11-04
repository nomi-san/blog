let drawing: Promise<void> = Promise.resolve()

// One at a time, since the theme is part of mermaid's global config.
export function drawDiagrams(dark: boolean, signal: AbortSignal) {
  drawing = drawing.then(() => draw(dark, signal)).catch((error) => console.error(error))
}

async function draw(dark: boolean, signal: AbortSignal) {
  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid'))
  if (signal.aborted || !diagrams.length) {
    return
  }

  // Mermaid replaces its source with the svg, so keep it to draw with another theme.
  const sources = diagrams.map((diagram) => (diagram.dataset.source ??= diagram.innerHTML))

  // Mermaid's default font lacks Vietnamese letters, so use the article's font.
  const fontFamily = getComputedStyle(diagrams[0]).fontFamily
  // Boxes are sized from the measured text, so the font has to load first.
  const fontLoaded = document.fonts.load(`1em ${fontFamily}`, sources.join('')).catch(() => {})

  const { default: mermaid } = await import('mermaid')
  // Right after the import, or mermaid starts by itself on window load.
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'default',
    fontFamily,
  })
  await fontLoaded

  if (signal.aborted) {
    return
  }

  // Drawn next to the current diagrams and swapped in together, so that a new
  // theme doesn't move the page or leave some of them in the old one.
  const copies = diagrams.map((diagram, i) => {
    const copy = diagram.cloneNode() as HTMLElement
    copy.removeAttribute('data-processed')
    copy.classList.add('drawing')
    copy.innerHTML = sources[i]
    diagram.after(copy)
    return copy
  })
  await mermaid.run({ nodes: copies, suppressErrors: true })

  copies.forEach((copy, i) => {
    if (signal.aborted) {
      copy.remove()
    } else {
      copy.classList.remove('drawing')
      diagrams[i].replaceWith(copy)
    }
  })
}
