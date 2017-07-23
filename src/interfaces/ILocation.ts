export interface IGeoCoordinates {
    latitude: number
    longitude: number
}

export interface ILocation extends IGeoCoordinates {
    city: string
    country: string
}
