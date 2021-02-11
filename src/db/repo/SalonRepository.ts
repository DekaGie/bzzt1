import { EntityRepository, Repository } from 'typeorm'
import SalonDbo from '../dbo/SalonDbo'

@EntityRepository(SalonDbo)
class SalonRepository extends Repository<SalonDbo> {
  findByName (salonName: string): Promise<SalonDbo | undefined> {
    return this.createQueryBuilder('salon')
      .where('salon.salonName = :salonName')
      .setParameters({ salonName })
      .getOne()
  }
}

export default SalonRepository
