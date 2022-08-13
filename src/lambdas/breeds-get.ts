import fetch, { Response as FetchResponse } from 'node-fetch'
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

export async function handler(): Promise<FlatListResponse | ErrorResponse> {
  try {
    const res: FetchResponse = await fetch('https://dog.ceo/api/breeds/list/all', { timeout: 8000 })
    const { message }: Breeds = await res.json()

    const flattenedBreedsList: string[] = Object.entries(message)
      .map(([breed, subBreeds]) =>
        subBreeds.length === 0 ? breed : subBreeds.map((subBreed) => `${subBreed} ${breed}`),
      )
      .reduce(
        (accumulator: string[], current: string | string[]) => accumulator.concat(current),
        [],
      )

    return {
      statusCode: 200,
      body: flattenedBreedsList,
    }
  } catch (error: any) {
    console.error(error)

    return {
      statusCode: 500,
      message: 'Something went wrong',
    }
  }
}
