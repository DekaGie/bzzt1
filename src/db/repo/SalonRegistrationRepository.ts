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
}

export default SalonRegistrationRepository
