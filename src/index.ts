import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { actionCreatorFactory } from 'typescript-fsa';

import { ActionCreatorAsync } from './types';

export { isType } from 'typescript-fsa';

export interface Endpoints {
  readonly [index: string]: string;
}

export type TypescriptFSAOptions = {
  prefix?: string | null;
  defaultIsError?: (payload: any) => boolean;
};

export type AxiosOptions = Omit<AxiosRequestConfig, 'method'>;

export type EndpointOptions<Endpoints> = {
  url: Endpoints[keyof Endpoints];
  method: Method;
};

type Config<Meta = any> = {
  meta?: Meta;
  axios?: AxiosOptions;
};

const methodsWithBody = ['post', 'put', 'patch'];

export default (
  endpoints: Endpoints,
  globalConfig: Config & TypescriptFSAOptions = {}
) => {
  const actionCreator = actionCreatorFactory(
    globalConfig?.prefix || null,
    globalConfig?.defaultIsError
  );

  const events: Array<keyof Endpoints> = Object.keys(endpoints);

  const actionCreatorAsyncWithHandler = <
    Params,
    Result,
    Error = {},
    Meta = void
  >(
    localConfig: Config<Meta> & EndpointOptions<Endpoints>
  ) => {
    const withBody = methodsWithBody.includes(localConfig.method.toLowerCase());

    const event = events.find((key) => endpoints[key] === localConfig.url);
    const eventName = `${event}_${localConfig.method}`.toUpperCase();

    const actionCreatorAsync: ActionCreatorAsync<Params, Result, Error, Meta> =
      actionCreator.async as any;

    const metaParams = Object.assign({}, globalConfig.meta, localConfig.meta);
    const axiosParams = Object.assign(
      {},
      globalConfig.axios,
      localConfig.axios
    );

    return {
      ...actionCreatorAsync(eventName, metaParams),
      handler: async (
        payload: Params,
        config?: AxiosOptions
      ): Promise<AxiosResponse<Result | Error>> =>
        axios({
          ...axiosParams,
          url: localConfig.url,
          method: localConfig.method,
          ...config,
          ...(withBody
            ? {
                data:
                  payload instanceof FormData
                    ? payload
                    : { ...axiosParams.data, ...payload },
              }
            : { params: { ...axiosParams.params, ...payload } }),
        }),
      options: {
        ...globalConfig,
        ...localConfig,
        meta: metaParams,
        axios: axiosParams,
      },
    };
  };

  type ActionCreatorAsyncWithHandler = ReturnType<
    typeof actionCreatorAsyncWithHandler
  >;

  const registerAsyncActions = (actions: object) => {
    const eventsToActionCreators: {
      [key: string]: ActionCreatorAsyncWithHandler;
    } = {};

    const registerAction = (actionsDict: any) => {
      Object.keys(actionsDict).forEach((key) => {
        const action = actionsDict[key];

        if (action.started) {
          eventsToActionCreators[action.started.type] = action;
        } else {
          registerAction(action);
        }
      });
    };

    registerAction(actions);

    return {
      events: Object.keys(eventsToActionCreators),
      eventsToActionCreators,
    };
  };

  return {
    actionCreator: Object.assign(actionCreator, {
      asyncWithHandler: actionCreatorAsyncWithHandler,
    }),
    registerAsyncActions,
  };
};
