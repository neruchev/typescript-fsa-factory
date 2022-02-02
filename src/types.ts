import { AnyAction, Action, Success, Failure } from 'typescript-fsa';

export interface ActionCreator<Payload, Meta = void> {
  type: string;
  /**
   * Identical to `isType` except it is exposed as a bound method of an action
   * creator. Since it is bound and takes a single argument it is ideal for
   * passing to a filtering function like `Array.prototype.filter` or
   * RxJS's `Observable.prototype.filter`.
   *
   * @example
   *
   *    const somethingHappened =
   *      actionCreator<{foo: string}>('SOMETHING_HAPPENED');
   *    const somethingElseHappened =
   *      actionCreator<{bar: number}>('SOMETHING_ELSE_HAPPENED');
   *
   *    if (somethingHappened.match(action)) {
   *      // action.payload has type {foo: string}
   *    }
   *
   *    const actionArray = [
   *      somethingHappened({foo: 'foo'}),
   *      somethingElseHappened({bar: 5}),
   *    ];
   *
   *    // somethingHappenedArray has inferred type Action<{foo: string}>[]
   *    const somethingHappenedArray =
   *      actionArray.filter(somethingHappened.match);
   */
  match: (action: AnyAction) => action is Action<Payload>;
  /**
   * Creates action with given payload and metadata.
   *
   * @param payload Action payload.
   * @param meta Action metadata. Merged with `commonMeta` of Action Creator.
   */
  (payload: Payload, meta: Meta): Action<Payload>;
}

export interface AsyncActionCreators<Params, Result, Error = {}, Meta = void> {
  type: string;
  started: ActionCreator<Params, Meta>;
  done: ActionCreator<Success<Params, Result>>;
  failed: ActionCreator<Failure<Params, Error>>;
}

export type ActionCreatorAsync<Params, Result, Error = {}, Meta = void> = (
  type: string,
  commonMeta?: Meta
) => AsyncActionCreators<Params, Result, Error, Meta>;
