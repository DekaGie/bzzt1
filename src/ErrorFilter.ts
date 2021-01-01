import HttpFilter from './http/HttpFilter'
import HttpRequest from './http/HttpRequest'
import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'
import Promises from './util/Promises'
import HttpError from './http/HttpError'

class ErrorFilter implements HttpFilter {
  handle (request: HttpRequest, servlet: HttpServlet): Promise<HttpResponse> {
    return Promises.safely(() => servlet.handle(request))
      .catch(ErrorFilter.renderErrorResponse)
  }

  private static renderErrorResponse (error: any): HttpResponse {
    const httpError: HttpError = error instanceof HttpError ? error : ErrorFilter.toHttpError(error)
    console.info('returning:', httpError)
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
