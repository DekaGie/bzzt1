import SalonDbo from '../../db/dbo/SalonDbo'
import ImageUrl from './ImageUrl'

class AvailableSalon {
  private readonly dbo: SalonDbo;

  constructor (dbo: SalonDbo) {
    this.dbo = dbo
  }

  displayName (): string {
    return this.dbo.displayName
  }

  picture (): ImageUrl {
    return new ImageUrl(this.dbo.pictureUrl)
  }

  bookingLink () : string {
    return this.dbo.bookingUrl
  }

  contactLink () : string {
    return this.dbo.contactUrl
  }

  availablePacketNames () : Array<string> {
    return [
      ...new Set(
        this.dbo.salonTreatments.map(
          (salonTreatment) => salonTreatment.treatment.packet.displayName
        )
      )
    ]
  }
}

export default AvailableSalon
