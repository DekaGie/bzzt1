import FbMessenger from './FbMessenger'

class FbClient {
  private readonly accessToken: string;

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  messenger (psid: string): FbMessenger {
    return new FbMessenger(this.accessToken, psid)
  }
}

export default FbClient
