import HttpRequest from '../http/HttpRequest'
import HttpServlet from '../http/HttpServlet'
import Promises from '../util/Promises'
import HttpResponse from '../http/HttpResponse'
import HttpFilter from '../http/HttpFilter'
import HttpError from '../http/HttpError'
import Logger from '../log/Logger'
import Loggers from '../log/Loggers'

class ErrorFilter implements HttpFilter {
  private static readonly LOG: Logger = Loggers.get(ErrorFilter.name)

  handle (request: HttpRequest, servlet: HttpServlet): Promise<HttpResponse> {
    return Promises.safely(() => servlet.handle(request))
      .catch(ErrorFilter.renderErrorResponse)
  }

  private static renderErrorResponse (error: any): HttpResponse {
    const httpError: HttpError = error instanceof HttpError ? error : ErrorFilter.toHttpError(error)
    ErrorFilter.LOG.warn('returning error', httpError)
    return {
      code: httpError.code,
      body: httpError.detail
    }
  }

  private static toHttpError (error: any): HttpError {
    return new HttpError(500, 'unexpected error occurred', error)
  }
}

export default ErrorFilter
