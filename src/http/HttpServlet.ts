import HttpResponse from './HttpResponse'
import HttpRequest from './HttpRequest'

interface HttpServlet {

  handle(request: HttpRequest): Promise<HttpResponse>
}

export default HttpServlet
