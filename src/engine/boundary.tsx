import { Component, ErrorBoundary, ParentComponent } from 'solid-js'

// Errors caught during prerender. The server entry rethrows them, so a broken
// page fails the build instead of being published with the fallback in place.
export const renderErrors = Array<unknown>()

export const PageBoundary: ParentComponent<{ fallback: Component }> = (props) => {
  return (
    <ErrorBoundary
      fallback={(error) => {
        if (import.meta.env.SSR) {
          renderErrors.push(error)
        } else {
          console.error(error)
        }
        return <props.fallback />
      }}
    >
      {props.children}
    </ErrorBoundary>
  )
}
