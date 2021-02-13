import { Optional } from 'typescript-optional'
import StateSlot from './StateSlot'
import Converter from '../util/Converter'

class ConvertedStateSlot<T, F> implements StateSlot<T> {
  private readonly underlying: StateSlot<F>

  private readonly converter: Converter<F, T>

  constructor (underlying: StateSlot<F>, converter: Converter<F, T>) {
    this.underlying = underlying
    this.converter = converter
  }

  set (value: T): void {
    this.underlying.set(this.converter.backward(value))
  }

  clear (): void {
    this.underlying.clear()
  }

  get (): Optional<T> {
    return this.underlying.get().map((from) => this.converter.forward(from))
  }

  convert<R> (converter: Converter<T, R>): StateSlot<R> {
    return new ConvertedStateSlot(this, converter)
  }
}

export default ConvertedStateSlot
