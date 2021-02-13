import { Optional } from 'typescript-optional'
import CardContextInquiry from '../domain/CardContextInquiry'
import BarcodeParser from './BarcodeParser'
import Reactions from '../spi/Reactions'
import ImageInquiry from '../spi/ImageInquiry'
import ActorAssistant from './ActorAssistant'
import StateCategoryId from '../domain/StateCategoryId'
import StateSlot from '../StateSlot'
import Choices from '../spi/Choices'
import GpTexts from '../text/GpTexts'
import FreeTextInquiry from '../spi/FreeTextInquiry'
import TextExtractions from '../util/TextExtractions'
import SalonTexts from '../text/SalonTexts'
import Instant from '../domain/Instant'
import Promises from '../../util/Promises'
import StateStore from '../StateStore'
import ImageUrl from '../domain/ImageUrl'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import Results from '../util/Results'
import SalonActor from '../domain/SalonActor'
import CardChecker from './CardChecker'
import CheckedCard from '../domain/CheckedCard'
import CardHoldingCustomer from '../domain/CardHoldingCustomer'
import CustomerPersonalData from '../domain/CustomerPersonalData'
import CardNumber from '../domain/CardNumber'
import Logger from '../../log/Logger'
import Loggers from '../../log/Loggers'
import Converters from '../../util/Converters'

class SalonAssistant implements ActorAssistant<SalonActor> {
  private static readonly LOG: Logger = Loggers.get(SalonAssistant.name)

  private static readonly SHOULD_SEND_PICTURE_FOR_CARD: StateCategoryId =
    new StateCategoryId(SalonAssistant.name, 'SHOULD_SEND_PICTURE_FOR_CARD');

  private readonly barcodeParser: BarcodeParser;

  private readonly cardChecker: CardChecker;

  private readonly stateStore: StateStore;

  constructor (
    barcodeParser: BarcodeParser,
    cardChecker: CardChecker,
    stateStore: StateStore
  ) {
    this.barcodeParser = barcodeParser
    this.cardChecker = cardChecker
    this.stateStore = stateStore
  }

