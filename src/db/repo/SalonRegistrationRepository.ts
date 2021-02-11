import { EntityRepository, Repository } from 'typeorm'
import SalonRegistrationDbo from '../dbo/SalonRegistrationDbo'

@EntityRepository(SalonRegistrationDbo)
class SalonRegistrationRepository extends Repository<SalonRegistrationDbo> {
  findFull (actorId: string): Promise<SalonRegistrationDbo | undefined> {
    return this.createQueryBuilder('registration')
      .leftJoinAndSelect('registration.salon', 'salon')
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

export default SalonRegistrationRepository
