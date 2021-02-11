import { EntityRepository, Repository } from 'typeorm'
import CardRegistrationDbo from '../dbo/CardRegistrationDbo'

@EntityRepository(CardRegistrationDbo)
class CardRegistrationRepository extends Repository<CardRegistrationDbo> {
  findFull (actorId: string): Promise<CardRegistrationDbo | undefined> {
    return this.createQueryBuilder('registration')
      .leftJoinAndSelect('registration.card', 'card')
      .leftJoinAndSelect('card.agreement', 'agreement')
      .where('registration.actorId = :actorId')
      .setParameters({ actorId })
      .getOne()
  }

  deleteIfExists (actorId: string): Promise<boolean> {
    return this.createQueryBuilder()
      .delete()
      .where('actorId = :actorId')
      .setParameters({ actorId })
      .execute()
      .then((deleted) => deleted.affected > 0)
  }
}

export default CardRegistrationRepository
