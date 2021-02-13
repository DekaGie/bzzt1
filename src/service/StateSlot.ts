import { Optional } from 'typescript-optional'
import Converter from '../util/Converter'

interface StateSlot<T> {

  set (value: T): void;

  clear (): void;

  get (): Optional<T>;

  convert<R> (converter: Converter<T, R>): StateSlot<R>
}

export default StateSlot
