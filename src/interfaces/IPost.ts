import {Color} from './Color';
export interface IApiLocation {
    name: string
}
export interface IPost {
    post_id: string
    children?: string[]
    child_count?: number
    next_reply?: string
    message: string
    thumbnail_url?: string
    image_url?: string
    user_handle: string
    replier?: string
    pinned?: boolean
    pin_count?: number
    updated_at: string
    created_at: string
    distance: number
    post_own: string
    vote_count: number
    location: IApiLocation
    color: Color
    voted?: 'up' | 'down'
    from_home?: boolean
    got_thanks?: boolean
    shareable?: boolean
    share_count?: number
}

export interface IApiPost {
    post_id: string
    children: IApiPost[]
    child_count: number
    next_reply: string
    message: string
    thumbnail_url: string
    image_url: string
    user_handle: string
    replier: string
    pinned: boolean
    pin_count: number
    updated_at: string
    created_at: string
    distance: number
    post_own: string
    vote_count: number
    location: IApiLocation
    color: Color
    voted?: 'up' | 'down'
    from_home?: boolean
}
