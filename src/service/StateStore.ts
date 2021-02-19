import { Optional } from 'typescript-optional'
import StateSlot from './StateSlot'
import ActorId from './domain/ActorId'
import StateCategoryId from './domain/StateCategoryId'
import MemoryStateSlot from './MemoryStateSlot'

class StateStore {
  private static readonly SEPARATOR: string = '|';

  private readonly memory: Map<string, StateSlot<string>>;

  constructor () {
    this.memory = new Map()
  }

  slot (actorId: ActorId, categoryId: StateCategoryId): StateSlot<string> {
    const key: string = actorId.toRepresentation()
        + StateStore.SEPARATOR + categoryId.toRepresentation()
    return Optional.ofNullable(this.memory.get(key)).orElseGet(
      () => {
        const newSlot: StateSlot<string> = new MemoryStateSlot()
        this.memory.set(key, newSlot)
        return newSlot
      }
    )
  }

  allOf (actorId: ActorId): Map<StateCategoryId, string> {
    const result: Map<StateCategoryId, string> = new Map()
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
