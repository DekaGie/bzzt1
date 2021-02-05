import AnyId from './AnyId'

class StateCategoryId extends AnyId {
  constructor (part: string, ...more: Array<string>) {
    super([part].concat(more).join('.'))
  }

  typeName (): string {
    return StateCategoryId.name
  }
}

export default StateCategoryId
