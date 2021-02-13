import { Optional } from 'typescript-optional'
import BarcodeParser from './BarcodeParser'
import ActorAssistant from './ActorAssistant'
import CardContextInquiry from '../domain/CardContextInquiry'
import CardRegistrator from './CardRegistrator'
import StaticImageUrls from '../util/StaticImageUrls'
import StateStore from '../StateStore'
import Reactions from '../spi/Reactions'
import ImageInquiry from '../spi/ImageInquiry'
import ActorId from '../domain/ActorId'
import Inquiry from '../spi/Inquiry'
import Reaction from '../spi/Reaction'
import StateCategoryId from '../domain/StateCategoryId'
import StateSlot from '../StateSlot'
import Choices from '../spi/Choices'
import GpTexts from '../text/GpTexts'
import FreeTextInquiry from '../spi/FreeTextInquiry'
import UnregisteredTexts from '../text/UnregisteredTexts'
import TextExtractions from '../util/TextExtractions'
import Results from '../util/Results'

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
              title: UnregisteredTexts.welcome(),
              subtitle: Optional.of(UnregisteredTexts.intentPrompt()),
              choices: [
                Choices.inquiry(UnregisteredTexts.activateCard(), { type: 'PROMPT_ACTIVATE' }),
                Choices.phone(GpTexts.customerService(), '+48662097978')
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
              return Results.many(Reactions.plainText(GpTexts.poorBarcodeImage()))
            }
            return this.handleCardNumber(actorId, cardNumber.get())
          }
        )
      }
      case 'PROMPT_ACTIVATE': {
        this.stateStore.slot(actorId, UnregisteredActorAssistant.ASKED_FOR_ACTIVATE).set(true)
        return Results.many(Reactions.plainText(UnregisteredTexts.inputCardNumberPrompt()))
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
          title: UnregisteredTexts.ensureActivationPrompt(),
          subtitle: Optional.of(UnregisteredTexts.ensureActivationQuestion()),
          choices: [Choices.inquiry(GpTexts.yes(), { type: 'ACTIVATE', cardNumber } as CardContextInquiry)]
        }
      )
    )
  }
}

export default UnregisteredActorAssistant
