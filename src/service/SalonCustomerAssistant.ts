import { Optional } from 'typescript-optional'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import CustomerAssistant from './CustomerAssistant'
import CardRepository from '../db/repo/CardRepository'
import Instant from './domain/Instant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import IdentificationDbo from '../db/dbo/IdentificationDbo'
import SalonRegistrationDbo from '../db/dbo/SalonRegistrationDbo'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import FreeTextInquiry from './spi/FreeTextInquiry'
import Reactions from './spi/Reactions'
import StaticTexts from './StaticTexts'
import ImageInquiry from './spi/ImageInquiry'
import CardDbo from '../db/dbo/CardDbo'
import Choices from './spi/Choices'
import TextExtractions from './TextExtractions'
import Results from './Results'

class SalonCustomerAssistant implements CustomerAssistant<SalonRegistrationDbo> {
  private readonly barcodeParser: BarcodeParser;

  private readonly cardRepository: CardRepository;

  constructor (
    barcodeParser: BarcodeParser,
    cardRepository: CardRepository
  ) {
    this.barcodeParser = barcodeParser
    this.cardRepository = cardRepository
  }

  handle (customer: SalonRegistrationDbo, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (!cardNumber.isPresent()) {
          return Promise.resolve([Reactions.plainText(StaticTexts.salonOnlyChecksCards())])
        }
        return this.handleCardNumber(cardNumber.get())
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return Promise.resolve([Reactions.plainText(StaticTexts.poorBarcodeImage())])
            }
            return this.handleCardNumber(cardNumber.get())
          }
        )
      }
      case 'PICTURE_CONSENTED':
      case 'PICTURE_NOT_CONSENTED':
      default:
        return Promise.resolve([])
    }
  }

  private handleCardNumber (cardNumber: number): Promise<Array<Reaction>> {
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (card) => {
          if (!card.isPresent()) {
            return Promise.resolve([Reactions.plainText(StaticTexts.salonInvalidCardNumber(cardNumber))])
          }
          return this.handleCard(card.get())
        }
      )
  }

  private handleCard (card: CardDbo): Promise<Array<Reaction>> {
    const validUntil: Instant = new Instant(card.agreement.validUntilEs)
    if (Instant.now().isAtOrAfter(validUntil)) {
      return Promise.resolve([Reactions.plainText(StaticTexts.salonOutdatedCard(card.cardNumber))])
    }
    const registration: Optional<CardRegistrationDbo> = Optional.ofNullable(card.registration)
    if (!registration.isPresent()) {
      return Promise.resolve([Reactions.plainText(StaticTexts.notYetActivatedCard(card.cardNumber))])
    }
    const identification: Optional<IdentificationDbo> = Optional.ofNullable(registration.get().identification)
    // TODO: uslugi
    // eslint-disable-next-line max-len
    const act: string = 'akceptuj kartę na usługi: regulacja brwi, henna brwi, laminacja brwi, depilacja wąsika, laminacja rzęs, henna rzęs, przedłużanie rzęs 1:1. Zapisz w versum, że użyta była karta Beauty ZAZERO.'
    if (!identification.isPresent()) {
      return Promise.resolve([Reactions.plainText(`Śmiało ${act}`)])
    }
    const fullName: string = `${identification.get().firstName} ${identification.get().lastName}`
    const pictureUrl: Optional<ImageUrl> = Optional.ofNullable(identification.get().pictureUrl)
      .map((url) => new ImageUrl(url))
    if (!pictureUrl.isPresent()) {
      return this.handleNoPicture(card.cardNumber, fullName)
    }
    return Results.many<Reaction>(
      Reactions.image(pictureUrl.get(), fullName),
      Reactions.plainText(`Zweryfikuj tożsamość zdjęciem lub dowodem osobistym i ${act}`)
    )
  }

  private handleNoPicture (cardNumber: number, fullName: string): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.empty(),
          title: fullName,
          subtitle: Optional.of(StaticTexts.missingPictureQuestion()),
          choices: [
            Choices.inquiry(
              StaticTexts.pictureConsented(true),
              { type: 'PICTURE_CONSENTED', cardNumber }
            ),
            Choices.inquiry(
              StaticTexts.pictureConsented(false),
              { type: 'PICTURE_NOT_CONSENTED', cardNumber }
            )
          ]
        }
      )
    )
  }
}

export default SalonCustomerAssistant
