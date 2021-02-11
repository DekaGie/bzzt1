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
import CardContextInquiry from './CardContextInquiry'
import StateStore from './StateStore'
import CustomerId from './domain/CustomerId'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'
import Promises from '../util/Promises'

class SalonCustomerAssistant implements CustomerAssistant<SalonRegistrationDbo> {
  private static readonly SHOULD_SEND_PICTURE_FOR_CARD: StateCategoryId =
    new StateCategoryId(SalonCustomerAssistant.name, 'SHOULD_SEND_PICTURE_FOR_CARD');

  private readonly barcodeParser: BarcodeParser;

  private readonly cardRepository: CardRepository;

  private readonly stateStore: StateStore;

  constructor (
    barcodeParser: BarcodeParser,
    cardRepository: CardRepository,
    stateStore: StateStore
  ) {
    this.barcodeParser = barcodeParser
    this.cardRepository = cardRepository
    this.stateStore = stateStore
  }

  handle (customer: SalonRegistrationDbo, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const pictureForCardNumber: Optional<number> = this.pictureAwaitingCardNumber(customer).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handleFailedPictureFor(customer)
        }
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (!cardNumber.isPresent()) {
          return Results.many(Reactions.plainText(StaticTexts.salonOnlyChecksCards()))
        }
        return this.handleCardNumber(customer, cardNumber.get())
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        const pictureForCardNumber: Optional<number> = this.pictureAwaitingCardNumber(customer).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handlePictureFor(customer, pictureForCardNumber.get(), imageInquiry.imageUrl)
        }
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return Results.many(Reactions.plainText(StaticTexts.poorBarcodeImage()))
            }
            return this.handleCardNumber(customer, cardNumber.get())
          }
        )
      }
      case 'PICTURE_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForPicture(customer, cardInquiry.cardNumber)
      }
      case 'PICTURE_NOT_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForIdVerification(cardInquiry.cardNumber)
      }
      case 'ID_VERIFICATION_SUCCESS': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerified(customer, cardInquiry.cardNumber)
      }
      case 'ID_VERIFICATION_FAILURE': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerificationFailure(customer, cardInquiry.cardNumber)
      }
      default: {
        return Results.many()
      }
    }
  }

  private handleCardNumber (customer: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (card) => {
          if (!card.isPresent()) {
            return Results.many(Reactions.plainText(StaticTexts.salonInvalidCardNumber(cardNumber)))
          }
          return this.handleCard(customer, card.get())
        }
      )
  }

  private handleCard (customer: SalonRegistrationDbo, card: CardDbo): Promise<Array<Reaction>> {
    const validUntil: Instant = new Instant(card.agreement.validUntilEs)
    if (Instant.now().isAtOrAfter(validUntil)) {
      return Results.many(Reactions.plainText(StaticTexts.salonOutdatedCard(card.cardNumber)))
    }
    const registration: Optional<CardRegistrationDbo> = Optional.ofNullable(card.registration)
    if (!registration.isPresent()) {
      return Results.many(Reactions.plainText(StaticTexts.notYetActivatedCard(card.cardNumber)))
    }
    const identification: Optional<IdentificationDbo> = Optional.ofNullable(registration.get().identification)
    if (!identification.isPresent()) {
      return this.handleVerified(customer, card.cardNumber)
    }
    const fullName: string = `${identification.get().firstName} ${identification.get().lastName}`
    const pictureUrl: Optional<ImageUrl> = Optional.ofNullable(identification.get().pictureUrl)
      .map((url) => new ImageUrl(url))
    if (!pictureUrl.isPresent()) {
      return this.handleNoPicture(card.cardNumber, fullName)
    }
    return Results.many(
      Reactions.choice(
        {
          topImage: pictureUrl,
          title: fullName,
          subtitle: Optional.of(StaticTexts.pictureVerificationQuestion()),
          choices: [
            Choices.inquiry(
              StaticTexts.yes(),
              { type: 'ID_VERIFICATION_SUCCESS', cardNumber: card.cardNumber }
            ),
            Choices.inquiry(
              StaticTexts.no(),
              { type: 'ID_VERIFICATION_FAILURE', cardNumber: card.cardNumber }
            )
          ]
        }
      )
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

  private promptForPicture (customer: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(customer).set(cardNumber)
    return Results.many(Reactions.plainText(StaticTexts.takePicturePrompt()))
  }

  private handlePictureFor (
    customer: SalonRegistrationDbo, cardNumber: number, pictureUrl: ImageUrl
  ): Promise<Array<Reaction>> {
    // TODO: mail
    console.log(`Received picture for ${cardNumber}: ${pictureUrl.asString()}`)
    this.pictureAwaitingCardNumber(customer).clear()
    return Promises.flatAll(
      Results.many(Reactions.plainText(StaticTexts.thanksForCustomerPicture())),
      this.promptForIdVerification(cardNumber)
    )
  }

  private handleFailedPictureFor (customer: SalonRegistrationDbo): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(customer).clear()
    return Results.many(Reactions.plainText(StaticTexts.customerPictureUpdateAborted()))
  }

  private promptForIdVerification (cardNumber: number): Promise<Array<Reaction>> {
    return Results.many(
      this.cardRepository.findFull(cardNumber).then(
        (card) => {
          const { identification } = card.registration
          const fullName: string = `${identification.firstName} ${identification.lastName}`
          return Reactions.choice(
            {
              topImage: Optional.empty(),
              title: StaticTexts.idVerificationPrompt(),
              subtitle: Optional.of(StaticTexts.idVerificationQuestion(fullName)),
              choices: [
                Choices.inquiry(
                  StaticTexts.yes(),
                  { type: 'ID_VERIFICATION_SUCCESS', cardNumber }
                ),
                Choices.inquiry(
                  StaticTexts.no(),
                  { type: 'ID_VERIFICATION_FAILURE' }
                )
              ]
            }
          )
        }
      )
    )
  }

  private pictureAwaitingCardNumber (customer: SalonRegistrationDbo): StateSlot<number> {
    return this.stateStore.slot(
      new CustomerId(customer.customerId),
      SalonCustomerAssistant.SHOULD_SEND_PICTURE_FOR_CARD
    )
  }

  private handleVerified (customer: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    // TODO: uslugi
    console.log(`Salon ${customer.salon.salonName} akceptuje ${cardNumber}`)
    return Results.many(Reactions.plainText(StaticTexts.acceptCard()))
  }

  private handleVerificationFailure (customer: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    // TODO: mail
    console.log(`Salon ${customer.salon.salonName} nie akceptuje ${cardNumber}`)
    return Results.many(Reactions.plainText(StaticTexts.rejectCard()))
  }
}

export default SalonCustomerAssistant
