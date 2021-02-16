import CardNumber from '../domain/CardNumber'
import IdentificationRepository from '../../db/repo/IdentificationRepository'
import ImageUrl from '../domain/ImageUrl'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'

class CardUpdater {
  private static readonly LOG: Logger = Loggers.get(CardUpdater.name)

  private readonly identificationRepository: IdentificationRepository;

  constructor (identificationRepository: IdentificationRepository) {
    this.identificationRepository = identificationRepository
  }

  updateHolderPicture (cardNumber: CardNumber, pictureUrl: ImageUrl): void {
    this.identificationRepository.updatePictureUrlByCardNumber(
      cardNumber.asNumber(), pictureUrl.asString()
    ).then(
      (result) => {
        if (!result) {
          CardUpdater.LOG.warn(`could not update ${cardNumber} picture ${pictureUrl}`)
        }
      },
      (error) => {
        CardUpdater.LOG.error(`while updating ${cardNumber} picture ${pictureUrl}`, error)
      }
    )
  }
}

export default CardUpdater
