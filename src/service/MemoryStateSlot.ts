import { Optional } from 'typescript-optional'
import StateSlot from './StateSlot'
import Converter from '../util/Converter'
import ConvertedStateSlot from './ConvertedStateSlot'

class MemoryStateSlot<T> implements StateSlot<T> {
  private value: Optional<T>;

  constructor () {
    this.value = Optional.empty()
  }

  set (value: T): void {
    this.value = Optional.of(value)
  }

  clear (): void {
    this.value = Optional.empty()
  }

  get (): Optional<T> {
    return this.value
  }

  convert<R> (converter: Converter<T, R>): StateSlot<R> {
    return new ConvertedStateSlot(this, converter)
  }
}

export default MemoryStateSlot
