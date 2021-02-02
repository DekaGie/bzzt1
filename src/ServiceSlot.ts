class ServiceSlot<T> {
  private instance: T | null

  constructor () {
    this.instance = null
  }

  provide (instance: T): void {
    if (this.instance != null) {
      throw new Error('already provided')
    }
    this.instance = instance
  }

  refer (): T {
    if (this.instance == null) {
      throw new Error('not provided yet')
    }
    return this.instance
  }
}

export default ServiceSlot
