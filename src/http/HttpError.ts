class HttpError extends Error {
  readonly code: number;

  readonly detail: string;

  readonly cause?: any

  constructor (code: number, detail: string, cause?: any) {
    super(`HTTP ${code}: ${detail}`)
    this.code = code
    this.detail = detail
    this.cause = cause
  }
}

export default HttpError
