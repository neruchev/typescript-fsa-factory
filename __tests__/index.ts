import actionsFactory, { isType } from '../src';

const ENDPOINTS = {
  FOO: '/foo',
  BAR: '/bar',
} as const;

describe('Package returns all creators and helpers', () => {
  test('The package returns all standard creators from `typescript-fsa`', () => {
    const creators = actionsFactory(ENDPOINTS);

    expect(creators).toHaveProperty('actionCreator');
    expect(creators).toHaveProperty('actionCreatorAsync');
  });

  test('The package return `isType` helper from `typescript-fsa`', () => {
    const { actionCreator } = actionsFactory(ENDPOINTS);

    const action1 = actionCreator('ACTION_1');
    const action2 = actionCreator('ACTION_2');

    expect(isType(action1(), action1)).toBeTruthy();
    expect(isType(action1(), action2)).toBeFalsy();
  });

  test('The package return `actionCreatorAsyncWithHandler`', () => {
    expect(actionsFactory(ENDPOINTS)).toHaveProperty(
      'actionCreatorAsyncWithHandler'
    );
  });

  test('The package return `registerAsyncActions` helper', () => {
    expect(actionsFactory(ENDPOINTS)).toHaveProperty('registerAsyncActions');
  });
});
