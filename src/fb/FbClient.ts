import FbMessenger from './FbMessenger'

class FbClient {
  private readonly accessToken: string;

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  messenger (userId: string): FbMessenger {
    return new FbMessenger(this.accessToken, userId)
  }
}

export default FbClient
