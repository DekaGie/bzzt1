import HttpResponse from './HttpResponse'
import HttpRequest from './HttpRequest'
import HttpServlet from './HttpServlet'

interface HttpFilter {

  handle(request: HttpRequest, servlet: HttpServlet): Promise<HttpResponse>
}

export default HttpFilter
