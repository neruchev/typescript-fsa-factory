import actionsFactory from '../src';

const ENDPOINTS = {
  FOO: '/foo',
  BAR: '/bar',
} as const;

describe('Package returns creators', () => {
  test('The package returns all standard creators from `typescript-fsa`', () => {
    const creators = actionsFactory(ENDPOINTS);

    expect(creators).toHaveProperty('actionCreator');
    expect(creators).toHaveProperty('actionCreatorAsync');
  });

  test('The package return `actionCreatorAsyncWithHandler`', () => {
    expect(actionsFactory(ENDPOINTS)).toHaveProperty(
      'actionCreatorAsyncWithHandler'
    );
  });
});
