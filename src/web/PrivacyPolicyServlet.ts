import HttpServlet from '../http/HttpServlet'
import HttpResponse from '../http/HttpResponse'

class PrivacyPolicyServlet implements HttpServlet {
  handle (): Promise<HttpResponse> {
    return Promise.resolve(
      {
        code: 200,
        body: 'Aplikacja Beauty Zazero nie przetwarza żadnych danych osobowych użytkowników.'
      }
    )
  }
}

export default PrivacyPolicyServlet
