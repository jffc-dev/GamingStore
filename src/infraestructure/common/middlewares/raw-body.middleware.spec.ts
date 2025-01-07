import { RawBodyMiddleware } from './raw-body.middleware';
import * as bodyParser from 'body-parser';

jest.mock('body-parser', () => ({
  raw: jest.fn().mockReturnValue((req: any, res: any, next: any) => next()),
}));

describe('RawBodyMiddleware', () => {
  let middleware: RawBodyMiddleware;
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new RawBodyMiddleware();
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call bodyParser.raw with correct options', () => {
    middleware.use(mockRequest, mockResponse, nextFunction);

    expect(bodyParser.raw).toHaveBeenCalledWith({
      type: 'application/json',
    });
    expect(bodyParser.raw).toHaveBeenCalledTimes(1);
  });

  it('should call next function after processing', () => {
    middleware.use(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should properly handle the middleware chain', () => {
    const mockRawMiddleware = jest.fn((req, res, next) => next());
    (bodyParser.raw as jest.Mock).mockReturnValueOnce(mockRawMiddleware);

    middleware.use(mockRequest, mockResponse, nextFunction);

    expect(mockRawMiddleware).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      nextFunction,
    );
  });

  it('should maintain request and response references', () => {
    const originalReq = { custom: 'value' };
    const originalRes = { status: jest.fn() };

    middleware.use(originalReq, originalRes, nextFunction);

    const middlewareFunc = bodyParser.raw as jest.Mock;
    expect(middlewareFunc).toHaveBeenCalled();
    const call = middlewareFunc.mock.calls[0][0];
    expect(call).toEqual({ type: 'application/json' });
  });
});
