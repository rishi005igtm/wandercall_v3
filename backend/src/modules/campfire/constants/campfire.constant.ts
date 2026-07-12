export enum CampfireVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum CampfireStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampfireMood {
  STORYTELLING = 'STORYTELLING',
  DEEP_DISCUSSION = 'DEEP_DISCUSSION',
  LEARNING = 'LEARNING',
  CASUAL = 'CASUAL',
  TRAVEL = 'TRAVEL',
  ADVENTURE = 'ADVENTURE',
}

export enum CampfireCategory {
  TRAVEL = 'TRAVEL',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  STORYTELLING = 'STORYTELLING',
  LEARNING = 'LEARNING',
  ADVENTURE = 'ADVENTURE',
  FOOD = 'FOOD',
}

export enum CampfireParticipantRole {
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  SPEAKER = 'SPEAKER',
  LISTENER = 'LISTENER',
}

export enum CampfireParticipantStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  BANNED = 'BANNED',
}

export const CAMPFIRE_ERROR_MESSAGES = {
  NOT_FOUND: 'Campfire not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  ROOM_FULL: 'Campfire is currently at full capacity',
  PASSCODE_REQUIRED: 'Passcode is required for private campfires',
  INVALID_PASSCODE: 'Invalid passcode',
};
