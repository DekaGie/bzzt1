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
import TreatmentResolver from './TreatmentResolver'
import TreatmentName from '../domain/TreatmentName'
import TreatmentsContextInquiry from '../domain/TreatmentsContextInquiry'
import Choice, { InquiryChoice } from '../spi/Choice'
import CardUpdater from './CardUpdater'
import VisitRegistrator from './VisitRegistrator'
import OfferedTreatment from '../domain/OfferedTreatment'

class SalonAssistant implements ActorAssistant<SalonActor> {
  private static readonly LOG: Logger = Loggers.get(SalonAssistant.name)

  private readonly barcodeParser: BarcodeParser;

  private readonly cardChecker: CardChecker;

  private readonly cardUpdater: CardUpdater;

  private readonly stateStore: StateStore;

  private readonly treatmentResolver: TreatmentResolver;

  private readonly visitRegistrator: VisitRegistrator;

  constructor (
    barcodeParser: BarcodeParser,
    cardChecker: CardChecker,
    cardUpdater: CardUpdater,
    stateStore: StateStore,
    treatmentResolver: TreatmentResolver,
    visitRegistrator: VisitRegistrator
  ) {
    this.barcodeParser = barcodeParser
    this.cardChecker = cardChecker
    this.cardUpdater = cardUpdater
    this.stateStore = stateStore
    this.treatmentResolver = treatmentResolver
    this.visitRegistrator = visitRegistrator
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
      case 'TREATMENT_PICKED': {
        // eslint-disable-next-line max-len
        const contextInquiry: CardContextInquiry & TreatmentsContextInquiry = inquiry as CardContextInquiry & TreatmentsContextInquiry
        return this.handleTreatmentsPicked(
          actor,
          new CardNumber(contextInquiry.cardNumber),
          contextInquiry.treatmentNames.map((name) => new TreatmentName(name))
        )
      }
      case 'TREATMENTS_CONFIRMED': {
        // eslint-disable-next-line max-len
        const contextInquiry: CardContextInquiry & TreatmentsContextInquiry = inquiry as CardContextInquiry & TreatmentsContextInquiry
        return this.handleTreatmentsConfirmed(
          actor,
          new CardNumber(contextInquiry.cardNumber),
          contextInquiry.treatmentNames.map((name) => new TreatmentName(name))
        )
      }
      case 'TREATMENTS_CANCELLED': {
        return this.handleTreatmentsCancelled()
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
    const picture: Optional<ImageUrl> = personalData.get().picture()
    if (!picture.isPresent()) {
      return this.handleNoPicture(card.cardNumber(), personalData.get().fullName())
    }
    return Results.many(
      Reactions.choice(
        {
          topImage: picture.get(),
          imageAsSquare: true,
          title: personalData.get().fullName(),
          subtitle: SalonTexts.pictureVerificationQuestion(),
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
          title: fullName,
          subtitle: SalonTexts.missingPictureQuestion(),
          choices: [
            Choices.inquiry(
              SalonTexts.pictureConsented(true),
              SalonAssistant.cardInquiry(cardNumber, 'PICTURE_CONSENTED')
            ),
            Choices.inquiry(
              SalonTexts.pictureConsented(false),
              SalonAssistant.cardInquiry(cardNumber, 'PICTURE_NOT_CONSENTED')
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
    actor: SalonActor, cardNumber: CardNumber, picture: ImageUrl
  ): Promise<Array<Reaction>> {
    // TODO: event
    SalonAssistant.LOG.info(`received picture for ${cardNumber}: ${picture.asString()}`)
    this.pictureAwaitingCardNumber(actor).clear()
    this.cardUpdater.updateHolderPicture(cardNumber, picture)
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
            title: SalonTexts.idVerificationPrompt(),
            subtitle: SalonTexts.idVerificationQuestion(
              card.holder().get().personalData().get().fullName()
            ),
            choices: [
              Choices.inquiry(
                GpTexts.yes(),
                SalonAssistant.cardInquiry(cardNumber, 'ID_VERIFICATION_SUCCESS')
              ),
              Choices.inquiry(
                GpTexts.no(),
                SalonAssistant.cardInquiry(cardNumber, 'ID_VERIFICATION_FAILURE')
              )
            ]
          }
        )
      )
    )
  }

  private pictureAwaitingCardNumber (actor: SalonActor): StateSlot<CardNumber> {
    return this.stateStore.slot(
      actor.id(), new StateCategoryId(SalonAssistant.name, 'SHOULD_SEND_PICTURE_FOR_CARD')
    ).convert(Converters.NUMBER_PARSER)
      .convert(Converters.inverse(CardNumber.NUMBER_CONVERTER))
  }

  private handleVerified (actor: SalonActor, cardNumber: CardNumber): Promise<Array<Reaction>> {
    return this.listTreatmentChoices(actor, cardNumber, []).then(
      (choices) => {
        if (choices.length === 0) {
          return Results.many(Reactions.plainText(SalonTexts.noTreatmentAvailable()))
        }
        return SalonAssistant.pageTreatmentChoices(
          SalonTexts.pickTreatmentPrompt(false), choices
        )
      }
    )
  }

  private handleTreatmentsPicked (
    actor: SalonActor, cardNumber: CardNumber, picks: Array<TreatmentName>
  ): Promise<Array<Reaction>> {
    return this.listTreatmentChoices(actor, cardNumber, picks).then(
      (moreChoices) => {
        const finalChoices: Array<Choice> = [
          Choices.inquiry(
            SalonTexts.treatmentPickingConfirm(),
            SalonAssistant.cardTreatmentsInquiry(
              cardNumber, picks, 'TREATMENTS_CONFIRMED'
            )
          ),
          Choices.inquiry(
            SalonTexts.treatmentPickingCancel(),
            { type: 'TREATMENTS_CANCELLED' }
          )
        ]
        if (moreChoices.length === 0) {
          return Results.many(
            Reactions.choice(
              {
                title: SalonTexts.treatmentPickingContinuation(picks.length),
                choices: finalChoices
              }
            )
          )
        }
        return Promises.flatAll(
          Results.many(
            Reactions.choice(
              {
                title: SalonTexts.treatmentPickingContinuation(picks.length),
                subtitle: SalonTexts.treatmentPickingContinuationChoice(),
                choices: finalChoices
              }
            )
          ),
          SalonAssistant.pageTreatmentChoices(
            SalonTexts.pickTreatmentPrompt(true), moreChoices
          )
        )
      }
    )
  }

  private listTreatmentChoices (
    actor: SalonActor, cardNumber: CardNumber, picks: Array<TreatmentName>
  ): Promise<Array<InquiryChoice>> {
    return this.treatmentResolver.findOffered(actor.name(), cardNumber).then(
      (treatments) => treatments.filter(
        (treatment) => picks.filter(
          (pick) => pick.equalTo(treatment.name())
        ).length === 0
      ).map(
        (treatment) => Choices.inquiry(
          treatment.fullName(),
          SalonAssistant.cardTreatmentsInquiry(
            cardNumber, picks.concat(treatment.name()), 'TREATMENT_PICKED'
          )
        )
      )
    )
  }

  private handleTreatmentsConfirmed (
    actor: SalonActor, cardNumber: CardNumber, treatments: Array<TreatmentName>
  ): Promise<Array<Reaction>> {
    return Promise.all(
      [
        this.cardChecker.get(cardNumber),
        this.treatmentResolver.get(treatments)
      ]
    ).then(
      (fetches) => {
        const offeredTreatments: Array<OfferedTreatment> = fetches[1]
        return this.visitRegistrator.register(
          actor.name(), cardNumber, offeredTreatments.map((offered) => offered.name())
        ).then(
          () => {
            SalonAssistant.LOG.info(`salon ${actor.name()} successfully accepted ${cardNumber} for ${treatments}`)
            const customerName: string = fetches[0].holder().get().personalData()
              .map((data) => data.fullName())
              .orElse(SalonTexts.unknownCustomer(cardNumber.asNumber()))
            const treatmentNames: Array<string> = offeredTreatments.map((name) => name.fullName())
            return Results.many(Reactions.plainText(SalonTexts.flowSuccessful(customerName, treatmentNames)))
          }
        )
      }
    )
  }

  private handleTreatmentsCancelled (): Promise<Array<Reaction>> {
    return Results.many(Reactions.plainText(SalonTexts.flowCancelled()))
  }

  private handleVerificationFailure (actor: SalonActor, cardNumber: CardNumber): Promise<Array<Reaction>> {
    // TODO: event
    SalonAssistant.LOG.info(`salon ${actor.name()} did not accept ${cardNumber}`)
    return Results.many(Reactions.plainText(SalonTexts.rejectCard()))
  }

  private static pageTreatmentChoices (
    title: string, choices: Array<InquiryChoice>
  ): Promise<Array<Reaction>> {
    const reactions: Array<Reaction> = []
    for (let fromIndex = 0; fromIndex < choices.length; fromIndex += Choices.LIMIT) {
      const pageChoices: Array<InquiryChoice> = choices.slice(fromIndex, fromIndex + Choices.LIMIT)
      const left: number = choices.length - fromIndex - pageChoices.length
      reactions.push(
        Reactions.choice(
          {
            title,
            subtitle: SalonTexts.pickTreatmentHint(left),
            choices: pageChoices
          }
        )
      )
    }
    return Results.many(...reactions)
  }

  private static cardInquiry (cardNumber: CardNumber, type: string): CardContextInquiry {
    return { type, cardNumber: cardNumber.asNumber() }
  }

  private static cardTreatmentsInquiry (
    cardNumber: CardNumber, treatmentNames: Array<TreatmentName>, type: string
  ): CardContextInquiry & TreatmentsContextInquiry {
    return {
      type,
      cardNumber: cardNumber.asNumber(),
      treatmentNames: treatmentNames.map((name) => name.toRepresentation())
    }
  }
}

export default SalonAssistant