  handle (actor: SalonActor, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const pictureForCardNumber: Optional<CardNumber> = this.pictureAwaitingCardNumber(actor).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handleFailedPictureFor(actor)
        }
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (!cardNumber.isPresent()) {
          return Results.many(Reactions.plainText(SalonTexts.onlyCardChecking()))
        }
        return this.handleCardNumber(actor, cardNumber.get())
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        const pictureForCardNumber: Optional<CardNumber> = this.pictureAwaitingCardNumber(actor).get()
        if (pictureForCardNumber.isPresent()) {
          return this.handlePictureFor(actor, pictureForCardNumber.get(), imageInquiry.imageUrl)
        }
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return Results.many(Reactions.plainText(GpTexts.poorBarcodeImage()))
            }
            return this.handleCardNumber(actor, cardNumber.get())
          }
        )
      }
      case 'PICTURE_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForPicture(actor, new CardNumber(cardInquiry.cardNumber))
      }
      case 'PICTURE_NOT_CONSENTED': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.promptForIdVerification(new CardNumber(cardInquiry.cardNumber))
      }
      case 'ID_VERIFICATION_SUCCESS': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerified(actor, new CardNumber(cardInquiry.cardNumber))
      }
      case 'ID_VERIFICATION_FAILURE': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.handleVerificationFailure(actor, new CardNumber(cardInquiry.cardNumber))
      }
      default: {
        return Results.many()
      }
    }
  }

  private handleCardNumber (actor: SalonActor, cardNumber: number): Promise<Array<Reaction>> {
    return this.cardChecker.check(cardNumber)
      .then(
        (card) => {
          if (!card.isPresent()) {
            return Results.many(Reactions.plainText(SalonTexts.invalidCardNumber(cardNumber)))
          }
          return this.handleCard(actor, card.get())
        }
      )
  }

  private handleCard (actor: SalonActor, card: CheckedCard): Promise<Array<Reaction>> {
    if (Instant.now().isAtOrAfter(card.validUntil())) {
      return Results.many(Reactions.plainText(SalonTexts.outdatedCard(card.cardNumber())))
    }
    const customer: Optional<CardHoldingCustomer> = card.holder()
    if (!customer.isPresent()) {
      return Results.many(Reactions.plainText(SalonTexts.notYetActivatedCard(card.cardNumber())))
    }
    const personalData: Optional<CustomerPersonalData> = customer.get().personalData()
    if (!personalData.isPresent()) {
      return this.handleVerified(actor, card.cardNumber())
    }
    const pictureUrl: Optional<ImageUrl> = personalData.get().pictureUrl()
    if (!pictureUrl.isPresent()) {
      return this.handleNoPicture(card.cardNumber(), personalData.get().fullName())
    }
    return Results.many(
      Reactions.choice(
        {
          topImage: pictureUrl,
          title: personalData.get().fullName(),
          subtitle: Optional.of(SalonTexts.pictureVerificationQuestion()),
          choices: [
            Choices.inquiry(
              GpTexts.yes(),
              SalonAssistant.cardInquiry(card.cardNumber(), 'ID_VERIFICATION_SUCCESS')
            ),
            Choices.inquiry(
              GpTexts.no(),
              SalonAssistant.cardInquiry(card.cardNumber(), 'ID_VERIFICATION_FAILURE')
            )
          ]
        }
      )
    )
  }

  private handleNoPicture (cardNumber: CardNumber, fullName: string): Promise<Array<Reaction>> {
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.empty(),
          title: fullName,
          subtitle: Optional.of(SalonTexts.missingPictureQuestion()),
          choices: [
            Choices.inquiry(
              SalonTexts.pictureConsented(true),
              SalonAssistant.cardInquiry(cardNumber, 'PICTURE_CONSENTED')
            ),
            Choices.inquiry(
              SalonTexts.pictureConsented(false),
              SalonAssistant.cardInquiry(cardNumber, 'PICTURE_CONSENTED')
            )
          ]
        }
      )
    )
  }

  private promptForPicture (actor: SalonActor, cardNumber: CardNumber): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(actor).set(cardNumber)
    return Results.many(Reactions.plainText(SalonTexts.takePicturePrompt()))
  }

  private handlePictureFor (
    actor: SalonActor, cardNumber: CardNumber, pictureUrl: ImageUrl
  ): Promise<Array<Reaction>> {
    // TODO: event
    SalonAssistant.LOG.info(`received picture for ${cardNumber}: ${pictureUrl.asString()}`)
    this.pictureAwaitingCardNumber(actor).clear()
    return Promises.flatAll(
      Results.many(Reactions.plainText(SalonTexts.thanksForCustomerPicture())),
      this.promptForIdVerification(cardNumber)
    )
  }

  private handleFailedPictureFor (actor: SalonActor): Promise<Array<Reaction>> {
    this.pictureAwaitingCardNumber(actor).clear()
    return Results.many(Reactions.plainText(SalonTexts.customerPictureUpdateAborted()))
  }

  private promptForIdVerification (cardNumber: CardNumber): Promise<Array<Reaction>> {
    return Results.many(
      this.cardChecker.get(cardNumber).then(
        (card) => Reactions.choice(
          {
            topImage: Optional.empty(),
            title: SalonTexts.idVerificationPrompt(),
            subtitle: Optional.of(
              SalonTexts.idVerificationQuestion(
                card.holder().get().personalData().get()
                  .fullName()
              )
            ),
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
      )
    )
  }

  private pictureAwaitingCardNumber (actor: SalonActor): StateSlot<CardNumber> {
    return this.stateStore.slot(actor.id(), SalonAssistant.SHOULD_SEND_PICTURE_FOR_CARD)
      .convert(Converters.inverse(CardNumber.NUMBER_CONVERTER))
  }

  private handleVerified (actor: SalonActor, cardNumber: CardNumber): Promise<Array<Reaction>> {
    // TODO: uslugi
    // TODO: event
    SalonAssistant.LOG.info(`salon ${actor.displayName()} accepted ${cardNumber}`)
    return Results.many(Reactions.plainText(SalonTexts.acceptCard()))
  }

  private handleVerificationFailure (actor: SalonActor, cardNumber: CardNumber): Promise<Array<Reaction>> {
    // TODO: mail
    SalonAssistant.LOG.info(`salon ${actor.displayName()} did not accept ${cardNumber}`)
    return Results.many(Reactions.plainText(SalonTexts.rejectCard()))
  }

  private static cardInquiry (cardNumber: CardNumber, type: string): CardContextInquiry {
    return { type, cardNumber: cardNumber.asNumber() }
  }
}

export default SalonAssistant
