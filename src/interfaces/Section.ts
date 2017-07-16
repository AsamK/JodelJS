// TODO maybe add Channel to enum and add additional selectedChannel state
export type Section = SectionEnum | string

export enum SectionEnum {
    LOCATION = 'location',
    MINE = 'mine',
    MINE_REPLIES = 'mineReplies',
    MINE_VOTES = 'mineVotes',
    MINE_PINNED = 'minePinned',
}
