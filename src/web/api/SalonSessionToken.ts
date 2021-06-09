import Instant from '../../service/domain/Instant'

interface SalonSessionToken {

  token: string;

  validUntil: Instant;
}

export default SalonSessionToken
