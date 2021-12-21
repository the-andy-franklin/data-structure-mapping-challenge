import fetch, { FetchError } from 'node-fetch'
import { handler } from '../../src/lambdas/breeds-get'

jest.mock('node-fetch', () => ({
  __esModule: true,
  ...jest.requireActual('node-fetch'),
  // Mock fetch default export and actual import other variables (e.g. FetchError)
  default: jest.genMockFromModule('node-fetch'),
}))
const mockedFetch: jest.Mock = fetch as any

describe('breeds-get handler', () => {
  it('returns payload from fetch request', async () => {
    const mockPayload = {
      message: {
        bulldog: ['boston', 'french'],
        pitbull: [],
      },
    }

    mockedFetch.mockReturnValueOnce({
      json: () => {
        return mockPayload
      },
    })

    const response = await handler()
    expect(response).toMatchObject({
      body: ['boston bulldog', 'french bulldog', 'pitbull'],
    })
  })

  it('throws error on network request timeout', async () => {
    mockedFetch.mockImplementationOnce(() => {
      throw new FetchError('request timeout', 'request-timeout')
    })

    const response = await handler()
    expect(response).toMatchObject({
      message: 'Timeout',
      statusCode: 408,
    })
  })

  it('throws a default error if anything else goes wrong', async () => {
    mockedFetch.mockRejectedValueOnce({
      name: 'SomeOtherError',
      type: 'some other error',
      message: 'some other error cause an error',
    })

    const response = await handler()
    expect(response).toMatchObject({
      message: 'Something else went wrong',
      statusCode: 500,
    })
  })

  it('should trigger my new custom error', async () => {
    mockedFetch.mockReturnValueOnce({
      type: 'error',
    })

    const response = await handler()
    expect(response).toMatchObject({
      statusCode: 500,
      message: 'Something else went wrong',
    })
  })
})
