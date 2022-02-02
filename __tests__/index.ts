import actionsFactory, { isType } from '../src';

const ENDPOINTS = {
  FOO: '/foo',
  BAR: '/bar',
} as const;

describe('Package returns all creators and helpers', () => {
  test('The package returns all standard creators from `typescript-fsa`', () => {
    const creators = actionsFactory(ENDPOINTS);

    expect(creators).toHaveProperty('actionCreator');
    expect(creators.actionCreator).toBeInstanceOf(Function);

    expect(creators.actionCreator).toHaveProperty('async');
    expect(creators.actionCreator.async).toBeInstanceOf(Function);
  });

  test('The package return `isType` helper from `typescript-fsa`', () => {
    expect(isType).toBeInstanceOf(Function);
  });

  test('The package return `actionCreator.asyncWithHandler`', () => {
    const creators = actionsFactory(ENDPOINTS);

    expect(creators.actionCreator).toHaveProperty('asyncWithHandler');
    expect(creators.actionCreator.asyncWithHandler).toBeInstanceOf(Function);
  });

  test('The package return `registerAsyncActions` helper', () => {
    const creators = actionsFactory(ENDPOINTS);

    expect(creators).toHaveProperty('registerAsyncActions');
    expect(creators.registerAsyncActions).toBeInstanceOf(Function);
  });
});

describe('Standard creators from `typescript-fsa` working correctly', () => {
  test('`actionCreator` without payload working correctly', () => {
    const action = actionsFactory(ENDPOINTS).actionCreator('ACTION_1');

    expect(action).toBeInstanceOf(Function);
    expect(action()).toEqual({ type: 'ACTION_1' });
  });

  test('`actionCreator` with payload working correctly', () => {
    const action =
      actionsFactory(ENDPOINTS).actionCreator<{ test: boolean }>('ACTION_2');

    expect(action({ test: true })).toEqual({
      type: 'ACTION_2',
      payload: { test: true },
    });
  });

  test('`actionCreator` with meta working correctly', () => {
    const action =
      actionsFactory(ENDPOINTS).actionCreator<{ test1: boolean }>(
        'ACTION_META'
      );

    const actionWithPreset = actionsFactory(ENDPOINTS).actionCreator<{
      test1: boolean;
    }>('ACTION_PRESET_META', { preset: true });

    expect(action({ test1: true }, { test2: false })).toEqual({
      type: 'ACTION_META',
      payload: { test1: true },
      meta: { test2: false },
    });

    expect(actionWithPreset({ test1: true }, { test2: false })).toEqual({
      type: 'ACTION_PRESET_META',
      payload: { test1: true },
      meta: { preset: true, test2: false },
    });
  });

  test('`actionCreator` with error working correctly', () => {
    const { actionCreator } = actionsFactory(ENDPOINTS);

    const errorAction = actionCreator<{
      test: boolean;
    }>('ERROR_ACTION', null, true);
    const inferredErrorAction = actionCreator<any>('INF_ERROR_ACTION');
    const customErrorAction = actionCreator<{
      isError: boolean;
    }>('CUSTOM_ERROR_ACTION', null, (payload) => payload.isError);

    expect(errorAction({ test: true })).toEqual({
      type: 'ERROR_ACTION',
      payload: { test: true },
      error: true,
    });

    expect(inferredErrorAction(new Error())).toEqual({
      type: 'INF_ERROR_ACTION',
      payload: new Error(),
      error: true,
    });

    expect(customErrorAction({ isError: true })).toEqual({
      type: 'CUSTOM_ERROR_ACTION',
      payload: { isError: true },
      error: true,
    });

    expect(customErrorAction({ isError: false })).toEqual({
      type: 'CUSTOM_ERROR_ACTION',
      payload: { isError: false },
    });
  });

  test('`actionCreator` throws an error when creating duplicates', () => {
    const creators = actionsFactory(ENDPOINTS);

    creators.actionCreator('DUPLICATED_ACTION');

    expect(() => creators.actionCreator('DUPLICATED_ACTION')).toThrow(
      'Duplicate action type: DUPLICATED_ACTION'
    );
  });

  test('`actionCreator.match` working correctly', () => {
    const creators = actionsFactory(ENDPOINTS);

    const action5 = creators.actionCreator('ACTION_5');
    const action6 = creators.actionCreator<{ test: boolean }>('ACTION_6');

    expect(action5.match(action5())).toBeTruthy();
    expect(action6.match(action5())).toBeFalsy();
  });
});

describe('Standard helpers from `typescript-fsa` working correctly', () => {
  test('`isType` working correctly', () => {
    const { actionCreator } = actionsFactory(ENDPOINTS);

    const action7 = actionCreator('ACTION_7');
    const action8 = actionCreator('ACTION_8');

    expect(isType(action7(), action7)).toBeTruthy();
    expect(isType(action7(), action8)).toBeFalsy();
  });
});
