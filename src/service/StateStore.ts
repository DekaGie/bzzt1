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
}

export default StateStore
