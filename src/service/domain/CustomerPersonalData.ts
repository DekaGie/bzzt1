import { Optional } from 'typescript-optional'
import IdentificationDbo from '../../db/dbo/IdentificationDbo'
import ImageUrl from './ImageUrl'

class CustomerPersonalData {
  private readonly dbo: IdentificationDbo;

  constructor (dbo: IdentificationDbo) {
    this.dbo = dbo
  }

  pictureUrl (): Optional<ImageUrl> {
    return Optional.ofNullable(this.dbo.pictureUrl)
      .map((url) => new ImageUrl(url))
  }

  fullName (): string {
    return `${this.dbo.firstName} ${this.dbo.lastName}`
  }
}

export default CustomerPersonalData
