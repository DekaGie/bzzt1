import { Optional } from 'typescript-optional'
import FbClient from './impl/FbClient'
import FbProfile from './FbProfile'

class FbProfileFetcher {
  private readonly fbClient: FbClient;

  constructor (fbClient: FbClient) {
    this.fbClient = fbClient
  }

  fetch (psid: string): Promise<Optional<FbProfile>> {
    return this.fbClient.getProfile(psid)
      .then(
        (profile) => Optional.of(profile),
        (error) => {
          console.error(`while fetching profile of ${psid}`)
          console.error(error)
          return Optional.empty()
        }
      )
  }
}

export default FbProfileFetcher
