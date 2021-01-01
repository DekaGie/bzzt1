import { Collections, ImmutableList } from 'typescriptcollectionsframework'
import HttpServlet from './HttpServlet'
import HttpFilter from './HttpFilter'
import HttpResponse from './HttpResponse'
import HttpRequest from './HttpRequest'

class FilteredServlet implements HttpServlet {
  private readonly filter: HttpFilter;

  private readonly servlet: HttpServlet;

  constructor (filter: HttpFilter, servlet: HttpServlet) {
    this.filter = filter
    this.servlet = servlet
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    return this.filter.handle(request, this.servlet)
  }

  static chain (filters: ImmutableList<HttpFilter>, servlet: HttpServlet): HttpServlet {
    return Collections.asArray(filters).reduceRight<HttpServlet>(
      (chained, filter) => new FilteredServlet(filter, chained), servlet
    )
  }
}

export default FilteredServlet
