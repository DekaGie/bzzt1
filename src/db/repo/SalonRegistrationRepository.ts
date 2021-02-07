import { EntityRepository, Repository } from 'typeorm'
import SalonRegistrationDbo from '../dbo/SalonRegistrationDbo'

@EntityRepository(SalonRegistrationDbo)
class SalonRegistrationRepository extends Repository<SalonRegistrationDbo> {
  findFull (customerId: string): Promise<SalonRegistrationDbo | undefined> {
    return this.createQueryBuilder('registration')
      .leftJoinAndSelect('registration.salon', 'salon')
      .where('registration.customerId = :customerId')
      .setParameters({ customerId })
      .getOne()
  }

  deleteIfExists (customerId: string): Promise<boolean> {
    return this.createQueryBuilder('registration')
      .delete()
      .where('registration.customerId = :customerId')
      .setParameters({ customerId })
      .execute()
      .then((deleted) => deleted.affected > 0)
  }
}

export default SalonRegistrationRepository
