import Converter from './Converter'

class Converters {
  static readonly NUMBER_PARSER: Converter<string, number> = Converters.construct(
    (str) => Number.parseFloat(str), (num) => num.toString()
  )

  static readonly JSON_PARSER: Converter<string, any> = Converters.construct(
    (str) => JSON.parse(str), (ref) => JSON.stringify(ref)
  )

  static readonly BOOLEAN_PARSER: Converter<string, boolean> = Converters.construct(
    (str) => str === 'true', (bool) => bool.toString()
  )

  static construct<I, O> (forward: (I) => O, backward: (O) => I): Converter<I, O> {
    return { forward, backward }
  }

  static inverse<I, O> (converter: Converter<I, O>): Converter<O, I> {
    return {
      forward (input: O): I {
        return converter.backward(input)
      },

      backward (output: I): O {
        return converter.forward(output)
      }
    }
  }
}

export default Converters
