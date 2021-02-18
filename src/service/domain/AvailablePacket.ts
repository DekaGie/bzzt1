import PacketDbo from '../../db/dbo/PacketDbo'
import ImageUrl from './ImageUrl'

class AvailablePacket {
  private readonly dbo: PacketDbo;

  constructor (dbo: PacketDbo) {
    this.dbo = dbo
  }

  displayName (): string {
    return this.dbo.displayName
  }

  picture (): ImageUrl {
    return new ImageUrl(this.dbo.pictureUrl)
  }

  availableTreatmentNames (): Array<string> {
    return this.dbo.treatments.map((treatment) => treatment.displayName)
  }
}

export default AvailablePacket
