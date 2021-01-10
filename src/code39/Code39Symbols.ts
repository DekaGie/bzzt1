import { HashMap, ImmutableMap, JMap } from 'typescriptcollectionsframework'
import Code39Symbol from './Code39Symbol'

class Code39Symbols {
  static DELIMITER: Code39Symbol = Code39Symbol.valid(false, true, false, false, true, false, true, false, false)

  static DIGITS: ImmutableMap<Code39Symbol, number> = (() => {
    const map: JMap<Code39Symbol, number> = new HashMap(Code39Symbol.HASHABLE)
    map.put(Code39Symbol.valid(false, false, false, true, true, false, true, false, false), 0)
    map.put(Code39Symbol.valid(true, false, false, true, false, false, false, false, true), 1)
    map.put(Code39Symbol.valid(false, false, true, true, false, false, false, false, true), 2)
    map.put(Code39Symbol.valid(true, false, true, true, false, false, false, false, false), 3)
    map.put(Code39Symbol.valid(false, false, false, true, true, false, false, false, true), 4)
    map.put(Code39Symbol.valid(true, false, false, true, true, false, false, false, false), 5)
    map.put(Code39Symbol.valid(false, false, true, true, true, false, false, false, false), 6)
    map.put(Code39Symbol.valid(false, false, false, true, false, false, true, false, true), 7)
    map.put(Code39Symbol.valid(true, false, false, true, false, false, true, false, false), 8)
    map.put(Code39Symbol.valid(false, false, true, true, false, false, true, false, false), 9)
    return map
  })()
}

export default Code39Symbols
