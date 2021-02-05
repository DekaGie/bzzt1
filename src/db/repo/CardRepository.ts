import { EntityRepository, Repository } from 'typeorm'
import CardDbo from '../dbo/CardDbo'

@EntityRepository(CardDbo)
class CardRepository extends Repository<CardDbo> {
  findFull (cardNumber: number): Promise<CardDbo | undefined> {
    return this.createQueryBuilder('card')
      .leftJoinAndSelect('card.registration', 'registration')
      .leftJoinAndSelect('registration.identification', 'identification')
      .leftJoinAndSelect('card.agreement', 'agreement')
      .where('card.cardNumber = :cardNumber')
      .setParameters({ cardNumber })
      .getOne()
  }
}

export default CardRepository
