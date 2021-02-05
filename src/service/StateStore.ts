import { Optional } from 'typescript-optional'
import StateSlot from './StateSlot'
import CustomerId from './domain/CustomerId'
import StateCategoryId from './domain/StateCategoryId'

class StateStore {
  private static readonly SEPARATOR: string = '|';

  private readonly memory: Map<string, StateSlot<any>>;

  constructor () {
    this.memory = new Map()
  }

  get <T> (customerId: CustomerId, categoryId: StateCategoryId): StateSlot<T> {
    const key: string = customerId.toRepresentation()
        + StateStore.SEPARATOR + categoryId.toRepresentation()
    return Optional.ofNullable(this.memory.get(key)).orElseGet(
      () => {
        const newSlot: StateSlot<T> = new StateSlot()
        this.memory.set(key, newSlot)
        return newSlot
      }
    )
  }

  allOf (customerId: CustomerId): Map<StateCategoryId, any> {
    const result: Map<StateCategoryId, any> = new Map()
    const prefix: string = customerId.toRepresentation() + StateStore.SEPARATOR
    this.memory.forEach(
      (value, key) => {
        if (key.startsWith(prefix) && value.isSet()) {
          result.set(new StateCategoryId(key.substring(prefix.length)), value.get())
        }
      }
    )
    return result
  }
}

export default StateStore
