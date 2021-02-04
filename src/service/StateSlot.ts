import { Optional } from 'typescript-optional'

class StateSlot<T> {
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
}

export default StateSlot
