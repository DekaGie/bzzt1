import {
  ArrayList,
  Collections,
  ImmutableList,
  List
} from 'typescriptcollectionsframework'
import { RequestHandler } from 'express'
import HttpFilter from './HttpFilter'
import ExpressServletAdapter from './ExpressServletAdapter'
import HttpServlet from './HttpServlet'
import FilteredServlet from './FilteredServlet'

class ExpressEndpointFactory {
  private readonly filters: ImmutableList<HttpFilter>

  constructor (filters: ImmutableList<HttpFilter> = Collections.emptyList()) {
    this.filters = filters
  }

  filter (filter: HttpFilter): ExpressEndpointFactory {
    const appended: List<HttpFilter> = new ArrayList()
    appended.addAll(this.filters)
    appended.add(filter)
    return new ExpressEndpointFactory(appended)
  }

  servlet (servlet: HttpServlet): RequestHandler {
    const adapter: ExpressServletAdapter = new ExpressServletAdapter(
      FilteredServlet.chain(this.filters, servlet)
    )
    return adapter.handle.bind(adapter)
  }
}

export default ExpressEndpointFactory
