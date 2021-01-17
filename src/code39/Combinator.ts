import Weighted from './Weighted'

class Combinator {
  static combine4 <A, B, C, D> (
    as: Array<Weighted<A>>,
    bs: Array<Weighted<B>>,
    cs: Array<Weighted<C>>,
    ds: Array<Weighted<D>>
  ): Array<Weighted<[A, B, C, D]>> {
    const ts: Array<Weighted<[A, B, C, D]>> = Combinator.combine(
      Combinator.combine(
        Combinator.normalize(as),
        Combinator.normalize(bs)
      ),
      Combinator.combine(
        Combinator.normalize(cs),
        Combinator.normalize(ds)
      ),
    ).map(
      (ms) => Combinator.weight(
        [ms.element[0][0], ms.element[0][1], ms.element[1][0], ms.element[1][1]], ms.weight
      )
    )
    return ts.sort(Combinator.byWeightDesc)
  }

  static combine3 <A, B, C> (
    as: Array<Weighted<A>>,
    bs: Array<Weighted<B>>,
    cs: Array<Weighted<C>>
  ): Array<Weighted<[A, B, C]>> {
    const ts: Array<Weighted<[A, B, C]>> = Combinator.combine(
      Combinator.combine(
        Combinator.normalize(as),
        Combinator.normalize(bs)
      ),
      Combinator.normalize(cs)
    ).map(
      (ms) => Combinator.weight(
        [ms.element[0][0], ms.element[0][1], ms.element[1]], ms.weight
      )
    )
    return ts.sort(Combinator.byWeightDesc)
  }

  static combine2 <A, B> (
    as: Array<Weighted<A>>,
    bs: Array<Weighted<B>>
  ): Array<Weighted<[A, B]>> {
    return Combinator.combine(Combinator.normalize(as), Combinator.normalize(bs))
      .sort(Combinator.byWeightDesc)
  }

  private static combine <A, B> (
    as: Array<Weighted<A>>,
    bs: Array<Weighted<B>>
  ): Array<Weighted<[A, B]>> {
    const xs: Array<Weighted<[A, B]>> = new Array(as.length * bs.length)
    for (let ai: number = 0; ai < as.length; ai += 1) {
      const a: Weighted<A> = as[ai]
      for (let bi: number = 0; bi < bs.length; bi += 1) {
        const b: Weighted<B> = bs[bi]
        xs[ai * bs.length + bi] = Combinator.weight([a.element, b.element], a.weight * b.weight)
      }
    }
    return xs
  }

  private static normalize <T> (ts: Array<Weighted<T>>): Array<Weighted<T>> {
    const sum: number = ts.map((t) => t.weight)
      .reduce((left, right) => left + right)
    if (sum === 1.0) {
      return ts
    }
    return ts.map((a) => Combinator.weight(a.element, a.weight / sum))
  }

  private static byWeightDesc <T> (left: Weighted<T>, right: Weighted<T>): number {
    return right.weight - left.weight
  }

  static weight<T> (element: T, weight: number): Weighted<T> {
    return { element, weight }
  }

  static linearWeights<T> (elements: Array<T>): Array<Weighted<T>> {
    return elements.map(
      (element, index) => Combinator.weight(element, elements.length - index)
    )
  }

  static exponentialWeights<T> (elements: Array<T>): Array<Weighted<T>> {
    return elements.map(
      (element, index) => Combinator.weight(element, 1.0 / (2 ** index))
    )
  }
}

export default Combinator
