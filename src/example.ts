import actionsFactory from './index';

export namespace Actions {
  export type started = {
    x1: string;
  };

  export type done = {
    x2: string;
  };

  export type failed = {
    x3: string;
  };

  export type meta = {
    x4: string;
  };
}

const API_ENDPOINTS = {
  FOO: '/foo',
  BAR: '/bar',
} as const;

const { actionCreator } = actionsFactory(API_ENDPOINTS);

const xx = {
  x1: actionCreator.asyncWithHandler<
    Actions.started,
    Actions.done,
    Actions.failed,
    Actions.meta
  >({
    url: API_ENDPOINTS.FOO,
    method: 'POST',
  }),
  x2: actionCreator.asyncWithHandler<
    Actions.started,
    Actions.done,
    Actions.failed
  >({
    url: API_ENDPOINTS.FOO,
    method: 'POST',
  }),
};

xx.x1.started({ x1: 'test' }, { x4: '' });
xx.x2.started({ x1: 'test' });
