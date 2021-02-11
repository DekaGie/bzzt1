import { Optional } from 'typescript-optional'
import StateSlot from './StateSlot'
import ActorId from './domain/ActorId'
import StateCategoryId from './domain/StateCategoryId'

class StateStore {
  private static readonly SEPARATOR: string = '|';

  private readonly memory: Map<string, StateSlot<any>>;

  constructor () {
    this.memory = new Map()
  }

  slot<T> (actorId: ActorId, categoryId: StateCategoryId): StateSlot<T> {
    const key: string = actorId.toRepresentation()
        + StateStore.SEPARATOR + categoryId.toRepresentation()
    return Optional.ofNullable(this.memory.get(key)).orElseGet(
      () => {
        const newSlot: StateSlot<T> = new StateSlot()
        this.memory.set(key, newSlot)
        return newSlot
      }
    )
  }

  allOf (actorId: ActorId): Map<StateCategoryId, any> {
    const result: Map<StateCategoryId, any> = new Map()
    const prefix: string = actorId.toRepresentation() + StateStore.SEPARATOR
    this.memory.forEach(
      (value, key) => {
        if (key.startsWith(prefix) && value.get().isPresent()) {
          result.set(new StateCategoryId(key.substring(prefix.length)), value.get().get())
        }
      }
    )
    return result
  }
}

export default StateStore
