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
import Converters from '../../util/Converters'

class UnregisteredActorAssistant implements ActorAssistant<ActorId> {
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
              topImage: StaticImageUrls.HORIZONTAL_LOGO,
              title: UnregisteredTexts.welcome(),
              subtitle: UnregisteredTexts.intentPrompt(),
              choices: [
                Choices.inquiry(UnregisteredTexts.activateCard(), { type: 'PROMPT_ACTIVATE' }),
                Choices.phone(GpTexts.faq(), 'https://beautyzazero.pl/faq')
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
        this.askedForActivate(actorId).set(true)
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

  private handleCardNumber (actorId: ActorId, cardNumber: number): Promise<Array<Reaction>> {
    const asked: StateSlot<Boolean> = this.askedForActivate(actorId)
    if (asked.get().orElse(false)) {
      return this.cardRegistrator.validateAndRegister(actorId, cardNumber)
    }
    return Results.many(
      Reactions.choice(
        {
          title: UnregisteredTexts.ensureActivationPrompt(),
          subtitle: UnregisteredTexts.ensureActivationQuestion(),
          choices: [Choices.inquiry(GpTexts.yes(), { type: 'ACTIVATE', cardNumber } as CardContextInquiry)]
        }
      )
    )
  }

  private askedForActivate (actorId: ActorId): StateSlot<boolean> {
    return this.stateStore.slot(
      actorId, new StateCategoryId(UnregisteredActorAssistant.name, 'ASKED_FOR_ACTIVATE')
    ).convert(Converters.BOOLEAN_PARSER)
  }
}

export default UnregisteredActorAssistant
