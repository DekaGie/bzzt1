import UrlQuery from './UrlQuery'
import RequestBody from './RequestBody'
import UrlPath from './UrlPath'

interface HttpRequest {

  path: UrlPath,

  query: UrlQuery,

  body?: RequestBody
}

export default HttpRequest
