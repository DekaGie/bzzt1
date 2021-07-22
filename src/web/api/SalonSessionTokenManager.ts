import ApiSafeError from './ApiSafeError'
import Instant from '../../service/domain/Instant'
import SalonSessionToken from './SalonSessionToken'
import SalonName from '../../service/domain/SalonName'

class SalonSessionTokenManager {
  issueFor (salon: SalonName): SalonSessionToken {
    const validUntil: Instant = new Instant(Instant.now().asEs() + 3600)
    const payload: string = `${salon.toRepresentation()}:${validUntil.asEs()}`
    return {
      token: `${payload}|${SalonSessionTokenManager.hash(payload)}`,
      validUntil
    }
  }

  validate (token: string): SalonName {
    const ioSignature: number = token.indexOf('|')
    if (ioSignature === -1) {
      throw new ApiSafeError('invalid_token', 'Brak sygnatury tokenu.')
    }
    const signature: number = Number.parseInt(token.substring(ioSignature + 1), 10)
    if (Number.isNaN(signature)) {
      throw new ApiSafeError('invalid_token', 'Nierozpoznawalna sygnatura tokenu.')
    }
    const payload: string = token.substring(0, ioSignature)
    const ioValidity: number = payload.indexOf(':')
    if (ioValidity === -1) {
      throw new ApiSafeError('invalid_token', 'Brak ważności tokenu.')
    }
    const validUntilEs = Number.parseInt(payload.substring(ioValidity + 1), 10)
    if (Number.isNaN(validUntilEs)) {
      throw new ApiSafeError('invalid_token', 'Nierozpoznawalna ważność tokenu.')
    }
    if (SalonSessionTokenManager.hash(payload) !== signature) {
      throw new ApiSafeError('invalid_token', 'Błędna sygnatura tokenu.')
    }
    if (Instant.now().isAtOrAfter(new Instant(validUntilEs))) {
      throw new ApiSafeError('outdated_token', 'Token stracił ważność.')
    }
    return new SalonName(payload.substring(0, ioValidity))
  }

  private static hash (str: string): number {
    let result = 0
    for (let i: number = 0; i < str.length; i += 1) {
      const current: number = str.codePointAt(i)
      /* eslint-disable no-bitwise */
      result = (31 * result + current) | 0
    }
    return result
  }
}

export default SalonSessionTokenManager
