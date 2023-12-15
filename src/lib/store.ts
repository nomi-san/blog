const kv = await Deno.openKv()

class _Visitors {
  #key = ['visitors']

  async count() {
    const ret = await kv.get<number>(this.#key)
    return ret.value || 0
  }

  async increase() {
    const last = await this.count() + 1
    await kv.set(this.#key, last)
    return last
  }
}

export const Visitors = new _Visitors()
