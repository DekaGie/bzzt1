import { Connection } from 'typeorm'
import HttpServlet from '../../http/HttpServlet'
import HttpRequest from '../../http/HttpRequest'
import HttpResponse from '../../http/HttpResponse'
import FbClient from '../../fb/impl/FbClient'
import JsonElement from '../../json/JsonElement'
import ApiSafeError from './ApiSafeError'
import SalonSessionTokenManager from './SalonSessionTokenManager'
import SalonSessionToken from './SalonSessionToken'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'
import SalonResolver from '../../service/api/SalonResolver'
import SalonRepository from '../../db/repo/SalonRepository'
import SalonWorkerRepository from '../../db/repo/SalonWorkerRepository'

class SalonAuthenticationServlet implements HttpServlet {
  private static readonly LOG: Logger = Loggers.get(SalonAuthenticationServlet.name)

  private readonly fbClient: FbClient;

  private readonly salonResolver: SalonResolver;

  private readonly manager: SalonSessionTokenManager;

  constructor (fbClient: FbClient, db: Connection) {
    this.fbClient = fbClient
    this.salonResolver = new SalonResolver(
      db.getCustomRepository(SalonRepository),
      db.getCustomRepository(SalonWorkerRepository)
    )
    this.manager = new SalonSessionTokenManager()
  }

  handle (request: HttpRequest): Promise<HttpResponse> {
    const fbAccessToken: string = request.body.asJson()
      .asObject()
      .mandatory('facebookAccessToken')
      .asString()
    return this.fbClient.identify(fbAccessToken)
      .then(
        (response) => new JsonElement('$', response).asObject()
          .optional('email')
          .orElseThrow(
            () => new ApiSafeError(
              'unconfigured_email',
              'Konto FB musi mieć skonfigurowany publiczny adres e-mail.',
              response
            )
          )
          .asString()
      )
      .catch(
        (error) => {
          throw new ApiSafeError(
            'fb_error', 'Nie udało się zalogować przez FB, spróbuj później.', error
          )
        }
      )
      .then(
        (email) => this.sessionTokenFor(email)
      )
      .then(
        (token) => ({
          code: 200,
          body: {
            sessionToken: token.token,
            validUntilEs: token.validUntil.asEs()
          }
        })
      )
  }

  private sessionTokenFor (email: string): Promise<SalonSessionToken> {
    return this.salonResolver.findNameByEmail(email)
      .then(
        (salonName) => salonName.orElseThrow(
          () => new ApiSafeError(
            'not_salon', 'To konto FB nie jest powiązane z salonem.'
          )
        )
      )
      .then((salonName) => this.manager.issueFor(salonName))
  }
}

export default SalonAuthenticationServlet
