# typescript-fsa-factory

Smart action factory. Based on [axios](https://www.npmjs.com/package/axios) and [typescript-fsa](https://www.npmjs.com/package/typescript-fsa).

## Why?

The package implements the "smart thresher" approach and takes most of the routine work of writing template code.

## Usage

```js
import actionsFactory from 'typescript-fsa-factory';

const API_ENDPOINTS = {
  FOO: '/foo',
  BAR: '/bar',
} as const;

type ApiEndpoints = typeof API_ENDPOINTS;

const {
  // Exported from `typescript-fsa`.
  // See `typescript-fsa` documentation.
  actionCreator,
  actionCreatorAsync,

  // Smart action creator
  actionCreatorAsyncWithHandler,
} = actionsFactory<ApiEndpoints>(API_ENDPOINTS);

const actions = {
  foo: actionCreatorAsyncWithHandler<
    Actions.api.foo.started,
    Actions.api.foo.done,
    Actions.api.foo.failed
  >({
    url: API_ENDPOINTS.FOO,
    method: 'GET',
  }),

  bar: actionCreatorAsyncWithHandler<
    Actions.api.bar.started,
    Actions.api.bar.done,
    Actions.api.bar.failed
  >({
    url: API_ENDPOINTS.BAR,
    method: 'POST',
  }),
};
```
