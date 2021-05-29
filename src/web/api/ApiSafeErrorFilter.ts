import HttpFilter from '../../http/HttpFilter'
import Loggers from '../../log/Loggers'
import Logger from '../../log/Logger'
import HttpRequest from '../../http/HttpRequest'
import HttpServlet from '../../http/HttpServlet'
import HttpResponse from '../../http/HttpResponse'
import Promises from '../../util/Promises'
import ApiSafeError from './ApiSafeError'
import HttpError from '../../http/HttpError'

class ApiSafeErrorFilter implements HttpFilter {
  private static readonly LOG: Logger = Loggers.get(ApiSafeErrorFilter.name)

  handle (request: HttpRequest, servlet: HttpServlet): Promise<HttpResponse> {
    return Promises.safely(() => servlet.handle(request))
      .catch(ApiSafeErrorFilter.renderErrorResponse)
  }

  private static renderErrorResponse (error: any): HttpResponse {
    const apiSafeError: ApiSafeError = error instanceof ApiSafeError ? error : ApiSafeErrorFilter.toApiSafeError(error)
    ApiSafeErrorFilter.LOG.warn('API error', error)
    return {
      code: 200,
      body: {
        problem: {
          id: apiSafeError.id,
          label: apiSafeError.label
        }
      }
    }
  }

  private static toApiSafeError (error: any): ApiSafeError {
    if (error instanceof HttpError) {
      return new ApiSafeError(`rest-framework-error-${error.code}`, `Framework REST zwrócił błąd: ${error.detail}`)
    }
    return new ApiSafeError('unexpected_error', 'Wystąpił nieznany błąd. Spróbuj ponownie później.', error)
  }
}

export default ApiSafeErrorFilter
