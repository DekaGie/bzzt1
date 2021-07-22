import { EntityRepository, Repository } from 'typeorm'
import SalonWorkerDbo from '../dbo/SalonWorkerDbo'

@EntityRepository(SalonWorkerDbo)
class SalonWorkerRepository extends Repository<SalonWorkerDbo> {
  findFull (email: string): Promise<SalonWorkerDbo | undefined> {
    return this.createQueryBuilder('worker')
      .leftJoinAndSelect('worker.salon', 'salon')
      .where('worker.email = :email')
      .setParameters({ email })
      .getOne()
  }
}

export default SalonWorkerRepository
