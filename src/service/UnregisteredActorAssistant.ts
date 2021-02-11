import { Optional } from 'typescript-optional'
import BarcodeParser from './BarcodeParser'
import ActorAssistant from './ActorAssistant'
import StaticImageUrls from './StaticImageUrls'
import CardRegistrator from './CardRegistrator'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import ActorId from './domain/ActorId'
import TextExtractions from './TextExtractions'
import StateStore from './StateStore'
import Reactions from './spi/Reactions'
import Choices from './spi/Choices'
import StaticTexts from './StaticTexts'
import FreeTextInquiry from './spi/FreeTextInquiry'
import ImageInquiry from './spi/ImageInquiry'
import CardContextInquiry from './CardContextInquiry'
import Results from './Results'

class UnregisteredActorAssistant implements ActorAssistant<ActorId> {
  private static readonly ASKED_FOR_ACTIVATE: StateCategoryId =
      new StateCategoryId(UnregisteredActorAssistant.name, 'ASKED_FOR_ACTIVATE');

  private readonly cardRegistrator: CardRegistrator;

  private readonly barcodeParser: BarcodeParser;

  private readonly stateStore: StateStore;

  constructor (
    barcodeParser: BarcodeParser,
    cardRegistrator: CardRegistrator,
    stateStore: StateStore
  ) {
    this.barcodeParser = barcodeParser
    this.cardRegistrator = cardRegistrator
    this.stateStore = stateStore
  }

  handle (actorId: ActorId, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (cardNumber.isPresent()) {
          return this.handleCardNumber(actorId, cardNumber.get())
        }
        return Results.many(
          Reactions.choice(
            {
              topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
              title: StaticTexts.unregisteredActorWelcome(),
              subtitle: Optional.of(StaticTexts.unregisteredActorIntentPrompt()),
              choices: [
                Choices.inquiry(StaticTexts.activateCard(), { type: 'PROMPT_ACTIVATE' }),
                Choices.phone(StaticTexts.customerService(), '+48662097978')
              ]
            }
          )
        )
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return Results.many(Reactions.plainText(StaticTexts.poorBarcodeImage()))
            }
            return this.handleCardNumber(actorId, cardNumber.get())
          }
        )
      }
      case 'PROMPT_ACTIVATE': {
        this.stateStore.slot(actorId, UnregisteredActorAssistant.ASKED_FOR_ACTIVATE).set(true)
        return Results.many(Reactions.plainText(StaticTexts.inputCardNumberPrompt()))
      }
      case 'ACTIVATE': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.cardRegistrator.validateAndRegister(actorId, cardInquiry.cardNumber)
      }
      default: {
        return Results.many()
      }
    }
  }

  handleCardNumber (actorId: ActorId, cardNumber: number): Promise<Array<Reaction>> {
    const asked: StateSlot<Boolean> = this.stateStore.slot(actorId, UnregisteredActorAssistant.ASKED_FOR_ACTIVATE)
    if (asked.get().orElse(false)) {
      return this.cardRegistrator.validateAndRegister(actorId, cardNumber)
    }
    return Results.many(
      Reactions.choice(
        {
          topImage: Optional.empty(),
          title: StaticTexts.ensureActivationPrompt(),
          subtitle: Optional.of(StaticTexts.ensureActivationQuestion()),
          choices: [Choices.inquiry(StaticTexts.yes(), { type: 'ACTIVATE', cardNumber })]
        }
      )
    )
  }
}

export default UnregisteredActorAssistant
