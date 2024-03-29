import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import actionCreatorFactory from 'typescript-fsa';

export { isType } from 'typescript-fsa';

export interface IDictionary<T> {
  readonly [index: string]: T;
}

export type BaseOptions = AxiosRequestConfig;

export type ExtraOptions<T> = T extends object ? { extra: T } : {};

export type EndpointOptions<Endpoints> = {
  url: Endpoints[keyof Endpoints];
  method: Method;
};

const methodsWithBody = ['post', 'put', 'patch'];
const actionCreator = actionCreatorFactory();

export default <Endpoints extends IDictionary<string>, Extra = undefined>(
  endpoints: Endpoints,
  globalConfig?: Partial<ExtraOptions<Partial<Extra>>> & BaseOptions
) => {
  const events: Array<keyof Endpoints> = Object.keys(endpoints);

  const actionCreatorAsyncWithHandler = <Params, Result, Error = {}>(
    localConfig: ExtraOptions<Extra> & BaseOptions & EndpointOptions<Endpoints>
  ) => {
    const extra: ExtraOptions<Extra> = {
      ...((globalConfig && (globalConfig as any).extra) || {}),
      ...((localConfig as any).extra || {}),
    };

    const options = {
      ...globalConfig,
      ...localConfig,
      extra,
    };

    const event = String(events.find((key) => endpoints[key] === options.url));
    const eventName = `${event}_${options.method}`.toUpperCase();

    return {
      ...actionCreator.async<Params, Result, Error>(eventName),
      handler: async (
        payload: Params,
        config?: BaseOptions
      ): Promise<AxiosResponse<Result | Error>> => {
        const method = (config?.method ?? options.method).toLowerCase();
        const withBody = methodsWithBody.includes(method);

        return axios({
          ...options,
          ...config,
          ...(withBody
            ? {
                data:
                  payload instanceof FormData
                    ? payload
                    : { ...options.data, ...payload },
              }
            : { params: { ...options.params, ...payload } }),
          extra: undefined,
        } as never);
      },
      options,
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
    actionCreator,
    actionCreatorAsync: actionCreator.async,
    actionCreatorAsyncWithHandler,
    registerAsyncActions,
  };
};
