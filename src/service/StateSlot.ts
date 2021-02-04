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

  get (): T {
    return this.value.orElseThrow(() => new Error('not set'))
  }

  defaultTo (value: T): void {
    if (!this.value.isPresent()) {
      this.value = Optional.of(value)
    }
  }
}

export default StateSlot
