import fetch, { FetchError, Response as FetchResponse } from 'node-fetch'
import { Response } from '../types'

interface FlatListResponse extends Response {
  body: string[]
}

interface ErrorResponse extends Response {
  message: string
}

interface Breeds {
  message: {
    [key: string]: string[]
  }
  status: string
}

class CustomError extends Error {
  type: string

  constructor(type: string, message: string) {
    super()
    this.type = type
    this.message = message
  }
}

export async function handler(): Promise<FlatListResponse | ErrorResponse> {
  try {
    const res: FetchResponse = await fetch('https://dog.ceo/api/breeds/list/all', { timeout: 8000 })
    if (res.type === 'error') {
      throw new CustomError('unknown-fetch-error', 'Something went wrong with the fetch')
    }
    const payload: Breeds = await res.json()

    const flattenedBreedsList: string[] = Object.entries(payload.message)
      .map(([breed, subBreeds]) =>
        subBreeds.length === 0 ? breed : subBreeds.map((kind) => `${kind} ${breed}`),
      )
      .reduce(
        (accumulator: string[], current: string | string[]) => accumulator.concat(current),
        [],
      )

    return {
      statusCode: 200,
      body: flattenedBreedsList,
    }
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      if (err.type === 'request-timeout') {
        return {
          statusCode: 408,
          message: 'Timeout',
        }
      }
    }

    if (err instanceof CustomError) {
      if (err.type === 'unknown-fetch-error') {
        return {
          statusCode: 500,
          message: err.message,
        }
      }
    }

    return {
      statusCode: 500,
      message: 'Something else went wrong',
    }
  }
}
