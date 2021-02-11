import { Optional } from 'typescript-optional'
import ImageUrl from './domain/ImageUrl'
import BarcodeParser from './BarcodeParser'
import ActorAssistant from './ActorAssistant'
import CardRepository from '../db/repo/CardRepository'
import Instant from './domain/Instant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import IdentificationDbo from '../db/dbo/IdentificationDbo'
import SalonRegistrationDbo from '../db/dbo/SalonRegistrationDbo'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import FreeTextInquiry from './spi/FreeTextInquiry'
import Reactions from './spi/Reactions'
import ImageInquiry from './spi/ImageInquiry'
import CardDbo from '../db/dbo/CardDbo'
import Choices from './spi/Choices'
import TextExtractions from './TextExtractions'
import Results from './Results'
import CardContextInquiry from './CardContextInquiry'
import StateStore from './StateStore'
import ActorId from './domain/ActorId'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'
import Promises from '../util/Promises'
import GpTexts from './text/GpTexts'
import SalonTexts from './text/SalonTexts'

class SalonAssistant implements ActorAssistant<SalonRegistrationDbo> {
  private static readonly SHOULD_SEND_PICTURE_FOR_CARD: StateCategoryId =
    new StateCategoryId(SalonAssistant.name, 'SHOULD_SEND_PICTURE_FOR_CARD');

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

  handle (salon: SalonRegistrationDbo, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const pictureForCardNumber: Optional<number> = this.pictureAwaitingCardNumber(salon).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handleFailedPictureFor(salon)
        }
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (!cardNumber.isPresent()) {
          return Results.many(Reactions.plainText(SalonTexts.onlyCardChecking()))
        }
        return this.handleCardNumber(salon, cardNumber.get())
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        const pictureForCardNumber: Optional<number> = this.pictureAwaitingCardNumber(salon).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handlePictureFor(salon, pictureForCardNumber.get(), imageInquiry.imageUrl)
        }
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return Results.many(Reactions.plainText(GpTexts.poorBarcodeImage()))
            }
            return this.handleCardNumber(salon, cardNumber.get())
          }
        )
      }
      case 'PICTURE_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForPicture(salon, cardInquiry.cardNumber)
      }
      case 'PICTURE_NOT_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForIdVerification(cardInquiry.cardNumber)
      }
      case 'ID_VERIFICATION_SUCCESS': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerified(salon, cardInquiry.cardNumber)
      }
      case 'ID_VERIFICATION_FAILURE': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerificationFailure(salon, cardInquiry.cardNumber)
      }
      default: {
        return Results.many()
      }
    }
  }

  private handleCardNumber (salon: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardRepository.findFull(cardNumber)
      .then(Optional.ofNullable)
      .then(
        (card) => {
          if (!card.isPresent()) {
            return Results.many(Reactions.plainText(SalonTexts.invalidCardNumber(cardNumber)))
          }
          return this.handleCard(salon, card.get())
        }
      )
  }

  private handleCard (salon: SalonRegistrationDbo, card: CardDbo): Promise<Array<Reaction>> {
    const validUntil: Instant = new Instant(card.agreement.validUntilEs)
    if (Instant.now().isAtOrAfter(validUntil)) {
      return Results.many(Reactions.plainText(SalonTexts.outdatedCard(card.cardNumber)))
    }
    const registration: Optional<CardRegistrationDbo> = Optional.ofNullable(card.registration)
    if (!registration.isPresent()) {
      return Results.many(Reactions.plainText(SalonTexts.notYetActivatedCard(card.cardNumber)))
    }
    const identification: Optional<IdentificationDbo> = Optional.ofNullable(registration.get().identification)
    if (!identification.isPresent()) {
      return this.handleVerified(salon, card.cardNumber)
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
          subtitle: Optional.of(SalonTexts.pictureVerificationQuestion()),
          choices: [
            Choices.inquiry(
              GpTexts.yes(),
              { type: 'ID_VERIFICATION_SUCCESS', cardNumber: card.cardNumber }
            ),
            Choices.inquiry(
              GpTexts.no(),
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
          subtitle: Optional.of(SalonTexts.missingPictureQuestion()),
          choices: [
            Choices.inquiry(
              SalonTexts.pictureConsented(true),
              { type: 'PICTURE_CONSENTED', cardNumber }
            ),
            Choices.inquiry(
              SalonTexts.pictureConsented(false),
              { type: 'PICTURE_NOT_CONSENTED', cardNumber }
            )
          ]
        }
      )
    )
  }

  private promptForPicture (salon: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(salon).set(cardNumber)
    return Results.many(Reactions.plainText(SalonTexts.takePicturePrompt()))
  }

  private handlePictureFor (
    salon: SalonRegistrationDbo, cardNumber: number, pictureUrl: ImageUrl
  ): Promise<Array<Reaction>> {
    // TODO: mail
    console.log(`Received picture for ${cardNumber}: ${pictureUrl.asString()}`)
    this.pictureAwaitingCardNumber(salon).clear()
    return Promises.flatAll(
      Results.many(Reactions.plainText(SalonTexts.thanksForCustomerPicture())),
      this.promptForIdVerification(cardNumber)
    )
  }

  private handleFailedPictureFor (salon: SalonRegistrationDbo): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(salon).clear()
    return Results.many(Reactions.plainText(SalonTexts.customerPictureUpdateAborted()))
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
              title: SalonTexts.idVerificationPrompt(),
              subtitle: Optional.of(SalonTexts.idVerificationQuestion(fullName)),
              choices: [
                Choices.inquiry(
                  GpTexts.yes(),
                  { type: 'ID_VERIFICATION_SUCCESS', cardNumber }
                ),
                Choices.inquiry(
                  GpTexts.no(),
                  { type: 'ID_VERIFICATION_FAILURE', cardNumber }
                )
              ]
            }
          )
        }
      )
    )
  }

  private pictureAwaitingCardNumber (salon: SalonRegistrationDbo): StateSlot<number> {
    return this.stateStore.slot(
      new ActorId(salon.actorId),
      SalonAssistant.SHOULD_SEND_PICTURE_FOR_CARD
    )
  }

  private handleVerified (salon: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    // TODO: uslugi
    console.log(`Salon ${salon.salon.salonName} akceptuje ${cardNumber}`)
    return Results.many(Reactions.plainText(SalonTexts.acceptCard()))
  }

  private handleVerificationFailure (salon: SalonRegistrationDbo, cardNumber: number): Promise<Array<Reaction>> {
    // TODO: mail
    console.log(`Salon ${salon.salon.salonName} nie akceptuje ${cardNumber}`)
    return Results.many(Reactions.plainText(SalonTexts.rejectCard()))
  }
}

export default SalonAssistant