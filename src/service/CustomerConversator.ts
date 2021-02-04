import CustomerId from './domain/CustomerId'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'
import StateStore from './StateStore'
import InteractionCallback from './spi/InteractionCallback'

class CustomerConversator {
  private readonly customerId: CustomerId;

  private readonly stateStore: StateStore;

  private readonly interaction: InteractionCallback;

  constructor (
    customerId: CustomerId,
    stateStore: StateStore,
    interaction: InteractionCallback
  ) {
    this.customerId = customerId
    this.stateStore = stateStore
    this.interaction = interaction
  }

  id (): CustomerId {
    return this.customerId
  }

  state <T> (categoryId: StateCategoryId): StateSlot<T> {
    return this.stateStore.get(this.customerId, categoryId)
  }

  callback (): InteractionCallback {
    return this.interaction
  }

  toString (): string {
    return `${this.customerId.toRepresentation()} - ${JSON.stringify([...this.stateStore.allOf(this.customerId)])}`
  }

  clearState (): void {
    this.stateStore.allOf(this.customerId).forEach(
      (value, categoryId) => this.stateStore.get(this.customerId, categoryId).clear()
    )
  }
}

export default CustomerConversator
