class ApiSafeError extends Error {
  readonly id: string;

  readonly label: string;

  readonly cause?: any

  constructor (id: string, label: string, cause?: any) {
    super(`${id}: ${label}`)
    this.id = id
    this.label = label
    this.cause = cause
  }
}

export default ApiSafeError
